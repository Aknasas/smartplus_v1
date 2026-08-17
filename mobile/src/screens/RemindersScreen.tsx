import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Platform,
  PermissionsAndroid,
} from "react-native";
import ReminderCard from "../components/ReminderCard";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
} from '../services/api/reminders';
import AlarmService from '../services/AlarmService';

const { width } = Dimensions.get('window');

// Complete color palette for all reminder types
const typeColors = {
  // Medical Appointments
  'Doctor Consultation': '#42A5F5',
  'Doctor Appointment': '#2196F3',
  'Specialist Visit': '#1E88E5',
  'Follow-up Appointment': '#1565C0',

  // Lab Tests
  'Lab Test': '#EF5350',
  'Blood Test': '#F44336',
  'Urine Test': '#FF7043',
  'ECG / EKG': '#FF5252',

  // Medication
  'Medicine Intake': '#4CAF50',
  'Daily Medication': '#66BB6A',
  'Medication Refill': '#FF9800',
  'Injection Schedule': '#2E7D32',
  'Blood Sugar Check': '#E91E63',

  // Health Habits
  'Exercise': '#00ACC1',
  'Exercise Session': '#00BCD4',
  'Water Intake': '#26C6DA',
  'Sleep Reminder': '#006064',

  // Vital Signs
  'Measurement': '#FFA726',
  'Heart Rate Check': '#F06292',
  'Blood Pressure Logging': '#EC407A',

  // Preventive Care
  'Vaccination': '#66BB6A',
  'Annual Checkup': '#2E7D32',
  'Dental Checkup': '#1B5E20',

  // Mental Wellness
  'Meditation': '#AED581',
  'Breathing Exercise': '#8BC34A',
  'Stress Check-in': '#689F38',

  // General
  'General': '#9E9E9E',
};

// Complete reminder categories
const reminderCategories = {
  'Medical Appointments': [
    'Doctor Consultation',
    'Doctor Appointment',
    'Specialist Visit',
    'Follow-up Appointment'
  ],
  'Lab Tests': [
    'Lab Test',
    'Blood Test',
    'Urine Test',
    'ECG / EKG'
  ],
  'Medication': [
    'Medicine Intake',
    'Daily Medication',
    'Medication Refill',
    'Injection Schedule',
    'Blood Sugar Check'
  ],
  'Health Habits': [
    'Exercise',
    'Exercise Session',
    'Water Intake',
    'Sleep Reminder'
  ],
  'Vital Signs': [
    'Measurement',
    'Heart Rate Check',
    'Blood Pressure Logging'
  ],
  'Preventive Care': [
    'Vaccination',
    'Annual Checkup',
    'Dental Checkup'
  ],
  'Mental Wellness': [
    'Meditation',
    'Breathing Exercise',
    'Stress Check-in'
  ],
  'General': ['General']
};

