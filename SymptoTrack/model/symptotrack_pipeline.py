from model.whisper_service import WhisperService
from model.xai_service import XAIService
import numpy as np

class SymptoTrackPipeline:
    def __init__(self, ml_model, explainer):
        self.whisper = WhisperService()
        self.xai = XAIService(ml_model, explainer)

    def analyze_patient(
        self,
        audio_path: str,
        patient_id: str,
        pain_today: int,
        pain_prev: int,
        checklist_symptoms: list
    ) -> dict:

        transcript_result = self.whisper.transcribe(audio_path)

        if "error" in transcript_result:
            return {
                "status": "failed",
                "patient_id": patient_id,
                "error": transcript_result["error"]
            }

        transcript = transcript_result["text"]

        # --- Pain trend logic ---
        pain_trend = (
            f"Increased ({pain_prev} → {pain_today})"
            if pain_today > pain_prev
            else "Stable or Decreased"
        )

        # --- Simple keyword extraction ---
        keywords = []
        for word in ["pain", "sharp", "sleep", "move"]:
            if word in transcript.lower():
                keywords.append(word)

        # --- Risk logic (rule-based, explainable) ---
        risk_level = "LOW"
        explanations = []

        if pain_today - pain_prev >= 2:
            risk_level = "HIGH"
            explanations.append("Pain increased significantly")

        if "sharp" in keywords:
            risk_level = "HIGH"
            explanations.append("Sharp pain reported")

        prediction = self.xai.predict([[pain_today]])
        explanation = explanations or ["No critical risk detected"]

        return {
            "patient_id": patient_id,
            "status": "success",
            "pain_today": pain_today,
            "pain_prev": pain_prev,
            "pain_trend": pain_trend,
            "checklist_symptoms": checklist_symptoms,
            "transcript": transcript,
            "keywords": keywords,
            "risk_level": risk_level,
            "xai_explanation": explanation
        }
