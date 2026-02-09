from model.xai_service import XAIService
import numpy as np

class SymptoTrackPipeline:
    def __init__(self, ml_model, explainer):
        self.xai = XAIService(ml_model, explainer)

    def analyze_patient(
        self,
        transcript_text: str,
        patient_id: str,
        pain_today: int,
        pain_prev: int,
        checklist_symptoms: list
    ) -> dict:
        
        transcript = transcript_text.lower() # Convert to lowercase for easier searching
        
        # --- 1. Pain Trend Logic ---
        pain_trend = "Stable"
        if pain_today > pain_prev:
            pain_trend = f"Increased ({pain_prev} -> {pain_today})"
        elif pain_today < pain_prev:
            pain_trend = "Decreased"

        # --- 2. Initialize Risk ---
        risk_level = "LOW"
        explanations = []

        # --- 3. RULE: High Absolute Pain ---
        # If pain is 7 or higher, it is ALWAYS High Risk, even if it didn't increase.
        if pain_today >= 7:
            risk_level = "HIGH"
            explanations.append(f"Critical Pain Level ({pain_today}/10)")

        # --- 4. RULE: Significant Increase ---
        if pain_today - pain_prev >= 2:
            risk_level = "HIGH"
            explanations.append("Pain spiked significantly")

        # --- 5. RULE: Dangerous Symptoms (Keywords) ---
        # We add more alarm words like "chest", "breath", "blood"
        danger_words = ["sharp", "chest", "breath", "breathing", "blood", "faint", "emergency", "heart"]
        found_keywords = [word for word in danger_words if word in transcript]
        
        if found_keywords:
            risk_level = "HIGH"
            explanations.append(f"Critical symptoms detected: {', '.join(found_keywords)}")

        # --- 6. RULE: Specific Checklist Items ---
        # If user selected specific tags in the app
        critical_tags = ["chest pain", "shortness of breath", "high fever"]
        found_tags = [tag for tag in checklist_symptoms if tag.lower() in critical_tags]
        
        if found_tags:
            risk_level = "HIGH"
            explanations.append(f"Critical checklist items: {', '.join(found_tags)}")

        # Default explanation if safe
        if not explanations:
            explanations.append("Vitals stable, no immediate risk detected")

        # Get Dummy Prediction (Just to keep the code running, doesn't affect logic)
        prediction = self.xai.predict([[pain_today]])

        return {
            "patient_id": patient_id,
            "status": "success",
            "pain_today": pain_today,
            "pain_prev": pain_prev,
            "pain_trend": pain_trend,
            "checklist_symptoms": checklist_symptoms,
            "transcript": transcript_text,
            "keywords": found_keywords,
            "risk_level": risk_level,
            "xai_explanation": explanations
        }
