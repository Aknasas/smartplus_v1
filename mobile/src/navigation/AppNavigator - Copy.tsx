import React, { useState, useRef, useEffect } from "react";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Custom Tab Bar Component with Scroll and Hide Animation
function CustomTabBar({ state, descriptors, navigation }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const HIDE_TIMEOUT = 3000; // Hide tabs after 3 seconds of inactivity
  const HIDE_DISTANCE = 100; // How much to move down when hidden

  const tabWidth = 120; // Fixed width for each tab

  const tabs = [
    {
      name: "HomeTab",
      label: "Home",
      icon: "home",
      component: HomeScreen,
      color: "#42A5F5"
    },
    {
      name: "AnomalyDetectionScreen",
      label: "Anomaly",
      icon: "exclamation-circle",
      component: AnomalyDetectionScreen,
      color: "#FFA726"
    },
    {
      name: "EmergencyAlertsScreen",
      label: "Alerts",
      icon: "bell",
      component: EmergencyAlertsScreen,
      color: "#EF5350"
    },
    {
      name: "RemindersScreen",
      label: "Reminders",
      icon: "clock-o",
      component: RemindersScreen,
      color: "#FFCA28"
    },
    {
      name: "RecommendationsScreen",
      label: "Tips",
      icon: "lightbulb-o",
      component: RecommendationsScreen,
      color: "#FFCA28"
    },
    {
      name: "ProgressTrackingScreen",
      label: "Progress",
      icon: "chart-line",
      component: ProgressTrackingScreen,
      color: "#42A5F5"
    },
    {
      name: "SecuritySettingsScreen",
      label: "Security",
      icon: "shield",
      component: SecuritySettingsScreen,
      color: "#42A5F5"
    },
    {
      name: "HelpSupportScreen",
      label: "Help",
      icon: "question-circle",
      component: HelpSupportScreen,
      color: "#42A5F5"
    },
    {
      name: "ProfileTab",
      label: "Profile",
      icon: "user",
      component: ProfileScreen,
      color: "#42A5F5"
    },
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
    if (!tabBarVisible) {
      showTabBar();
    }
  };

  const handleTabPress = (index, route) => {
    handleInteraction();
    setSelectedTab(index);
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }

    // Scroll to selected tab
    scrollViewRef.current?.scrollTo({
      x: index * tabWidth - SCREEN_WIDTH / 2 + tabWidth / 2,
      animated: true,
    });
  };

  const scrollToPrev = () => {
    handleInteraction();
    const newIndex = Math.max(0, selectedTab - 1);
    setSelectedTab(newIndex);
    navigation.navigate(tabs[newIndex].name);
    scrollViewRef.current?.scrollTo({
      x: newIndex * tabWidth - SCREEN_WIDTH / 2 + tabWidth / 2,
      animated: true,
    });
  };

  const scrollToNext = () => {
    handleInteraction();
    const newIndex = Math.min(tabs.length - 1, selectedTab + 1);
    setSelectedTab(newIndex);
    navigation.navigate(tabs[newIndex].name);
    scrollViewRef.current?.scrollTo({
      x: newIndex * tabWidth - SCREEN_WIDTH / 2 + tabWidth / 2,
      animated: true,
    });
  };

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Show/Hide Indicator */}
      <TouchableOpacity
        style={styles.tabBarIndicator}
        onPress={() => tabBarVisible ? hideTabBar() : showTabBar()}
        activeOpacity={0.8}
      >
        <Icon
          name={tabBarVisible ? "chevron-down" : "chevron-up"}
          size={16}
          color="rgba(255, 255, 255, 0.6)"
        />
      </TouchableOpacity>

      <View style={styles.tabBarContent}>
        {/* Left Arrow Button */}
        {selectedTab > 0 && (
          <TouchableOpacity
            onPress={scrollToPrev}
            style={styles.arrowButton}
          >
            <Icon name="chevron-left" size={24} color="#42A5F5" />
          </TouchableOpacity>
        )}

        {/* Scrollable Tabs */}
        <View style={styles.scrollContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            onTouchStart={handleInteraction}
          >
            {tabs.map((tab, index) => {
              const isFocused = state.index === index;

              return (
                <TouchableOpacity
                  key={tab.name}
                  onPress={() => handleTabPress(index, state.routes[index])}
                  style={[
                    styles.tabButton,
                    isFocused && styles.tabButtonActive,
                    { borderColor: tab.color }
                  ]}
                >
                  <View style={[
                    styles.tabIconContainer,
                    isFocused && { backgroundColor: tab.color + '20' }
                  ]}>
                    <Icon
                      name={tab.icon}
                      size={22}
                      color={isFocused ? tab.color : 'rgba(255, 255, 255, 0.6)'}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.tabLabel,
                      isFocused && { color: tab.color }
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Arrow Button */}
        {selectedTab < tabs.length - 1 && (
          <TouchableOpacity
            onPress={scrollToNext}
            style={styles.arrowButton}
          >
            <Icon name="chevron-right" size={24} color="#42A5F5" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// Individual Tab Screen Component
function TabScreen({ route, navigation }) {
  const screenConfigs = {
    HomeTab: {
      component: HomeScreen,
      title: "SmartHealth+",
      tagline: "Your AI-Powered Health Companion"
    },
    AnomalyDetectionScreen: {
      component: AnomalyDetectionScreen,
      title: "Anomaly Detection",
      tagline: "AI-powered anomaly detection for your health"
    },
    EmergencyAlertsScreen: {
      component: EmergencyAlertsScreen,
      title: "Emergency Alerts",
      tagline: "Stay safe with instant emergency notifications"
    },
    RemindersScreen: {
      component: RemindersScreen,
      title: "Reminders",
      tagline: "Never miss important health tasks"
    },
    RecommendationsScreen: {
      component: RecommendationsScreen,
      title: "Health Recommendations",
      tagline: "AI-powered personalized health suggestions"
    },
    ProgressTrackingScreen: {
      component: ProgressTrackingScreen,
      title: "Progress Tracking",
      tagline: "Track your health goals and achievements"
    },
    SecuritySettingsScreen: {
      component: SecuritySettingsScreen,
      title: "Security Settings",
      tagline: "Protect your health data and privacy"
    },
    HelpSupportScreen: {
      component: HelpSupportScreen,
      title: "Help & Support",
      tagline: "24/7 support for all your questions and concerns"
    },
    ProfileTab: {
      component: ProfileScreen,
      title: "Profile",
      tagline: "Manage your account and settings"
    },
  };

  const config = screenConfigs[route.name] || screenConfigs.HomeTab;
  const ScreenComponent = config.component;

  return <ScreenComponent navigation={navigation} />;
}

// Main Tab Navigator with Custom Tab Bar
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={TabScreen} />
      <Tab.Screen
        name="AnomalyDetectionScreen"
        component={TabScreen}
      />
      <Tab.Screen
        name="EmergencyAlertsScreen"
        component={TabScreen}
      />
      <Tab.Screen name="RemindersScreen" component={TabScreen} />
      <Tab.Screen
        name="RecommendationsScreen"
        component={TabScreen}
      />
      <Tab.Screen
        name="ProgressTrackingScreen"
        component={TabScreen}
      />
      <Tab.Screen
        name="SecuritySettingsScreen"
        component={TabScreen}
      />
      <Tab.Screen name="HelpSupportScreen" component={TabScreen} />
      <Tab.Screen name="ProfileTab" component={TabScreen} />
    </Tab.Navigator>
  );
}

// Stack Navigator for modals and authentication
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: "card",
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: '#1A1F3E',
          }
        }}
      >
        {/* Main Tab Navigator */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Modal Screens */}
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animation: 'slide_from_bottom',
              contentStyle: {
                backgroundColor: '#1A1F3E',
              }
            }}
          />
          <Stack.Screen
            name="SetTarget"
            component={SetTargetScreen}
            options={{
              animation: 'slide_from_bottom',
              contentStyle: {
                backgroundColor: '#1A1F3E',
              }
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              animation: 'slide_from_bottom',
              contentStyle: {
                backgroundColor: '#1A1F3E',
              }
            }}
          />
        </Stack.Group>

        {/* Full Screen Screens */}
        <Stack.Screen
          name="AnomalyDetection"
          component={AnomalyDetectionScreen}
        />
        <Stack.Screen name="EmergencyAlerts" component={EmergencyAlertsScreen} />
        <Stack.Screen name="ProgressTracking" component={ProgressTrackingScreen} />
        <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 31, 62, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  tabBarIndicator: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 20,
    backgroundColor: 'rgba(26, 31, 62, 0.95)',
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
    height: 80,
  },
  arrowButton: {
    paddingHorizontal: 12,
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
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  tabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});
