from typing import Optional
from datetime import datetime

class User:
    def __init__(self, id: str, email: str, name: str, created_at: Optional[datetime] = None):
        self.id = id
        self.email = email
        self.name = name
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

