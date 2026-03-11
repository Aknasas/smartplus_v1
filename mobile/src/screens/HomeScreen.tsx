// HomeScreen.tsx - UPDATED with user dashboard
import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// User details interface
interface UserDetails {
  username: string;
  fullName: string;
  email: string;
  userId: string;
}

export default function HomeScreen({ navigation }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check login status when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkLoginStatus = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@health_app_token');
      const userId = await AsyncStorage.getItem('@health_app_user_id');
      const username = await AsyncStorage.getItem('@health_app_username');
      const fullName = await AsyncStorage.getItem('@health_app_fullname');
      const email = await AsyncStorage.getItem('@health_app_email');

      if (token && userId) {
        setIsLoggedIn(true);
        setUserDetails({
          username: username || 'User',
          fullName: fullName || 'User Name',
          email: email || 'email@example.com',
          userId: userId
        });
      } else {
        setIsLoggedIn(false);
        setUserDetails(null);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                '@health_app_token',
                '@health_app_user_id',
                '@health_app_username',
                '@health_app_fullname',
                '@health_app_email'
              ]);
              setIsLoggedIn(false);
              setUserDetails(null);
              // Navigate to Login screen
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  const features = [
    { label: "Health Monitoring", icon: "heartbeat", value: "Health", color: "#FF6B6B", description: "Real-time health data from your devices" },
    { label: "Anomaly Detection", icon: "exclamation-circle", value: "Anomaly", color: "#FFA726", description: "AI-powered health anomaly detection" },
    { label: "Emergency Alerts", icon: "bell", value: "Alerts", color: "#EF5350", description: "Instant emergency notifications" },
    { label: "Progress Tracking", icon: "line-chart", value: "Progress", color: "#42A5F5", description: "Track your health progress over time" },
    { label: "Health Tips", icon: "stethoscope", value: "Tips", color: "#66BB6A", description: "Personalized health recommendations" },
    { label: "Security Settings", icon: "lock", value: "Security", color: "#AB47BC", description: "Manage your account security" },
    { label: "Reminders", icon: "clock-o", value: "Reminders", color: "#FFCA28", description: "Set health and medication reminders" },
    { label: "Help & Support", icon: "question-circle", value: "Help", color: "#42A5F5", description: "Get help and support" },
  ];

  const quickStats = [
    { label: "Heart Rate", value: "72 bpm", icon: "heart", color: "#FF6B6B" },
    { label: "Steps", value: "6,432", icon: "walk", color: "#66BB6A" },
    { label: "Sleep", value: "7.2h", icon: "moon-o", color: "#AB47BC" },
  ];

  // Show loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1D3A" />

      {/* Animated Background */}
      <Animated.View style={[styles.background, { opacity: fadeAnim }]}>
        <View style={styles.backgroundBlur1} />
        <View style={styles.backgroundBlur2} />
        <View style={styles.backgroundBlur3} />
      </Animated.View>

      {/* Header Section - Changes based on login status */}
      <View style={styles.headerContainer}>
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

          {/* Login/Logout Button */}
          {isLoggedIn ? (
            <View style={styles.userInfoRow}>
              <Text style={styles.userNameText} numberOfLines={1}>
                Hi, {userDetails?.fullName?.split(' ')[0] || 'User'}
              </Text>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Icon name="sign-out" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.8}
            >
              <Icon name="sign-in" size={18} color="#FFF" />
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* App Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SmartHealth+</Text>
          <Text style={styles.tagline}>Your AI-Powered Health Companion</Text>
        </View>

        {/* User Details Card - Only shown when logged in */}
        {isLoggedIn && userDetails && (
          <Animated.View style={[styles.userDetailsCard, { opacity: fadeAnim }]}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {userDetails.fullName?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userFullName}>{userDetails.fullName}</Text>
              <Text style={styles.userEmail}>{userDetails.email}</Text>
              <Text style={styles.userUsername}>@{userDetails.username}</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Main Content Area */}
      <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.contentScrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {isLoggedIn ? (
            <>
              {/* Quick Stats Section */}
              <Text style={styles.sectionTitle}>Quick Stats</Text>
              <View style={styles.statsContainer}>
                {quickStats.map((stat, index) => (
                  <View key={index} style={[styles.statCard, { backgroundColor: stat.color + '20' }]}>
                    <Icon name={stat.icon} size={24} color={stat.color} />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {/* Welcome Message */}
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>
                  Welcome back, {userDetails?.fullName?.split(' ')[0]}!
                </Text>
                <Text style={styles.welcomeText}>
                  Your health dashboard is ready. Swipe up on the tray below to access all features.
                </Text>
              </View>

              {/* Features Preview */}
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <View style={styles.featuresPreview}>
                {features.slice(0, 4).map((feature, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.previewCard, { backgroundColor: feature.color + '15' }]}
                    onPress={() => navigation.navigate(feature.value)}
                  >
                    <View style={[styles.previewIcon, { backgroundColor: feature.color + '30' }]}>
                      <Icon name={feature.icon} size={24} color={feature.color} />
                    </View>
                    <Text style={styles.previewLabel}>{feature.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tray Indicator */}
              <View style={styles.trayIndicator}>
                <View style={styles.trayLine} />
                <Text style={styles.trayText}>Swipe up on the bottom tray to see all features</Text>
                <Icon name="arrow-up" size={16} color="rgba(255,255,255,0.5)" />
              </View>
            </>
          ) : (
            // Not logged in view
            <View style={styles.welcomeCard}>
              <Icon name="lock" size={50} color="#42A5F5" style={styles.lockIcon} />
              <Text style={styles.welcomeTitle}>Welcome to SmartHealth+</Text>
              <Text style={styles.welcomeText}>
                Please log in to access your personalized health dashboard and start monitoring your health data.
              </Text>
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <Icon name="arrow-right" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
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
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    marginLeft: 10,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: 120,
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
  userDetailsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 24,
    marginTop: 10,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#42A5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userFullName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  userUsername: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  contentArea: {
    flex: 1,
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  lockIcon: {
    marginBottom: 15,
  },
  welcomeTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#42A5F5',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  featuresPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  previewCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  trayIndicator: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  trayLine: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  trayText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
  },
};