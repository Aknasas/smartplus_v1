import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Dimensions,
} from "react-native";
import ReminderCard from "../components/ReminderCard";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get('window');

const initialReminders = [
  {
    id: '1',
    type: 'Medicine Intake',
    title: 'Take Blood Pressure Medicine',
    description: 'Take after breakfast',
    dateTime: new Date('2024-11-10T08:00:00'),
    extraInfo: 'Lisinopril, 10mg',
    color: '#42A5F5',
  },
  {
    id: '2',
    type: 'Doctor Appointment',
    title: 'Next Doctor Appointment',
    description: 'Regular check-up',
    dateTime: new Date('2024-11-15T10:00:00'),
    extraInfo: 'Dr. Smith at Health Clinic, Room 101',
    color: '#66BB6A',
  },
  {
    id: '3',
    type: 'Lab Test',
    title: 'Blood Sugar Test',
    description: 'Fasting required',
    dateTime: new Date('2024-11-20T09:00:00'),
    extraInfo: 'City Lab',
    color: '#FFA726',
  },
  {
    id: '4',
    type: 'Exercise',
    title: 'Morning Walk',
    description: '30 minutes brisk walking',
    dateTime: new Date('2024-11-09T07:00:00'),
    extraInfo: 'Park near home',
    color: '#AB47BC',
  },
  {
    id: '5',
    type: 'Medication Refill',
    title: 'Refill Prescription',
    description: 'Pick up from pharmacy',
    dateTime: new Date('2024-11-25T16:00:00'),
    extraInfo: 'CVS Pharmacy',
    color: '#EF5350',
  },
];

