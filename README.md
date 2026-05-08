# SymptoTrack - AI-Powered Symptom Tracking & Analysis 

**SymptoTrack** is an end-to-end intelligent healthcare solution designed to optimize patient symptom monitoring through audio analysis. By combining mobile technology, machine learning, and explainable AI, the platform enables precise symptom detection and actionable insights for both patients and healthcare providers.

##  Overview

The SymptoTrack ecosystem consists of three primary components:

1.  **Mobile App (Patient)**: A React Native (Expo) application for patients to record symptoms, view history, and receive AI-driven insights.
2.  **ML Pipeline (Core Engine)**: A Python-based processing hub that performs audio transcription, symptom prediction, and generates XAI explanations.
3.  **Admin Dashboard (Provider)**: A Next.js web portal for healthcare professionals to monitor patient data and manage the platform.

---

##  Project Structure

```text
SymptoTrack/
├── app/                # Mobile App (Expo Router)
├── assets/             # Shared App Assets
├── components/         # Mobile UI Components
├── SymptoTrack/        # ML Pipeline (Python)
│   ├── model/          # Pre-trained ML weights
│   └── process_queue.py# Audio processing logic
└── AdminWebsite/       # Admin Dashboard
    └── gigglebite/     # Next.js & Supabase application
```

---

##  Key Features

- **Real-time Audio Analysis**: Automated transcription of patient voice notes.
- **AI Symptom Prediction**: High-accuracy models for identifying potential medical conditions.
- **Explainable AI (XAI)**: Visual explanations of model logic to build clinical trust.
- **Provider Dashboard**: Centralized view for managing patient records and monitoring trends.
- **Secure Data Sync**: End-to-end synchronization with Supabase integration.

---

##  Technology Stack

### Mobile & Frontend
- **Framework**: React Native, Expo, Next.js
- **State Management**: React Hooks & Context API
- **Icons**: Expo Vector Icons & Lucide React
- **Styling**: Vanilla CSS & React Native StyleSheets

### Backend & Machine Learning
- **ML Logic**: Python, Scikit-learn
- **XAI Integration**: SHAP / LIME
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth & Google Sign-In

---

##  Getting Started

### 1. Mobile Application (Root)
```bash
npm install
npx expo start
```

### 2. ML Pipeline (`/SymptoTrack`)
```bash
cd SymptoTrack
pip install -r requirements.txt
```

### 3. Admin Dashboard (`/AdminWebsite/gigglebite`)
```bash
cd AdminWebsite/gigglebite
npm install
npm run dev
```

---

##  License

This project is licensed under the MIT License.

