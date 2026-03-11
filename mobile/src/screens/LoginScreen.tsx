// LoginScreen.tsx - UPDATED with correct API imports
import React, { useState, useEffect } from "react";
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
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "../styles/styles";

// Import from your API service
import api, {
  API_BASE_URL,
  login,
  register,
  healthCheck,
  logout
} from "../services/api";

export default function LoginScreen({ navigation }) {
  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  // UI states
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState<string | null>(null);

  // Test connection on mount
  useEffect(() => {
    testConnection();

    // Check if user is already logged in
    checkLoggedInStatus();
  }, []);

  // Check if user is already logged in
  const checkLoggedInStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('@health_app_token');
      const userId = await AsyncStorage.getItem('@health_app_user_id');

      if (token && userId) {
        // Optional: Verify token with server
        try {
          await verifyToken();
          // If token is valid, navigate to Home
          navigation.replace("MainTabs");
        } catch (error) {
          // Token invalid, clear storage
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  // Test database connection
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

  // Toggle between Login and Register modes
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    // Clear form when switching modes
    setUsername("");
    setPassword("");
    setEmail("");
    setFullName("");
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle Login - Using the API function
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending login request...');
      console.log('URL:', `${API_BASE_URL}/api/users/login`);

      // Use the login function from api.ts
      const response = await login(username.trim(), password);

      console.log('✅ Login response:', response);

      Alert.alert("Success", "Login successful!");

      // Clear form
      setUsername("");
      setPassword("");

      // Navigate to MainTabs (which should be your main app)
      navigation.replace("MainTabs");

    } catch (err: any) {
      console.error('❌ Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Handle different error types
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        Alert.alert(
          "Connection Error",
          `Cannot connect to server at ${API_BASE_URL}. Please check:\n• Server is running\n• IP address is correct (current: ${API_BASE_URL})\n• Network connection`
        );
      } else if (err.response?.status === 401) {
        Alert.alert("Login Failed", "Invalid username or password.");
      } else if (err.response?.status === 400) {
        Alert.alert("Login Failed", err.response.data?.error || "Bad request. Check your input.");
      } else if (err.response?.status === 404) {
        Alert.alert("Error", "Login endpoint not found. Check server routes.");
      } else if (err.response?.data?.error) {
        Alert.alert("Login Failed", err.response.data.error);
      } else {
        Alert.alert(
          "Login Failed",
          err.message || "An unexpected error occurred."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration - Using the API function
  const handleRegister = async () => {
    // Validation
    if (!username || !password || !email || !fullName) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending registration request...');
      console.log('URL:', `${API_BASE_URL}/api/users/register`);

      // Use the register function from api.ts
      const response = await register({
        username: username.trim(),
        password,
        email: email.trim(),
        fullName: fullName.trim(), // This will be sent as full_name to backend
        role: 'patient', // Default role
      });

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
      setFullName("");

    } catch (err: any) {
      console.error('❌ Registration error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        Alert.alert("Connection Error", "Cannot connect to server. Please check if the server is running.");
      } else if (err.response?.status === 409) {
        Alert.alert("Registration Failed", "Username or email already exists.");
      } else if (err.response?.status === 400) {
        Alert.alert("Registration Failed", err.response.data?.error || "Invalid input data.");
      } else if (err.response?.data?.error) {
        Alert.alert("Registration Failed", err.response.data.error);
      } else {
        Alert.alert(
          "Registration Failed",
          err?.message || "Could not create account."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick fill test accounts
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

          <TextInput
            style={styles.loginInput}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {!isLoginMode && (
            <>
              <TextInput
                style={styles.loginInput}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!loading}
              />
              <TextInput
                style={styles.loginInput}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </>
          )}

          <View style={{ position: 'relative', width: '100%' }}>
            <TextInput
              style={[styles.loginInput, { paddingRight: 50 }]}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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

          {isLoginMode && (
            <TouchableOpacity
              onPress={() => Alert.alert('Info', 'Please contact support to reset your password.')}
              style={{ marginTop: 10 }}
              disabled={loading}
            >
              <Text style={{ color: '#999', fontSize: 12 }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export default LoginScreen;