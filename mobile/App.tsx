import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import AlarmService from './src/services/AlarmService';
import FirebaseService from './src/services/firebase';

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Firebase
        await FirebaseService.initialize();

        // Create notification channels
        AlarmService.createChannels();

        // Request permissions
        await AlarmService.requestPermissions();

        console.log('App initialized successfully');
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}