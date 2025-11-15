from openai import OpenAI
from app.core.config import Config

client = OpenAI(api_key=Config.OPENAI_API_KEY)

def transcribe_audio(audio_file) -> str:
    """Transcribe audio using Whisper API."""
    # TODO: Implement Whisper transcription
    pass

def generate_notes(transcript: str) -> str:
    """Generate structured notes from transcript using GPT."""
    # TODO: Implement GPT note generation
    pass

def generate_flashcards(note_content: str, count: int = 20) -> list:
    """Generate flashcards from note content using GPT."""
    # TODO: Implement GPT flashcard generation
    pass

