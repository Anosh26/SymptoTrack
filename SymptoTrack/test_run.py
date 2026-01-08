from display import display_result
from model.symptotrack_pipeline import SymptoTrackPipeline
from model.dummy_model import model, explainer  # replace with real ones

pipeline = SymptoTrackPipeline(model, explainer)

result = pipeline.analyze_patient(
    audio_path="/home/prachig/Documents/Projects/SymptoTrack/data/1249120_13842059_18087389.wav",
    patient_id="P001",
    pain_today=1,
    pain_prev=4,
    checklist_symptoms=["chest pain"]
)

display_result(result)
