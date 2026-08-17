import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

class FirebaseService {
  private static instance: FirebaseService;
  private initialized: boolean;

  private constructor() {
    this.initialized = false;
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Get token - this initializes Firebase automatically
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return false;
    }
  }

  async requestUserPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Push notification permission denied');
      }
      return enabled;
    }
    return true;
  }

  async getFCMToken(): Promise<string | null> {
    try {
      return await messaging().getToken();
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }
}

export default FirebaseService.getInstance();