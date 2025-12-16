import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MOCK_PATIENTS } from '@/src/data/mockPatients';
import { LineChart } from 'react-native-chart-kit';

export default function PatientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Find the patient by ID
  const patient = MOCK_PATIENTS.find(p => p.id === id);

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Patient not found</Text>
      </SafeAreaView>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return '#FF4444';
      case 'MODERATE': return '#FFCC00';
      default: return '#00C851';
    }
  };

  const getButtonColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return '#D32F2F';     // Dark Red
      case 'MODERATE': return '#F57F17'; // Dark Yellow/Orange
      default: return '#00A040';         // Dark Green
    }
  };

  const riskColor = getRiskColor(patient.riskLevel);

  // Mock pain trend data (7 days)
  const painTrendData = {
    labels: ['Dec 1', 'Dec 2', 'Dec 3', 'Dec 4', 'Dec 5', 'Dec 6', 'Dec 7'],
    datasets: [
      {
        data: [4, 3, 4, 5, 5, 6, patient.painLevel],
        color: () => riskColor,
        strokeWidth: 2,
      },
    ],
  };

  // Mock recent check-ins
  const recentCheckIns = [
    {
      date: 'Today',
      painLevel: patient.painLevel,
      symptoms: patient.symptoms,
      transcript: 'Patient reports increased pain and difficulty sleeping.',
      riskLevel: 'high',
    },
    {
      date: 'Yesterday',
      painLevel: patient.painLevel - 1,
      symptoms: ['Fatigue', 'Sleep issues'],
      transcript: 'Patient feeling tired but stable.',
      riskLevel: 'medium',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Patient Details',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Patient Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientAge}>Age: {patient.age}</Text>
            <Text style={styles.patientLastCheck}>Last check-in: {patient.lastCheckIn}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
            <Text style={[styles.riskBadgeText, { color: riskColor }]}>
              {patient.riskLevel} RISK
            </Text>
          </View>
        </View>

        {/* Video Call Button */}
        <TouchableOpacity 
          style={[styles.videoCallButton]}
          onPress={() => console.log('Starting video call...')}
          activeOpacity={0.85}
        >
          <Text style={styles.videoCallButtonText}>Start Call</Text>
        </TouchableOpacity>

        {/* Current Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Current Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Pain Level</Text>
              <Text style={styles.statusValue}>{patient.painLevel}/10</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Symptoms</Text>
              <Text style={styles.statusValue}>{patient.symptoms.length}</Text>
            </View>
          </View>
          
          {patient.symptoms.length > 0 && (
            <View style={styles.symptomsList}>
              <Text style={styles.symptomsLabel}>Reported Symptoms:</Text>
              {patient.symptoms.map((symptom, index) => (
                <Text key={index} style={styles.symptomItem}>
                  • {symptom}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Pain Trend Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Pain Level Trend (Last 7 Days)</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={painTrendData}
              width={350}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: () => '#ddd',
                labelColor: () => '#888',
                style: {
                  borderRadius: 8,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: riskColor,
                },
              }}
              bezier
            />
          </View>
        </View>

        {/* Risk Alert Box */}
        {patient.riskLevel === 'HIGH' && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>⚠️ Risk Alert Explanation</Text>
            <Text style={styles.alertDescription}>
              AI detected concerning patterns. Here's why this patient needs attention:
            </Text>
            <View style={styles.alertReasons}>
              <View style={styles.reasonItem}>
                <Text style={styles.reasonIcon}>📈</Text>
                <View>
                  <Text style={styles.reasonTitle}>Pain Trend</Text>
                  <Text style={styles.reasonText}>Increasing pain over 2 days</Text>
                </View>
              </View>
              <View style={styles.reasonItem}>
                <Text style={styles.reasonIcon}>🆕</Text>
                <View>
                  <Text style={styles.reasonTitle}>New Symptoms</Text>
                  <Text style={styles.reasonText}>{patient.symptoms[0]}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recent Check-ins */}
        <View style={styles.checkInsCard}>
          <Text style={styles.cardTitle}>Recent Check-ins</Text>
          {recentCheckIns.map((checkIn, index) => (
            <View key={index} style={styles.checkInItem}>
              <View style={styles.checkInHeader}>
                <Text style={styles.checkInDate}>{checkIn.date}</Text>
                <View 
                  style={[
                    styles.checkInRisk,
                    { 
                      backgroundColor: 
                        checkIn.riskLevel === 'high' ? '#FFE5E5' : '#FFFAEB'
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.checkInRiskText,
                      { 
                        color: checkIn.riskLevel === 'high' ? '#D32F2F' : '#F57F17'
                      }
                    ]}
                  >
                    {checkIn.riskLevel}
                  </Text>
                </View>
              </View>
              
              <View style={styles.checkInDetails}>
                <Text style={styles.checkInLabel}>Pain Level: <Text style={{fontWeight: 'bold'}}>{checkIn.painLevel}/10</Text></Text>
                <Text style={styles.checkInLabel}>Symptoms: {checkIn.symptoms.join(', ')}</Text>
              </View>
              
              <View style={styles.checkInTranscript}>
                <Text style={styles.transcriptLabel}>Voice Transcript:</Text>
                <Text style={styles.transcriptText}>"{checkIn.transcript}"</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 20,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  patientLastCheck: {
    fontSize: 14,
    color: '#999',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  videoCallButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  videoCallButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 12,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statusLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  symptomsList: {
    marginTop: 8,
  },
  symptomsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  symptomItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  alertBox: {
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#B71C1C',
    marginBottom: 12,
  },
  alertReasons: {
    marginTop: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reasonIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 13,
    color: '#666',
  },
  checkInsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkInItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkInDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  checkInRisk: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  checkInRiskText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  checkInDetails: {
    marginBottom: 8,
  },
  checkInLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  checkInTranscript: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
});