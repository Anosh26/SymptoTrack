import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  Modal,
  BackHandler,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Audio } from 'expo-av';
import type { Patient } from '../App';

type Props = {
  patient: Patient;
  onBack: () => void;
  onBookAppointment?: () => void;
};

export function PatientDetail({ patient, onBack, onBookAppointment }: Props) {
  const [inVideoCall, setInVideoCall] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const latestCheckIn = patient.checkIns.length > 0 ? patient.checkIns[patient.checkIns.length - 1] : null;
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (inVideoCall) {
        setInVideoCall(false); // Close video call modal only
        return true;
      }
      onBack(); // Navigate back to dashboard
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [inVideoCall, onBack]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playRecording = async (recordingUri: string, checkInId: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setPlayingId(checkInId);

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          setPlayingId(null);
        }
      });

    } catch (err) {
      console.error('Failed to play recording', err);
      Alert.alert('Error', 'Failed to play recording');
      setPlayingId(null);
    }
  };
  
  // Get recent 7 days for chart (most recent first, then reverse for chronological order)
  const recentCheckIns = [...patient.checkIns].slice(-7).reverse();
  
  const chartData = {
    labels: recentCheckIns.map(checkIn => 
      new Date(checkIn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [{
      data: recentCheckIns.map(checkIn => checkIn.painLevel)
    }]
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    const normalizedLevel = level.toLowerCase();
    switch (normalizedLevel) {
      case 'high':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'medium':
      case 'moderate': // Handle 'moderate' as well
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'low':
      default:
        return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
    }
  };

  const handleStartVideoCall = () => {
    setInVideoCall(true);
    // Simulate call duration
    setTimeout(() => setInVideoCall(false), 5000);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <View style={styles.container}>
      {/* Video Call Modal */}
      <Modal
        visible={inVideoCall}
        animationType="slide"
        onRequestClose={() => setInVideoCall(false)}
      >
        <View style={styles.videoCallContainer}>
          <View style={styles.videoScreen}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarTextLarge}>{getInitials(patient.name)}</Text>
            </View>
            <Text style={styles.videoCallName}>{patient.name}</Text>
            <Text style={styles.videoCallStatus}>Connected</Text>
          </View>
          
          <View style={styles.videoCallControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="videocam" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, styles.endCallButton]}
              onPress={() => setInVideoCall(false)}
            >
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#6b7280" />
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
        
        {/* Patient Info Card */}
        <View style={styles.card}>
          <View style={styles.patientHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientCondition}>{patient.condition}</Text>
              <Text style={styles.patientAge}>Age: {patient.age}</Text>
              
              {/* Show assigned doctor */}
              {patient.assignedDoctor && (
                <View style={styles.doctorCard}>
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorAvatarText}>Dr</Text>
                  </View>
                  <View>
                    <Text style={styles.doctorName}>{patient.assignedDoctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{patient.assignedDoctor.specialty}</Text>
                  </View>
                </View>
              )}
            </View>
            <View 
              style={[
                styles.riskBadge,
                { 
                  backgroundColor: getRiskColor(patient.currentRiskLevel).bg,
                  borderColor: getRiskColor(patient.currentRiskLevel).border
                }
              ]}
            >
              <Text style={[
                styles.riskBadgeText,
                { color: getRiskColor(patient.currentRiskLevel).text }
              ]}>
                {patient.currentRiskLevel.toUpperCase()} RISK
              </Text>
            </View>
          </View>
          
          <View style={styles.buttonsRow}>
            <TouchableOpacity 
              onPress={handleStartVideoCall}
              style={styles.videoButton}>
              <Ionicons name="videocam" size={20} color="#fff" />
              <Text style={styles.videoButtonText}>Start Video Call</Text>
            </TouchableOpacity>

            {onBookAppointment && (
              <TouchableOpacity 
                onPress={onBookAppointment}
                style={styles.appointmentButtonSmall}>
                <Ionicons name="calendar" size={20} color="#8b5cf6" />
                <Text style={styles.appointmentButtonSmallText}>Book Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Risk Alert Explanation */}
        {latestCheckIn && patient.currentRiskLevel !== 'low' && latestCheckIn.riskExplanation && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="alert-circle" size={24} color="#dc2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Risk Alert Explanation</Text>
                <Text style={styles.alertSubtitle}>
                  AI detected concerning patterns. Here's why this patient needs attention:
                </Text>
              </View>
            </View>

            <View style={styles.alertContent}>
              {latestCheckIn.riskExplanation.painChange && (
                <View style={styles.alertItem}>
                  <Ionicons name="trending-up" size={20} color="#dc2626" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertItemTitle}>Pain Trend</Text>
                    <Text style={styles.alertItemText}>{latestCheckIn.riskExplanation.painChange}</Text>
                  </View>
                </View>
              )}

              {latestCheckIn.riskExplanation.newSymptoms && latestCheckIn.riskExplanation.newSymptoms.length > 0 && (
                <View style={styles.alertItem}>
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertItemTitle}>New Symptoms</Text>
                    <Text style={styles.alertItemText}>
                      {latestCheckIn.riskExplanation.newSymptoms.join(', ')}
                    </Text>
                  </View>
                </View>
              )}

              {latestCheckIn.riskExplanation.sentimentAnalysis && (
                <View style={styles.alertItem}>
                  <Ionicons name="chatbox-ellipses" size={20} color="#dc2626" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertItemTitle}>Voice Analysis</Text>
                    <Text style={styles.alertItemText}>{latestCheckIn.riskExplanation.sentimentAnalysis}</Text>
                  </View>
                </View>
              )}

              {latestCheckIn.riskExplanation.keywords && latestCheckIn.riskExplanation.keywords.length > 0 && (
                <View style={styles.alertItem}>
                  <Ionicons name="pricetags" size={20} color="#dc2626" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertItemTitle}>Keywords Detected</Text>
                    <View style={styles.keywordsContainer}>
                      {latestCheckIn.riskExplanation.keywords.map(kw => (
                        <View key={kw} style={styles.keywordBadge}>
                          <Text style={styles.keywordText}>{kw}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Pain Trend Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pain Level Trend (Last 7 Days)</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 64}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#ef4444'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Recent Check-ins */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Check-ins</Text>
          <View style={styles.checkInsList}>
            {patient.checkIns.slice().reverse().map(checkIn => (
              <View key={checkIn.id} style={styles.checkInCard}>
                <View style={styles.checkInHeader}>
                  <View style={styles.checkInDate}>
                    <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                    <Text style={styles.checkInDateText}>
                      {new Date(checkIn.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View 
                    style={[
                      styles.checkInRiskBadge,
                      { 
                        backgroundColor: getRiskColor(checkIn.riskLevel).bg,
                        borderColor: getRiskColor(checkIn.riskLevel).border
                      }
                    ]}
                  >
                    <Text style={[
                      styles.checkInRiskText,
                      { color: getRiskColor(checkIn.riskLevel).text }
                    ]}>
                      {checkIn.riskLevel}
                    </Text>
                  </View>
                </View>

                <View style={styles.checkInDetails}>
                  <View style={styles.checkInDetailItem}>
                    <Text style={styles.checkInDetailLabel}>Pain Level:</Text>
                    <Text style={styles.checkInDetailValue}>{checkIn.painLevel}/10</Text>
                  </View>
                  <View style={styles.checkInDetailItem}>
                    <Text style={styles.checkInDetailLabel}>Symptoms:</Text>
                    <Text style={styles.checkInDetailValue}>
                      {checkIn.symptoms.length === 0 ? 'None' : checkIn.symptoms.join(', ')}
                    </Text>
                  </View>
                </View>

                {checkIn.voiceTranscript && (
                  <View style={styles.transcriptCard}>
                    <Text style={styles.transcriptLabel}>Voice Transcript:</Text>
                    <Text style={styles.transcriptText}>"{checkIn.voiceTranscript}"</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
  },
  patientHeader: {
    marginBottom: 16,
  },
  patientName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  patientCondition: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  patientAge: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#6b7280',
  },
  riskBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  videoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  appointmentButtonSmallText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  alertCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#991b1b',
  },
  alertContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  alertItem: {
    flexDirection: 'row',
    gap: 12,
  },
  alertItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  alertItemText: {
    fontSize: 14,
    color: '#6b7280',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  keywordBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  keywordText: {
    fontSize: 12,
    color: '#991b1b',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  checkInsList: {
    gap: 12,
  },
  checkInCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkInDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkInDateText: {
    fontSize: 14,
    color: '#111827',
  },
  checkInRiskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkInRiskText: {
    fontSize: 10,
    fontWeight: '600',
  },
  checkInDetails: {
    gap: 8,
    marginBottom: 12,
  },
  checkInDetailItem: {
    flexDirection: 'row',
    gap: 8,
  },
  checkInDetailLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  checkInDetailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  transcriptCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcriptLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  transcriptText: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
  miniPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
  },
  miniPlayText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  videoCallContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'space-between',
    padding: 16,
  },
  videoScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarTextLarge: {
    fontSize: 48,
    fontWeight: '600',
    color: '#fff',
  },
  videoCallName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  videoCallStatus: {
    fontSize: 16,
    color: '#9ca3af',
  },
  videoCallControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallButton: {
    backgroundColor: '#dc2626',
  },
});