import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Dimensions
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    biometricLogin: true,
    autoBackup: true,
    shareAnalytics: false,
    locationTracking: true,
    emailUpdates: true,
    pushReminders: true
  });

  const userStats = {
    healthScore: 87,
    weeklyProgress: '+12%',
    streakDays: 24,
    goalsCompleted: 15,
    totalReadings: 342,
    avgHeartRate: 72,
    avgSleep: 7.2,
    dailySteps: 8560
  };

  const healthMetrics = [
    { label: 'Health Score', value: '87/100', icon: 'heartbeat', color: '#EF5350', trend: '+5' },
    { label: 'Weekly Progress', value: '+12%', icon: 'chart-line', color: '#66BB6A', trend: '↑' },
    { label: 'Current Streak', value: '24 days', icon: 'fire', color: '#FFA726', trend: '🔥' },
    { label: 'Goals Completed', value: '15/20', icon: 'check-circle', color: '#42A5F5', trend: '75%' },
  ];

  const menuItems = [
    { icon: 'user', label: 'Personal Information', color: '#42A5F5' },
    { icon: 'history', label: 'Health History', color: '#66BB6A' },
    { icon: 'chart-bar', label: 'Health Insights', color: '#FFA726' },
    { icon: 'award', label: 'Achievements', color: '#AB47BC' },
    { icon: 'share-alt', label: 'Share Data', color: '#78909C' },
    { icon: 'download', label: 'Export Data', color: '#FFCA28' },
    { icon: 'cog', label: 'Account Settings', color: '#EF5350' },
    { icon: 'question-circle', label: 'Help & Support', color: '#26C6DA' },
  ];

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleMenuItemPress = (label) => {
    // Handle menu item press
    console.log(`${label} pressed`);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Smith</Text>
            <Text style={styles.profileEmail}>john.smith@email.com</Text>
            <Text style={styles.profileRole}>Premium Member</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <FontAwesome name="edit" size={18} color="#42A5F5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Health Stats */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScrollView}
      >
        <View style={styles.statsContainer}>
          {healthMetrics.map((metric, index) => (
            <View key={index} style={[styles.statCard, { borderLeftColor: metric.color }]}>
              <View style={styles.statHeader}>
                <FontAwesome name={metric.icon} size={20} color={metric.color} />
                <Text style={[styles.statTrend, { color: metric.color }]}>{metric.trend}</Text>
              </View>
              <Text style={styles.statValue}>{metric.value}</Text>
              <Text style={styles.statLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Profile Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Profile Menu</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.label)}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                <FontAwesome name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <FontAwesome name="bell" size={20} color="#FFA726" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Receive health alerts and reminders</Text>
              </View>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => handleToggle('notifications')}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#FFA726' }}
              thumbColor={settings.notifications ? '#FFF' : 'rgba(255, 255, 255, 0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <FontAwesome name="moon" size={20} color="#AB47BC" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Use dark theme interface</Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={() => handleToggle('darkMode')}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#AB47BC' }}
              thumbColor={settings.darkMode ? '#FFF' : 'rgba(255, 255, 255, 0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <FontAwesome name="fingerprint" size={20} color="#42A5F5" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Biometric Login</Text>
                <Text style={styles.settingDescription}>Use fingerprint or face ID</Text>
              </View>
            </View>
            <Switch
              value={settings.biometricLogin}
              onValueChange={() => handleToggle('biometricLogin')}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#42A5F5' }}
              thumbColor={settings.biometricLogin ? '#FFF' : 'rgba(255, 255, 255, 0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <FontAwesome name="cloud" size={20} color="#66BB6A" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Auto Backup</Text>
                <Text style={styles.settingDescription}>Backup health data automatically</Text>
              </View>
            </View>
            <Switch
              value={settings.autoBackup}
              onValueChange={() => handleToggle('autoBackup')}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#66BB6A' }}
              thumbColor={settings.autoBackup ? '#FFF' : 'rgba(255, 255, 255, 0.5)'}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
          <FontAwesome name="sync" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Sync Health Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <FontAwesome name="sign-out" size={18} color="#EF5350" style={{ marginRight: 8 }} />
          <Text style={styles.secondaryButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
  },
  header: {
    backgroundColor: 'rgba(26, 31, 62, 0.8)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 30,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#42A5F5',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#66BB6A',
    borderWidth: 3,
    borderColor: '#1A1F3E',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 12,
    color: '#42A5F5',
    fontWeight: '600',
    backgroundColor: 'rgba(66, 165, 245, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsScrollView: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingRight: 40,
  },
  statCard: {
    width: 150,
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  statTrend: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  settingsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  settingsContainer: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: '#42A5F5',
    borderWidth: 1,
    borderColor: '#42A5F5',
  },
  secondaryButton: {
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF5350',
  },
});

export default ProfileScreen;