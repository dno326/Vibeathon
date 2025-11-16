from app.core.config import Config
from app.core.supabase_client import supabase
from app.utils.errors import ValidationError, NotFoundError, UnauthorizedError
from supabase import create_client
import os
import time

class NoteService:
    def __init__(self):
        self.supabase = supabase
        self.admin = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)

    def _stub_summarize_pdf(self, pdf_bytes: bytes, filename: str) -> str:
        # Placeholder summarization. Replace with real pipeline later.
        return f"Summary for {filename}:\n\n- Key point 1\n- Key point 2\n- Key point 3\n\n(Replace with AI-generated summary)"

    def create_note_from_pdf(self, file, class_id: str, user_id: str, public: bool):
        if not class_id:
            raise ValidationError("class_id is required")
        if not user_id:
            raise ValidationError("user_id is required")

        # Verify class exists
        cls = self.admin.table('classes').select('id').eq('id', class_id).single().execute()
        if not cls.data:
            raise NotFoundError("Class not found")

        # Verify user is a class member
        membership = self.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
        if not membership.data:
            raise ValidationError("You must join the class before adding notes")

        filename = file.filename or 'upload.pdf'
        pdf_bytes = file.read()
        if not pdf_bytes:
            raise ValidationError("Empty file uploaded")

        # Stub summarize
        content = self._stub_summarize_pdf(pdf_bytes, filename)

        # Create a session for this note (simple: title from filename)
        title = os.path.splitext(os.path.basename(filename))[0][:120] or 'PDF Upload'
        session_res = self.admin.table('sessions').insert({
            'class_id': class_id,
            'title': title,
            'created_by': user_id
        }).execute()
        if not session_res.data:
            raise ValidationError("Failed to create session for note")
        session_id = session_res.data[0]['id']

        # Create note with type 'slides' and public flag
        note_res = self.admin.table('notes').insert({
            'session_id': session_id,
            'type': 'slides',
            'content': content,
            'created_by': user_id,
            'public': public
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

    def list_notes_for_user(self, user_id: str):
        """List notes created by the user (any class)."""
        try:
            res = self.admin.table('notes').select('id, session_id, type, content, public, created_at').eq('created_by', user_id).order('created_at', desc=True).execute()
            return res.data or []
        except Exception as e:
            raise ValidationError(f"Failed to list notes: {str(e)}")

    def list_public_notes_for_class(self, class_id: str, user_id: str):
        """List public notes for a class, only visible to class members."""
        # Check membership
        mem = self.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
        if not mem.data:
            raise UnauthorizedError("You are not a member of this class")
        try:
            # Join sessions to filter by class and only public notes
            # Use RPC-like logic via two-step query if needed, but here we can filter by sessions
            sess = self.admin.table('sessions').select('id').eq('class_id', class_id).execute()
            session_ids = [s['id'] for s in (sess.data or [])]
            if not session_ids:
                return []
            res = self.admin.table('notes').select('id, session_id, type, content, public, created_at').in_('session_id', session_ids).eq('public', True).order('created_at', desc=True).execute()
            return res.data or []
        except Exception as e:
            raise ValidationError(f"Failed to list class notes: {str(e)}")

