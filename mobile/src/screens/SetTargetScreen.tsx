// In your SetTargetScreen.js file
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function SetTargetScreen({ metric, onSave, onClose }) {
  const [target, setTarget] = useState(metric.target.toString());

  const handleSave = () => {
    const numericTarget = parseFloat(target);
    if (!isNaN(numericTarget) && numericTarget > 0) {
      onSave(numericTarget);
    } else {
      onSave(metric.target);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Target</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="times" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.metricInfo}>
          <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
            <Icon name={metric.icon} size={28} color={metric.color} />
          </View>
          <View>
            <Text style={styles.metricName}>{metric.name}</Text>
            <Text style={styles.currentTarget}>Current: {metric.target}{metric.unit}</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Set New Target</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={target}
              onChangeText={setTarget}
              keyboardType="numeric"
              placeholder={`Enter ${metric.name.toLowerCase()} target`}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              autoFocus
            />
            <Text style={styles.unitText}>{metric.unit}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Icon name="check" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Save Target</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1F3E',
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  metricIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metricName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  currentTarget: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    paddingVertical: 16,
  },
  unitText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: '#42A5F5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});