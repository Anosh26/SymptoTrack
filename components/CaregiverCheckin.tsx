import { useState, useRef } from 'react';
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
import { Audio } from 'expo-av';
import type { Patient, CheckIn } from '../App';

type Props = {
  patient: Patient;
  onSubmit: (checkIn: Omit<CheckIn, 'id' | 'riskLevel' | 'riskExplanation'>) => void;
  onViewHistory?: () => void;
};

const symptomOptions = [
  'fatigue',
  'sleep issues',
  'difficulty moving',
  'swelling',
  'nausea',
  'dizziness',
  'fever',
  'loss of appetite',
  'no symptoms'
];

export function CaregiverCheckin({ patient, onSubmit, onViewHistory }: Props) {
  const [painLevel, setPainLevel] = useState(1); // Changed from 4 to 1 (minimum allowed)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [voiceNote, setVoiceNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record audio');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 9) {
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      setRecordingUri(uri);
      recordingRef.current = null;

      Alert.alert('Recording Complete', 'Voice note recorded successfully!');
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

  const playRecording = async () => {
    if (!recordingUri) {
      Alert.alert('No Recording', 'Please record a voice note first');
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

    } catch (err) {
      console.error('Failed to play recording', err);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const deleteRecording = () => {
    setRecordingUri(null);
    setRecordingDuration(0);
    setVoiceNote('');
  };

  const handleSubmit = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Don't include recordingUri in the data sent to database
    onSubmit({
      date: today,
      painLevel,
      symptoms: selectedSymptoms,
      voiceNote: voiceNote || (recordingUri ? `[Voice Recording: ${recordingDuration}s]` : ''),
      voiceTranscript: voiceNote
      // recordingUri is intentionally NOT included here
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPainLevel(1); // Reset to 1 instead of 4
      setSelectedSymptoms([]);
      setVoiceNote('');
      setRecordingUri(null);
      setRecordingDuration(0);
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

          {/* Voice Note */}
          <View style={styles.card}>
            <Text style={styles.label}>
              Voice Note{' '}
              <Text style={styles.labelOptional}>(optional, 10 seconds)</Text>
            </Text>

            {recordingUri ? (
              <View style={styles.recordedContainer}>
                <View style={styles.recordedInfo}>
                  <Ionicons name="mic" size={24} color="#10b981" />
                  <Text style={styles.recordedText}>
                    Recording saved ({recordingDuration}s)
                  </Text>
                </View>
                <View style={styles.recordedActions}>
                  <TouchableOpacity
                    onPress={playRecording}
                    style={styles.playButton}
                  >
                    <Ionicons name="play" size={20} color="#2563eb" />
                    <Text style={styles.playButtonText}>Play</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={deleteRecording}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={toggleRecording}
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive
                ]}
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
                  {isRecording ? `Recording... ${recordingDuration}s / 10s` : 'Tap to Record'}
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.voiceNoteHelper}>Or type what you would say:</Text>
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
  recordedContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  recordedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  recordedText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  recordedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 6,
  },
  playButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 6,
  },
});