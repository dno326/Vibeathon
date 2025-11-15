from typing import Optional, Literal
from datetime import datetime

NoteType = Literal['audio', 'slides', 'merged', 'manual']

class Note:
    def __init__(self, id: str, session_id: str, type: NoteType, content: str, 
                 created_by: str, created_at: Optional[datetime] = None, 
                 updated_at: Optional[datetime] = None):
        self.id = id
        self.session_id = session_id
        self.type = type
        self.content = content
        self.created_by = created_by
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'type': self.type,
            'content': self.content,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at
        }

