// mobile/src/components/ReminderCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";

interface ReminderCardProps {
  type: string;
  title: string;
  description?: string;
  dateTime: Date;
  extraInfo: string;
  color?: string;
  isCompleted?: boolean;
  notes?: string;
}

const getIconName = (type: string): string => {
  // Medical Appointments
  if (type.includes('Doctor') || type.includes('Consultation')) return 'user-md';
  if (type.includes('Specialist')) return 'stethoscope';
  if (type.includes('Follow-up')) return 'repeat';
  if (type.includes('Telemedicine')) return 'video-camera';
  if (type.includes('Emergency')) return 'ambulance';

  // Lab Tests & Diagnostics
  if (type.includes('Blood') || type.includes('Urine')) return 'flask';
  if (type.includes('Imaging') || type.includes('X-ray')) return 'camera';
  if (type.includes('ECG') || type.includes('EKG')) return 'heartbeat';
  if (type.includes('Fasting')) return 'cutlery';
  if (type.includes('Report')) return 'file-text';

  // Medication Management
  if (type.includes('Medication') || type.includes('Medicine')) return 'medkit';
  if (type.includes('Dose')) return 'clock-o';
  if (type.includes('Refill')) return 'shopping-cart';
  if (type.includes('Expiry')) return 'warning';

  // Treatment & Recovery
  if (type.includes('Wound') || type.includes('Therapy')) return 'band-aid';
  if (type.includes('Physiotherapy') || type.includes('Rehab')) return 'wheelchair';
  if (type.includes('Pain')) return 'thermometer';
  if (type.includes('Rest')) return 'bed';

  // Daily Health Habits
  if (type.includes('Water')) return 'tint';
  if (type.includes('Step') || type.includes('Exercise')) return 'shoe-prints';
  if (type.includes('Sleep')) return 'moon-o';
  if (type.includes('Meal')) return 'apple';

  // Vital Monitoring
  if (type.includes('Heart')) return 'heart';
  if (type.includes('Blood Pressure')) return 'heartbeat';
  if (type.includes('Blood Sugar')) return 'tint';
  if (type.includes('Weight')) return 'balance-scale';

  // Health Alerts
  if (type.includes('Alert')) return 'exclamation-triangle';

  // Preventive Care
  if (type.includes('Vaccination')) return 'syringe';
  if (type.includes('Checkup') || type.includes('Exam')) return 'stethoscope';

  // Mental Wellness
  if (type.includes('Meditation')) return 'peace';
  if (type.includes('Breathing')) return 'leaf';
  if (type.includes('Stress')) return 'smile-o';

  // Default
  return 'calendar';
};

export default function ReminderCard({
  type,
  title,
  description,
  dateTime,
  extraInfo,
  color = '#76c7c0',
  isCompleted = false,
  notes
}: ReminderCardProps) {
  return (
    <View style={[
      styles.card,
      color && { borderLeftWidth: 4, borderLeftColor: color },
      isCompleted && styles.completedCard
    ]}>
      <View style={styles.contentContainer}>
        <Icon name={getIconName(type)} size={24} color={color} />
        <Text style={[styles.typeText, { color: color }]}>{type}</Text>
      </View>

      <Text style={[styles.titleText, isCompleted && styles.completedText]}>
        {title}
      </Text>

      {description && (
        <Text style={[styles.descriptionText, isCompleted && styles.completedText]}>
          {description}
        </Text>
      )}

      <View style={styles.dateContainer}>
        <Icon name="clock-o" size={12} color="#888" />
        <Text style={styles.dateText}>{dateTime.toLocaleString()}</Text>
      </View>

      {extraInfo && (
        <View style={styles.infoContainer}>
          <Icon name="info-circle" size={12} color="#888" />
          <Text style={styles.extraInfoText}>{extraInfo}</Text>
        </View>
      )}

      {notes && (
        <View style={styles.notesContainer}>
          <Icon name="pencil-square-o" size={12} color="#888" />
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#dddddd',
    alignItems: 'flex-start',
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  extraInfoText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  notesText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
});