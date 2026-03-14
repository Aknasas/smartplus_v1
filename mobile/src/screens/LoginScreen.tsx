// LoginScreen.tsx - COMPLETELY FIXED hook order
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "../styles/styles";
import { login, register, forgotPassword, API_BASE_URL, healthCheck } from '../services';

// Role options - defined outside component to avoid recreation
const ROLES = [
  { id: 'patient', name: 'Patient', description: 'Regular patient access' },
  { id: 'doctor', name: 'Doctor', description: 'Healthcare provider access' },
  { id: 'admin', name: 'Administrator', description: 'Full system access' },
  { id: 'ambulance', name: 'Ambulance Service', description: 'Emergency response access' },
];

export default function LoginScreen({ navigation }) {
  // ==================== ALL HOOKS MUST BE AT THE TOP ====================

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("patient");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // UI states
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  // Validation states
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [dobError, setDobError] = useState("");

  // Password reset states
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Effects - always at the top level
  useEffect(() => {
    testConnection();
    checkLoggedInStatus();
  }, []);

  // ==================== HELPER FUNCTIONS ====================

  const checkLoggedInStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('@health_app_token');
      const userId = await AsyncStorage.getItem('@health_app_user_id');

      if (token && userId) {
        navigation.replace("MainTabs");
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const testConnection = async () => {
    try {
      const response = await healthCheck();
      console.log('Server health check:', response);
      setServerStatus('connected');
    } catch (error) {
      console.error('Server connection failed:', error);
      setServerStatus('disconnected');
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    // Clear form when switching modes
    setUsername("");
    setPassword("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setRole("patient");
    setDateOfBirth("");

    // Clear validation errors
    clearErrors();
  };

  const clearErrors = () => {
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setUsernameError("");
    setPasswordError("");
    setDobError("");
  };

  // ==================== VALIDATION FUNCTIONS ====================

  const isValidName = (name: string): boolean => {
    if (!name) return false;
    const nameRegex = /^[A-Za-z\s\-']+$/;
    return nameRegex.test(name);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const isValidPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const isValidDateOfBirth = (dateStr: string): boolean => {
    if (!dateStr) return true;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;

    const [year, month, day] = dateStr.split('-').map(Number);

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      return false;
    }

    const age = currentYear - year;
    if (age < 0 || age > 150) {
      return false;
    }

    return true;
  };

  const validateRegistration = (): boolean => {
    clearErrors();
    let isValid = true;

    if (!firstName.trim()) {
      setFirstNameError("First name is required");
      isValid = false;
    } else if (!isValidName(firstName)) {
      setFirstNameError("First name can only contain letters, spaces, hyphens, and apostrophes");
      isValid = false;
    } else if (firstName.length < 2) {
      setFirstNameError("First name must be at least 2 characters");
      isValid = false;
    }

    if (lastName.trim() && !isValidName(lastName)) {
      setLastNameError("Last name can only contain letters, spaces, hyphens, and apostrophes");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!username.trim()) {
      setUsernameError("Username is required");
      isValid = false;
    } else if (!isValidUsername(username)) {
      setUsernameError("Username must be 3-20 characters and can only contain letters, numbers, and underscores");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (!isValidPassword(password)) {
      setPasswordError("Password must be at least 6 characters and contain at least one letter and one number");
      isValid = false;
    }

    if (dateOfBirth && !isValidDateOfBirth(dateOfBirth)) {
      setDobError("Please enter a valid date between 1900 and current year (YYYY-MM-DD)");
      isValid = false;
    }

    return isValid;
  };

  const validateLogin = (): boolean => {
    clearErrors();
    let isValid = true;

    if (!username.trim()) {
      setUsernameError("Username is required");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const validateResetEmail = (): boolean => {
    if (!resetEmail.trim()) {
      setResetEmailError("Email is required");
      return false;
    } else if (!isValidEmail(resetEmail)) {
      setResetEmailError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  // ==================== HANDLER FUNCTIONS ====================

  const handleLogin = async () => {
    if (!validateLogin()) {
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending login request...');
      const response = await login(username.trim(), password);
      console.log('✅ Login response:', response);

      Alert.alert("Success", "Login successful!");
      setUsername("");
      setPassword("");
      navigation.replace("MainTabs");

    } catch (err: any) {
      console.error('❌ Login error:', err);

      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        Alert.alert("Connection Error", `Cannot connect to server at ${API_BASE_URL}`);
      } else if (err.response?.status === 401) {
        Alert.alert("Login Failed", "Invalid username or password.");
      } else {
        Alert.alert("Login Failed", err.response?.data?.error || err.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegistration()) {
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending registration request...');

      const registrationData = {
        username: username.trim(),
        password: password,
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim() || '',
        date_of_birth: dateOfBirth || new Date().toISOString().split('T')[0],
        role: role,
      };

      console.log('Registration data:', { ...registrationData, password: '[REDACTED]' });

      const response = await register(registrationData);
      console.log('✅ Registration response:', response);

      Alert.alert(
        "Registration Successful",
        "Your account has been created. Please login.",
        [{ text: "OK", onPress: () => toggleMode() }]
      );

      // Clear form
      setUsername("");
      setPassword("");
      setEmail("");
      setFirstName("");
      setLastName("");
      setRole("patient");
      setDateOfBirth("");

    } catch (err: any) {
      console.error('❌ Registration error:', err);

      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        Alert.alert("Connection Error", "Cannot connect to server.");
      } else if (err.response?.status === 409) {
        Alert.alert("Registration Failed", "Username or email already exists.");
      } else if (err.response?.status === 400) {
        Alert.alert("Registration Failed", err.response.data?.error || "Invalid input data.");
      } else {
        Alert.alert("Registration Failed", err.response?.data?.error || err?.message || "Could not create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateResetEmail()) {
      return;
    }

    setResetLoading(true);
    try {
      const response = await forgotPassword(resetEmail);
      console.log('Forgot password response:', response);
      setResetSent(true);

      // Auto close after 3 seconds
      setTimeout(() => {
        setForgotPasswordVisible(false);
        setResetSent(false);
        setResetEmail("");
        setResetEmailError("");
        setResetLoading(false);
      }, 3000);

    } catch (err: any) {
      console.error('Forgot password error:', err);
      setResetLoading(false);
      Alert.alert(
        "Error",
        err.response?.data?.error || "Failed to process request. Please try again."
      );
    }
  };

  const getRoleName = (roleId: string) => {
    const role = ROLES.find(r => r.id === roleId);
    return role ? role.name : 'Select Role';
  };

  const fillTestAccount = (testUser: string) => {
    if (testUser === 'john') {
      setUsername('john_doe');
      setPassword('password123');
    } else if (testUser === 'jane') {
      setUsername('jane_smith');
      setPassword('password123');
    } else if (testUser === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, '');

    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0,4)}-${cleaned.slice(4)}`;
    } else {
      return `${cleaned.slice(0,4)}-${cleaned.slice(4,6)}-${cleaned.slice(6,8)}`;
    }
  };

  const closeForgotPasswordModal = () => {
    setForgotPasswordVisible(false);
    setResetSent(false);
    setResetEmail("");
    setResetEmailError("");
    setResetLoading(false);
  };

  // Render role item - defined as a separate function to avoid hooks in renderItem
  const renderRoleItem = ({ item }: { item: typeof ROLES[0] }) => (
    <TouchableOpacity
      style={{
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: role === item.id ? '#e8f5e9' : 'white'
      }}
      onPress={() => {
        setRole(item.id);
        setRoleModalVisible(false);
      }}
    >
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: role === item.id ? '#4caf50' : '#333'
      }}>
        {item.name}
      </Text>
      <Text style={{
        fontSize: 12,
        color: '#666',
        marginTop: 2
      }}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  // ==================== RENDER ====================

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.loginContainer}>
          {/* Server Status Indicator */}
          {serverStatus && (
            <TouchableOpacity
              onPress={testConnection}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
                padding: 8,
                backgroundColor: serverStatus === 'connected' ? '#e8f5e9' : '#ffebee',
                borderRadius: 5,
              }}
            >
              <View style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: serverStatus === 'connected' ? '#4caf50' : '#f44336',
                marginRight: 8,
              }} />
              <Text style={{
                color: serverStatus === 'connected' ? '#2e7d32' : '#c62828',
                fontSize: 12,
              }}>
                Server: {serverStatus === 'connected' ? 'Connected' : 'Disconnected'} (Tap to retest)
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.loginTitle}>
            {isLoginMode ? "eHDS Login" : "Create Account"}
          </Text>

          {/* Debug info - remove in production */}
          {__DEV__ && (
            <View style={{ marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#999' }}>
                API: {API_BASE_URL}
              </Text>
              <Text style={{ fontSize: 10, color: '#999' }}>
                Platform: {Platform.OS}
              </Text>
            </View>
          )}

          {/* Username Field */}
          <View style={{ width: '100%' }}>
            <TextInput
              style={[styles.loginInput, usernameError ? { borderColor: 'red' } : null]}
              placeholder="Username *"
              placeholderTextColor="#999"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError("");
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {usernameError ? (
              <Text style={{ color: 'red', fontSize: 12, marginTop: -5, marginBottom: 5 }}>
                {usernameError}
              </Text>
            ) : null}
          </View>

          {/* Registration-only fields */}
          {!isLoginMode && (
            <>
              {/* First Name Field */}
              <View style={{ width: '100%' }}>
                <TextInput
                  style={[styles.loginInput, firstNameError ? { borderColor: 'red' } : null]}
                  placeholder="First Name *"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    setFirstNameError("");
                  }}
                  autoCapitalize="words"
                  editable={!loading}
                />
                {firstNameError ? (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: -5, marginBottom: 5 }}>
                    {firstNameError}
                  </Text>
                ) : null}
              </View>

              {/* Last Name Field */}
              <View style={{ width: '100%' }}>
                <TextInput
                  style={[styles.loginInput, lastNameError ? { borderColor: 'red' } : null]}
                  placeholder="Last Name (Optional)"
                  placeholderTextColor="#999"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    setLastNameError("");
                  }}
                  autoCapitalize="words"
                  editable={!loading}
                />
                {lastNameError ? (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: -5, marginBottom: 5 }}>
                    {lastNameError}
                  </Text>
                ) : null}
              </View>

              {/* Email Field */}
              <View style={{ width: '100%' }}>
                <TextInput
                  style={[styles.loginInput, emailError ? { borderColor: 'red' } : null]}
                  placeholder="Email *"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {emailError ? (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: -5, marginBottom: 5 }}>
                    {emailError}
                  </Text>
                ) : null}
              </View>

              {/* Role Dropdown */}
              <TouchableOpacity
                style={[styles.loginInput, { justifyContent: 'center' }]}
                onPress={() => setRoleModalVisible(true)}
                disabled={loading}
              >
                <Text style={{ color: role ? '#000' : '#999' }}>
                  {getRoleName(role)}
                </Text>
              </TouchableOpacity>

              {/* Date of Birth Field */}
              <View style={{ width: '100%' }}>
                <TextInput
                  style={[styles.loginInput, dobError ? { borderColor: 'red' } : null]}
                  placeholder="Date of Birth (YYYY-MM-DD) - Optional"
                  placeholderTextColor="#999"
                  value={dateOfBirth}
                  onChangeText={(text) => {
                    const formatted = formatDateInput(text);
                    setDateOfBirth(formatted);
                    setDobError("");
                  }}
                  maxLength={10}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {dobError ? (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: -5, marginBottom: 5 }}>
                    {dobError}
                  </Text>
                ) : null}
              </View>
            </>
          )}

          {/* Password Field */}
          <View style={{ width: '100%' }}>
            <View style={{ position: 'relative', width: '100%' }}>
              <TextInput
                style={[
                  styles.loginInput,
                  { paddingRight: 50 },
                  passwordError ? { borderColor: 'red' } : null
                ]}
                placeholder="Password *"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                }}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 15,
                }}
                disabled={loading}
              >
                <Text style={{ color: '#76c7c0' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={{ color: 'red', fontSize: 12, marginTop: -5, marginBottom: 5 }}>
                {passwordError}
              </Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.loginSubmitButton,
              loading && { opacity: 0.7 }
            ]}
            onPress={isLoginMode ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginSubmitButtonText}>
                {isLoginMode ? "Login" : "Register"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Mode */}
          <TouchableOpacity
            onPress={toggleMode}
            disabled={loading}
            style={{ marginTop: 15 }}
          >
            <Text style={{ color: '#76c7c0', fontSize: 14 }}>
              {isLoginMode
                ? "Don't have an account? Register here"
                : "Already have an account? Login here"}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Button */}
          {isLoginMode && (
            <TouchableOpacity
              onPress={() => setForgotPasswordVisible(true)}
              style={{ marginTop: 10 }}
              disabled={loading}
            >
              <Text style={{ color: '#76c7c0', fontSize: 12 }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

          {/* Test Accounts */}
          {isLoginMode && !loading && (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: '#999', marginBottom: 10 }}>Test Accounts:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                <TouchableOpacity
                  onPress={() => fillTestAccount('john')}
                  style={{ marginHorizontal: 10, marginVertical: 5 }}
                >
                  <Text style={{ color: '#76c7c0' }}>John Doe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => fillTestAccount('jane')}
                  style={{ marginHorizontal: 10, marginVertical: 5 }}
                >
                  <Text style={{ color: '#76c7c0' }}>Jane Smith</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => fillTestAccount('admin')}
                  style={{ marginHorizontal: 10, marginVertical: 5 }}
                >
                  <Text style={{ color: '#76c7c0' }}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Role Selection Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={roleModalVisible}
            onRequestClose={() => setRoleModalVisible(false)}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
              <View style={{
                width: '80%',
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
                maxHeight: '70%'
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 15,
                  textAlign: 'center'
                }}>
                  Select Role
                </Text>

                <FlatList
                  data={ROLES}
                  keyExtractor={(item) => item.id}
                  renderItem={renderRoleItem}
                />

                <TouchableOpacity
                  style={{
                    marginTop: 15,
                    padding: 10,
                    backgroundColor: '#f44336',
                    borderRadius: 5,
                    alignItems: 'center'
                  }}
                  onPress={() => setRoleModalVisible(false)}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Forgot Password Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={forgotPasswordVisible}
            onRequestClose={closeForgotPasswordModal}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
              <View style={{
                width: '85%',
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 15,
                  textAlign: 'center',
                  color: '#333'
                }}>
                  Reset Password
                </Text>

                {!resetSent ? (
                  <>
                    <Text style={{
                      fontSize: 14,
                      color: '#666',
                      marginBottom: 20,
                      textAlign: 'center'
                    }}>
                      Enter your email address and we'll send you a link to reset your password.
                    </Text>

                    <TextInput
                      style={[
                        styles.loginInput,
                        resetEmailError ? { borderColor: 'red' } : null
                      ]}
                      placeholder="Email Address"
                      placeholderTextColor="#999"
                      value={resetEmail}
                      onChangeText={(text) => {
                        setResetEmail(text);
                        setResetEmailError("");
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!resetLoading}
                    />

                    {resetEmailError ? (
                      <Text style={{ color: 'red', fontSize: 12, marginTop: -10, marginBottom: 10 }}>
                        {resetEmailError}
                      </Text>
                    ) : null}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 5,
                          backgroundColor: '#f44336',
                          marginRight: 10,
                          alignItems: 'center'
                        }}
                        onPress={closeForgotPasswordModal}
                        disabled={resetLoading}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 5,
                          backgroundColor: '#76c7c0',
                          alignItems: 'center',
                          opacity: resetLoading ? 0.7 : 1
                        }}
                        onPress={handleForgotPassword}
                        disabled={resetLoading}
                      >
                        {resetLoading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={{ alignItems: 'center', marginVertical: 20 }}>
                      <View style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: '#4caf50',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 15
                      }}>
                        <Text style={{ color: 'white', fontSize: 30 }}>✓</Text>
                      </View>
                      <Text style={{
                        fontSize: 16,
                        color: '#333',
                        textAlign: 'center',
                        marginBottom: 10
                      }}>
                        Email Sent!
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: '#666',
                        textAlign: 'center'
                      }}>
                        If your email is registered, you will receive a password reset link shortly.
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}