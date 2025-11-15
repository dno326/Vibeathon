from app.core.openai_client import generate_notes

class AINotesService:
    def __init__(self):
        pass
    
    def generate_structured_notes(self, transcript: str) -> str:
        """Generate structured notes from transcript."""
        return generate_notes(transcript)
    
    def summarize_slides(self, slide_text: str) -> str:
        """Summarize slide content."""
        # TODO: Implement slide summarization
        pass