const RemindersScreen = ({ navigation }) => {
  // State declarations
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [extraInfo, setExtraInfo] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [priority, setPriority] = useState('medium');
  const [showCategorySelection, setShowCategorySelection] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Load user and check permissions
  useEffect(() => {
    loadCurrentUser();
    checkNotificationPermissions();
  }, []);

  useEffect(() => {
    if (currentUser?.patientId) {
      fetchReminders();
    }
  }, [currentUser]);

  useEffect(() => {
    const initializeAlarms = async () => {
      try {
        await AlarmService.requestPermissions();
        AlarmService.createChannels();
      } catch (error) {
        console.error('Alarm initialization error:', error);
      }
    };
    initializeAlarms();
  }, []);

  const checkNotificationPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (!granted) {
        Alert.alert(
          'Notifications Required',
          'Please enable notifications to receive reminders',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enable', onPress: () => AlarmService.requestPermissions() }
          ]
        );
      }
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('@health_app_user_id');
      const patientId = await AsyncStorage.getItem('@health_app_patient_id') || userId;
      const fullname = await AsyncStorage.getItem('@health_app_fullname');
      const role = await AsyncStorage.getItem('@health_app_user_role');

      if (userId) {
        setCurrentUser({
          userId,
          patientId: patientId || userId,
          fullname: fullname || 'User',
          role: role || 'patient',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchReminders = async () => {
    if (!currentUser?.patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getReminders(currentUser.patientId, { active_only: true });
      if (response && response.success) {
        setReminders(response.reminders || []);

        // Schedule pending reminders
        const pendingReminders = (response.reminders || []).filter(
          r => !r.is_completed && new Date(r.scheduled_datetime) > new Date() && r.alarm_enabled
        );

        if (pendingReminders.length > 0) {
          await AlarmService.checkAndSchedulePendingReminders(pendingReminders);
        }
      } else {
        setReminders([]);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReminders();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setSelectedCategory('');
    setTitle('');
    setDescription('');
    setDateTime(new Date());
    setExtraInfo('');
    setAlarmEnabled(true);
    setPriority('medium');
    setShowCategorySelection(true);
    setModalVisible(true);
  };

  const openEditModal = (reminder) => {
    setEditingId(reminder.reminder_id);
    setSelectedCategory(reminder.reminder_type);
    setTitle(reminder.title);
    setDescription(reminder.description || '');
    setDateTime(new Date(reminder.scheduled_datetime));
    setExtraInfo(reminder.extra_info || '');
    setAlarmEnabled(reminder.alarm_enabled !== false);
    setPriority(reminder.priority || 'medium');
    setShowCategorySelection(false);
    setModalVisible(true);
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setShowCategorySelection(false);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTempDate(selectedDate);
      setShowTimePicker(true);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(tempDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      newDateTime.setSeconds(0);
      setDateTime(newDateTime);
    }
  };

  const formatDateTime = () => {
    return dateTime.toLocaleString();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a reminder type');
      return;
    }

    if (!currentUser?.patientId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const reminderData = {
      reminder_type: selectedCategory,
      title: title.trim(),
      description: description.trim(),
      scheduled_datetime: dateTime.toISOString(),
      extra_info: extraInfo.trim(),
      color: typeColors[selectedCategory] || '#FFA726',
      alarm_enabled: alarmEnabled,
      priority: priority,
    };

    console.log('Saving reminder:', reminderData);

    try {
      let response;
      if (editingId) {
        response = await updateReminder(editingId, reminderData);
        if (response && response.success) {
          await AlarmService.cancelReminder(editingId);
        }
      } else {
        response = await createReminder(currentUser.patientId, reminderData);
      }

      console.log('Save response:', response);

      if (response && response.success) {
        // Schedule alarm if enabled
        if (alarmEnabled && response.reminder) {
          await AlarmService.scheduleReminder(response.reminder);
        }

        await fetchReminders();
        setModalVisible(false);
        Alert.alert('Success', editingId ? 'Reminder updated!' : 'Reminder created!');
      } else {
        throw new Error(response?.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', 'Failed to save reminder');
    }
  };

  const handleDelete = (reminderId) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteReminder(reminderId);
              if (response && response.success) {
                await AlarmService.cancelReminder(reminderId);
                await fetchReminders();
                Alert.alert('Success', 'Reminder deleted');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleComplete = async (reminder) => {
    Alert.alert(
      'Complete Reminder',
      'Mark as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await completeReminder(reminder.reminder_id);
              await AlarmService.cancelReminder(reminder.reminder_id);
              await fetchReminders();
              Alert.alert('Success', 'Great job! 🎉');
            } catch (error) {
              Alert.alert('Error', 'Failed to complete');
            }
          },
        },
      ]
    );
  };

  const testNotification = () => {
    AlarmService.sendTestNotification('Test Notification', 'Your reminder system is working!');
    Alert.alert('Test Sent', 'Check your notification shade');
  };

  const stats = {
    total: reminders.length,
    upcoming: reminders.filter(r => new Date(r.scheduled_datetime) > new Date()).length,
    completed: reminders.filter(r => r.is_completed).length,
    today: reminders.filter(r => {
      const today = new Date();
      const rDate = new Date(r.scheduled_datetime);
      return rDate.toDateString() === today.toDateString() && !r.is_completed;
    }).length,
  };

  if (loadingUser) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFA726" />
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome name="exclamation-triangle" size={60} color="#EF5350" />
        <Text style={styles.errorText}>Not Logged In</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.userBar}>
        <Text style={styles.userName}>{currentUser.fullname}</Text>
        <Text style={styles.userRole}>{currentUser.role}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <FontAwesome name="clock-o" size={32} color="#FFA726" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Health Reminders</Text>
          <Text style={styles.subtitle}>Never miss important health tasks</Text>
        </View>
      </View>

      {/* Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: 'rgba(255,167,38,0.1)' }]}>
          <Text style={[styles.statValue, { color: '#FFA726' }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: 'rgba(66,165,245,0.1)' }]}>
          <Text style={[styles.statValue, { color: '#42A5F5' }]}>{stats.upcoming}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: 'rgba(102,187,106,0.1)' }]}>
          <Text style={[styles.statValue, { color: '#66BB6A' }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: 'rgba(239,83,80,0.1)' }]}>
          <Text style={[styles.statValue, { color: '#EF5350' }]}>{stats.today}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
      </ScrollView>

      {/* Test Notification Button (Remove in production) */}
      <TouchableOpacity
        style={[styles.testButton]}
        onPress={testNotification}
      >
        <FontAwesome name="bell" size={16} color="#FFF" />
        <Text style={styles.testButtonText}>Test Notification</Text>
      </TouchableOpacity>

      {/* Reminders List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Your Reminders</Text>

        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FFA726"]} />}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FFA726" style={{ marginTop: 50 }} />
          ) : reminders.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name="bell-o" size={60} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>No reminders yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to create your first reminder</Text>
            </View>
          ) : (
            reminders.map(item => (
              <View key={item.reminder_id} style={styles.reminderCard}>
                <ReminderCard
                  type={item.reminder_type}
                  title={item.title}
                  description={item.description}
                  dateTime={new Date(item.scheduled_datetime)}
                  extraInfo={item.extra_info}
                  color={item.color}
                  isCompleted={item.is_completed}
                />
                <View style={styles.cardActions}>
                  {!item.is_completed && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleComplete(item)}>
                      <FontAwesome name="check" size={16} color="#66BB6A" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
                    <FontAwesome name="edit" size={16} color="#42A5F5" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.reminder_id)}>
                    <FontAwesome name="trash" size={16} color="#EF5350" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <FontAwesome name="plus" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>Add New Reminder</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>{editingId ? 'Edit Reminder' : 'New Reminder'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {showCategorySelection && !selectedCategory ? (
                <View>
                  <Text style={modalStyles.label}>Select Reminder Type</Text>
                  {Object.entries(reminderCategories).map(([category, types]) => (
                    <View key={category} style={modalStyles.categoryBlock}>
                      <Text style={modalStyles.categoryTitle}>{category}</Text>
                      <View style={modalStyles.typeGrid}>
                        {types.map(type => (
                          <TouchableOpacity
                            key={type}
                            style={[modalStyles.typeBtn, { borderColor: typeColors[type] || '#FFA726' }]}
                            onPress={() => selectCategory(type)}
                          >
                            <Text style={[modalStyles.typeText, { color: typeColors[type] || '#FFA726' }]}>{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View>
                  {selectedCategory ? (
                    <TouchableOpacity style={modalStyles.changeBtn} onPress={() => setShowCategorySelection(true)}>
                      <Text style={modalStyles.changeText}>Current: {selectedCategory} (Tap to change)</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TextInput
                    style={modalStyles.input}
                    placeholder="Title *"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={title}
                    onChangeText={setTitle}
                  />

                  <TextInput
                    style={[modalStyles.input, modalStyles.textArea]}
                    placeholder="Description"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />

                  <TouchableOpacity
                    style={modalStyles.dateBtn}
                    onPress={() => {
                      setTempDate(dateTime);
                      setShowDatePicker(true);
                    }}
                  >
                    <FontAwesome name="calendar" size={20} color="#FFA726" />
                    <Text style={modalStyles.dateText}>{formatDateTime()}</Text>
                  </TouchableOpacity>

                  <View style={modalStyles.priorityRow}>
                    {['low', 'medium', 'high'].map(p => (
                      <TouchableOpacity
                        key={p}
                        style={[modalStyles.priorityBtn, priority === p && modalStyles.priorityActive]}
                        onPress={() => setPriority(p)}
                      >
                        <Text style={[modalStyles.priorityText, priority === p && modalStyles.priorityTextActive]}>
                          {p.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={modalStyles.input}
                    placeholder="Additional Info (dosage, location, etc.)"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={extraInfo}
                    onChangeText={setExtraInfo}
                  />

                  <View style={modalStyles.switchRow}>
                    <View style={modalStyles.switchLabel}>
                      <FontAwesome name="bell" size={18} color="#FFA726" />
                      <Text style={modalStyles.switchText}>Enable Alarm</Text>
                    </View>
                    <Switch value={alarmEnabled} onValueChange={setAlarmEnabled} trackColor={{ false: '#767577', true: '#FFA726' }} />
                  </View>

                  <View style={modalStyles.buttonRow}>
                    <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setModalVisible(false)}>
                      <Text style={modalStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave}>
                      <Text style={modalStyles.saveText}>{editingId ? 'Update' : 'Create'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DateTime Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={onDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#1A1F3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 199, 192, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#76c7c0',
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  userRole: {
    color: '#76c7c0',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  statsRow: {
    marginBottom: 20,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  reminderCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA726',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 20,
  },
  loginButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#FFA726',
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#1A1F3E',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  categoryBlock: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFA726',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  changeBtn: {
    backgroundColor: 'rgba(255,167,38,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  changeText: {
    color: '#FFA726',
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
    gap: 12,
  },
  dateText: {
    color: '#FFF',
    fontSize: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  priorityActive: {
    backgroundColor: '#FFA726',
    borderColor: '#FFA726',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  priorityTextActive: {
    color: '#1A1F3E',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchText: {
    fontSize: 16,
    color: '#FFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    alignItems: 'center',
    backgroundColor: '#42A5F5',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RemindersScreen;