import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

export default function EmergencyContacts({ onBack }) {
  const [contacts, setContacts] = useState({
    hospital: [
      { name: 'City General Hospital', number: '+1 (555) 123-4567' },
      { name: 'Emergency Medical Center', number: '+1 (555) 987-6543' },
    ],
    doctor: [
      { name: 'Dr. Sarah Johnson', number: '+1 (555) 234-5678' },
      { name: 'Dr. Michael Chen', number: '+1 (555) 876-5432' },
    ],
    relative: [
      { name: 'John Smith (Spouse)', number: '+1 (555) 345-6789' },
      { name: 'Mary Johnson (Daughter)', number: '+1 (555) 765-4321' },
    ],
  });

  const [selectedContact, setSelectedContact] = useState(null);
  const [newContact, setNewContact] = useState({
    section: 'hospital',
    name: '',
    number: '',
  });

  const getSectionIcon = (section) => {
    switch(section) {
      case 'hospital': return 'hospital';
      case 'doctor': return 'user-md';
      case 'relative': return 'user';
      default: return 'user';
    }
  };

  const getSectionColor = (section) => {
    switch(section) {
      case 'hospital': return '#EF5350';
      case 'doctor': return '#42A5F5';
      case 'relative': return '#66BB6A';
      default: return '#42A5F5';
    }
  };

  const addContact = () => {
    if (newContact.name && newContact.number) {
      setContacts((prev) => ({
        ...prev,
        [newContact.section]: [...prev[newContact.section], { name: newContact.name, number: newContact.number }],
      }));
      setNewContact({ section: 'hospital', name: '', number: '' });
      setSelectedContact(null);
      Alert.alert('Success', 'Contact added successfully!');
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  const deleteContact = (section, index) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          setContacts((prev) => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index),
          }));
          setNewContact({ section: 'hospital', name: '', number: '' });
          setSelectedContact(null);
          Alert.alert('Success', 'Contact deleted successfully!');
        },
        style: 'destructive',
      },
    ]);
  };

  const selectContact = (section, index, contact) => {
    setSelectedContact({ section, index });
    setNewContact({ section, name: contact.name, number: contact.number });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.subtitle}>Manage your emergency contact list</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Form Section */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {selectedContact ? 'Edit Contact' : 'Add New Contact'}
          </Text>

          <View style={styles.inputContainer}>
            <Icon name="user" size={18} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contact Name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newContact.name}
              onChangeText={(text) => setNewContact((prev) => ({ ...prev, name: text }))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="phone" size={18} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="phone-pad"
              value={newContact.number}
              onChangeText={(text) => setNewContact((prev) => ({ ...prev, number: text }))}
            />
          </View>

          <Text style={styles.sectionLabel}>Contact Type</Text>
          <View style={styles.typeContainer}>
            {['hospital', 'doctor', 'relative'].map((section) => (
              <TouchableOpacity
                key={section}
                style={[
                  styles.typeButton,
                  newContact.section === section && {
                    backgroundColor: getSectionColor(section) + '20',
                    borderColor: getSectionColor(section)
                  },
                ]}
                onPress={() => setNewContact((prev) => ({ ...prev, section }))}
              >
                <Icon
                  name={getSectionIcon(section)}
                  size={20}
                  color={newContact.section === section ? getSectionColor(section) : 'rgba(255, 255, 255, 0.6)'}
                  style={styles.typeIcon}
                />
                <Text
                  style={[
                    styles.typeText,
                    newContact.section === section && { color: getSectionColor(section) }
                  ]}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={addContact}
          >
            <Icon
              name={selectedContact ? "check" : "plus"}
              size={18}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.actionButtonText}>
              {selectedContact ? 'Update Contact' : 'Add Contact'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact List */}
        {Object.entries(contacts).map(([section, contactList]) => (
          <View key={section} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: getSectionColor(section) + '20' }]}>
                <Icon name={getSectionIcon(section)} size={22} color={getSectionColor(section)} />
              </View>
              <Text style={[styles.sectionTitle, { color: getSectionColor(section) }]}>
                {section.charAt(0).toUpperCase() + section.slice(1)} ({contactList.length})
              </Text>
            </View>

            {contactList.length > 0 ? (
              contactList.map((contact, index) => (
                <View
                  key={index}
                  style={[
                    styles.contactCard,
                    selectedContact?.section === section && selectedContact?.index === index && styles.contactCardSelected
                  ]}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactNumber}>{contact.number}</Text>
                  </View>

                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={[styles.iconButton, styles.editButton]}
                      onPress={() => selectContact(section, index, contact)}
                    >
                      <Icon name="pencil" size={16} color="#42A5F5" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconButton, styles.deleteButton]}
                      onPress={() => deleteContact(section, index)}
                    >
                      <Icon name="trash" size={16} color="#EF5350" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="users" size={40} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.emptyStateText}>No contacts added yet</Text>
              </View>
            )}
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="download" size={20} color="#42A5F5" />
              <Text style={styles.quickActionText}>Export Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="share-alt" size={20} color="#66BB6A" />
              <Text style={styles.quickActionText}>Share List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="envelope" size={20} color="#FFA726" />
              <Text style={styles.quickActionText}>Send SMS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 31, 62, 0.8)',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 4,
  },
  typeIcon: {
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  addButton: {
    backgroundColor: '#42A5F5',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  sectionCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactCardSelected: {
    backgroundColor: 'rgba(66, 165, 245, 0.1)',
    borderColor: '#42A5F5',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(66, 165, 245, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 12,
    fontWeight: '500',
  },
  quickActionsCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
});