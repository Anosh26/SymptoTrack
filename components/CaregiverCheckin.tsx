import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
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
  'loss of appetite'
];

export function CaregiverCheckin({ patient, onSubmit, onViewHistory }: Props) {
  const [painLevel, setPainLevel] = useState(4);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [voiceNote, setVoiceNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    const today = new Date().toISOString().split('T')[0];
    
    onSubmit({
      date: today,
      painLevel,
      symptoms: selectedSymptoms,
      voiceNote,
      voiceTranscript: voiceNote
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPainLevel(4);
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
                minimumValue={0}
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
              <Text style={styles.painLabelText}>No Pain</Text>
              <Text style={styles.painLabelText}>Moderate</Text>
              <Text style={styles.painLabelText}>Severe</Text>
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

            <TouchableOpacity
              onPress={() => setIsRecording(!isRecording)}
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive
              ]}
            >
              <Ionicons 
                name={isRecording ? "mic" : "mic-outline"} 
                size={24} 
                color={isRecording ? "#dc2626" : "#374151"} 
              />
              <Text style={[
                styles.recordButtonText,
                isRecording && styles.recordButtonTextActive
              ]}>
                {isRecording ? 'Recording...' : 'Tap to Record'}
              </Text>
            </TouchableOpacity>

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
});