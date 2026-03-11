// mobile/src/services/api.ts
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== CONFIGURATION ====================
const getBaseURL = () => {
  // For production
  if (!__DEV__) {
    return 'http://192.168.8.102:4100'; // Your production IP
  }

  // For development - handle different platforms
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    return 'http://192.168.8.102:4100';
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
    console.log('📦 Request Data:', config.data);

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
    console.error('❌ Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 Unauthorized - clear stored data
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([
        '@health_app_token',
        '@health_app_user_id',
        '@health_app_username',
        '@health_app_user_role'
      ]);
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      console.error('🔌 Network Error: Cannot connect to server at', API_BASE_URL);
    }

    return Promise.reject(error);
  }
);

// ==================== API FUNCTIONS ====================

// Auth endpoints
export const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/api/users/login', {
      username: username.trim(),
      password
    });

    if (response.data.token) {
      await AsyncStorage.setItem('@health_app_token', response.data.token);
      await AsyncStorage.setItem('@health_app_user_id', String(response.data.user?.user_id || response.data.user_id));
      await AsyncStorage.setItem('@health_app_username', response.data.user?.username || username);
      await AsyncStorage.setItem('@health_app_user_role', response.data.user?.role || 'patient');
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
  fullName: string;  // Changed from 'name' to 'fullName' to match your LoginScreen
  role?: string;
}) => {
  try {
    // Transform the data to match what your backend expects
    const backendData = {
      username: userData.username.trim(),
      password: userData.password,
      email: userData.email.trim(),
      full_name: userData.fullName.trim(), // Send as full_name to backend
      date_of_birth: new Date().toISOString().split('T')[0], // Default DOB
      role: userData.role || 'patient'
    };

    const response = await api.post('/api/users/register', backendData);

    if (response.data.token) {
      await AsyncStorage.setItem('@health_app_token', response.data.token);
      await AsyncStorage.setItem('@health_app_user_id', String(response.data.user?.user_id || response.data.user_id));
      await AsyncStorage.setItem('@health_app_username', response.data.user?.username || userData.username);
      await AsyncStorage.setItem('@health_app_user_role', response.data.user?.role || 'patient');
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
    '@health_app_user_role'
  ]);
};

export const verifyToken = async () => {
  const response = await api.get('/api/users/verify');
  return response.data;
};

// User endpoints
export const getUsers = (page = 1, limit = 20) =>
  api.get('/api/users', { params: { page, limit } }).then(res => res.data);

export const getUser = (userId: string) =>
  api.get(`/api/users/${userId}`).then(res => res.data);

export const updateUser = (userId: string, data: any) =>
  api.put(`/api/users/${userId}`, data).then(res => res.data);

// Health metrics endpoints
export const getMetrics = (userId: string, limit = 50) =>
  api.get(`/api/users/${userId}/metrics`, { params: { limit } }).then(res => res.data);

export const addMetric = (metric: {
  user_id: string;
  metric_type: string;
  value: number;
  unit: string;
  device_id?: string;
}) => api.post('/api/metrics', metric).then(res => res.data);

// System endpoints
export const healthCheck = () => api.get('/health').then(res => res.data);
export const testDB = () => api.get('/test-db').then(res => res.data);
export const getDBInfo = () => api.get('/api/db-info').then(res => res.data);
export const createSampleUsers = () => api.get('/api/create-sample-users').then(res => res.data);

// Export the axios instance as default (for backward compatibility)
export default api;

// Also export the api instance with a different name if needed
export { api as axiosInstance };