from pydantic import BaseModel

class UpdateNoteRequest(BaseModel):
    content: str

class MergeNotesRequest(BaseModel):
    source_note_ids: list[str]

