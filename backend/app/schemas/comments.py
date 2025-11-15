from pydantic import BaseModel
from typing import Optional

class CreateCommentRequest(BaseModel):
    text: str
    note_id: Optional[str] = None
    anchor: Optional[str] = None

