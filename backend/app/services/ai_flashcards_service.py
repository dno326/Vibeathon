from app.core.openai_client import generate_flashcards

class AIFlashcardsService:
    def __init__(self):
        pass
    
    def generate_from_notes(self, note_content: str, count: int = 20) -> list:
        """Generate flashcards from note content."""
        return generate_flashcards(note_content, count)

