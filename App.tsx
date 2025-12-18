import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CaregiverCheckin } from "./components/CaregiverCheckin";
import { PatientDetail } from "./components/PatientDetail";

export type CheckIn = {
  id: string;
  date: string;
  painLevel: number;
  symptoms: string[];
  voiceNote: string;
  voiceTranscript: string;
  riskLevel: "low" | "medium" | "high";
  riskExplanation: {
    painChange?: string;
    newSymptoms?: string[];
    sentimentAnalysis?: string;
    keywords?: string[];
  };
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  condition: string;
  checkIns: CheckIn[];
  currentRiskLevel: "low" | "medium" | "high";
  assignedDoctor?: Doctor;
};

// Mock patient data for the patient/caregiver view
const mockPatient: Patient = {
  id: "1",
  name: "Sarah Johnson",
  age: 68,
  condition: "Post-surgery recovery",
  currentRiskLevel: "high",
  assignedDoctor: {
    id: "d1",
    name: "Dr. Emily Carter",
    specialty: "Post-operative Care",
  },
  checkIns: [
    {
      id: "c1",
      date: "2025-12-01",
      painLevel: 4,
      symptoms: [],
      voiceNote: "Doing fine today.",
      voiceTranscript: "Doing fine today.",
      riskLevel: "low",
      riskExplanation: {
        painChange: "Pain level stable at 4",
        sentimentAnalysis: "Positive tone detected",
      },
    },
    {
      id: "c2",
      date: "2025-12-02",
      painLevel: 3,
      symptoms: [],
      voiceNote: "Feeling better, less pain.",
      voiceTranscript: "Feeling better, less pain.",
      riskLevel: "low",
      riskExplanation: {
        painChange: "Pain decreased from 4 to 3 (improving)",
        sentimentAnalysis: "Positive tone detected",
      },
    },
    {
      id: "c3",
      date: "2025-12-03",
      painLevel: 4,
      symptoms: [],
      voiceNote: "Same as usual.",
      voiceTranscript: "Same as usual.",
      riskLevel: "low",
      riskExplanation: {
        painChange: "Pain level stable",
        sentimentAnalysis: "Neutral tone",
      },
    },
    {
      id: "c4",
      date: "2025-12-04",
      painLevel: 5,
      symptoms: ["fatigue"],
      voiceNote: "A bit tired today.",
      voiceTranscript: "A bit tired today.",
      riskLevel: "low",
      riskExplanation: {
        painChange: "Slight increase in pain (4→5)",
        newSymptoms: ["fatigue"],
        sentimentAnalysis: "Slightly negative tone",
        keywords: ["tired"],
      },
    },
    {
      id: "c5",
      date: "2025-12-05",
      painLevel: 6,
      symptoms: ["fatigue", "sleep issues"],
      voiceNote: "Not sleeping well.",
      voiceTranscript: "Not sleeping well.",
      riskLevel: "medium",
      riskExplanation: {
        painChange: "Pain increasing (5→6)",
        newSymptoms: ["sleep issues"],
        sentimentAnalysis: "Negative tone detected",
        keywords: ["not sleeping well"],
      },
    },
    {
      id: "c6",
      date: "2025-12-06",
      painLevel: 7,
      symptoms: ["sleep issues", "difficulty moving"],
      voiceNote: "Had sharp pain. Barely slept.",
      voiceTranscript: "Had sharp pain. Barely slept.",
      riskLevel: "high",
      riskExplanation: {
        painChange: "Significant pain increase (4→7 over 2 days)",
        newSymptoms: ["difficulty moving"],
        sentimentAnalysis: "Stressed, negative tone",
        keywords: ["sharp pain", "barely slept"],
      },
    },
  ],
};

