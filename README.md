# SymptoTrack - Patient App

SymptoTrack Patient is a mobile application designed to empower patients in managing their health journey. It provides tools for audio-based symptom tracking, real-time medical consultations, and comprehensive health data visualization.

## Key Features

- **Audio Symptom Logging**: Record voice notes about your symptoms, which are automatically processed for transcription and analysis.
- **Real-time Consultations**: Connect with healthcare professionals instantly via integrated LiveKit audio/video sessions.
- **Health Insights**: Visualize your symptom trends and health metrics through interactive charts.
- **Secure Sync**: Your data is securely synchronized and stored using Supabase.
- **Speech Recognition**: On-device and cloud-based speech-to-text for seamless logging.

---

## Project Structure

```text
SymptoTrack/
├── app/                # File-based routing (Expo Router)
├── assets/             # App icons, splash screens, and images
├── components/         # Reusable UI components (Buttons, Cards, etc.)
├── constants/          # Theme colors and configuration constants
├── hooks/              # Custom React hooks for logic and state
├── lib/                # Third-party service initializations (Supabase, LiveKit)
└── App.tsx             # Root application component
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS)
- [Expo Go](https://expo.dev/go) on your mobile device (for testing)

### Installation
1. Clone the repository and navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the development server:
```bash
npx expo start
```
- Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).
- Press `a` for Android Emulator or `i` for iOS Simulator.

---

## Technology Stack
- **Framework**: React Native with Expo
- **Real-time Communication**: LiveKit
- **Database & Auth**: Supabase
- **Audio/Speech**: Expo AV & Expo Speech Recognition
- **Data Visualization**: React Native Chart Kit
- **Language**: TypeScript

