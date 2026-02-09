import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import type { Patient, CheckIn } from '../App';

type Props = {
  patient: Patient;
  onSubmit: (checkIn: Omit<CheckIn, 'id' | 'riskLevel' | 'riskExplanation'>) => void;
  onViewHistory?: () => void;
  onViewAppointments?: () => void;
  onBookAppointment?: () => void;
};

const symptomOptions = [
  'fatigue',
  'sleep issues',
  'difficulty moving',
  'swelling',
  'nausea',
  'dizziness',
  'fever',
  'loss of appetite'
];

export function CaregiverCheckin({ patient, onSubmit, onViewHistory, onViewAppointments, onBookAppointment }: Props) {
  const [painLevel, setPainLevel] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [voiceNote, setVoiceNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recognizing, setRecognizing] = useState(false);

  // Check if speech recognition is available
  useEffect(() => {
    const checkAvailability = async () => {
      const result = await ExpoSpeechRecognitionModule.getStateAsync();
      if (result.state === "unavailable") {
        Alert.alert(
          "Speech Recognition Unavailable",
          "Speech recognition is not available on this device"
        );
      }
    };
    checkAvailability();
  }, []);

  // Handle speech recognition events
  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcripts = event.results.map((result) => result.transcript);
    setVoiceNote(transcripts.join(" "));
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Speech recognition error:", event.error);
    Alert.alert("Error", `Speech recognition failed: ${event.error}`);
    setRecognizing(false);
  });

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const startRecording = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert("Permission Required", "Please grant microphone permission");
        return;
      }

      await ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        contextualStrings: ["pain", "symptoms", "feeling", "recovery"],
      });
      
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  const stopRecording = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const clearRecording = () => {
    setVoiceNote('');
  };

  const handleSubmit = () => {
    const today = new Date().toISOString().split('T')[0];
    
    onSubmit({
      date: today,
      painLevel,
      symptoms: selectedSymptoms,
      voiceNote: voiceNote || '',
      voiceTranscript: voiceNote || ''
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPainLevel(1);
      setSelectedSymptoms([]);
      setVoiceNote('');
    }, 2000);
  };

  const latestCheckIn = patient.checkIns[patient.checkIns.length - 1];

  // Get color based on pain level
  const getSliderColor = (value: number) => {
    if (value <= 3) return '#10b981'; // green
    if (value <= 6) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Patient Info Card */}
      <View style={styles.card}>
        <View style={styles.patientHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>Patient: {patient.name}</Text>
            <Text style={styles.patientCondition}>{patient.condition}</Text>
            <Text style={styles.patientAge}>Age: {patient.age}</Text>
          </View>
        </View>
      </View>

      {/* View History Button */}
      {onViewHistory && (
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={onViewHistory}
        >
          <Ionicons name="time-outline" size={20} color="#2563eb" />
          <Text style={styles.historyButtonText}>View Check-in History</Text>
        </TouchableOpacity>
      )}

      {/* Appointments Buttons */}
      {patient.assignedDoctor && (
        <View style={styles.appointmentsRow}>
          {onViewAppointments && (
            <TouchableOpacity 
              style={styles.appointmentButton}
              onPress={onViewAppointments}
            >
              <Ionicons name="calendar-outline" size={20} color="#10b981" />
              <Text style={styles.appointmentButtonText}>My Appointments</Text>
            </TouchableOpacity>
          )}
          {onBookAppointment && (
            <TouchableOpacity 
              style={styles.bookAppointmentButton}
              onPress={onBookAppointment}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.bookAppointmentButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {submitted ? (
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={48} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Check-in Submitted</Text>
          <Text style={styles.successText}>Data sent for analysis</Text>
        </View>
      ) : (
        <>
          {/* Pain Level with Slider */}
          <View style={styles.card}>
            <Text style={styles.label}>How is the pain today?</Text>
            
            <View style={styles.sliderContainer}>
              <View style={styles.painValueCircle}>
                <Text style={styles.painValue}>{painLevel}</Text>
              </View>
              
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={painLevel}
                onValueChange={setPainLevel}
                minimumTrackTintColor={getSliderColor(painLevel)}
                maximumTrackTintColor="#e5e7eb"
                thumbTintColor={getSliderColor(painLevel)}
              />
            </View>
            
            <View style={styles.painLabels}>
              <Text style={styles.painLabelText}>Mild (1)</Text>
              <Text style={styles.painLabelText}>Moderate (5)</Text>
              <Text style={styles.painLabelText}>Severe (10)</Text>
            </View>

            {latestCheckIn && (
              <View style={styles.previousPain}>
                <Text style={styles.previousPainText}>
                  Previous: <Text style={styles.previousPainValue}>{latestCheckIn.painLevel}</Text> on{' '}
                  {new Date(latestCheckIn.date).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Symptoms */}
          <View style={styles.card}>
            <Text style={styles.label}>
              Any symptoms today?{' '}
              <Text style={styles.labelOptional}>(optional)</Text>
            </Text>
            
            <View style={styles.symptomsGrid}>
              {symptomOptions.map(symptom => (
                <TouchableOpacity
                  key={symptom}
                  onPress={() => toggleSymptom(symptom)}
                  style={[
                    styles.symptomButton,
                    selectedSymptoms.includes(symptom) && styles.symptomButtonSelected
                  ]}
                >
                  <Text style={[
                    styles.symptomButtonText,
                    selectedSymptoms.includes(symptom) && styles.symptomButtonTextSelected
                  ]}>
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Voice Note with Speech-to-Text */}
          <View style={styles.card}>
            <Text style={styles.label}>
              Voice Note{' '}
              <Text style={styles.labelOptional}>(optional)</Text>
            </Text>

            <TouchableOpacity
              onPress={toggleRecording}
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive
              ]}
              disabled={recognizing && !isRecording}
            >
              <Ionicons 
                name={isRecording ? "stop-circle" : "mic-outline"} 
                size={24} 
                color={isRecording ? "#dc2626" : "#374151"} 
              />
              <Text style={[
                styles.recordButtonText,
                isRecording && styles.recordButtonTextActive
              ]}>
                {isRecording ? 'Tap to Stop Recording' : recognizing ? 'Processing...' : 'Tap to Start Voice Input'}
              </Text>
            </TouchableOpacity>

            {voiceNote && (
              <View style={styles.transcriptPreview}>
                <View style={styles.transcriptHeader}>
                  <Ionicons name="document-text" size={20} color="#10b981" />
                  <Text style={styles.transcriptHeaderText}>Transcribed Text:</Text>
                  <TouchableOpacity onPress={clearRecording}>
                    <Ionicons name="close-circle" size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.transcriptText}>{voiceNote}</Text>
              </View>
            )}

            <Text style={styles.voiceNoteHelper}>Or type manually:</Text>
            <TextInput
              value={voiceNote}
              onChangeText={setVoiceNote}
              placeholder="e.g., 'Doing fine today' or 'Had sharp pain. Barely slept.'"
              multiline
              numberOfLines={3}
              style={styles.textInput}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Submit Daily Check-in</Text>
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              Your check-in will be analyzed by our AI system. The doctor will be notified if any concerning patterns are detected.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  patientCondition: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  patientAge: {
    fontSize: 14,
    color: '#9ca3af',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  historyButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  appointmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  appointmentButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  bookAppointmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  bookAppointmentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#15803d',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  labelOptional: {
    fontSize: 14,
    color: '#9ca3af',
  },
  sliderContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  painValueCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  painValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#111827',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  painLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  painLabelText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  previousPain: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  previousPainText: {
    fontSize: 14,
    color: '#6b7280',
  },
  previousPainValue: {
    color: '#111827',
    fontWeight: '600',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  symptomButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
  symptomButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  symptomButtonTextSelected: {
    color: '#1d4ed8',
    fontWeight: '500',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  recordButtonActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  recordButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  recordButtonTextActive: {
    color: '#dc2626',
  },
  transcriptPreview: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  transcriptHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  transcriptText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  voiceNoteHelper: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});