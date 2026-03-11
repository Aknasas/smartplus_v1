import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
  label: string;
  progress: number;
  target: number;
  onSetTarget?: () => void;
  showSetTargetButton?: boolean;
}

export default function ProgressBar({
  label,
  progress,
  target,
  onSetTarget,
  showSetTargetButton = true,
}: ProgressBarProps) {
  const percentage = (progress / target) * 100;

  // Define color segments for different progress levels
  let effectiveColors, effectiveLocations;
  if (percentage <= 25) {
    // Red only
    effectiveColors = ['#FF0000', '#FF0000']; // Duplicate red to meet >=2 color requirement
    effectiveLocations = [0, 1];
  } else if (percentage <= 50) {
    // Red to Orange
    effectiveColors = ['#FF0000', '#FFA500'];
    effectiveLocations = [0, 1];
  } else if (percentage <= 75) {
    // Red to Orange to Yellow
    effectiveColors = ['#FF0000', '#FFA500', '#FFFF00'];
    effectiveLocations = [0, 0.5, 1];
  } else {
    // Red to Orange to Yellow to Green
    effectiveColors = ['#FF0000', '#FFA500', '#FFFF00', '#00FF00'];
    effectiveLocations = [0, 0.33, 0.66, 1];
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.progressBar}>
        <LinearGradient
          colors={effectiveColors}
          locations={effectiveLocations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progress, { width: `${percentage}%` }]}
        />
      </View>
      <Text style={styles.progressText}>{progress}/{target}</Text>
      {showSetTargetButton && onSetTarget && (
        <TouchableOpacity style={styles.button} onPress={onSetTarget}>
          <Text style={styles.buttonText}>Set {label} Target</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#76c7c0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
