import React, { useState, Suspense, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

// lazy-load feature components (same folder)
const featureComponents: any = {
  HealthMonitoring: React.lazy(() => import("./HealthMonitoringScreen")),
  AnomalyDetection: React.lazy(() => import("./AnomalyDetectionScreen")),
  EmergencyAlerts: React.lazy(() => import("./EmergencyAlertsScreen")),
  ProgressTracking: React.lazy(() => import("./ProgressTrackingScreen")),
  Recommendations: React.lazy(() => import("./RecommendationsScreen")),
  SecuritySettings: React.lazy(() => import("./SecuritySettingsScreen")),
  Reminders: React.lazy(() => import("./RemindersScreen")),
};

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [selectedFeature, setSelectedFeature] = useState("HealthMonitoring");
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const features = [
    { label: "Health Monitoring", icon: "heartbeat", value: "HealthMonitoring", color: "#FF6B6B" },
    { label: "Anomaly Detection", icon: "exclamation-circle", value: "AnomalyDetection", color: "#FFA726" },
    { label: "Emergency Alerts", icon: "bell", value: "EmergencyAlerts", color: "#EF5350" },
    { label: "Progress Tracking", icon: "line-chart", value: "ProgressTracking", color: "#42A5F5" },
    { label: "Health Recommendations", icon: "stethoscope", value: "Recommendations", color: "#66BB6A" },
    { label: "Security Settings", icon: "lock", value: "SecuritySettings", color: "#AB47BC" },
    { label: "Reminders", icon: "exclamation-triangle", value: "Reminders", color: "#FFCA28" },
  ];

  // Get current feature data based on selected tab
  const selectedFeatureData = features.find(f => f.value === selectedFeature);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1D3A" />

      {/* Animated Background */}
      <Animated.View style={[styles.background, { opacity: fadeAnim }]}>
        <View style={styles.backgroundBlur1} />
        <View style={styles.backgroundBlur2} />
        <View style={styles.backgroundBlur3} />
      </Animated.View>

      {/* Header Section - Always Visible */}
      <View style={styles.headerContainer}>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo/App Icon */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/myimage.jpg")}
              style={styles.logo}
            />
            <View style={styles.logoBadge}>
              <Icon name="plus" size={10} color="#FFF" />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <Icon name="sign-in" size={18} color="#FFF" />
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* App Title & Tagline */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SmartHealth+</Text>
          <Text style={styles.tagline}>Your AI-Powered Health Companion</Text>
        </View>
      </View>

      {/* Feature Content Area - Takes remaining space */}
      <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.contentScrollView}
        >
          {/* Selected Feature Content */}
          <View style={styles.featureContent}>
            <Suspense fallback={
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner}>
                  <Icon name="spinner" size={30} color="#42A5F5" />
                </View>
                <Text style={styles.loadingText}>Loading {selectedFeatureData?.label}...</Text>
              </View>
            }>
              {selectedFeature && React.createElement(featureComponents[selectedFeature])}
            </Suspense>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#0A1D3A',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundBlur1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(66, 165, 245, 0.1)',
  },
  backgroundBlur2: {
    position: 'absolute',
    bottom: -100,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  backgroundBlur3: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(102, 187, 106, 0.05)',
  },
  headerContainer: {
    backgroundColor: 'rgba(10, 29, 58, 0.95)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    position: 'relative',
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#42A5F5',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A1D3A',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  contentArea: {
    flex: 1,
    paddingTop: 20,
  },
  contentScrollView: {
    flex: 1,
  },
  featureContent: {
    flex: 1,
    minHeight: 500,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
};