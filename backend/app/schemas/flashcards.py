from pydantic import BaseModel
from typing import Optional

class CreateDeckRequest(BaseModel):
    class_id: str
    session_id: Optional[str] = None
    title: str
    public: bool = True

class GenerateFlashcardsRequest(BaseModel):
    note_id: str
    count: int = 20

class CreateCardRequest(BaseModel):
    question: str
    answer: str
    topic: Optional[str] = None

class UpdateCardRequest(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    topic: Optional[str] = None

