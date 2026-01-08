import whisper
import os

class WhisperService:
    def __init__(self, model_size="tiny"):
        self.model = whisper.load_model(model_size)

    def transcribe(self, audio_path: str) -> dict:
        if not os.path.exists(audio_path):
            return {"error": "audio_not_found"}

        try:
            result = self.model.transcribe(
                audio_path,
                language="en",
                fp16=False  # VERY IMPORTANT for CPU
            )
            return {
                "text": result.get("text", "").strip(),
                "language": result.get("language", "en")
            }
        except Exception as e:
            return {"error": str(e)}
