// screens/RegistrationScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function RegistrationScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bloodType: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    allergies: '',
    medications: '',
  });

  const [selectedGender, setSelectedGender] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');

  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

  const handleNext = () => {
    if (step === 1) {
      if (!userData.fullName || !userData.email || !userData.phone) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!userData.age || !selectedGender || !userData.height || !userData.weight) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!selectedBloodType || !userData.emergencyContactName || !userData.emergencyContactPhone) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const completeUserData = {
      ...userData,
      gender: selectedGender,
      bloodType: selectedBloodType,
      registrationCompleted: true,
      registrationDate: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName)}&background=42A5F5&color=fff`,
    };

    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(completeUserData));
      await AsyncStorage.setItem('hasCompletedRegistration', 'true');

      Alert.alert(
        'Registration Complete!',
        'Welcome to SmartHealth+! Your profile has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.replace('MainTabs')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {[1, 2, 3].map((stepNumber) => (
          <View key={stepNumber} style={styles.stepRow}>
            <View style={[
              styles.stepCircle,
              stepNumber === step ? styles.stepCircleActive :
              stepNumber < step ? styles.stepCircleCompleted : styles.stepCircleInactive
            ]}>
              {stepNumber < step ? (
                <Icon name="check" size={14} color="#FFF" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  stepNumber === step && styles.stepNumberActive
                ]}>
                  {stepNumber}
                </Text>
              )}
            </View>
            {stepNumber < 3 && (
              <View style={[
                styles.stepLine,
                stepNumber < step ? styles.stepLineCompleted : styles.stepLineInactive
              ]} />
            )}
          </View>
        ))}
        <View style={styles.stepLabels}>
          <Text style={styles.stepLabel}>Basic Info</Text>
          <Text style={styles.stepLabel}>Health Details</Text>
          <Text style={styles.stepLabel}>Medical Info</Text>
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <Text style={styles.sectionSubtitle}>Let's get to know you better</Text>

      <View style={styles.inputContainer}>
        <Icon name="user" size={18} color="#42A5F5" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={userData.fullName}
          onChangeText={(text) => setUserData({...userData, fullName: text})}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="envelope" size={18} color="#42A5F5" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          keyboardType="email-address"
          value={userData.email}
          onChangeText={(text) => setUserData({...userData, email: text})}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="phone" size={18} color="#42A5F5" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          keyboardType="phone-pad"
          value={userData.phone}
          onChangeText={(text) => setUserData({...userData, phone: text})}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Health Details</Text>
      <Text style={styles.sectionSubtitle}>Help us personalize your health monitoring</Text>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Icon name="birthday-cake" size={18} color="#42A5F5" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            keyboardType="numeric"
            value={userData.age}
            onChangeText={(text) => setUserData({...userData, age: text})}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
          <Icon name="venus-mars" size={18} color="#42A5F5" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Gender"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={selectedGender}
            editable={false}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genderScroll}>
        <View style={styles.genderContainer}>
          {genders.map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                selectedGender === gender && styles.genderButtonActive
              ]}
              onPress={() => {
                setSelectedGender(gender);
                setUserData({...userData, gender});
              }}
            >
              <Text style={[
                styles.genderText,
                selectedGender === gender && styles.genderTextActive
              ]}>
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Icon name="arrows-v" size={18} color="#42A5F5" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            keyboardType="numeric"
            value={userData.height}
            onChangeText={(text) => setUserData({...userData, height: text})}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
          <Icon name="balance-scale" size={18} color="#42A5F5" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            keyboardType="numeric"
            value={userData.weight}
            onChangeText={(text) => setUserData({...userData, weight: text})}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Medical Information</Text>
      <Text style={styles.sectionSubtitle}>Important for emergency situations</Text>

      <Text style={styles.inputLabel}>Blood Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bloodTypeScroll}>
        <View style={styles.bloodTypeContainer}>
          {bloodTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.bloodTypeButton,
                selectedBloodType === type && styles.bloodTypeButtonActive
              ]}
              onPress={() => setSelectedBloodType(type)}
            >
              <Text style={[
                styles.bloodTypeText,
                selectedBloodType === type && styles.bloodTypeTextActive
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Icon name="user-plus" size={18} color="#EF5350" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact Name"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={userData.emergencyContactName}
            onChangeText={(text) => setUserData({...userData, emergencyContactName: text})}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
          <Icon name="phone-square" size={18} color="#EF5350" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact Phone"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            keyboardType="phone-pad"
            value={userData.emergencyContactPhone}
            onChangeText={(text) => setUserData({...userData, emergencyContactPhone: text})}
          />
        </View>
      </View>

      <Text style={styles.inputLabel}>Medical Conditions (Optional)</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., Diabetes, Hypertension, Asthma..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          multiline
          numberOfLines={3}
          value={userData.medicalConditions}
          onChangeText={(text) => setUserData({...userData, medicalConditions: text})}
        />
      </View>

      <Text style={styles.inputLabel}>Allergies (Optional)</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., Penicillin, Peanuts, Latex..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          multiline
          numberOfLines={2}
          value={userData.allergies}
          onChangeText={(text) => setUserData({...userData, allergies: text})}
        />
      </View>

      <Text style={styles.inputLabel}>Current Medications (Optional)</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., Metformin 500mg, Lisinopril 10mg..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          multiline
          numberOfLines={2}
          value={userData.medications}
          onChangeText={(text) => setUserData({...userData, medications: text})}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <Icon name="user-plus" size={32} color="#42A5F5" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Create Your Profile</Text>
            <Text style={styles.subtitle}>Step {step} of 3 • Complete your health profile</Text>
          </View>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.previousButton]}
              onPress={handlePrevious}
            >
              <Icon name="chevron-left" size={18} color="#42A5F5" style={{ marginRight: 8 }} />
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          {step < 3 ? (
            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Icon name="chevron-right" size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.completeButton]}
              onPress={handleCompleteRegistration}
            >
              <Icon name="check-circle" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.completeButtonText}>Complete Registration</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  headerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 165, 245, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  stepIndicatorContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepCircleActive: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  stepCircleCompleted: {
    backgroundColor: '#66BB6A',
    borderColor: '#66BB6A',
  },
  stepCircleInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  stepNumberActive: {
    color: '#FFF',
  },
  stepLine: {
    width: 60,
    height: 2,
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#66BB6A',
  },
  stepLineInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  stepLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  stepContent: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    paddingVertical: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  genderScroll: {
    marginBottom: 24,
  },
  genderContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  genderButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
  },
  genderButtonActive: {
    backgroundColor: 'rgba(66, 165, 245, 0.15)',
    borderColor: '#42A5F5',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  genderTextActive: {
    color: '#42A5F5',
  },
  bloodTypeScroll: {
    marginBottom: 24,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  bloodTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
    marginBottom: 10,
  },
  bloodTypeButtonActive: {
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderColor: '#EF5350',
  },
  bloodTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bloodTypeTextActive: {
    color: '#EF5350',
  },
  textAreaContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 16,
    color: '#FFF',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  previousButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#42A5F5',
  },
  nextButton: {
    backgroundColor: '#42A5F5',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  completeButton: {
    backgroundColor: '#66BB6A',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});