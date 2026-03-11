import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HealthMonitoring" component={HealthMonitoringScreen} />
        <Stack.Screen name="AnomalyDetection" component={AnomalyDetectionScreen} />
        <Stack.Screen name="EmergencyAlerts" component={EmergencyAlertsScreen} />
        <Stack.Screen name="ProgressTracking" component={ProgressTrackingScreen} />
        <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
        <Stack.Screen name="SetTarget" component={SetTargetScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}