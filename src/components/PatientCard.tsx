import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Patient } from '../types/patient';

interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return '#FF4444';
      case 'MODERATE': return '#FFCC00';
      default: return '#00C851';
    }
  };

  const getButtonColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return '#D32F2F';
      case 'MODERATE': return '#F57F17';
      default: return '#00A040';
    }
  };

  const riskColor = getRiskColor(patient.riskLevel);
  const buttonColor = getButtonColor(patient.riskLevel);

  const handleVideoCall = (e: any) => {
    e.preventDefault();
    console.log(`Starting video call with ${patient.name}`);
  };

  return (
    <Link 
      href={{
        pathname: '/patient/[id]',
        params: { id: patient.id }
      }}
      asChild
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={[styles.indicator, { backgroundColor: riskColor }]} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{patient.name}</Text>
              <Text style={styles.subText}>Age: {patient.age} • Last update: {patient.lastCheckIn}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: riskColor + '20' }]}>
              <Text style={[styles.riskText, { color: riskColor }]}>
                {patient.riskLevel} RISK
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.infoSection}>
              <Text style={styles.painText}>Pain Level: <Text style={{fontWeight: 'bold'}}>{patient.painLevel}/10</Text></Text>
              {patient.symptoms.length > 0 && (
                <Text style={styles.symptomText}>{patient.symptoms[0]} {patient.symptoms.length > 1 ? `+${patient.symptoms.length - 1} more` : ''}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.callButton, { backgroundColor: buttonColor }]}
              onPress={handleVideoCall}
              activeOpacity={0.85}
            >
              <Text style={styles.callButtonText}>Start Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  indicator: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '800',
  },
  subText: {
    fontSize: 13,
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  infoSection: {
    flex: 1,
  },
  painText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  symptomText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  callButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});