export default function App() {
  const [patient, setPatient] = useState<Patient>(mockPatient);
  const [showHistory, setShowHistory] = useState(false);

  const addCheckIn = (
    checkIn: Omit<CheckIn, "id" | "riskLevel" | "riskExplanation">
  ) => {
    // Simulate AI risk calculation
    const riskData = calculateRisk(checkIn, patient.checkIns);

    const newCheckIn: CheckIn = {
      ...checkIn,
      id: `c${Date.now()}`,
      riskLevel: riskData.level,
      riskExplanation: riskData.explanation,
    };

    const updatedPatient = {
      ...patient,
      checkIns: [...patient.checkIns, newCheckIn],
      currentRiskLevel: riskData.level,
    };
    
    setPatient(updatedPatient);
  };

  const calculateRisk = (
    current: Omit<CheckIn, "id" | "riskLevel" | "riskExplanation">,
    history: CheckIn[]
  ): {
    level: "low" | "medium" | "high";
    explanation: CheckIn["riskExplanation"];
  } => {
    const explanation: CheckIn["riskExplanation"] = {};
    let riskScore = 0;

    // Check pain trend
    if (history.length > 0) {
      const lastPain = history[history.length - 1].painLevel;
      const painChange = current.painLevel - lastPain;

      if (painChange >= 3) {
        riskScore += 30;
        explanation.painChange = `Significant pain increase (${lastPain}→${current.painLevel})`;
      } else if (painChange >= 1) {
        riskScore += 15;
        explanation.painChange = `Pain increased (${lastPain}→${current.painLevel})`;
      } else if (painChange <= -1) {
        explanation.painChange = `Pain decreased (${lastPain}→${current.painLevel}) - improving`;
      } else {
        explanation.painChange = "Pain level stable";
      }
    }

    // Check for new symptoms
    const lastSymptoms =
      history.length > 0 ? history[history.length - 1].symptoms : [];
    const newSymptoms = current.symptoms.filter(
      (s) => !lastSymptoms.includes(s)
    );
    if (newSymptoms.length > 0) {
      riskScore += 20;
      explanation.newSymptoms = newSymptoms;
    }

    // Check pain level absolute value
    if (current.painLevel >= 7) {
      riskScore += 25;
    } else if (current.painLevel >= 5) {
      riskScore += 10;
    }

    // Keyword detection
    const negativeKeywords = [
      "sharp pain",
      "barely",
      "severe",
      "worse",
      "can't",
      "difficulty",
      "unable",
    ];
    const foundKeywords = negativeKeywords.filter((kw) =>
      current.voiceTranscript.toLowerCase().includes(kw)
    );
    if (foundKeywords.length > 0) {
      riskScore += 15;
      explanation.keywords = foundKeywords;
    }

    // Sentiment analysis (simple mock)
    const positiveWords = ["fine", "good", "better", "well", "improving"];
    const negativeWords = ["pain", "worse", "difficult", "can't", "barely"];

    const positiveCount = positiveWords.filter((w) =>
      current.voiceTranscript.toLowerCase().includes(w)
    ).length;
    const negativeCount = negativeWords.filter((w) =>
      current.voiceTranscript.toLowerCase().includes(w)
    ).length;

    if (negativeCount > positiveCount) {
      riskScore += 10;
      explanation.sentimentAnalysis = "Negative tone detected";
    } else if (positiveCount > negativeCount) {
      explanation.sentimentAnalysis = "Positive tone detected";
    } else {
      explanation.sentimentAnalysis = "Neutral tone";
    }

    // Determine risk level
    let level: "low" | "medium" | "high";
    if (riskScore >= 50) {
      level = "high";
    } else if (riskScore >= 30) {
      level = "medium";
    } else {
      level = "low";
    }

    return { level, explanation };
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>SymptoTrack</Text>
        <Text style={styles.appTagline}>Post-Treatment Care Monitoring</Text>
      </View>

      <View style={styles.content}>
        {showHistory ? (
          <PatientDetail
            patient={patient}
            onBack={() => setShowHistory(false)}
          />
        ) : (
          <CaregiverCheckin
            patient={patient}
            onSubmit={addCheckIn}
            onViewHistory={() => setShowHistory(true)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#2563eb",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: "#bfdbfe",
  },
  content: {
    flex: 1,
  },
});