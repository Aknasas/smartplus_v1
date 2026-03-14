// mobile/src/services/api.ts
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== CONFIGURATION ====================
const getBaseURL = () => {
  // For production
  if (!__DEV__) {
    return 'http://192.168.8.103:4100'; // Your production IP
  }

  // For development - handle different platforms
  if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 for localhost
    // For physical device, use your machine's IP
    return 'http://192.168.8.103:4100'; // Change to your actual IP
  } else if (Platform.OS === 'ios') {
    // iOS simulator uses localhost
    return 'http://localhost:4100';
  } else {
    // For web or other platforms
    return 'http://localhost:4100';
  }
};

export const API_BASE_URL = getBaseURL();
console.log('📱 Platform:', Platform.OS);
console.log('🔌 API Base URL:', API_BASE_URL);

// ==================== AXIOS INSTANCE ====================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Log the request for debugging
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
    if (config.data) {
      console.log('📦 Request Data:', JSON.stringify(config.data).substring(0, 200));
    }

    // Add token if available
    const token = await AsyncStorage.getItem('@health_app_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const errorInfo = {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message,
      code: error.code
    };

    console.error('❌ Response Error:', errorInfo);

    // Handle 401 Unauthorized - clear stored data
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized, clearing stored data...');
      await AsyncStorage.multiRemove([
        '@health_app_token',
        '@health_app_user_id',
        '@health_app_username',
        '@health_app_user_role',
        '@health_app_fullname',
        '@health_app_email'
      ]);
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      console.error('🔌 Network Error: Cannot connect to server at', API_BASE_URL);
      error.userMessage = 'Cannot connect to server. Please check your network connection.';
    }

    return Promise.reject(error);
  }
);

// ==================== TYPES ====================
export interface User {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  patient_id?: string;
  blood_type?: string;
  created_at?: string;
  last_login?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface HealthMetric {
  metric_id?: string;
  time?: string;
  metric_type: string;
  value: number;
  unit: string;
  device_id?: string;
  finger_detected?: boolean;
  notes?: string;
}

export interface Anomaly {
  anomaly_id: string;
  detected_at: string;
  metric_type: string;
  metric_value: number;
  expected_range_min: number;
  expected_range_max: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  level?: string;
  is_resolved: boolean;
  notes?: string;
}

export interface EmergencyContact {
  contact_id: string;
  name: string;
  relationship: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  is_primary: boolean;
  can_receive_alerts: boolean;
}

export interface Reminder {
  reminder_id: string;
  reminder_type: string;
  title: string;
  description?: string;
  scheduled_datetime: string;
  end_datetime?: string;
  extra_info?: string;
  color?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_interval?: number;
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface HealthTarget {
  target_id: string;
  target_type: string;
  target_value: number;
  target_min_value?: number;
  target_max_value?: number;
  current_value: number;
  unit: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
}

// ==================== AUTH FUNCTIONS ====================

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/api/users/login', {
      username: username.trim(),
      password
    });

    if (response.data.success && response.data.token) {
      const user = response.data.user;

      await AsyncStorage.setItem('@health_app_token', response.data.token);
      await AsyncStorage.setItem('@health_app_user_id', user.user_id);
      await AsyncStorage.setItem('@health_app_username', user.username);
      await AsyncStorage.setItem('@health_app_user_role', user.role || 'patient');
      await AsyncStorage.setItem('@health_app_fullname', user.full_name || user.first_name || '');
      await AsyncStorage.setItem('@health_app_email', user.email || '');

      console.log('✅ Login successful for user:', user.username);
    }
    return response.data;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const register = async (userData: {
  username: string;
  password: string;
  email: string;
  full_name: string;  // Changed from fullName to match backend
  date_of_birth?: string;
  role?: string;
}) => {
  try {
    // Ensure all required fields are present
    const backendData = {
      username: userData.username.trim(),
      password: userData.password,
      email: userData.email.trim(),
      full_name: userData.full_name.trim(), // Send as full_name to backend
      date_of_birth: userData.date_of_birth || new Date().toISOString().split('T')[0],
      role: userData.role || 'patient'
    };

    console.log('📤 Registering user with data:', { ...backendData, password: '[REDACTED]' });

    const response = await api.post('/api/users/register', backendData);

    if (response.data.success && response.data.token) {
      const user = response.data.user;

      await AsyncStorage.setItem('@health_app_token', response.data.token);
      await AsyncStorage.setItem('@health_app_user_id', user.user_id);
      await AsyncStorage.setItem('@health_app_username', user.username);
      await AsyncStorage.setItem('@health_app_user_role', user.role || 'patient');
      await AsyncStorage.setItem('@health_app_fullname', user.full_name || '');
      await AsyncStorage.setItem('@health_app_email', user.email || '');

      console.log('✅ Registration successful for user:', user.username);
    }
    return response.data;
  } catch (error) {
    console.error('Register API error:', error);
    throw error;
  }
};

