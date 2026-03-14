// mobile/src/services/api/auth.js
import api from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (username, password) => {
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
      await AsyncStorage.setItem('@health_app_fullname', `${user.first_name || ''} ${user.last_name || ''}`.trim());
      await AsyncStorage.setItem('@health_app_email', user.email || '');

      console.log('✅ Login successful for user:', user.username);
    }
    return response.data;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    // Validate required fields
    if (!userData) {
      throw new Error('User data is required');
    }

    // Safely trim strings
    const username = userData.username?.trim() || '';
    const email = userData.email?.trim() || '';
    const firstName = userData.first_name?.trim() || '';
    const lastName = userData.last_name?.trim() || '';
    const password = userData.password || '';
    const role = userData.role || 'patient';
    const date_of_birth = userData.date_of_birth || new Date().toISOString().split('T')[0];

    // Check required fields
    if (!username) throw new Error('Username is required');
    if (!password) throw new Error('Password is required');
    if (!email) throw new Error('Email is required');
    if (!firstName) throw new Error('First name is required');

    // Send first_name and last_name separately
    const backendData = {
      username: username,
      password: password,
      email: email,
      first_name: firstName,
      last_name: lastName || '',
      date_of_birth: date_of_birth,
      role: role
    };

    console.log('📤 Registering user with data:', {
      ...backendData,
      password: '[REDACTED]'
    });

    const response = await api.post('/api/users/register', backendData);

    if (response.data.success && response.data.token) {
      const user = response.data.user;

      await AsyncStorage.setItem('@health_app_token', response.data.token);
      await AsyncStorage.setItem('@health_app_user_id', user.user_id);
      await AsyncStorage.setItem('@health_app_username', user.username);
      await AsyncStorage.setItem('@health_app_user_role', user.role || role);

      // Store name
      const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
      await AsyncStorage.setItem('@health_app_fullname', fullName);

      await AsyncStorage.setItem('@health_app_email', user.email || '');

      console.log('✅ Registration successful for user:', user.username);
    }
    return response.data;
  } catch (error) {
    console.error('Register API error:', error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/users/forgot-password', {
      email: email.trim()
    });
    return response.data;
  } catch (error) {
    console.error('Forgot password API error:', error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/api/users/reset-password', {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Reset password API error:', error);
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