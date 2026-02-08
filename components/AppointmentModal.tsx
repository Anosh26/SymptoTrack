import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Appointment, Doctor } from '../App';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (appointment: Omit<Appointment, "id" | "created_at" | "patient_id">) => void;
  doctor?: Doctor;
};

export function AppointmentModal({ visible, onClose, onSubmit, doctor }: Props) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<"Video Consultation" | "In-Person" | "Phone Call">("Video Consultation");
  const [notes, setNotes] = useState('');

  const appointmentTypes: Array<"Video Consultation" | "In-Person" | "Phone Call"> = [
    "Video Consultation",
    "In-Person",
    "Phone Call"
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
  ];

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    if (!doctor) {
      alert('No doctor assigned');
      return;
    }

    onSubmit({
      doctor_id: doctor.id,
      date: selectedDate,
      time: selectedTime,
      status: "Pending",
      type: appointmentType,
      notes: notes
    });

    // Reset form
    setSelectedDate('');
    setSelectedTime('');
    setAppointmentType("Video Consultation");
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Doctor Info */}
            {doctor && (
              <View style={styles.doctorInfo}>
                <View style={styles.doctorAvatar}>
                  <Text style={styles.doctorAvatarText}>Dr</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                </View>
              </View>
            )}

            {/* Appointment Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Appointment Type</Text>
              <View style={styles.typeGrid}>
                {appointmentTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setAppointmentType(type)}
                    style={[
                      styles.typeButton,
                      appointmentType === type && styles.typeButtonSelected
                    ]}
                  >
                    <Ionicons
                      name={
                        type === "Video Consultation" ? "videocam" :
                        type === "In-Person" ? "person" : "call"
                      }
                      size={20}
                      color={appointmentType === type ? "#2563eb" : "#6b7280"}
                    />
                    <Text style={[
                      styles.typeButtonText,
                      appointmentType === type && styles.typeButtonTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Date</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD (e.g., 2026-01-20)"
                value={selectedDate}
                onChangeText={setSelectedDate}
              />
              <Text style={styles.helperText}>Enter date in YYYY-MM-DD format</Text>
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Time</Text>
              <View style={styles.timeGrid}>
                {timeSlots.map(time => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.timeSlotSelected
                    ]}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      selectedTime === time && styles.timeSlotTextSelected
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Reason for appointment or any specific concerns..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Request Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  typeButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  timeSlotSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeSlotTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});