import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { CaregiverCheckin } from "./components/CaregiverCheckin";
import { PatientDetail } from "./components/PatientDetail";
import { supabase, SymptomRecord } from "./lib/supabase";

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

// Mock patient data - keeping static for now
const STATIC_USER_ID = "6f209238-27e9-464e-881d-67b59b993a53"; // Replace with one of your actual user IDs

const mockPatient: Patient = {
  id: STATIC_USER_ID,
  name: "Sarah Johnson",
  age: 68,
  condition: "Post-surgery recovery",
  currentRiskLevel: "low",
  assignedDoctor: {
    id: "d1",
    name: "Dr. Emily Carter",
    specialty: "Post-operative Care"
  },
  checkIns: []
};

export default function App() {
  const [patient, setPatient] = useState<Patient>(mockPatient);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load check-ins from Supabase on mount
  useEffect(() => {
    loadCheckIns();
  }, []);

  const loadCheckIns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('symptoms')
        .select<'*', SymptomRecord>('*')
        .eq('user_id', STATIC_USER_ID)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error loading check-ins:', error);
        Alert.alert('Error', 'Failed to load check-in history');
        return;
      }

      // Convert Supabase data to CheckIn format
      const checkIns: CheckIn[] = (data || []).map(record => ({
        id: record.id,
        date: new Date(record.timestamp).toISOString().split('T')[0],
        painLevel: record.painlvl,
        symptoms: record.symptoms ? record.symptoms.split(',').map(s => s.trim()) : [],
        voiceNote: record.description || '',
        voiceTranscript: record.description || '',
        riskLevel: calculateRiskLevel(record.painlvl),
        riskExplanation: {
          painChange: `Pain level: ${record.painlvl}`,
          sentimentAnalysis: record.description ? "Voice note recorded" : "No voice note"
        }
      }));

      // Calculate current risk level
      const currentRisk = checkIns.length > 0 ? checkIns[0].riskLevel : 'low';

      setPatient(prev => ({
        ...prev,
        checkIns: checkIns.reverse(),
        currentRiskLevel: currentRisk
      }));
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskLevel = (painLevel: number): 'low' | 'medium' | 'high' => {
    if (painLevel >= 7) return 'high';
    if (painLevel >= 5) return 'medium';
    return 'low';
  };

  const addCheckIn = async (
    checkIn: Omit<CheckIn, "id" | "riskLevel" | "riskExplanation">
  ) => {
    try {
      // Prepare data for Supabase
      const symptomRecord = {
        user_id: STATIC_USER_ID,
        symptoms: checkIn.symptoms.join(', '),
        painlvl: checkIn.painLevel,
        description: checkIn.voiceNote || null
      };

      const { data, error } = await supabase
        .from('symptoms')
        .insert([symptomRecord])
        .select()
        .single();

      if (error) {
        console.error('Error saving check-in:', error);
        Alert.alert('Error', 'Failed to save check-in. Please try again.');
        return;
      }

      console.log('Check-in saved successfully:', data);
      Alert.alert('Success', 'Check-in submitted successfully!');

      // Reload check-ins from database
      await loadCheckIns();
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  if (loading) {
    return (
      <View style={loadingStyles.container}>
        <View style={loadingStyles.header}>
          <Text style={loadingStyles.appName}>SymptoTrack</Text>
          <Text style={loadingStyles.appTagline}>Post-Treatment Care Monitoring</Text>
        </View>
        <View style={loadingStyles.loadingContainer}>
          <Text style={loadingStyles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb"
  },
  header: {
    backgroundColor: "#2563eb",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center"
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4
  },
  appTagline: {
    fontSize: 14,
    color: "#bfdbfe"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280'
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb"
  },
  header: {
    backgroundColor: "#2563eb",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center"
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4
  },
  appTagline: {
    fontSize: 14,
    color: "#bfdbfe"
  },
  content: {
    flex: 1
  }
});