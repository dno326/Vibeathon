from pydantic import BaseModel
from typing import Optional

class UpdateSessionRequest(BaseModel):
    title: Optional[str] = None

