from typing import Optional
from datetime import datetime

class Session:
    def __init__(self, id: str, class_id: str, title: str, created_by: str, created_at: Optional[datetime] = None):
        self.id = id
        self.class_id = class_id
        self.title = title
        self.created_by = created_by
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'class_id': self.class_id,
            'title': self.title,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

