from app.core.openai_client import transcribe_audio

class TranscriptionService:
    def __init__(self):
        pass
    
    def transcribe(self, audio_file) -> str:
        """Transcribe audio using Whisper."""
        return transcribe_audio(audio_file)

