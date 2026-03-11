// screens/DatabaseTestScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { healthAPI } from '../services/api';

const DatabaseTestScreen: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const health = await healthAPI.health();
      console.log('Health check:', health.data);

      const dbTest = await healthAPI.testDB();
      console.log('DB Test:', dbTest.data);
      setStatus(`✅ Connected: ${dbTest.data.data.database}`);

      const usersRes = await healthAPI.getUsers();
      setUsers(usersRes.data);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Database Connection Test</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, { color: status.includes('✅') ? '#4CAF50' : '#f44336' }]}>
          {status}
        </Text>
        {loading && <ActivityIndicator size="large" color="#76c7c0" />}
      </View>

      <TouchableOpacity style={styles.button} onPress={testConnection}>
        <Text style={styles.buttonText}>Test Again</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>Users in Database:</Text>
        {users.map(user => (
          <View key={user.user_id} style={styles.userItem}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userId}>ID: {user.user_id}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#2A2F4E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  button: {
    backgroundColor: '#42A5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  userId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
});

export default DatabaseTestScreen;