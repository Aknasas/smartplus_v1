// components/ReminderCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";

interface ReminderCardProps {
  type: string;
  title: string;
  description?: string;
  dateTime: Date;
  extraInfo: string;
}

const getIconName = (type: string) => {
  switch (type) {
    case 'Medicine Intake':
      return 'medkit';
    case 'Doctor Appointment':
      return 'user-md';
    case 'Lab Test':
      return 'flask';
    default:
      return 'calendar';
  }
};

export default function ReminderCard({ type, title, description, dateTime, extraInfo }: ReminderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.contentContainer}>
        <Icon name={getIconName(type)} size={24} color="#76c7c0" />
        <Text style={styles.typeText}>{type}</Text>
      </View>

      <Text style={styles.titleText}>{title}</Text>

      {description && <Text style={styles.descriptionText}>{description}</Text>}

      <Text style={styles.dateText}>{dateTime.toLocaleString()}</Text>

      <Text style={styles.extraInfoText}>{extraInfo}</Text>
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
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginVertical: 4,
  },
  extraInfoText: {
    fontSize: 14,
    color: '#666',
  },
});
