import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Switch, 
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const SecuritySettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    biometricAuth: true,
    twoFactorAuth: false,
    autoLogout: true,
    dataEncryption: true,
    cloudBackup: true,
    activityLogs: true,
    emergencyAccess: true,
    shareData: false
  });

  const [selectedPrivacy, setSelectedPrivacy] = useState('high');

  const securityFeatures = [
    {
      icon: 'fingerprint',
      title: 'Biometric Authentication',
      description: 'Use fingerprint or face ID for secure login',
      enabled: settings.biometricAuth,
      color: '#42A5F5'
    },
    {
      icon: 'lock',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security with 2FA',
      enabled: settings.twoFactorAuth,
      color: '#66BB6A'
    },
    {
      icon: 'shield',
      title: 'End-to-End Encryption',
      description: 'All health data is encrypted in transit and at rest',
      enabled: settings.dataEncryption,
      color: '#AB47BC'
    },
    {
      icon: 'cloud',
      title: 'Secure Cloud Backup',
      description: 'Automatic encrypted backups of your health data',
      enabled: settings.cloudBackup,
      color: '#FFA726'
    },
    {
      icon: 'history',
      title: 'Activity Logs',
      description: 'Track all access to your health information',
      enabled: settings.activityLogs,
      color: '#EF5350'
    },
    {
      icon: 'exclamation-triangle',
      title: 'Emergency Access',
      description: 'Grant temporary access in emergencies',
      enabled: settings.emergencyAccess,
      color: '#FF6B6B'
    },
    {
      icon: 'users',
      title: 'Data Sharing',
      description: 'Share anonymized data for research',
      enabled: settings.shareData,
      color: '#FFCA28'
    },
    {
      icon: 'hourglass',
      title: 'Auto Logout',
      description: 'Automatically log out after 15 minutes of inactivity',
      enabled: settings.autoLogout,
      color: '#78909C'
    }
  ];

  const privacyLevels = [
    { level: 'high', label: 'Maximum', description: 'Full encryption, no data sharing', icon: 'shield' },
    { level: 'medium', label: 'Balanced', description: 'Basic protection, anonymized sharing', icon: 'balance-scale' },
    { level: 'low', label: 'Essential', description: 'Minimal security for quick access', icon: 'bolt' }
  ];

  const securityStats = {
    encryptionStrength: 'AES-256',
    lastAudit: '2 days ago',
    threatsBlocked: 124,
    dataBreaches: 0
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacySelect = (level) => {
    setSelectedPrivacy(level);
    Alert.alert(
      'Privacy Level Updated',
      `Your privacy settings have been set to ${privacyLevels.find(p => p.level === level)?.label || 'Maximum'} protection`,
      [{ text: 'OK' }]
    );
  };

  const runSecurityCheck = () => {
    Alert.alert(
      'Security Check Complete',
      'All security features are active and up to date. No vulnerabilities detected.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Screen-specific Header */}
      <View style={styles.screenHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <FontAwesome name="shield" size={32} color="#42A5F5" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.screenTitle}>Security Settings</Text>
            <Text style={styles.screenSubtitle}>Protect your health data and privacy</Text>
          </View>
        </View>

        {/* Security Stats */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsScrollView}
        >
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(66, 165, 245, 0.1)' }]}>
              <FontAwesome name="lock" size={24} color="#42A5F5" />
              <Text style={[styles.statValue, { color: '#42A5F5' }]}>{securityStats.encryptionStrength}</Text>
              <Text style={styles.statLabel}>Encryption</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(239, 83, 80, 0.1)' }]}>
              <FontAwesome name="ban" size={24} color="#EF5350" />
              <Text style={[styles.statValue, { color: '#EF5350' }]}>{securityStats.threatsBlocked}</Text>
              <Text style={styles.statLabel}>Threats Blocked</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(102, 187, 106, 0.1)' }]}>
              <FontAwesome name="check-circle" size={24} color="#66BB6A" />
              <Text style={[styles.statValue, { color: '#66BB6A' }]}>{securityStats.dataBreaches}</Text>
              <Text style={styles.statLabel}>Data Breaches</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 167, 38, 0.1)' }]}>
              <FontAwesome name="history" size={24} color="#FFA726" />
              <Text style={[styles.statValue, { color: '#FFA726' }]}>{securityStats.lastAudit}</Text>
              <Text style={styles.statLabel}>Last Audit</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Privacy Level Selector */}
      <View style={styles.privacySection}>
        <Text style={styles.sectionTitle}>Privacy Level</Text>
        <View style={styles.privacyLevelsContainer}>
          {privacyLevels.map((level) => (
            <TouchableOpacity
              key={level.level}
              style={[
                styles.privacyLevelCard,
                selectedPrivacy === level.level && styles.privacyLevelCardActive
              ]}
              onPress={() => handlePrivacySelect(level.level)}
            >
              <View style={[
                styles.privacyIconContainer,
                selectedPrivacy === level.level && { backgroundColor: '#42A5F5' }
              ]}>
                <FontAwesome 
                  name={level.icon} 
                  size={24} 
                  color={selectedPrivacy === level.level ? '#FFF' : '#42A5F5'} 
                />
              </View>
              <Text style={[
                styles.privacyLevelLabel,
                selectedPrivacy === level.level && { color: '#42A5F5' }
              ]}>
                {level.label}
              </Text>
              <Text style={styles.privacyLevelDescription}>{level.description}</Text>
              {selectedPrivacy === level.level && (
                <View style={styles.selectedIndicator}>
                  <FontAwesome name="check" size={16} color="#42A5F5" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Security Features */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Security Features</Text>
          <TouchableOpacity style={styles.securityCheckButton} onPress={runSecurityCheck}>
            <FontAwesome name="shield" size={16} color="#42A5F5" />
            <Text style={styles.securityCheckText}>Run Check</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.featuresScrollView}
        >
          {securityFeatures.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <FontAwesome name={feature.icon} size={24} color={feature.color} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Switch
                  value={feature.enabled}
                  onValueChange={() => handleToggle(Object.keys(settings)[index])}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: feature.color }}
                  thumbColor={feature.enabled ? '#FFF' : 'rgba(255, 255, 255, 0.5)'}
                />
              </View>
              
              {feature.enabled && (
                <View style={styles.statusIndicator}>
                  <FontAwesome name="check-circle" size={14} color="#66BB6A" />
                  <Text style={styles.statusText}>Active and protecting your data</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="key" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionButtonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <FontAwesome name="download" size={18} color="#42A5F5" style={{ marginRight: 8 }} />
          <Text style={[styles.actionButtonText, { color: '#42A5F5' }]}>Export Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
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
    backgroundColor: 'rgba(66, 165, 245, 0.15)',
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
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  privacySection: {
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
  privacyLevelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  privacyLevelCard: {
    flex: 1,
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  privacyLevelCardActive: {
    borderColor: '#42A5F5',
    backgroundColor: 'rgba(66, 165, 245, 0.1)',
  },
  privacyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 165, 245, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyLevelLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  privacyLevelDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 165, 245, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 165, 245, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(66, 165, 245, 0.3)',
  },
  securityCheckText: {
    fontSize: 14,
    color: '#42A5F5',
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresScrollView: {
    flex: 1,
  },
  featureCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 187, 106, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 187, 106, 0.2)',
  },
  statusText: {
    fontSize: 12,
    color: '#66BB6A',
    marginLeft: 8,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#42A5F5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#42A5F5',
  },
  secondaryButton: {
    backgroundColor: 'rgba(66, 165, 245, 0.1)',
    borderColor: '#42A5F5',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
};

export default SecuritySettingsScreen;