const RemindersScreen = ({ navigation }) => {
  const [reminders, setReminders] = useState(initialReminders);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [form, setForm] = useState({
    id: '',
    type: '',
    title: '',
    description: '',
    dateTime: '',
    extraInfo: '',
    color: '#FFCA28',
  });

  const openModal = (reminder = null) => {
    if (reminder) {
      setForm({
        ...reminder,
        dateTime: reminder.dateTime.toISOString().slice(0, 16)
      });
      setEditingReminder(reminder);
    } else {
      setForm({
        id: '',
        type: '',
        title: '',
        description: '',
        dateTime: '',
        extraInfo: '',
        color: '#FFCA28',
      });
      setEditingReminder(null);
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setForm({
      id: '',
      type: '',
      title: '',
      description: '',
      dateTime: '',
      extraInfo: '',
      color: '#FFCA28',
    });
  };

  const handleSave = () => {
    if (editingReminder) {
      // Update existing reminder
      setReminders((prevReminders) =>
        prevReminders.map((reminder) =>
          reminder.id === editingReminder.id
            ? { ...form, dateTime: new Date(form.dateTime) }
            : reminder
        )
      );
    } else {
      // Add new reminder
      const typeColors = {
        'Medicine Intake': '#42A5F5',
        'Doctor Appointment': '#66BB6A',
        'Lab Test': '#FFA726',
        'Exercise': '#AB47BC',
        'Medication Refill': '#EF5350',
      };

      setReminders((prevReminders) => [
        ...prevReminders,
        {
          ...form,
          id: Date.now().toString(),
          dateTime: new Date(form.dateTime),
          color: typeColors[form.type] || '#FFCA28'
        },
      ]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setReminders((prevReminders) =>
      prevReminders.filter((reminder) => reminder.id !== id)
    );
  };

  const stats = {
    total: reminders.length,
    upcoming: reminders.filter(r => r.dateTime > new Date()).length,
    completed: reminders.filter(r => r.dateTime < new Date()).length,
    today: reminders.filter(r => {
      const today = new Date();
      const reminderDate = new Date(r.dateTime);
      return reminderDate.getDate() === today.getDate() &&
             reminderDate.getMonth() === today.getMonth() &&
             reminderDate.getFullYear() === today.getFullYear();
    }).length,
  };

  return (
    <View style={styles.container}>
      {/* Screen-specific Header */}
      <View style={styles.screenHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <FontAwesome name="clock-o" size={32} color="#FFCA28" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.screenTitle}>Reminders</Text>
            <Text style={styles.screenSubtitle}>Never miss important health tasks</Text>
          </View>
        </View>

        {/* Stats Overview */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScrollView}
        >
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 202, 40, 0.1)' }]}>
              <FontAwesome name="bell" size={24} color="#FFCA28" />
              <Text style={[styles.statValue, { color: '#FFCA28' }]}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(66, 165, 245, 0.1)' }]}>
              <FontAwesome name="calendar" size={24} color="#42A5F5" />
              <Text style={[styles.statValue, { color: '#42A5F5' }]}>{stats.upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(102, 187, 106, 0.1)' }]}>
              <FontAwesome name="check-circle" size={24} color="#66BB6A" />
              <Text style={[styles.statValue, { color: '#66BB6A' }]}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(239, 83, 80, 0.1)' }]}>
              <FontAwesome name="exclamation-circle" size={24} color="#EF5350" />
              <Text style={[styles.statValue, { color: '#EF5350' }]}>{stats.today}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Reminders List */}
      <View style={styles.remindersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Reminders</Text>
          <TouchableOpacity style={styles.filterButton}>
            <FontAwesome name="filter" size={16} color="#42A5F5" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.remindersScrollView}
        >
          {reminders.map((item) => (
            <View key={item.id} style={styles.reminderCard}>
              <ReminderCard
                type={item.type}
                title={item.title}
                description={item.description}
                dateTime={item.dateTime}
                extraInfo={item.extraInfo}
                color={item.color}
              />
              <View style={styles.reminderActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openModal(item)}
                >
                  <FontAwesome name="edit" size={16} color="#42A5F5" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <FontAwesome name="trash" size={16} color="#EF5350" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Add Reminder Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openModal()}
        >
          <FontAwesome name="plus" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add New Reminder</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Adding/Editing Reminder */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>
                {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <FontAwesome name="times" size={24} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            </View>

            <ScrollView style={modalStyles.formContainer}>
              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.label}>Type</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="e.g., Medicine, Appointment, Exercise"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={form.type}
                  onChangeText={(text) => setForm({ ...form, type: text })}
                />
              </View>

              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.label}>Title</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="Enter reminder title"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={form.title}
                  onChangeText={(text) => setForm({ ...form, title: text })}
                />
              </View>

              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.label}>Description</Text>
                <TextInput
                  style={[modalStyles.input, modalStyles.textArea]}
                  placeholder="Add description"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={form.description}
                  onChangeText={(text) => setForm({ ...form, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.label}>Date & Time</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="YYYY-MM-DDTHH:mm"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={form.dateTime}
                  onChangeText={(text) => setForm({ ...form, dateTime: text })}
                />
                <Text style={modalStyles.hint}>Format: 2024-11-10T08:00</Text>
              </View>

              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.label}>Additional Info</Text>
                <TextInput
                  style={[modalStyles.input, modalStyles.textArea]}
                  placeholder="Any extra details"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={form.extraInfo}
                  onChangeText={(text) => setForm({ ...form, extraInfo: text })}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </ScrollView>

            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity
                style={modalStyles.cancelButton}
                onPress={closeModal}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyles.saveButton}
                onPress={handleSave}
              >
                <FontAwesome name="check" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={modalStyles.saveButtonText}>
                  {editingReminder ? 'Update' : 'Create Reminder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
  },
  screenHeader: {
    backgroundColor: 'rgba(26, 31, 62, 0.8)',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 202, 40, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  statsScrollView: {
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingRight: 40,
  },
  statCard: {
    width: 120,
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  remindersSection: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 165, 245, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(66, 165, 245, 0.3)',
  },
  filterText: {
    fontSize: 14,
    color: '#42A5F5',
    fontWeight: '600',
    marginLeft: 8,
  },
  remindersScrollView: {
    flex: 1,
  },
  reminderCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 202, 40, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 202, 40, 0.3)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#1A1F3E',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '80%',
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
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#42A5F5',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#42A5F5',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RemindersScreen;