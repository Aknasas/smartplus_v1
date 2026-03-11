// HealthMonitoringScreen.tsx - FIXED VERSION
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle } from "react-native-svg";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import useESP32BLE, { ESP32SensorData, BLEDeviceInfo } from "../hooks/useESP32BLE";
import { healthAPI } from '../services/api';

const screenWidth = Dimensions.get("window").width;

// ---------- Types ---------- //
interface MetricData {
  current: string;
  pastWeek: number[];
  anomalyCheck: (data: number[]) => boolean;
}

interface RealTimeHealthMap {
  "heartRate": MetricData;
  "Blood Oxygen": MetricData;
  "Body Temperature": MetricData;
  "Physical Activity": MetricData;
}

interface HistoricalData {
  metrics: any[];
  anomalies: any[];
}

// Constants
const USER_ID_KEY = '@health_app_user_id';
const USER_TOKEN_KEY = '@health_app_token';

// ---------- Small Components ---------- //

const HealthDataCard = ({
  metric,
  value,
  onPress,
}: {
  metric: string;
  value: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={cardStyles.card} onPress={onPress}>
    <Text style={cardStyles.metric}>{metric}</Text>
    <Text style={cardStyles.value}>{value}</Text>
  </TouchableOpacity>
);

// Simple circular gauge using react-native-svg
const GaugeCard = ({
  title,
  value,
  unit,
  min,
  max,
  isEmpty = false,
}: {
  title: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  isEmpty?: boolean;
}) => {
  const radius = 40;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  const normalized = isEmpty ? min : Math.max(min, Math.min(value, max));
  const percent = isEmpty ? 0 : (normalized - min) / (max - min || 1);
  const strokeDashoffset = circumference * (1 - percent);

  let color = isEmpty ? "#ccc" : "#76c7c0";
  if (!isEmpty) {
    if (title === "Heart Rate" && (value < 60 || value > 100)) color = "#e53935";
    if (title === "SpO₂" && value < 95) color = "#e53935";
    if (title === "Temperature" && (value < 36 || value > 38)) color = "#e53935";
  }

  return (
    <View style={gaugeStyles.card}>
      <Text style={gaugeStyles.title}>{title}</Text>
      <Svg height={100} width={100} viewBox="0 0 120 120">
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#eee"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin="60,60"
        />
      </Svg>
      <Text style={gaugeStyles.value}>
        {isEmpty ? "--" : (isNaN(value) ? "--" : value.toFixed(title === "Temperature" ? 1 : 0))}
        <Text style={gaugeStyles.unit}>{unit}</Text>
      </Text>
    </View>
  );
};

// ---------- Main Screen ---------- //

const HealthMonitoringScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [isMetricModalVisible, setIsMetricModalVisible] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkingLogin, setCheckingLogin] = useState<boolean>(true);

  // Store raw acceleration data
  const [accelerationData, setAccelerationData] = useState<{x: number, y: number, z: number} | null>(null);

  // Database state
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [savingToDB, setSavingToDB] = useState<boolean>(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({ metrics: [], anomalies: [] });
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const [realTimeData, setRealTimeData] = useState<RealTimeHealthMap>({
    "heartRate": {
      current: "-- bpm",
      pastWeek: [],
      anomalyCheck: (d) => d.some((v) => v < 60 || v > 100),
    },
    "Blood Oxygen": {
      current: "--%",
      pastWeek: [],
      anomalyCheck: (d) => d.some((v) => v < 95),
    },
    "Body Temperature": {
      current: "--°C",
      pastWeek: [],
      anomalyCheck: (d) => d.some((v) => v < 36 || v > 38),
    },
    "Physical Activity": {
      current: "Inactive",
      pastWeek: [],
      anomalyCheck: (d) => d.some((v) => v < 20),
    },
  });

  // Extended motion-related state
  const [motionState, setMotionState] = useState({
    motionIntensity: [] as number[],
    steps: 0,
    lastPeakTime: 0,
    fallDetected: false,
    tremorDetected: false,
    calories: 0,
  });

  // BLE hook
  const {
    connected,
    connecting,
    scanning,
    deviceName,
    devices,
    scanForDevices,
    connectToDevice,
    disconnect,
    currentData,
  } = useESP32BLE(updateHealthData);

  // ✅ ALL HOOKS MUST BE AT THE TOP LEVEL - BEFORE ANY CONDITIONAL RETURNS

  // Gauges values - useMemo hooks
  const heartRateValue = useMemo(() => {
    const val = parseFloat(realTimeData["heartRate"].current);
    return isNaN(val) ? 0 : val;
  }, [realTimeData]);

  const spo2Value = useMemo(() => {
    const val = parseFloat(realTimeData["Blood Oxygen"].current);
    return isNaN(val) ? 0 : val;
  }, [realTimeData]);

  const tempValue = useMemo(() => {
    const val = parseFloat(realTimeData["Body Temperature"].current);
    return isNaN(val) ? 0 : val;
  }, [realTimeData]);

  const isHeartRateEmpty = realTimeData["heartRate"].current.includes("--");
  const isSpO2Empty = realTimeData["Blood Oxygen"].current.includes("--");
  const isTempEmpty = realTimeData["Body Temperature"].current.includes("--");

  // Effects
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Check if user is logged in
  const checkLoginStatus = async () => {
    setCheckingLogin(true);
    try {
      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      const userId = await AsyncStorage.getItem(USER_ID_KEY);

      if (token && userId) {
        // User is logged in
        setIsLoggedIn(true);
        setCurrentUserId(userId);

        // Now connect to database and load data
        await testDBConnection();
        if (userId) {
          await loadHistoricalData(userId);
        }
      } else {
        // No user logged in
        setIsLoggedIn(false);
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setCheckingLogin(false);
    }
  };

  // Handle login
  const handleLogin = async (userId: string, token: string) => {
    try {
      await AsyncStorage.setItem(USER_ID_KEY, userId);
      await AsyncStorage.setItem(USER_TOKEN_KEY, token);
      setIsLoggedIn(true);
      setCurrentUserId(userId);

      // Connect to database after login
      await testDBConnection();
      await loadHistoricalData(userId);

      Alert.alert('Success', 'Logged in successfully!');
    } catch (error) {
      console.error('Error saving login data:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(USER_ID_KEY);
      await AsyncStorage.removeItem(USER_TOKEN_KEY);
      setIsLoggedIn(false);
      setCurrentUserId(null);
      setDbConnected(false);
      setHistoricalData({ metrics: [], anomalies: [] });

      // Navigate to login screen
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Test database connection (only if logged in)
  const testDBConnection = async () => {
    if (!isLoggedIn) return;

    try {
      console.log('Testing DB connection...');
      const response = await healthAPI.testDB();
      console.log('DB Connected:', response.data);
      setDbConnected(true);
    } catch (error) {
      console.error('DB Connection Failed:', error);
      setDbConnected(false);
    }
  };

  // Load historical data (only if logged in)
  const loadHistoricalData = async (userId: string) => {
    if (!isLoggedIn) return;

    setLoadingHistory(true);
    try {
      const [metricsRes, anomaliesRes] = await Promise.all([
        healthAPI.getMetrics(userId),
        healthAPI.getAnomalies(userId)
      ]);

      setHistoricalData({
        metrics: metricsRes.data,
        anomalies: anomaliesRes.data
      });

      console.log(`Loaded ${metricsRes.data.length} metrics and ${anomaliesRes.data.length} anomalies`);
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Save health metric to database (only if logged in)
  const saveMetricToDB = async (type: string, value: number, unit: string) => {
    if (!isLoggedIn || !currentUserId || !dbConnected) return;

    setSavingToDB(true);
    try {
      await healthAPI.addMetric({
        user_id: currentUserId,
        metric_type: type,
        value: value,
        unit: unit,
        device_id: deviceName || 'ESP32'
      });
      console.log(`Saved ${type} to database: ${value} ${unit}`);
    } catch (error) {
      console.error('Error saving to database:', error);
    } finally {
      setSavingToDB(false);
    }
  };

  // Check for anomalies (only if logged in)
  const checkAndSaveAnomaly = async (type: string, value: number, unit: string) => {
    if (!isLoggedIn || !currentUserId || !dbConnected) return;

    let isAnomaly = false;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    switch (type) {
      case 'heart_rate':
        if (value < 60 || value > 100) {
          isAnomaly = true;
          severity = value < 50 || value > 120 ? 'high' : 'medium';
        }
        break;
      case 'blood_oxygen':
        if (value < 95) {
          isAnomaly = true;
          severity = value < 90 ? 'critical' : 'high';
        }
        break;
      case 'body_temperature':
        if (value < 36 || value > 38) {
          isAnomaly = true;
          severity = value < 35 || value > 39 ? 'critical' : 'high';
        }
        break;
    }

    if (isAnomaly) {
      console.log(`⚠️ Anomaly detected: ${type} = ${value} ${unit} (${severity})`);

      if (severity === 'critical' || severity === 'high') {
        Alert.alert(
          '⚠️ Health Alert',
          `Abnormal ${type} detected: ${value} ${unit}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Helper: push numeric value into pastWeek with max length
  const pushToPastWeek = (arr: number[], v: number, max = 20) =>
    [...arr.slice(-max + 1), v];

  // Update state from BLE data
  function updateHealthData(data: ESP32SensorData) {
    console.log("RECEIVED BLE DATA:", JSON.stringify(data));

    // Defensive parsing
    const hr = Number.isFinite(Number(data.heartRate)) ? Number(data.heartRate) : NaN;
    const spo2 = Number.isFinite(Number(data.spo2)) ? Number(data.spo2) : NaN;
    const bt = Number.isFinite(Number(data.bodyTemperature))
      ? Number(data.bodyTemperature)
      : NaN;

    // Save to database ONLY if logged in
    if (isLoggedIn && currentUserId && dbConnected) {
      if (!isNaN(hr) && hr > 0) {
        saveMetricToDB('heart_rate', hr, 'bpm');
        checkAndSaveAnomaly('heart_rate', hr, 'bpm');
      }
      if (!isNaN(spo2) && spo2 > 0) {
        saveMetricToDB('blood_oxygen', spo2, '%');
        checkAndSaveAnomaly('blood_oxygen', spo2, '%');
      }
      if (!isNaN(bt) && bt > 0) {
        saveMetricToDB('body_temperature', bt, 'celsius');
        checkAndSaveAnomaly('body_temperature', bt, 'celsius');
      }
    }

    // ========== ACCELERATION DATA ==========
    if (data.acceleration) {
      console.log("ACCELERATION DATA RECEIVED:", data.acceleration);
      setAccelerationData(data.acceleration);

      const { x, y, z } = data.acceleration;
      const intensity = Math.sqrt(x * x + y * y + z * z);

      // Save acceleration data (only if logged in)
      if (isLoggedIn && currentUserId && dbConnected) {
        saveMetricToDB('acceleration_magnitude', intensity, 'g');
      }

      // Process acceleration for motion detection
      processAcceleration(intensity, x, y, z);

      // Update physical activity display
      let status = "Inactive";
      if (intensity > 2.0) status = "Running";
      else if (intensity > 1.2) status = "Walking";
      else if (intensity > 0.1) status = "Light Activity";
      else status = "Inactive";

      setRealTimeData(prev => ({
        ...prev,
        "Physical Activity": {
          ...prev["Physical Activity"],
          current: status,
          pastWeek: pushToPastWeek(prev["Physical Activity"].pastWeek, intensity),
        }
      }));
    }

    setRealTimeData((prev) => {
      const updated = { ...prev };
      const fingerPresent = data.fingerDetected === undefined ? true : Boolean(data.fingerDetected);

      // Heart Rate
      if (fingerPresent && !Number.isNaN(hr) && hr > 0) {
        updated["heartRate"] = {
          ...prev["heartRate"],
          current: `${hr} bpm`,
          pastWeek: pushToPastWeek(prev["heartRate"].pastWeek, hr),
        };
      } else {
        updated["heartRate"] = {
          ...prev["heartRate"],
          current: fingerPresent ? "0 bpm" : "-- bpm",
        };
      }

      // Blood Oxygen
      if (fingerPresent && !Number.isNaN(spo2) && spo2 > 0) {
        updated["Blood Oxygen"] = {
          ...prev["Blood Oxygen"],
          current: `${spo2}%`,
          pastWeek: pushToPastWeek(prev["Blood Oxygen"].pastWeek, spo2),
        };
      } else {
        updated["Blood Oxygen"] = {
          ...prev["Blood Oxygen"],
          current: fingerPresent ? "0%" : "--%",
        };
      }

      // Body Temperature
      if (!Number.isNaN(bt) && bt > 0) {
        updated["Body Temperature"] = {
          ...prev["Body Temperature"],
          current: `${bt.toFixed(1)}°C`,
          pastWeek: pushToPastWeek(prev["Body Temperature"].pastWeek, bt),
        };
      } else {
        updated["Body Temperature"] = {
          ...prev["Body Temperature"],
          current: "--°C",
        };
      }

      return updated;
    });
  }

  // Motion processing
  const processAcceleration = (magnitude: number, x: number, y: number, z: number) => {
    setMotionState((prev) => {
      const now = Date.now();
      const updated = { ...prev };

      updated.motionIntensity = [...prev.motionIntensity, magnitude].slice(-180);

      // Step detection
      const STEP_THRESHOLD = 1.25;
      const verticalAcceleration = Math.abs(z);

      if (verticalAcceleration > STEP_THRESHOLD) {
        if (now - prev.lastPeakTime > 350) {
          updated.steps = prev.steps + 1;
          updated.lastPeakTime = now;

          // Save steps to database (only if logged in)
          if (isLoggedIn && currentUserId && dbConnected) {
            saveMetricToDB('steps', updated.steps, 'count');
          }
        }
      }

      // Fall detection
      const FALL_THRESHOLD = 3.5;
      if (magnitude > FALL_THRESHOLD) {
        updated.fallDetected = true;
        console.log("⚠️ FALL DETECTED!");

        if (isLoggedIn && currentUserId && dbConnected) {
          saveMetricToDB('fall_detected', magnitude, 'event');
          checkAndSaveAnomaly('fall_detected', magnitude, 'event');
        }

        Alert.alert(
          '⚠️ FALL DETECTED',
          'A fall has been detected. Are you okay?',
          [
            { text: "I'm OK", onPress: () => console.log('User OK') },
            { text: 'Emergency', onPress: () => console.log('Emergency triggered'), style: 'destructive' }
          ]
        );

        setTimeout(() => {
          setMotionState((p) => ({ ...p, fallDetected: false }));
        }, 3500);
      }

      // Tremor detection
      if (prev.motionIntensity.length >= 10) {
        const recent = prev.motionIntensity.slice(-10);
        const mean = recent.reduce((s, v) => s + v, 0) / recent.length;
        const variance = recent.reduce((s, v) => s + (v - mean) ** 2, 0) / recent.length;
        updated.tremorDetected = variance > 0.2 && magnitude < 2.0;

        if (updated.tremorDetected && !prev.tremorDetected && isLoggedIn) {
          console.log("⚠️ TREMOR DETECTED!");
          if (currentUserId && dbConnected) {
            saveMetricToDB('tremor_detected', variance, 'event');
          }
        }
      }

      // Calories estimate
      const MET = magnitude > 2.0 ? 8 : magnitude > 1.2 ? 4 : magnitude > 0.5 ? 2 : 1;
      const WEIGHT_KG = 70;
      updated.calories = prev.calories + ((MET * 3.5 * WEIGHT_KG) / 200) * (1 / 60);

      return updated;
    });
  };

  const handleMetricPress = (metric: keyof RealTimeHealthMap) => {
    setSelectedMetric({ ...realTimeData[metric], name: metric });
    setIsMetricModalVisible(true);
  };

  const closeMetricModal = () => {
    setIsMetricModalVisible(false);
    setSelectedMetric(null);
  };

  const openScanner = async () => {
    setIsScannerVisible(true);
    await scanForDevices();
  };

  const closeScanner = () => {
    setIsScannerVisible(false);
  };

  const handleDeviceSelect = async (device: BLEDeviceInfo) => {
    await connectToDevice(device.id);
    setIsScannerVisible(false);
  };

  // ✅ CONDITIONAL RENDERING IS FINE - AFTER ALL HOOKS

  // Show loading screen while checking login
  if (checkingLogin) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#76c7c0" />
        <Text style={{ color: '#FFF', marginTop: 10 }}>Checking login status...</Text>
      </View>
    );
  }

  // Show login required message if not logged in
  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.title, { textAlign: 'center', marginBottom: 20 }]}>
          🔒 Login Required
        </Text>
        <Text style={{ color: '#FFF', textAlign: 'center', marginBottom: 30 }}>
          Please log in to view your health data and sync with the database.
        </Text>
        <TouchableOpacity
          style={connectionStyles.connectButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={connectionStyles.connectText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Rest of your return statement (when logged in)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Data Monitoring</Text>

      {/* User Info & Logout */}
      <View style={connectionStyles.statusContainer}>
        <Text style={[connectionStyles.statusText, { flex: 1 }]}>
          👤 User ID: {currentUserId?.substring(0, 8)}...
        </Text>
        <TouchableOpacity
          style={[connectionStyles.disconnectButton, { backgroundColor: '#f44336' }]}
          onPress={handleLogout}
        >
          <Text style={connectionStyles.disconnectText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* BLE Connection Status */}
      <View style={connectionStyles.statusContainer}>
        <View
          style={[
            connectionStyles.statusIndicator,
            { backgroundColor: connected ? "#4CAF50" : "#f44336" },
          ]}
        />
        <View style={{ flex: 1 }}>
          <Text style={connectionStyles.statusText}>
            {connected
              ? `BLE: ${deviceName ?? "ESP32"}`
              : "BLE Disconnected"}
          </Text>
        </View>
        {!connected ? (
          <TouchableOpacity
            style={connectionStyles.connectButton}
            onPress={openScanner}
            disabled={connecting || scanning}
          >
            <Text style={connectionStyles.connectText}>Scan</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={connectionStyles.disconnectButton}
            onPress={disconnect}
          >
            <Text style={connectionStyles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Database Connection Status */}
      <View style={connectionStyles.statusContainer}>
        <View
          style={[
            connectionStyles.statusIndicator,
            { backgroundColor: dbConnected ? "#4CAF50" : "#f44336" },
          ]}
        />
        <Text style={connectionStyles.statusText}>
          Database: {dbConnected ? "Connected" : "Disconnected"}
        </Text>
        {savingToDB && <ActivityIndicator size="small" color="#76c7c0" style={{ marginLeft: 8 }} />}
      </View>

      {/* Dashboard Gauges */}
      <View style={gaugeStyles.row}>
        <GaugeCard
          title="Heart Rate"
          value={heartRateValue}
          unit=" bpm"
          min={40}
          max={160}
          isEmpty={isHeartRateEmpty}
        />
        <GaugeCard
          title="SpO₂"
          value={spo2Value}
          unit="%"
          min={80}
          max={100}
          isEmpty={isSpO2Empty}
        />
        <GaugeCard
          title="Temperature"
          value={tempValue}
          unit="°C"
          min={34}
          max={40}
          isEmpty={isTempEmpty}
        />
      </View>

      {/* Finger Detection Status */}
      <View style={fingerStyles.container}>
        <View style={[
          fingerStyles.indicator,
          { backgroundColor: currentData.fingerDetected ? "#4CAF50" : "#f44336" }
        ]} />
        <Text style={fingerStyles.text}>
          Finger: {currentData.fingerDetected ? "Detected" : "Not Detected"}
        </Text>
      </View>

      {/* Acceleration Data Display */}
      {accelerationData && (
        <View style={accelStyles.container}>
          <Text style={accelStyles.title}>Acceleration (g)</Text>
          <View style={accelStyles.row}>
            <View style={accelStyles.axis}>
              <Text style={accelStyles.axisLabel}>X</Text>
              <Text style={accelStyles.axisValue}>{accelerationData.x.toFixed(2)}</Text>
            </View>
            <View style={accelStyles.axis}>
              <Text style={accelStyles.axisLabel}>Y</Text>
              <Text style={accelStyles.axisValue}>{accelerationData.y.toFixed(2)}</Text>
            </View>
            <View style={accelStyles.axis}>
              <Text style={accelStyles.axisLabel}>Z</Text>
              <Text style={accelStyles.axisValue}>{accelerationData.z.toFixed(2)}</Text>
            </View>
            <View style={accelStyles.axis}>
              <Text style={accelStyles.axisLabel}>Total</Text>
              <Text style={accelStyles.axisValue}>
                {Math.sqrt(
                  accelerationData.x * accelerationData.x +
                  accelerationData.y * accelerationData.y +
                  accelerationData.z * accelerationData.z
                ).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Activity / Motion card */}
      <View style={cardStyles.card}>
        <Text style={cardStyles.metric}>Physical Activity</Text>
        <Text style={[cardStyles.value, { fontSize: 20 }]}>
          {realTimeData["Physical Activity"].current}
        </Text>

        <View style={{ marginTop: 8 }}>
          <Text style={{ color: "#FFF" }}>Steps: {motionState.steps}</Text>
          <Text style={{ color: motionState.fallDetected ? "red" : "#FFF" }}>
            {motionState.fallDetected ? "⚠ Fall detected" : "No fall"}
          </Text>
          <Text style={{ color: motionState.tremorDetected ? "orange" : "#FFF" }}>
            {motionState.tremorDetected ? "Tremor detected" : "No tremor"}
          </Text>
          <Text style={{ color: "#FFF" }}>
            Calories: {motionState.calories.toFixed(2)} kcal
          </Text>
        </View>

        {/* Motion chart */}
        {motionState.motionIntensity.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 12, color: "#FFF", marginBottom: 4 }}>
              Motion Intensity (Last 30 samples)
            </Text>
            <LineChart
              data={{
                labels: [],
                datasets: [{ data: motionState.motionIntensity.slice(-30) }],
              }}
              width={screenWidth - 40}
              height={140}
              chartConfig={{
                backgroundGradientFrom: "#1A1F3E",
                backgroundGradientTo: "#1A1F3E",
                decimalPlaces: 2,
                color: () => `rgba(118, 199, 192, 1)`,
                labelColor: () => `rgba(255,255,255,0.6)`,
                style: { borderRadius: 8 },
              }}
              bezier
              style={{ borderRadius: 8 }}
            />
          </View>
        )}
      </View>

      {/* Historical Data Section - Only shown if logged in */}
      {isLoggedIn && (
        <View style={cardStyles.card}>
          <Text style={cardStyles.metric}>Historical Data</Text>
          {loadingHistory ? (
            <ActivityIndicator size="small" color="#76c7c0" />
          ) : (
            <>
              <Text style={{ color: '#FFF', marginTop: 8 }}>
                📊 Metrics: {historicalData.metrics.length} readings
              </Text>
              <Text style={{ color: '#FFF' }}>
                ⚠️ Anomalies: {historicalData.anomalies.length} detected
              </Text>
              {historicalData.anomalies.slice(0, 3).map((anomaly: any) => (
                <View key={anomaly.anomaly_id} style={{ marginTop: 8, padding: 8, backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: 6 }}>
                  <Text style={{ color: '#FF6B6B', fontSize: 12 }}>
                    • {anomaly.metric_type}: {anomaly.actual_value} ({anomaly.severity})
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                    {new Date(anomaly.detected_at).toLocaleString()}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* Health Cards List */}
      <ScrollView contentContainerStyle={styles.cardContainer}>
        {Object.keys(realTimeData).map((metric) => (
          <HealthDataCard
            key={metric}
            metric={metric}
            value={realTimeData[metric as keyof RealTimeHealthMap].current}
            onPress={() => handleMetricPress(metric as keyof RealTimeHealthMap)}
          />
        ))}
      </ScrollView>

      {/* Metric Chart Modal */}
      {selectedMetric && (
        <Modal visible={isMetricModalVisible} transparent animationType="slide">
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalContent}>
              <Text style={modalStyles.modalTitle}>
                {selectedMetric.name} – Real Time Data
              </Text>
              {selectedMetric.pastWeek.length > 0 ? (
                <LineChart
                  data={{
                    labels: selectedMetric.pastWeek.map(
                      (_: number, i: number) => `T-${selectedMetric.pastWeek.length - i}`
                    ),
                    datasets: [{ data: selectedMetric.pastWeek }],
                  }}
                  width={screenWidth * 0.85}
                  height={220}
                  chartConfig={{
                    backgroundGradientFrom: "#1A1F3E",
                    backgroundGradientTo: "#1A1F3E",
                    color: () => `rgba(118,199,192,1)`,
                  }}
                  bezier
                  style={{ borderRadius: 10 }}
                />
              ) : (
                <Text style={modalStyles.noDataText}>
                  {connected ? "Waiting for BLE data..." : "Connect ESP32 to view data"}
                </Text>
              )}
              <Text style={modalStyles.modalText}>
                Current Value: {selectedMetric.current}
              </Text>
              <Text style={[
                modalStyles.modalText,
                selectedMetric.anomalyCheck(selectedMetric.pastWeek) && modalStyles.anomalyText,
              ]}>
                Anomalies Detected: {selectedMetric.anomalyCheck(selectedMetric.pastWeek) ? "Yes" : "No"}
              </Text>
              <TouchableOpacity style={modalStyles.closeButton} onPress={closeMetricModal}>
                <Text style={modalStyles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Device Scanner Modal */}
      <Modal visible={isScannerVisible} transparent animationType="fade">
        <View style={scannerStyles.overlay}>
          <View style={scannerStyles.content}>
            <Text style={scannerStyles.title}>Select ESP32 Device</Text>
            {scanning && (
              <View style={scannerStyles.loadingRow}>
                <ActivityIndicator size="small" color="#76c7c0" />
                <Text style={scannerStyles.loadingText}>Scanning for devices...</Text>
              </View>
            )}
            {!scanning && devices.length === 0 && (
              <Text style={scannerStyles.noDevicesText}>
                No devices found. Make sure ESP32 is powered on and in BLE mode.
              </Text>
            )}
            <ScrollView style={{ maxHeight: 200, alignSelf: "stretch" }}>
              {devices.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={scannerStyles.deviceRow}
                  onPress={() => handleDeviceSelect(d)}
                >
                  <Text style={scannerStyles.deviceName}>{d.name || 'Unknown Device'}</Text>
                  <Text style={scannerStyles.deviceId}>{d.id.slice(0, 10)}...</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={scannerStyles.footerRow}>
              <TouchableOpacity
                style={scannerStyles.refreshButton}
                onPress={scanForDevices}
                disabled={scanning}
              >
                <Text style={scannerStyles.refreshText}>
                  {scanning ? "Scanning..." : "Rescan"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={scannerStyles.closeButton}
                onPress={closeScanner}
                disabled={scanning}
              >
                <Text style={scannerStyles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles remain exactly the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#FFF",
  },
  cardContainer: {
    paddingBottom: 20,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#1A1F3E",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metric: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
});

const fingerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1F3E",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    color: "#FFF",
  },
});

const connectionStyles = StyleSheet.create({
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1F3E",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#FFF",
    flex: 1,
  },
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  loadingText: {
    marginLeft: 6,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  connectButton: {
    backgroundColor: "#42A5F5",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginLeft: 8,
  },
  connectText: {
    color: "white",
    fontWeight: "bold",
  },
  disconnectButton: {
    backgroundColor: "#f44336",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginLeft: 8,
  },
  disconnectText: {
    color: "white",
    fontWeight: "bold",
  },
});

const gaugeStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#1A1F3E",
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
    color: "#FFF",
  },
  unit: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
});

const accelStyles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1F3E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  axis: {
    alignItems: "center",
    flex: 1,
  },
  axisLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  axisValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1A1F3E",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#FFF",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    color: "rgba(255, 255, 255, 0.8)",
  },
  anomalyText: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  noDataText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    marginVertical: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#42A5F5",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    minWidth: 100,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const scannerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#1A1F3E",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#FFF",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  noDevicesText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 12,
  },
  deviceRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FFF",
  },
  deviceId: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "#42A5F5",
    marginRight: 8,
  },
  refreshText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  closeText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default HealthMonitoringScreen;