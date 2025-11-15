from typing import Literal, Optional
from datetime import datetime

UpvoteTargetType = Literal['note', 'deck']

class Upvote:
    def __init__(self, id: str, user_id: str, target_id: str, target_type: UpvoteTargetType,
                 created_at: Optional[datetime] = None):
        self.id = id
        self.user_id = user_id
        self.target_id = target_id
        self.target_type = target_type
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'target_id': self.target_id,
            'target_type': self.target_type,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

