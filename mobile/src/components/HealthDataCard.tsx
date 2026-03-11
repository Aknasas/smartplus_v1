import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface HealthDataCardProps {
  metric: string;
  value: string;
  onPress: () => void;
}

const getIconName = (metric: string) => {
  switch (metric) {
    case 'Heart Rate':
      return 'heartbeat';
    case 'Body Temperature':
      return 'thermometer-half';
    case 'Blood Oxygen':
      return 'tint';
    case 'Physical Activity':
      return 'bicycle';
    default:
      return 'info-circle';
  }
};

export default function HealthDataCard({ metric, value, onPress }: HealthDataCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.contentContainer}>
        <FontAwesome name={getIconName(metric)} size={24} color="#FF5733" />
        <Text style={styles.metricText}>{metric}</Text>
      </View>
      <Text style={styles.valueText}>{value}</Text>
    </TouchableOpacity>
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
  metricText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  valueText: {
    fontSize: 16,
    color: '#666',
  },
});
