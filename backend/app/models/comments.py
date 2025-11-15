from typing import Optional
from datetime import datetime

class Comment:
    def __init__(self, id: str, session_id: str, user_id: str, text: str,
                 note_id: Optional[str] = None, anchor: Optional[str] = None,
                 created_at: Optional[datetime] = None):
        self.id = id
        self.session_id = session_id
        self.note_id = note_id
        self.user_id = user_id
        self.text = text
        self.anchor = anchor
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'note_id': self.note_id,
            'user_id': self.user_id,
            'text': self.text,
            'anchor': self.anchor,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