export const logout = async () => {
  await AsyncStorage.multiRemove([
    '@health_app_token',
    '@health_app_user_id',
    '@health_app_username',
    '@health_app_user_role',
    '@health_app_fullname',
    '@health_app_email'
  ]);
  console.log('🔓 User logged out');
};

export const verifyToken = async () => {
  const response = await api.get('/api/users/verify');
  return response.data;
};

// ==================== USER FUNCTIONS ====================

export const getUsers = (page = 1, limit = 20) =>
  api.get('/api/users', { params: { page, limit } }).then(res => res.data);

export const getUser = async (userId: string) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId: string, data: any) => {
  const response = await api.put(`/api/users/${userId}`, data);
  return response.data;
};

// ==================== HEALTH METRICS FUNCTIONS ====================

export const getMetrics = async (
  userId: string,
  options?: { metric_type?: string; limit?: number; days?: number }
) => {
  const params: any = { limit: options?.limit || 100 };
  if (options?.metric_type) params.metric_type = options.metric_type;
  if (options?.days) params.days = options.days;

  const response = await api.get(`/api/users/${userId}/metrics`, { params });
  return response.data;
};

export const addMetric = async (metric: {
  patient_id: string;  // Note: using patient_id, not user_id
  metric_type: string;
  value: number;
  unit: string;
  device_id?: string;
  finger_detected?: boolean;
  notes?: string;
}) => {
  const response = await api.post('/api/metrics', metric);
  return response.data;
};

// ==================== ANOMALIES FUNCTIONS ====================

export const getAnomalies = async (
  userId: string,
  options?: { resolved?: boolean; limit?: number }
) => {
  const params: any = { limit: options?.limit || 50 };
  if (options?.resolved !== undefined) params.resolved = options.resolved;

  const response = await api.get(`/api/users/${userId}/anomalies`, { params });
  return response.data;
};

// ==================== EMERGENCY CONTACTS FUNCTIONS ====================

export const getEmergencyContacts = async (userId: string) => {
  const response = await api.get(`/api/users/${userId}/emergency-contacts`);
  return response.data;
};

// ==================== REMINDERS FUNCTIONS ====================

export const getReminders = async (
  userId: string,
  options?: { active_only?: boolean; upcoming?: boolean }
) => {
  const params: any = {};
  if (options?.active_only !== undefined) params.active_only = options.active_only;
  if (options?.upcoming !== undefined) params.upcoming = options.upcoming;

  const response = await api.get(`/api/users/${userId}/reminders`, { params });
  return response.data;
};

// ==================== HEALTH TARGETS FUNCTIONS ====================

export const getHealthTargets = async (userId: string) => {
  const response = await api.get(`/api/users/${userId}/targets`);
  return response.data;
};

// ==================== SYSTEM FUNCTIONS ====================

export const healthCheck = () => api.get('/health').then(res => res.data);

export const testDB = () => api.get('/test-db').then(res => res.data);

export const getDBInfo = () => api.get('/api/db-info').then(res => res.data);

export const createSampleUsers = () => api.get('/api/create-sample-users').then(res => res.data);

// ==================== EXPORTS ====================

export default api;
export { api as axiosInstance };