import { View, Text, ScrollView, TouchableOpacity, StyleSheet, BackHandler} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Appointment, Patient } from '../App';
import { useEffect } from "react";

type Props = {
  patient: Patient;
  onBack: () => void;
  onBookNew: () => void;
};

export function AppointmentsList({ patient, onBack, onBookNew }: Props) {
  const appointments = patient.appointments || [];

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      onBack();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [onBack]);

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed':
        return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
      case 'Pending':
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'Cancelled':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'Completed':
        return { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' };
    }
  };

  const getTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'Video Consultation':
        return 'videocam';
      case 'In-Person':
        return 'person';
      case 'Phone Call':
        return 'call';
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6b7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onBookNew} style={styles.bookButton}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Book New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>My Appointments</Text>
        <Text style={styles.subtitle}>
          {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
        </Text>
      </View>

      {/* Appointments List */}
      {sortedAppointments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>No Appointments</Text>
          <Text style={styles.emptyStateText}>
            You haven't booked any appointments yet
          </Text>
          <TouchableOpacity onPress={onBookNew} style={styles.emptyStateButton}>
            <Text style={styles.emptyStateButtonText}>Book Your First Appointment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.appointmentsList}>
          {sortedAppointments.map(appointment => (
            <View key={appointment.id} style={styles.appointmentCard}>
              {/* Header */}
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentTypeIcon}>
                  <Ionicons name={getTypeIcon(appointment.type)} size={20} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appointmentType}>{appointment.type}</Text>
                  <Text style={styles.appointmentDoctor}>
                    {patient.assignedDoctor?.name || 'Doctor'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(appointment.status).bg,
                      borderColor: getStatusColor(appointment.status).border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: getStatusColor(appointment.status).text }
                    ]}
                  >
                    {appointment.status}
                  </Text>
                </View>
              </View>

              {/* Date & Time */}
              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>{appointment.time}</Text>
                </View>
              </View>

              {/* Notes */}
              {appointment.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{appointment.notes}</Text>
                </View>
              )}

              {/* Actions */}
              {appointment.status === 'Confirmed' && (
                <TouchableOpacity style={styles.joinButton}>
                  <Ionicons name="videocam" size={18} color="#fff" />
                  <Text style={styles.joinButtonText}>Join Consultation</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  appointmentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  appointmentDoctor: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  appointmentDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
  },
  notesSection: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});