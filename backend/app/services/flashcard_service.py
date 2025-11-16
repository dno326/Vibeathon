from app.core.config import Config
from app.core.supabase_client import supabase
from supabase import create_client
from app.services.file_service import FileService
import uuid
import os

class FlashcardService:
    def __init__(self):
        self.supabase = supabase
        self.admin = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
        self.files = FileService()
    
    def create_deck(self, class_id: str, title: str, user_id: str, session_id: str = None, public: bool = True):
        """Create a new flashcard deck."""
        # TODO: Implement create deck
        pass
    
    def generate_flashcards(self, deck_id: str, note_id: str, count: int, user_id: str):
        """Generate flashcards from a note using AI."""
        # TODO: Implement AI flashcard generation
        pass
    
    def get_deck(self, deck_id: str, user_id: str):
        """Get deck with all cards, ensuring viewer membership to class or creator."""
        d = self.admin.table('flashcard_decks').select('*').eq('id', deck_id).single().execute()
        if not d.data:
            raise ValueError('Deck not found')
        deck = d.data
        # visibility: if public false, only creator can view
        if 'public' in deck and deck['public'] is False and deck.get('created_by') != user_id:
            raise ValueError('Forbidden')
        # ensure viewer is member of class
        class_id = deck.get('class_id')
        if class_id:
            mem = self.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
            if not mem.data and deck.get('created_by') != user_id:
                raise ValueError('Forbidden')
        cards = self.admin.table('flashcards').select('id, question, answer').eq('deck_id', deck_id).order('created_at').execute()
        deck['cards'] = cards.data or []
        # attach class
        cls = None
        if class_id:
            c = self.admin.table('classes').select('id, name').eq('id', class_id).single().execute()
            if c.data:
                cls = {'id': c.data['id'], 'name': c.data.get('name','')}
        deck['cls'] = cls
        # attach author
        try:
            u = self.admin.table('users').select('id, first_name, last_name').eq('id', deck.get('created_by')).single().execute()
            if u.data:
                deck['author'] = {'id': u.data['id'], 'first_name': u.data.get('first_name',''), 'last_name': u.data.get('last_name','')}
        except Exception:
            pass
        return deck
    
    def create_card(self, deck_id: str, question: str, answer: str, user_id: str, topic: str = None):
        """Create a flashcard manually."""
        # TODO: Implement create card
        pass
    
    def update_card(self, card_id: str, updates: dict, user_id: str):
        """Update a flashcard."""
        # TODO: Implement update card
        pass
    
    def delete_card(self, card_id: str, user_id: str):
        """Delete a flashcard."""
        # TODO: Implement delete card
        pass

    def list_public_decks_by_user(self, target_user_id: str, viewer_user_id: str):
        res = self.admin.table('flashcard_decks').select('*').eq('created_by', target_user_id).execute()
        decks = res.data or []
        if not decks:
            return []
        visible = []
        for d in decks:
            if 'public' in d and d['public'] is False:
                continue
            class_id = d.get('class_id')
            if not class_id:
                continue
            mem = self.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', viewer_user_id).execute()
            if mem.data:
                visible.append(d)
        # attach class name
        class_ids = list({d.get('class_id') for d in visible if d.get('class_id')})
        classes_map = {}
        if class_ids:
            c = self.admin.table('classes').select('id, name').in_('id', class_ids).execute()
            for row in (c.data or []):
                classes_map[row['id']] = {'id': row['id'], 'name': row.get('name', '')}
        for d in visible:
            d['cls'] = classes_map.get(d.get('class_id'))
        visible.sort(key=lambda x: x.get('created_at') or '', reverse=True)
        return visible

    # ---------- Deck creation from PDFs ----------
    def _generate_cards_from_text(self, text: str):
        import re
        cards: list[dict] = []

        # Normalize whitespace
        norm = re.sub(r"\s+", " ", text)

        # 1) Capture explicit definition patterns (term : definition) or (term – definition)
        def_lines = [l.strip() for l in text.splitlines() if l.strip()]
        for ln in def_lines:
            m = re.match(r"^([A-Za-z][A-Za-z0-9\- '()]+)\s*[:\-–]\s*(.+)$", ln)
            if m:
                term, definition = m.group(1).strip(), m.group(2).strip()
                if 2 < len(term) <= 80 and 5 <= len(definition) <= 300:
                    cards.append({
                        'question': f"Define: {term}"[:180],
                        'answer'  : definition[:300]
                    })

        # 2) Sentences with "X is/are Y" shaped definitions
        sentences = re.split(r"(?<=[.!?])\s+", norm)
        for s in sentences:
            m = re.match(r"^([A-Z][A-Za-z0-9\- '()]{2,80})\s+(is|are|was|were)\s+(.{5,300})$", s.strip())
            if m:
                term = m.group(1).strip()
                definition = m.group(3).strip()
                # Skip if sentence is too long or clearly not a definition
                if len(s) <= 240:
                    cards.append({
                        'question': f"What is {term}?"[:180],
                        'answer'  : definition.rstrip('. ')[:300]
                    })

        # 3) Key vocabulary: take frequent capitalized nouns and try to find appositive/short explanation
        tokens = re.findall(r"[A-Za-z][A-Za-z\-']+", text)
        freq: dict[str,int] = {}
        for t in tokens:
            if t[0].isupper() and len(t) > 2:
                freq[t] = freq.get(t, 0) + 1
        common = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:30]
        for term, _ in common:
            # Find first short phrase containing the term followed by a comma or dash
            m = re.search(rf"\b{re.escape(term)}\b\s*(?:\-|\—|,|:)\s*([^.;]{5,160})", norm)
            if m:
                definition = m.group(1).strip()
                cards.append({
                    'question': f"Define: {term}"[:180],
                    'answer': definition[:300]
                })

        # 4) Fallback: make a few cloze deletions for practice
        if not cards:
            for s in sentences[:20]:
                words = s.split()
                if len(words) > 6:
                    mid = max(1, len(words)//3)
                    answer = words[mid]
                    words[mid] = '____'
                    q = ' '.join(words) + '?'
                    cards.append({'question': q[:180], 'answer': answer[:180]})

        # Dedupe by question
        seen = set()
        deduped = []
        for c in cards:
            q = c['question']
            if q not in seen:
                seen.add(q)
                deduped.append(c)
        return deduped[:60]

    def create_deck_from_pdfs(self, files, class_id: str, user_id: str, public: bool, title: str | None = None):
        if not class_id:
            raise ValueError('class_id required')
        # Ensure class exists and membership
        cls = self.admin.table('classes').select('id').eq('id', class_id).single().execute()
        if not cls.data:
            raise ValueError('Class not found')
        mem = self.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
        if not mem.data:
            raise ValueError('Join the class before creating a deck')

        # Create session for deck grouping
        deck_title = (title or 'Flashcards').strip() or 'Flashcards'
        session_res = self.admin.table('sessions').insert({
            'class_id': class_id,
            'title': deck_title[:120],
            'created_by': user_id
        }).execute()
        if not session_res.data:
            raise ValueError('Failed to create session')
        session_id = session_res.data[0]['id']

        # Create deck
        deck_res = self.admin.table('flashcard_decks').insert({
            'class_id': class_id,
            'session_id': session_id,
            'title': deck_title[:180],
            'public': public,
            'created_by': user_id
        }).execute()
        if not deck_res.data:
            raise ValueError('Failed to create deck')
        deck = deck_res.data[0]

        # Extract text from all PDFs and generate cards
        collected_text = ''
        for file in files:
            try:
                collected_text += '\n' + self.files.extract_text_from_pdf(file)
            except Exception:
                continue
        cards = self._generate_cards_from_text(collected_text)
        for c in cards:
            self.admin.table('flashcards').insert({
                'deck_id': deck['id'],
                'question': c['question'],
                'answer': c['answer'],
                'created_by': user_id
            }).execute()
        return deck

    def list_user_decks(self, user_id: str):
        res = self.admin.table('flashcard_decks').select('*').eq('created_by', user_id).order('created_at', desc=True).execute()
        decks = res.data or []
        # attach class names
        class_ids = list({d.get('class_id') for d in decks if d.get('class_id')})
        classes_map = {}
        if class_ids:
            c = self.admin.table('classes').select('id, name').in_('id', class_ids).execute()
            for row in (c.data or []):
                classes_map[row['id']] = {'id': row['id'], 'name': row.get('name', '')}
        for d in decks:
            d['cls'] = classes_map.get(d.get('class_id'))
        return decks

    def list_class_decks(self, class_id: str, viewer_user_id: str):
        # Ensure viewer is member
        mem = self.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', viewer_user_id).execute()
        if not mem.data:
            raise ValueError('Not a class member')
        res = self.admin.table('flashcard_decks').select('*').eq('class_id', class_id).execute()
        decks = [d for d in (res.data or []) if not ('public' in d and d['public'] is False)]
        decks.sort(key=lambda x: x.get('created_at') or '', reverse=True)
        # attach authors
        user_ids = list({d.get('created_by') for d in decks if d.get('created_by')})
        users_map = {}
        if user_ids:
            u = self.admin.table('users').select('id, first_name, last_name').in_('id', user_ids).execute()
            for row in (u.data or []):
                users_map[row['id']] = {'id': row['id'], 'first_name': row.get('first_name',''), 'last_name': row.get('last_name','')}
        for d in decks:
            d['author'] = users_map.get(d.get('created_by'))
        return decks

