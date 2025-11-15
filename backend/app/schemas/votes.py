from pydantic import BaseModel
from typing import Literal

UpvoteTargetType = Literal['note', 'deck']

class ToggleUpvoteRequest(BaseModel):
    target_id: str
    target_type: UpvoteTargetType

