// mobile/src/services/api/client.js
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== CONFIGURATION ====================
const getBaseURL = () => {
  // For production
  if (!__DEV__) {
    return 'http://192.168.8.101:4100'; // Your production IP
  }

  // For development - handle different platforms
  if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 for localhost
    // For physical device, use your machine's IP
    return 'http://192.168.8.101:4100'; // Change to your actual IP
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

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
  async (config) => {
    // Log the request for debugging
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
    if (config.data) {
      console.log('📦 Request Data:', JSON.stringify(config.data).substring(0, 200));
    }

    // Add token if available
    try {
      const token = await AsyncStorage.getItem('@health_app_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token from storage:', error);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    // Detailed error logging
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
      try {
        await AsyncStorage.multiRemove([
          '@health_app_token',
          '@health_app_user_id',
          '@health_app_username',
          '@health_app_user_role',
          '@health_app_fullname',
          '@health_app_email'
        ]);
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.log('🚫 Forbidden access');
      error.userMessage = 'You do not have permission to perform this action.';
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.log('🔍 Resource not found');
      error.userMessage = 'The requested resource was not found.';
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.log('💥 Server error');
      error.userMessage = 'Server error. Please try again later.';
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      console.error('🔌 Network Error: Cannot connect to server at', API_BASE_URL);
      error.userMessage = 'Cannot connect to server. Please check your network connection.';
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout');
      error.userMessage = 'Request timeout. Please try again.';
    }

    return Promise.reject(error);
  }
);

export default api;