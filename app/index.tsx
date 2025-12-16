import React from 'react';
import { StyleSheet, View, FlatList, Text, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Stack } from 'expo-router'; 
import { MOCK_PATIENTS } from '@/src/data/mockPatients';
import PatientCard from '@/src/components/PatientCard';

export default function DoctorDashboard() {
  const highRiskCount = MOCK_PATIENTS.filter(p => p.riskLevel === 'HIGH').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* This sets the title in the top bar */}
      <Stack.Screen options={{ title: 'Doctor Dashboard', headerTitleAlign: 'center' }} />

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.headerTitle}>Dr. Shreyash</Text>
        </View>
        <View style={styles.alertBox}>
          <Text style={styles.alertNumber}>{highRiskCount}</Text>
          <Text style={styles.alertLabel}>Critical</Text>
        </View>
      </View>

      {/* Patient List Section */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Patient List</Text>
        <FlatList
          data={MOCK_PATIENTS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PatientCard patient={item} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    padding: 24,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  alertBox: {
    backgroundColor: '#FFEBEE', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  alertNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  alertLabel: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});