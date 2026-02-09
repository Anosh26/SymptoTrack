import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { AppointmentModal } from "./components/AppointmentModal";
import { AppointmentsList } from "./components/AppointmentsList";
import { CaregiverCheckin } from "./components/CaregiverCheckin";
import { PatientDetail } from "./components/PatientDetail";
import { supabase, SymptomRecord, AppointmentRecord, UserRecord, PatientProfileRecord, DoctorProfileRecord } from "./lib/supabase";
import { useRouter } from 'expo-router';

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

// User IDs
const STATIC_USER_ID = "11111111-1111-1111-1111-111111111111"; // Patient user ID
const STATIC_DOCTOR_ID = "f1f155f1-44bc-4e02-938e-45195850c2af"; // Doctor user ID

const mockPatient: Patient = {
  id: STATIC_USER_ID,
  name: "Loading...",
  age: 0,
  condition: "Loading...",
  currentRiskLevel: "low",
  assignedDoctor: {
    id: STATIC_DOCTOR_ID,
    name: "Loading...",
    specialty: "Loading..."
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
  const router = useRouter(); // Initialize the router

  // Load check-ins and appointments from Supabase on mount
  useEffect(() => {
    // 1. Initial Data Load
    loadData();

    // 2. Realtime Listener
    console.log("🔴 Setting up Realtime Listener...");
    
    const channel = supabase
      .channel('appointments-tracking')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', 
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${STATIC_USER_ID}`, 
        },
        (payload) => {
          // ✅ FIX: Cast payload.new to 'AppointmentRecord' so TypeScript knows it has a 'status' property
          const newRecord = payload.new as AppointmentRecord;
          
          console.log("🟢 Update received. New Status:", newRecord.status);

          // Check if status is IN_PROGRESS (or whatever your doctor app sends)
          if (newRecord.status === 'IN_PROGRESS') {
            Alert.alert(
              'Incoming Consultation',
              'Your doctor is starting the video call.',
              [
                { 
                  text: 'Join Now', 
                  onPress: () => {
                    // Safety check: ensure router exists before pushing
                    if (router) {
                      router.push({
                        pathname: "/consultation",
                        params: {
                          roomId: newRecord.id, // Using Appointment ID as Room ID
                          patientName: patient.name
                        }
                      });
                    } else {
                      console.error("Router is not mounted. Cannot navigate.");
                      // Fallback: If you are using manual state navigation in App.tsx, 
                      // you might need a setShowConsultation(true) state here instead.
                    }
                  } 
                },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadPatientData(),
      loadDoctorData(),
      loadCheckIns(),
      loadAppointments()
    ]);
    setLoading(false);
  };

  const loadPatientData = async () => {
    try {
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select<'*', UserRecord>('*')
        .eq('id', STATIC_USER_ID)
        .single();

      if (userError) {
        console.error('Error loading user data:', userError);
        return;
      }

      // Fetch patient profile data
      const { data: profileData, error: profileError } = await supabase
        .from('patient_profiles')
        .select<'*', PatientProfileRecord>('*')
        .eq('user_id', STATIC_USER_ID)
        .single();

      if (profileError) {
        console.error('Error loading patient profile:', profileError);
      }

      // Use patient_profiles data if available, otherwise fall back to users table
      const patientAge = profileData?.age || userData.age || 0;
      const patientCondition = profileData?.condition || userData.condition || 'General';
      const riskLevel = profileData?.risk_level || userData.risk_level || 'Low';

      setPatient(prev => ({
        ...prev,
        name: userData.name,
        age: patientAge,
        condition: patientCondition,
        currentRiskLevel: riskLevel.toLowerCase() as 'low' | 'medium' | 'high'
      }));
    } catch (err) {
      console.error('Unexpected error loading patient data:', err);
      Alert.alert('Error', 'Failed to load patient information');
    }
  };

  const loadDoctorData = async () => {
    try {
      // Fetch doctor user data
      const { data: doctorUser, error: doctorUserError } = await supabase
        .from('users')
        .select<'*', UserRecord>('*')
        .eq('id', STATIC_DOCTOR_ID)
        .single();

      if (doctorUserError) {
        console.error('Error loading doctor user data:', doctorUserError);
        return;
      }

      // Fetch doctor profile data (optional - may not exist)
      const { data: doctorProfile, error: doctorProfileError } = await supabase
        .from('doctor_profiles')
        .select<'*', DoctorProfileRecord>('*')
        .eq('user_id', STATIC_DOCTOR_ID)
        .maybeSingle(); // Use maybeSingle() instead of single() to allow null

      // Don't log error if profile doesn't exist
      if (doctorProfileError && doctorProfileError.code !== 'PGRST116') {
        console.error('Error loading doctor profile:', doctorProfileError);
      }

      const specialty = doctorProfile?.specialization || 'General Practice';

      setPatient(prev => ({
        ...prev,
        assignedDoctor: {
          id: STATIC_DOCTOR_ID,
          name: doctorUser.name,
          specialty: specialty
        }
      }));
    } catch (err) {
      console.error('Unexpected error loading doctor data:', err);
    }
  };

  const loadCheckIns = async () => {
    try {
      console.log('Loading check-ins for user:', STATIC_USER_ID);
      
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

      console.log('Check-ins loaded:', data?.length || 0, 'records');

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
    if (painLevel >= 4) return 'medium'; // Changed from 5 to 4 to better match pain scale
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