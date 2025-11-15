from pydantic import BaseModel
from typing import Optional

class CreateClassRequest(BaseModel):
    name: str
    code: Optional[str] = None

class JoinClassRequest(BaseModel):
    code: str

