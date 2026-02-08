import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { AppointmentModal } from "./components/AppointmentModal";
import { AppointmentsList } from "./components/AppointmentsList";
import { CaregiverCheckin } from "./components/CaregiverCheckin";
import { PatientDetail } from "./components/PatientDetail";
import { supabase, SymptomRecord, AppointmentRecord } from "./lib/supabase";

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
  recordingUri?: string;
};

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  type: "Video Consultation" | "In-Person" | "Phone Call";
  notes: string;
  created_at: string;
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
  appointments?: Appointment[];
};

// Mock patient data - keeping static for now
const STATIC_USER_ID = "6f209238-27e9-464e-881d-67b59b993a53"; // Replace with one of your actual user IDs
const STATIC_DOCTOR_ID = "f1f155f1-44bc-4e02-938e-45195850c2af"; // Shreyash - doctor from users table

const mockPatient: Patient = {
  id: STATIC_USER_ID,
  name: "Sarah Johnson",
  age: 68,
  condition: "Post-surgery recovery",
  currentRiskLevel: "low",
  assignedDoctor: {
    id: STATIC_DOCTOR_ID,
    name: "Dr. Emily Carter",
    specialty: "Post-operative Care"
  },
  checkIns: [],
  appointments: []
};

export default function App() {
  const [patient, setPatient] = useState<Patient>(mockPatient);
  const [showHistory, setShowHistory] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load check-ins and appointments from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadCheckIns(),
      loadAppointments()
    ]);
    setLoading(false);
  };

  const loadCheckIns = async () => {
    try {
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
      console.error('Unexpected error loading check-ins:', err);
      Alert.alert('Error', 'An unexpected error occurred while loading check-ins');
    }
  };

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select<'*', AppointmentRecord>('*')
        .eq('patient_id', STATIC_USER_ID)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading appointments:', error);
        Alert.alert('Error', 'Failed to load appointments');
        return;
      }

      // Convert Supabase data to Appointment format
      const appointments: Appointment[] = (data || []).map(record => {
        const dateTime = new Date(record.date);
        return {
          id: record.id,
          patient_id: record.patient_id,
          doctor_id: record.doctor_id,
          date: dateTime.toISOString().split('T')[0],
          time: dateTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          status: record.status as Appointment['status'],
          type: record.type as Appointment['type'],
          notes: record.notes || '',
          created_at: record.created_at
        };
      });

      setPatient(prev => ({
        ...prev,
        appointments
      }));
    } catch (err) {
      console.error('Unexpected error loading appointments:', err);
      Alert.alert('Error', 'An unexpected error occurred while loading appointments');
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
      // Validate pain level (must be 1-10)
      if (checkIn.painLevel < 1 || checkIn.painLevel > 10) {
        Alert.alert('Invalid Data', 'Pain level must be between 1 and 10');
        return;
      }

      // Prepare data for Supabase
      const symptomRecord = {
        user_id: STATIC_USER_ID,
        symptoms: checkIn.symptoms.length > 0 ? checkIn.symptoms.join(', ') : 'None',
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

  const bookAppointment = async (appointmentData: Omit<Appointment, "id" | "created_at" | "patient_id">) => {
    try {
      // Parse date and time separately for better compatibility
      const [year, month, day] = appointmentData.date.split('-').map(Number);
      const timeString = appointmentData.time;
      
      // Parse time (handles both 12-hour and 24-hour format)
      const timeParts = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!timeParts) {
        Alert.alert('Error', 'Invalid time format');
        return;
      }
      
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3]?.toUpperCase();
      
      // Convert to 24-hour format if needed
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      // Create date object
      const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Validate the date
      if (isNaN(appointmentDateTime.getTime())) {
        Alert.alert('Error', 'Invalid date or time format');
        return;
      }

      const appointmentRecord = {
        patient_id: STATIC_USER_ID,
        doctor_id: appointmentData.doctor_id,
        date: appointmentDateTime.toISOString(),
        status: appointmentData.status || 'Pending',
        type: appointmentData.type || 'Video Consultation',
        notes: appointmentData.notes
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentRecord])
        .select()
        .single();

      if (error) {
        console.error('Error booking appointment:', error);
        Alert.alert('Error', 'Failed to book appointment. Please try again.');
        return;
      }

      console.log('Appointment booked:', data);
      Alert.alert('Success', 'Appointment request submitted!');
      
      // Reload appointments from database
      await loadAppointments();
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
            onBookAppointment={() => {
              setShowHistory(false);
              setShowAppointmentModal(true);
            }}
          />
        ) : showAppointments ? (
          <AppointmentsList
            patient={patient}
            onBack={() => setShowAppointments(false)}
            onBookNew={() => setShowAppointmentModal(true)}
          />
        ) : (
          <CaregiverCheckin
            patient={patient}
            onSubmit={addCheckIn}
            onViewHistory={() => setShowHistory(true)}
            onViewAppointments={() => setShowAppointments(true)}
            onBookAppointment={() => setShowAppointmentModal(true)}
          />
        )}
      </View>

      {/* Appointment Booking Modal */}
      <AppointmentModal
        visible={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSubmit={bookAppointment}
        doctor={patient.assignedDoctor}
      />
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