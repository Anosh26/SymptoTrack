import numpy as np

class XAIService:
    def __init__(self, model, explainer):
        """
        model: trained ML model
        explainer: SHAP / LIME / custom explainer
        """
        self.model = model
        self.explainer = explainer

    def predict(self, features: np.ndarray) -> dict:
        prediction = self.model.predict(features)[0]
        probability = self.model.predict_proba(features)[0].max()

        return {
            "prediction": str(prediction),
            "confidence": float(probability)
        }

    def explain(self, features: np.ndarray) -> dict:
        explanation = self.explainer.explain_instance(
            features[0],
            self.model.predict_proba
        )

        return {
            "top_features": explanation.as_list()
        }
