from app.core.config import Config
from app.core.supabase_client import supabase
from app.utils.errors import ValidationError, NotFoundError, UnauthorizedError
from supabase import create_client
import os
import re
from .file_service import FileService
import uuid

class NoteService:
    def __init__(self):
        self.supabase = supabase
        self.admin = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
        self.files = FileService()

    # ----------------------------
    # Heuristic summarization
    # ----------------------------
    def _sentence_split(self, text: str):
        return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]

    def _tokenize(self, text: str):
        return re.findall(r"[A-Za-z0-9']+", text.lower())

    def _frequency_scores(self, text: str):
        stop = set([
            "the","a","an","and","or","to","of","in","on","for","with","is","are","as","that","this","it","by","be","from","at","was","were","which","has","had","have","but","not","their","his","her","its","they","them","we","you"
        ])
        freqs = {}
        for t in self._tokenize(text):
            if t in stop or len(t) <= 2:
                continue
            freqs[t] = freqs.get(t, 0) + 1
        return freqs

    def _is_noise_sentence(self, s: str) -> bool:
        # Filter instructional scaffolding, URLs, and admin/meta lines
        noise_patterns = [
            r"http[s]?://",
            r"www\.",
            r"@",
            r"optional",
            r"teacher",
            r"students?",
            r"materials",
            r"procedure",
            r"homework",
            r"database",
            r"power\s*point",
            r"attached",
            r"note:?\s*\d+",
        ]
        s_low = s.lower()
        if any(re.search(p, s_low) for p in noise_patterns):
            return True
        # Discard overly long list-like lines
        if len(s) > 400:
            return True
        return False

    def _score_sentences(self, sentences, freqs):
        scored = []
        for s in sentences:
            if self._is_noise_sentence(s):
                continue
            score = 0
            for t in self._tokenize(s):
                if t in freqs:
                    score += freqs[t]
            if s:
                scored.append((score, s))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [s for _, s in scored]

    def _summarize_text(self, text: str) -> str:
        # Build scores
        sentences = self._sentence_split(text)
        freqs = self._frequency_scores(text)
        ranked = self._score_sentences(sentences, freqs)

        # Construct concise paragraphs (no timeline, no bullets)
        # Overview: up to 2 sentences stitched
        overview = " ".join(ranked[:2])
        overview = re.sub(r"\s+", " ", overview).strip()

        # Additional paragraphs: groups of 2 sentences each, up to 2 paragraphs
        rest = ranked[2:8]  # up to 6 more
        paras = []
        for i in range(0, len(rest), 2):
            chunk = " ".join(rest[i:i+2]).strip()
            if chunk:
                paras.append(re.sub(r"\s+", " ", chunk))
            if len(paras) >= 2:
                break

        md = []
        if overview:
            md.append("### Overview")
            md.append(overview)
            # Add two blank lines for visual separation
            md.append("")
            md.append("")
        if paras:
            md.append("### Summary")
            for p in paras:
                md.append(p)
                md.append("")
        return "\n".join(md).strip()

    # ----------------------------
    # Existing methods below (unchanged except where we call _summarize_text)
    # ----------------------------
    def _split_into_sections(self, text: str):
        sections = []
        current_title = "Document"
        current_lines = []
        for line in text.splitlines():
            if self._looks_like_heading(line):
                if current_lines:
                    sections.append((current_title, "\n".join(current_lines).strip()))
                    current_lines = []
                current_title = line.strip()[:120]
            else:
                current_lines.append(line)
        if current_lines:
            sections.append((current_title, "\n".join(current_lines).strip()))
        return sections

    def _looks_like_heading(self, line: str) -> bool:
        s = line.strip()
        if not s:
            return False
        if len(s) > 120:
            return False
        words = s.split()
        if len(words) <= 12 and (s.isupper() or all(w[:1].isupper() for w in words if w)):
            return True
        if re.match(r"^(\d+\.|[A-Z]\))\s+", s):
            return True
        return False

    def _top_sentences(self, text: str, k: int = 5):
        sentences = re.split(r"(?<=[.!?])\s+", text)
        tokens = re.findall(r"[A-Za-z0-9']+", text.lower())
        stop = set(["the","a","an","and","or","to","of","in","on","for","with","is","are","as","that","this","it","by","be","from","at","was","were","which","has","had","have"])
        freqs = {}
        for t in tokens:
            if t in stop or len(t) <= 2:
                continue
            freqs[t] = freqs.get(t, 0) + 1
        scored = []
        for s in sentences:
            score = 0
            for t in re.findall(r"[A-Za-z0-9']+", s.lower()):
                if t in freqs:
                    score += freqs[t]
            if s.strip():
                scored.append((score, s.strip()))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [s for _, s in scored[:k]]

    def _ensure_notes_bucket(self):
        try:
            buckets = self.admin.storage.list_buckets()
            names = [b.name for b in buckets]
            if 'notes-pdfs' not in names:
                try:
                    self.admin.storage.create_bucket('notes-pdfs', options={'public': True})
                except Exception:
                    pass
        except Exception:
            pass

    def _upload_pdf(self, file, user_id: str) -> str:
        self._ensure_notes_bucket()
        filename = getattr(file, 'filename', None) or f'{uuid.uuid4()}.pdf'
        ext = os.path.splitext(filename)[1] or '.pdf'
        key = f"{user_id}/{uuid.uuid4()}{ext}"
        file.seek(0)
        data = file.read()
        self.admin.storage.from_('notes-pdfs').upload(key, data, file_options={"content-type": "application/pdf", "upsert": "true"})
        public_url = f"{Config.SUPABASE_URL}/storage/v1/object/public/notes-pdfs/{key}"
        return public_url

    def create_note_from_pdf(self, file, class_id: str, user_id: str, public: bool, title: str | None = None):
        if not class_id:
            raise ValidationError("class_id is required")
        if not user_id:
            raise ValidationError("user_id is required")

        cls = self.admin.table('classes').select('id').eq('id', class_id).single().execute()
        if not cls.data:
            raise NotFoundError("Class not found")

        membership = self.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
        if not membership.data:
            raise ValidationError("You must join the class before adding notes")

        text = self.files.extract_text_from_pdf(file)
        if not text:
            raise ValidationError("Could not extract text from PDF")

        content = self._summarize_text(text)

        filename = getattr(file, 'filename', None) or 'PDF Upload'
        session_title = os.path.splitext(os.path.basename(filename))[0][:120] or 'PDF Upload'
        session_res = self.admin.table('sessions').insert({
            'class_id': class_id,
            'title': session_title,
            'created_by': user_id
        }).execute()
        if not session_res.data:
            raise ValidationError("Failed to create session for note")
        session_id = session_res.data[0]['id']

        pdf_url = self._upload_pdf(file, user_id)

        note_payload = {
            'session_id': session_id,
            'type': 'slides',
            'content': content,
            'created_by': user_id,
            'public': public,
            'pdf_url': pdf_url
        }
        if title:
            note_payload['title'] = title[:180]

        note_res = self.admin.table('notes').insert(note_payload).execute()
        if not note_res.data:
            raise ValidationError("Failed to create note")
        return note_res.data[0]
    
    def get_note(self, note_id: str, user_id: str):
        """Get a specific note."""
        # TODO: Implement get note
        pass
    
    def update_note(self, note_id: str, content: str, user_id: str):
        """Update note content."""
        # TODO: Implement update note
        pass
    
    def merge_notes(self, session_id: str, source_note_ids: list[str], user_id: str):
        """Merge multiple notes into one."""
        # TODO: Implement merge notes
        pass

    def get_note_detail(self, note_id: str, user_id: str):
        res = self.admin.table('notes').select('*').eq('id', note_id).execute()
        rows = res.data or []
        if not rows:
            raise NotFoundError("Note not found")
        note = rows[0]
        # author
        note['author'] = None
        try:
            ares = self.admin.table('users').select('id, first_name, last_name').eq('id', note['created_by']).execute()
            arows = ares.data or []
            if arows:
                note['author'] = {
                    'id': arows[0]['id'],
                    'first_name': arows[0].get('first_name', ''),
                    'last_name': arows[0].get('last_name', ''),
                }
        except Exception:
            pass
        # class via session
        note['cls'] = None
        try:
            sres = self.admin.table('sessions').select('class_id').eq('id', note['session_id']).execute()
            srows = sres.data or []
            class_id = srows[0]['class_id'] if srows and srows[0].get('class_id') else None
            if class_id:
                cres = self.admin.table('classes').select('id, name').eq('id', class_id).execute()
                crows = cres.data or []
                if crows:
                    note['cls'] = {'id': crows[0]['id'], 'name': crows[0].get('name', '')}
        except Exception:
            pass
        return note

    def delete_note(self, note_id: str, user_id: str):
        res = self.admin.table('notes').select('id, created_by, pdf_url').eq('id', note_id).single().execute()
        if not res.data:
            raise NotFoundError("Note not found")
        if res.data['created_by'] != user_id:
            raise UnauthorizedError("You can only delete your own notes")
        # Optionally delete PDF from storage
        pdf_url = res.data.get('pdf_url')
        if pdf_url and '/notes-pdfs/' in pdf_url:
            try:
                key = pdf_url.split('/notes-pdfs/')[1]
                self.admin.storage.from_('notes-pdfs').remove([key])
            except Exception:
                pass
        self.admin.table('notes').delete().eq('id', note_id).execute()
        return True

    def _attach_authors(self, notes):
        if not notes:
            return []
        user_ids = list({n.get('created_by') for n in notes if n.get('created_by')})
        authors_map = {}
        if user_ids:
            users_res = self.admin.table('users').select('id, first_name, last_name').in_('id', user_ids).execute()
            for u in (users_res.data or []):
                authors_map[u['id']] = {
                    'id': u['id'],
                    'first_name': u.get('first_name', ''),
                    'last_name': u.get('last_name', ''),
                }
        for n in notes:
            n['author'] = authors_map.get(n.get('created_by'))
        return notes

    def _attach_classes_via_sessions(self, notes):
        if not notes:
            return []
        sessions_res = None
        session_ids = list({n.get('session_id') for n in notes if n.get('session_id')})
        if session_ids:
            sessions_res = self.admin.table('sessions').select('id, class_id').in_('id', session_ids).execute()
        sess_map = {s['id']: s['class_id'] for s in (sessions_res.data or [])} if sessions_res else {}
        class_ids = list({sess_map.get(n.get('session_id')) for n in notes if sess_map.get(n.get('session_id'))})
        classes_map = {}
        if class_ids:
            classes_res = self.admin.table('classes').select('id, name').in_('id', class_ids).execute()
            for c in (classes_res.data or []):
                classes_map[c['id']] = {'id': c['id'], 'name': c.get('name', '')}
        for n in notes:
            cls_id = sess_map.get(n.get('session_id'))
            n['cls'] = classes_map.get(cls_id)
        return notes

    def list_notes_for_user(self, user_id: str):
        try:
            res = self.admin.table('notes').select('*').eq('created_by', user_id).order('created_at', desc=True).execute()
            notes = res.data or []
            notes = self._attach_authors(notes)
            notes = self._attach_classes_via_sessions(notes)
            return notes
        except Exception as e:
            raise ValidationError(f"Failed to list notes: {str(e)}")

    def list_public_notes_for_class(self, class_id: str, user_id: str):
        mem = self.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
        if not mem.data:
            raise UnauthorizedError("You are not a member of this class")
        try:
            sess = self.admin.table('sessions').select('id').eq('class_id', class_id).execute()
            session_ids = [s['id'] for s in (sess.data or [])]
            if not session_ids:
                return []
            # Fetch notes without relying on a 'public' column existing in the DB
            res = self.admin.table('notes').select('*').in_('session_id', session_ids).execute()
            notes = res.data or []
            # If a 'public' flag exists on rows, enforce it here; otherwise treat as public by default
            filtered = []
            for n in notes:
                if 'public' in n and n['public'] is False:
                    continue
                filtered.append(n)
            notes = filtered
            # Sort newest first by created_at if present
            try:
                notes.sort(key=lambda n: n.get('created_at') or '', reverse=True)
            except Exception:
                pass

            notes = self._attach_authors(notes)
            cls_res = self.admin.table('classes').select('id, name').eq('id', class_id).single().execute()
            cls = None
            if cls_res.data:
                cls = {'id': cls_res.data['id'], 'name': cls_res.data.get('name', '')}
            for n in notes:
                n['cls'] = cls
            return notes
        except Exception as e:
            raise ValidationError(f"Failed to list class notes: {str(e)}")

    def get_note_votes_count(self, note_id: str, user_id: str):
        # Ensure member of the class
        note = self.get_note_detail(note_id, user_id)
        res = self.admin.table('note_votes').select('note_id', count='exact').eq('note_id', note_id).execute()
        count = res.count or 0
        # Check if user voted
        mine = self.admin.table('note_votes').select('note_id').eq('note_id', note_id).eq('user_id', user_id).execute()
        return {'count': count, 'user_has_voted': bool(mine.data)}

    def upsert_vote(self, note_id: str, user_id: str):
        # Ensure visibility
        self.get_note_detail(note_id, user_id)
        # Insert vote; primary key prevents duplicates
        self.admin.table('note_votes').insert({'note_id': note_id, 'user_id': user_id}).execute()
        return self.get_note_votes_count(note_id, user_id)

    def remove_vote(self, note_id: str, user_id: str):
        self.admin.table('note_votes').delete().eq('note_id', note_id).eq('user_id', user_id).execute()
        return self.get_note_votes_count(note_id, user_id)

    def list_comments(self, note_id: str, user_id: str):
        # Ensure member of the class
        self.get_note_detail(note_id, user_id)
        res = self.admin.table('note_comments').select('id, note_id, user_id, content, created_at, parent_id').eq('note_id', note_id).order('created_at').execute()
        comments = res.data or []
        # Attach author names
        for c in comments:
            u = self.admin.table('users').select('first_name, last_name').eq('id', c['user_id']).single().execute()
            c['author'] = {
                'first_name': u.data.get('first_name', '') if u.data else '',
                'last_name': u.data.get('last_name', '') if u.data else '',
            }
        return comments

    def add_comment(self, note_id: str, user_id: str, content: str, parent_id: str | None = None):
        if not content or not content.strip():
            raise ValidationError('Comment cannot be empty')
        # Ensure visibility
        self.get_note_detail(note_id, user_id)
        payload = {'note_id': note_id, 'user_id': user_id, 'content': content.strip()[:2000]}
        if parent_id:
            # Validate parent belongs to same note
            p = self.admin.table('note_comments').select('id, note_id').eq('id', parent_id).single().execute()
            if not p.data or p.data['note_id'] != note_id:
                raise ValidationError('Invalid parent comment')
            payload['parent_id'] = parent_id
        c = self.admin.table('note_comments').insert(payload).execute()
        return c.data[0] if c.data else None

    def delete_comment(self, note_id: str, comment_id: str, user_id: str):
        # Ensure visibility and ownership
        self.get_note_detail(note_id, user_id)
        res = self.admin.table('note_comments').select('id, user_id').eq('id', comment_id).single().execute()
        if not res.data:
            raise NotFoundError('Comment not found')
        if res.data['user_id'] != user_id:
            raise UnauthorizedError('You can only delete your own comments')
        self.admin.table('note_comments').delete().eq('id', comment_id).execute()
        return True

    def list_public_notes_by_user(self, target_user_id: str, viewer_user_id: str):
        """List notes created by target user that are public and visible to viewer (member of class)."""
        # Get notes by creator
        res = self.admin.table('notes').select('*').eq('created_by', target_user_id).execute()
        notes = res.data or []
        if not notes:
            return []
        # Attach sessions and classes
        notes = self._attach_classes_via_sessions(notes)
        # Filter by public flag and viewer membership to the class
        visible = []
        for n in notes:
            # public flag check (treat missing as True)
            if 'public' in n and n['public'] is False:
                continue
            cls = n.get('cls')
            if not cls or not cls.get('id'):
                continue
            mem = self.admin.table('class_members').select('user_id').eq('class_id', cls['id']).eq('user_id', viewer_user_id).execute()
            if mem.data:
                visible.append(n)
        # Sort newest first
        visible.sort(key=lambda x: x.get('created_at') or '', reverse=True)
        return self._attach_authors(visible)

