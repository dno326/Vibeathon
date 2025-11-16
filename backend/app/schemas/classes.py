from pydantic import BaseModel
from typing import Optional

class CreateClassRequest(BaseModel):
    name: str

class JoinClassRequest(BaseModel):
    class_id: str

