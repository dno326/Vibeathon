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

    def _summarize_text(self, text: str) -> str:
        sections = self._split_into_sections(text)
        bullets = []
        for title, body in sections:
            if not body:
                continue
            top = self._top_sentences(body, k=4)
            if not top:
                continue
            bullets.append(f"## {title}")
            for s in top:
                bullets.append(f"- {s}")
            bullets.append("")
        if not bullets:
            top = self._top_sentences(text, k=8)
            bullets = ["## Summary", *[f"- {s}" for s in top]]
        return "\n".join(bullets).strip()

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

    def create_note_from_pdf(self, file, class_id: str, user_id: str, public: bool):
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
        title = os.path.splitext(os.path.basename(filename))[0][:120] or 'PDF Upload'
        session_res = self.admin.table('sessions').insert({
            'class_id': class_id,
            'title': title,
            'created_by': user_id
        }).execute()
        if not session_res.data:
            raise ValidationError("Failed to create session for note")
        session_id = session_res.data[0]['id']

        pdf_url = self._upload_pdf(file, user_id)

        note_res = self.admin.table('notes').insert({
            'session_id': session_id,
            'type': 'slides',
            'content': content,
            'created_by': user_id,
            'public': public,
            'pdf_url': pdf_url
        }).execute()
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
        res = self.admin.table('notes').select('id, session_id, type, content, public, created_at, created_by, pdf_url').eq('id', note_id).single().execute()
        if not res.data:
            raise NotFoundError("Note not found")
        note = res.data
        # Author info
        author_res = self.admin.table('users').select('id, first_name, last_name').eq('id', note['created_by']).single().execute()
        note['author'] = None
        if author_res.data:
            note['author'] = {
                'id': author_res.data['id'],
                'first_name': author_res.data.get('first_name', ''),
                'last_name': author_res.data.get('last_name', ''),
            }
        # Class info via session
        sess_res = self.admin.table('sessions').select('class_id').eq('id', note['session_id']).single().execute()
        note['cls'] = None
        if sess_res.data and sess_res.data.get('class_id'):
            cls_res = self.admin.table('classes').select('id, name').eq('id', sess_res.data['class_id']).single().execute()
            if cls_res.data:
                note['cls'] = {'id': cls_res.data['id'], 'name': cls_res.data.get('name', '')}
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
            res = self.admin.table('notes').select('id, session_id, type, content, public, created_at, created_by, pdf_url').eq('created_by', user_id).order('created_at', desc=True).execute()
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
            res = self.admin.table('notes').select('id, session_id, type, content, public, created_at, created_by, pdf_url').in_('session_id', session_ids).eq('public', True).order('created_at', desc=True).execute()
            notes = res.data or []
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

