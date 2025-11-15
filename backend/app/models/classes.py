from typing import Optional
from datetime import datetime

class Class:
    def __init__(self, id: str, name: str, code: str, owner_id: str, created_at: Optional[datetime] = None):
        self.id = id
        self.name = name
        self.code = code
        self.owner_id = owner_id
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'owner_id': self.owner_id,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

