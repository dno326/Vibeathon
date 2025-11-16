from app.core.config import Config
from app.core.supabase_client import supabase
from supabase import create_client

class FlashcardService:
    def __init__(self):
        self.supabase = supabase
        self.admin = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
    
    def create_deck(self, class_id: str, title: str, user_id: str, session_id: str = None, public: bool = True):
        """Create a new flashcard deck."""
        # TODO: Implement create deck
        pass
    
    def generate_flashcards(self, deck_id: str, note_id: str, count: int, user_id: str):
        """Generate flashcards from a note using AI."""
        # TODO: Implement AI flashcard generation
        pass
    
    def get_deck(self, deck_id: str, user_id: str):
        """Get deck with all cards."""
        # TODO: Implement get deck
        pass
    
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

