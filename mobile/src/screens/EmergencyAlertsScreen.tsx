import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from "react-native";
import EmergencyContacts from "../components/EmergencyContacts";
import Icon from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get('window');

export default function EmergencyAlertsScreen({ navigation }) {
  const [showContacts, setShowContacts] = useState(false);

  const emergencyAlerts = [
    { id: "1", type: "Heart Rate Spike", time: "10:45 AM", date: "2024-11-20", status: "successful", value: "156 bpm" },
    { id: "2", type: "Low SpO2", time: "08:30 PM", date: "2024-11-19", status: "false", value: "87%" },
    { id: "3", type: "High Blood Pressure", time: "03:15 PM", date: "2024-11-18", status: "successful", value: "145/95" },
    { id: "4", type: "Fall Detection", time: "11:20 AM", date: "2024-11-17", status: "successful", value: "Hard Fall" },
    { id: "5", type: "Irregular Heartbeat", time: "09:10 AM", date: "2024-11-16", status: "false", value: "Arrhythmia" },
    { id: "6", type: "Temperature Alert", time: "07:45 PM", date: "2024-11-15", status: "successful", value: "103.2°F" },
    { id: "7", type: "Panic Button Pressed", time: "02:30 PM", date: "2024-11-14", status: "successful", value: "Manual Trigger" },
    { id: "8", type: "Medication Missed", time: "10:00 AM", date: "2024-11-13", status: "successful", value: "Heart Meds" },
    { id: "9", type: "Sudden Movement", time: "05:20 AM", date: "2024-11-12", status: "false", value: "Seizure-like" },
    { id: "10", type: "Respiratory Distress", time: "04:10 PM", date: "2024-11-11", status: "successful", value: "28 BPM" },
  ];

  const stats = {
    total: emergencyAlerts.length,
    successful: emergencyAlerts.filter(a => a.status === "successful").length,
    false: emergencyAlerts.filter(a => a.status === "false").length,
    responseTime: "2.4 min", // Average response time
  };

  const getAlertIcon = (type) => {
    const icons = {
      "Heart Rate Spike": "heartbeat",
      "Low SpO2": "tint",
      "High Blood Pressure": "heart",
      "Fall Detection": "exclamation-triangle",
      "Irregular Heartbeat": "heartbeat",
      "Temperature Alert": "thermometer-half",
      "Panic Button Pressed": "bell",
      "Medication Missed": "medkit",
      "Sudden Movement": "running",
      "Respiratory Distress": "wind",
    };
    return icons[type] || "exclamation-circle";
  };

  const getStatusColor = (status) => {
    return status === "successful" ? "#66BB6A" : "#EF5350";
  };

  const getStatusText = (status) => {
    return status === "successful" ? "Alert Sent" : "False Alarm";
  };

  return (
    <View style={styles.container}>
      {showContacts ? (
        <EmergencyContacts onBack={() => setShowContacts(false)} />
      ) : (
        <>
          {/* Screen-specific Header */}
          <View style={styles.screenHeader}>
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Icon name="bell" size={32} color="#EF5350" />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.screenTitle}>Emergency Alerts</Text>
                <Text style={styles.screenSubtitle}>Stay safe with instant emergency notifications</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="plus" size={18} color="#EF5350" />
                <Text style={styles.actionButtonText}>New Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="cog" size={18} color="#42A5F5" />
                <Text style={styles.actionButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Overview */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsScrollView}
          >
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: 'rgba(239, 83, 80, 0.1)' }]}>
                <Icon name="bell" size={24} color="#EF5350" />
                <Text style={[styles.statValue, { color: '#EF5350' }]}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Alerts</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(102, 187, 106, 0.1)' }]}>
                <Icon name="check-circle" size={24} color="#66BB6A" />
                <Text style={[styles.statValue, { color: '#66BB6A' }]}>{stats.successful}</Text>
                <Text style={styles.statLabel}>Successful</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255, 167, 38, 0.1)' }]}>
                <Icon name="times-circle" size={24} color="#FFA726" />
                <Text style={[styles.statValue, { color: '#FFA726' }]}>{stats.false}</Text>
                <Text style={styles.statLabel}>False Alarms</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(66, 165, 245, 0.1)' }]}>
                <Icon name="clock-o" size={24} color="#42A5F5" />
                <Text style={[styles.statValue, { color: '#42A5F5' }]}>{stats.responseTime}</Text>
                <Text style={styles.statLabel}>Avg. Response</Text>
              </View>
            </View>
          </ScrollView>

          {/* Alert History */}
          <View style={styles.alertsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Alert History</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <Icon name="chevron-right" size={14} color="#42A5F5" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.alertsScrollView}
            >
              {emergencyAlerts.map((alert, index) => (
                <TouchableOpacity
                  key={alert.id}
                  style={styles.alertCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.alertIconContainer}>
                    <Icon
                      name={getAlertIcon(alert.type)}
                      size={22}
                      color="#EF5350"
                    />
                  </View>

                  <View style={styles.alertContent}>
                    <Text style={styles.alertType}>{alert.type}</Text>
                    <View style={styles.alertDetails}>
                      <Text style={styles.alertTime}>
                        <Icon name="clock-o" size={12} color="rgba(255, 255, 255, 0.5)" /> {alert.time}
                      </Text>
                      <Text style={styles.alertDate}>{alert.date}</Text>
                    </View>
                    <View style={styles.alertValueContainer}>
                      <Text style={styles.alertValue}>{alert.value}</Text>
                    </View>
                  </View>

                  <View style={styles.alertStatusContainer}>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(alert.status) }
                    ]} />
                    <Text style={[
                      styles.alertStatus,
                      { color: getStatusColor(alert.status) }
                    ]}>
                      {getStatusText(alert.status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Emergency Button */}
          <View style={styles.emergencyButtonContainer}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => setShowContacts(true)}
              activeOpacity={0.8}
            >
              <Icon name="phone" size={22} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={styles.emergencyButtonText}>Manage Emergency Contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyButton, styles.panicButton]}
              activeOpacity={0.9}
            >
              <Icon name="exclamation-triangle" size={24} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={[styles.emergencyButtonText, { fontWeight: '700' }]}>Emergency Panic Button</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#0A1D3A',
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
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  statsScrollView: {
    marginTop: 20,
    maxHeight: 150,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  statCard: {
    width: 140,
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  alertsSection: {
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
  alertsScrollView: {
    flex: 1,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  alertDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
  },
  alertDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  alertValueContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  alertValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  alertStatusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  alertStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.3)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
  },
  panicButton: {
    backgroundColor: 'rgba(239, 83, 80, 0.3)',
    borderColor: '#EF5350',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.3,
  },
};