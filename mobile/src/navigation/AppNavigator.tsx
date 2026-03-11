import React, { useState, useRef, useEffect } from "react";
import {
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";

// Import Screens
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import HealthMonitoringScreen from "../screens/HealthMonitoringScreen";
import AnomalyDetectionScreen from "../screens/AnomalyDetectionScreen";
import EmergencyAlertsScreen from "../screens/EmergencyAlertsScreen";
import ProgressTrackingScreen from "../screens/ProgressTrackingScreen";
import RecommendationsScreen from "../screens/RecommendationsScreen";
import RemindersScreen from "../screens/RemindersScreen";
import SecuritySettingsScreen from "../screens/SecuritySettingsScreen";
import SetTargetScreen from "../screens/SetTargetScreen";
import ProfileScreen from "../screens/ProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import DatabaseTestScreen from '../screens/DatabaseTestScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ==================== CUSTOM TAB BAR ====================
function CustomTabBar({ state, descriptors, navigation }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const scrollViewRef = useRef(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const HIDE_TIMEOUT = 3000;
  const HIDE_DISTANCE = 100;
  const tabWidth = 90;

  // Define tabs
  const tabs = [
    { name: "Home", label: "Home", icon: "home", color: "#42A5F5" },
    { name: "Health", label: "Health", icon: "heartbeat", color: "#76c7c0" },
    { name: "Anomaly", label: "Anomaly", icon: "exclamation-triangle", color: "#FFA726" },
    { name: "Alerts", label: "Alerts", icon: "bell", color: "#EF5350" },
    { name: "Reminders", label: "Reminders", icon: "clock-o", color: "#FFCA28" },
    { name: "Tips", label: "Tips", icon: "lightbulb-o", color: "#FFCA28" },
    { name: "Progress", label: "Progress", icon: "chart-line", color: "#42A5F5" },
    { name: "Security", label: "Security", icon: "shield", color: "#42A5F5" },
    { name: "Help", label: "Help", icon: "question-circle", color: "#42A5F5" },
    { name: "Profile", label: "Profile", icon: "user", color: "#42A5F5" },
    { name: "DatabaseTest", label: "Test", icon: "database", color: "#42A5F5" },
  ];

  // Auto-hide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteractionTime;
      if (timeSinceLastInteraction > HIDE_TIMEOUT && tabBarVisible) {
        hideTabBar();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastInteractionTime, tabBarVisible]);

  useEffect(() => {
    if (state && state.index !== undefined) {
      setSelectedTab(state.index);
    }
  }, [state?.index]);

  const showTabBar = () => {
    setTabBarVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideTabBar = () => {
    setTabBarVisible(false);
    Animated.timing(translateY, {
      toValue: HIDE_DISTANCE,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleInteraction = () => {
    setLastInteractionTime(Date.now());
    if (!tabBarVisible) showTabBar();
  };

  const handleTabPress = (index, routeName) => {
    handleInteraction();
    setSelectedTab(index);
    navigation.navigate(routeName);

    // Scroll to selected tab
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * tabWidth - SCREEN_WIDTH / 2 + tabWidth / 2,
        animated: true,
      });
    }
  };

  const scrollToPrev = () => {
    if (selectedTab > 0) {
      handleTabPress(selectedTab - 1, tabs[selectedTab - 1].name);
    }
  };

  const scrollToNext = () => {
    if (selectedTab < tabs.length - 1) {
      handleTabPress(selectedTab + 1, tabs[selectedTab + 1].name);
    }
  };

  return (
    <Animated.View style={[styles.tabBarContainer, { transform: [{ translateY }] }]}>
      <TouchableOpacity
        style={styles.tabBarIndicator}
        onPress={() => tabBarVisible ? hideTabBar() : showTabBar()}
      >
        <Icon name={tabBarVisible ? "chevron-down" : "chevron-up"} size={16} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      <View style={styles.tabBarContent}>
        <TouchableOpacity
          onPress={scrollToPrev}
          style={[styles.arrowButton, { opacity: selectedTab > 0 ? 1 : 0.3 }]}
          disabled={selectedTab === 0}
        >
          <Icon name="chevron-left" size={24} color="#42A5F5" />
        </TouchableOpacity>

        <View style={styles.scrollContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onTouchStart={handleInteraction}
          >
            {tabs.map((tab, index) => {
              const isFocused = selectedTab === index;
              return (
                <TouchableOpacity
                  key={tab.name}
                  onPress={() => handleTabPress(index, tab.name)}
                  style={[styles.tabButton, isFocused && styles.tabButtonActive]}
                >
                  <View style={[styles.tabIconContainer, isFocused && { backgroundColor: tab.color + '20' }]}>
                    <Icon name={tab.icon} size={20} color={isFocused ? tab.color : 'rgba(255,255,255,0.6)'} />
                  </View>
                  <Text style={[styles.tabLabel, isFocused && { color: tab.color }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={scrollToNext}
          style={[styles.arrowButton, { opacity: selectedTab < tabs.length - 1 ? 1 : 0.3 }]}
          disabled={selectedTab === tabs.length - 1}
        >
          <Icon name="chevron-right" size={24} color="#42A5F5" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ==================== TAB NAVIGATOR ====================
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Health" component={HealthMonitoringScreen} />
      <Tab.Screen name="Anomaly" component={AnomalyDetectionScreen} />
      <Tab.Screen name="Alerts" component={EmergencyAlertsScreen} />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
      <Tab.Screen name="Tips" component={RecommendationsScreen} />
      <Tab.Screen name="Progress" component={ProgressTrackingScreen} />
      <Tab.Screen name="Security" component={SecuritySettingsScreen} />
      <Tab.Screen name="Help" component={HelpSupportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="DatabaseTest" component={DatabaseTestScreen} />
    </Tab.Navigator>
  );
}

// ==================== ROOT STACK NAVIGATOR ====================
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#1A1F3E' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#1A1F3E' }
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* Main App - After Login */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Modal Screens */}
        <Stack.Screen
          name="SetTarget"
          component={SetTargetScreen}
          options={{
            presentation: 'modal',
            title: 'Set Target',
            headerLeft: () => null
          }}
        />

        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            presentation: 'modal',
            title: 'Notifications'
          }}
        />

        {/* Individual Screens (can be accessed from anywhere) */}
        <Stack.Screen
          name="HealthMonitoring"
          component={HealthMonitoringScreen}
          options={{ title: 'Health Monitor' }}
        />

        <Stack.Screen
          name="AnomalyDetection"
          component={AnomalyDetectionScreen}
          options={{ title: 'Anomaly Detection' }}
        />

        <Stack.Screen
          name="EmergencyAlerts"
          component={EmergencyAlertsScreen}
          options={{ title: 'Emergency Alerts' }}
        />

        <Stack.Screen
          name="ProgressTracking"
          component={ProgressTrackingScreen}
          options={{ title: 'Progress' }}
        />

        <Stack.Screen
          name="Recommendations"
          component={RecommendationsScreen}
          options={{ title: 'Recommendations' }}
        />

        <Stack.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{ title: 'Reminders' }}
        />

        <Stack.Screen
          name="SecuritySettings"
          component={SecuritySettingsScreen}
          options={{ title: 'Security' }}
        />

        <Stack.Screen
          name="HelpSupport"
          component={HelpSupportScreen}
          options={{ title: 'Help & Support' }}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />

        <Stack.Screen
          name="DatabaseTest"
          component={DatabaseTestScreen}
          options={{ title: 'Database Test' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 31, 62, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  tabBarIndicator: {
    position: 'absolute',
    top: -18,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 18,
    backgroundColor: 'rgba(26, 31, 62, 0.98)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 0,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
  },
  arrowButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tabButton: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(118, 199, 192, 0.1)',
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});