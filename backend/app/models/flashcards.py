from typing import Optional
from datetime import datetime

class FlashcardDeck:
    def __init__(self, id: str, class_id: str, title: str, created_by: str,
                 session_id: Optional[str] = None, public: bool = True,
                 created_at: Optional[datetime] = None):
        self.id = id
        self.class_id = class_id
        self.session_id = session_id
        self.title = title
        self.public = public
        self.created_by = created_by
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'class_id': self.class_id,
            'session_id': self.session_id,
            'title': self.title,
            'public': self.public,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

class Flashcard:
    def __init__(self, id: str, deck_id: str, question: str, answer: str,
                 created_by: str, topic: Optional[str] = None,
                 created_at: Optional[datetime] = None, updated_at: Optional[datetime] = None):
        self.id = id
        self.deck_id = deck_id
        self.question = question
        self.answer = answer
        self.topic = topic
        self.created_by = created_by
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'deck_id': self.deck_id,
            'question': self.question,
            'answer': self.answer,
            'topic': self.topic,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at
        }

