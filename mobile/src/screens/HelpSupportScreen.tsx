import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
}

const HelpSupportScreen: React.FC = ({ navigation }) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'How do I connect my ESP32 device?',
      answer: 'Make sure Bluetooth is enabled on your phone, then go to the Monitor screen and tap "Scan". Select your ESP32 device from the list. Ensure the device is powered on and in pairing mode.',
      expanded: false,
    },
    {
      id: '2',
      question: 'What do the different health metrics mean?',
      answer: 'Heart Rate: Beats per minute (normal: 60-100)\nSpO2: Blood oxygen saturation (normal: 95-100%)\nBody Temperature: Core body temperature (normal: 36-37.5°C)\nAcceleration: Movement data for activity tracking',
      expanded: false,
    },
    {
      id: '3',
      question: 'How accurate are the health readings?',
      answer: 'Our readings are comparable to medical-grade devices (±2% accuracy). For medical decisions, always consult with a healthcare professional.',
      expanded: false,
    },
    {
      id: '4',
      question: 'How do emergency alerts work?',
      answer: 'When critical health anomalies are detected, the app will notify your emergency contacts and can automatically call emergency services if enabled in settings.',
      expanded: false,
    },
    {
      id: '5',
      question: 'Is my health data secure?',
      answer: 'Yes! All data is encrypted using AES-256 encryption. We comply with HIPAA and GDPR regulations. Your data is never shared without your consent.',
      expanded: false,
    },
    {
      id: '6',
      question: 'How do I set health targets?',
      answer: 'Navigate to the "Set Targets" screen from the main menu. You can set daily goals for steps, heart rate zones, and other health metrics.',
      expanded: false,
    },
  ]);

  const [feedback, setFeedback] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const toggleFaq = (id: string) => {
    setFaqs(prev =>
      prev.map(faq =>
        faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
      )
    );
  };

  const contactOptions: ContactOption[] = [
    {
      id: '1',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: 'comment',
      color: '#42A5F5',
      action: () => Alert.alert('Live Chat', 'Connecting you with support...'),
    },
    {
      id: '2',
      title: 'Email Support',
      description: 'support@smarthealth.com',
      icon: 'envelope',
      color: '#66BB6A',
      action: () => {
        Linking.openURL('mailto:support@smarthealth.com?subject=SmartHealth%20Support').catch(() =>
          Alert.alert('Error', 'Could not open email app')
        );
      },
    },
    {
      id: '3',
      title: 'Phone Support',
      description: '+1 (800) 123-4567',
      icon: 'phone',
      color: '#FFA726',
      action: () => {
        Linking.openURL('tel:+18001234567').catch(() =>
          Alert.alert('Error', 'Could not make phone call')
        );
      },
    },
    {
      id: '4',
      title: 'Video Call',
      description: 'Schedule a video consultation',
      icon: 'video-camera',
      color: '#AB47BC',
      action: () => {
        Alert.alert(
          'Schedule Video Call',
          'Would you like to schedule a video consultation?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Schedule', onPress: () => {
              Linking.openURL('https://calendly.com/smarthealth/support').catch(() =>
                Alert.alert('Error', 'Could not open scheduling page')
              );
            }},
          ]
        );
      },
    },
  ];

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }

    setSendingFeedback(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSendingFeedback(false);
    setFeedback('');

    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted successfully.',
      [{ text: 'OK' }]
    );
  };

  const openDocumentation = () => {
    Linking.openURL('https://docs.smarthealth.com').catch(() =>
      Alert.alert('Error', 'Could not open documentation')
    );
  };

  const openCommunity = () => {
    Linking.openURL('https://community.smarthealth.com').catch(() =>
      Alert.alert('Error', 'Could not open community forum')
    );
  };

  const reportBug = () => {
    Alert.prompt(
      'Report a Bug',
      'Please describe the issue you encountered:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: (description) => {
            if (description) {
              Alert.alert('Bug Reported', 'Thank you for helping us improve!');
            }
          },
        },
      ]
    );
  };

  const supportStats = {
    responseTime: '2 min',
    satisfaction: '98%',
    issuesResolved: '24.8k',
    availability: '24/7'
  };

  return (
    <View style={styles.container}>
      {/* Screen-specific Header */}
      <View style={styles.screenHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <FontAwesome name="question-circle" size={32} color="#42A5F5" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.screenTitle}>Help & Support</Text>
            <Text style={styles.screenSubtitle}>24/7 support for all your questions and concerns</Text>
          </View>
        </View>

        {/* Support Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScrollView}
        >
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(66, 165, 245, 0.1)' }]}>
              <FontAwesome name="clock-o" size={20} color="#42A5F5" />
              <Text style={[styles.statValue, { color: '#42A5F5' }]}>{supportStats.responseTime}</Text>
              <Text style={styles.statLabel}>Avg Response</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(102, 187, 106, 0.1)' }]}>
              <FontAwesome name="smile-o" size={20} color="#66BB6A" />
              <Text style={[styles.statValue, { color: '#66BB6A' }]}>{supportStats.satisfaction}</Text>
              <Text style={styles.statLabel}>Satisfaction</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 167, 38, 0.1)' }]}>
              <FontAwesome name="check-circle" size={20} color="#FFA726" />
              <Text style={[styles.statValue, { color: '#FFA726' }]}>{supportStats.issuesResolved}</Text>
              <Text style={styles.statLabel}>Issues Resolved</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(171, 71, 188, 0.1)' }]}>
              <FontAwesome name="globe" size={20} color="#AB47BC" />
              <Text style={[styles.statValue, { color: '#AB47BC' }]}>{supportStats.availability}</Text>
              <Text style={styles.statLabel}>Availability</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Quick Contact Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.contactsScrollView}
        >
          <View style={styles.contactsContainer}>
            {contactOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactCard}
                onPress={option.action}
              >
                <View style={[styles.contactIcon, { backgroundColor: `${option.color}20` }]}>
                  <FontAwesome name={option.icon as any} size={24} color={option.color} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* FAQs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <TouchableOpacity onPress={openDocumentation} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <FontAwesome name="chevron-right" size={14} color="#42A5F5" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.faqsScrollView}
        >
          {faqs.map(faq => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqCard}
              onPress={() => toggleFaq(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqIcon}>
                  <FontAwesome name="question-circle" size={20} color="#42A5F5" />
                </View>
                <View style={styles.faqContent}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <FontAwesome
                    name={faq.expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                </View>
              </View>

              {faq.expanded && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Send Us Feedback</Text>
        <Text style={styles.sectionDescription}>
          Your feedback helps us improve the SmartHealth+ experience
        </Text>

        <View style={styles.feedbackCard}>
          <TextInput
            style={styles.feedbackInput}
            placeholder="What can we improve? Share your suggestions..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            multiline
            numberOfLines={4}
            value={feedback}
            onChangeText={setFeedback}
          />

          <View style={styles.feedbackActions}>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={handleSendFeedback}
              disabled={sendingFeedback}
            >
              <FontAwesome name="send" size={18} color="#FFF" />
              <Text style={styles.feedbackButtonText}>
                {sendingFeedback ? 'Sending...' : 'Send Feedback'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportBugButton}
              onPress={reportBug}
            >
              <FontAwesome name="bug" size={18} color="#EF5350" />
              <Text style={styles.reportBugText}>Report Bug</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Resources Section */}
      <View style={styles.resourcesSection}>
        <Text style={styles.sectionTitle}>Additional Resources</Text>

        <View style={styles.resourcesGrid}>
          <TouchableOpacity
            style={styles.resourceCard}
            onPress={openDocumentation}
          >
            <View style={[styles.resourceIcon, { backgroundColor: 'rgba(66, 165, 245, 0.1)' }]}>
              <FontAwesome name="book" size={24} color="#42A5F5" />
            </View>
            <Text style={styles.resourceTitle}>Documentation</Text>
            <Text style={styles.resourceDescription}>Complete user guides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={openCommunity}
          >
            <View style={[styles.resourceIcon, { backgroundColor: 'rgba(102, 187, 106, 0.1)' }]}>
              <FontAwesome name="users" size={24} color="#66BB6A" />
            </View>
            <Text style={styles.resourceTitle}>Community</Text>
            <Text style={styles.resourceDescription}>Join discussions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <View style={[styles.resourceIcon, { backgroundColor: 'rgba(255, 167, 38, 0.1)' }]}>
              <FontAwesome name="download" size={24} color="#FFA726" />
            </View>
            <Text style={styles.resourceTitle}>Download</Text>
            <Text style={styles.resourceDescription}>User Manual (PDF)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <View style={[styles.resourceIcon, { backgroundColor: 'rgba(171, 71, 188, 0.1)' }]}>
              <FontAwesome name="graduation-cap" size={24} color="#AB47BC" />
            </View>
            <Text style={styles.resourceTitle}>Tutorials</Text>
            <Text style={styles.resourceDescription}>Video guides</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info Footer */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoTitle}>SmartHealth+ v1.2.0</Text>
        <Text style={styles.appInfoText}>
          Build 2024.01.15 • {Platform.OS === 'ios' ? 'iOS' : 'Android'}
        </Text>
        <Text style={styles.appInfoText}>
          © 2024 SmartHealth Technologies. All rights reserved.
        </Text>

        <View style={styles.legalLinks}>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Data Usage</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    width: 100,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    lineHeight: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#42A5F5',
    fontWeight: '600',
    marginRight: 4,
  },
  contactsScrollView: {
    marginBottom: 10,
  },
  contactsContainer: {
    flexDirection: 'row',
    paddingRight: 40,
  },
  contactCard: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
  faqsScrollView: {
    flex: 1,
  },
  faqCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIcon: {
    marginRight: 12,
  },
  faqContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    marginRight: 12,
  },
  faqAnswerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  faqAnswer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  feedbackSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  feedbackCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  feedbackInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#FFF',
    textAlignVertical: 'top',
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  feedbackActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#42A5F5',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#42A5F5',
  },
  feedbackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportBugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  reportBugText: {
    color: '#EF5350',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  resourcesSection: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  resourceCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  resourceDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  appInfo: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    marginTop: 16,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  legalLink: {
    fontSize: 12,
    color: '#42A5F5',
    fontWeight: '500',
  },
  legalSeparator: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
  },
});

export default HelpSupportScreen;