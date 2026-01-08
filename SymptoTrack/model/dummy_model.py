import numpy as np

class DummyModel:
    def predict(self, X):
        return ["HIGH"]

    def predict_proba(self, X):
        return np.array([[0.1, 0.9]])

class DummyExplainer:
    def explain_instance(self, data, predict_fn):
        return self

    def as_list(self):
        return [
            ("Pain increased", 0.6),
            ("Negative tone in voice", 0.3),
            ("Keyword: sharp pain", 0.1)
        ]

model = DummyModel()
explainer = DummyExplainer()
