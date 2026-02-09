import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client
from model.symptotrack_pipeline import SymptoTrackPipeline
from model.dummy_model import model, explainer 

# 1. LOAD SECRETS
load_dotenv()

url = os.getenv("SUPABASE_URL")
# Changed to look for the modern Secret Key
key = os.getenv("SUPABASE_SECRET_KEY")

if not url or not key:
    raise ValueError("[ERROR] Missing Supabase keys. Please check your .env file.")

# 2. SETUP SUPABASE
supabase: Client = create_client(url, key)

# 3. INITIALIZE PIPELINE
pipeline = SymptoTrackPipeline(model, explainer)

def process_latest_symptoms():
    print("Checking for unprocessed symptoms...")

    response = supabase.table('symptoms')\
        .select("*")\
        .is_("risk_level", "null")\
        .execute()

    symptoms_to_process = response.data

    if not symptoms_to_process:
        print("No new symptoms found.")
        return

    for symptom in symptoms_to_process:
        print("DEBUG - Row Data:", symptom)
        
        symptom_id = symptom['id']
        user_id = symptom['user_id']
        text = symptom['description'] or ""
        
        pain_today = symptom.get('painlvl') 

        if pain_today is None:
            print(f"Skipping symptom {symptom_id}: 'painlvl' is missing.")
            continue

        print(f"Processing symptom {symptom_id} for user {user_id}...")

        # FETCH PREVIOUS PAIN LEVEL
        history_response = supabase.table('symptoms')\
            .select("painlvl")\
            .eq("user_id", user_id)\
            .neq("id", symptom_id)\
            .order("timestamp", desc=True)\
            .limit(1)\
            .execute()

        pain_prev = pain_today
        if history_response.data:
            prev_val = history_response.data[0].get('painlvl')
            if prev_val is not None:
                pain_prev = prev_val

        # RUN PIPELINE
        checklist_data = []
        if symptom.get('symptoms'):
            checklist_data = symptom['symptoms'].split(',')

        result = pipeline.analyze_patient(
            transcript_text=text,
            patient_id=user_id,
            pain_today=pain_today,
            pain_prev=pain_prev,
            checklist_symptoms=checklist_data
        )

        # SAVE RESULTS
        update_data = {
            "risk_level": result["risk_level"],
            "ai_explanation": ", ".join(result["xai_explanation"])
        }

        supabase.table('symptoms')\
            .update(update_data)\
            .eq("id", symptom_id)\
            .execute()

        print(f"[OK] Updated Risk: {result['risk_level']}")

if __name__ == "__main__":
    while True:
        try:
            process_latest_symptoms()
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(10)