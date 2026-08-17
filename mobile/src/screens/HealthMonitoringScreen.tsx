// HealthMonitoringScreen.tsx - WITH ALL DATA SENT TOGETHER
import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORT CORRECTIONS: Use named imports from the services
import { addMetric, getMetrics, getAnomalies } from "../services";
import useESP32BLE, { ESP32SensorData, BLEDeviceInfo } from "../hooks/useESP32BLE";

const screenWidth = Dimensions.get("window").width;

// ---------- Types ---------- //
interface MetricData {
  current: string;
  pastWeek: number[];
  anomalyCheck: (data: number[]) => boolean;
  timestamps?: string[];
  unit: string;
  metric_type: string;
}

interface RealTimeHealthMap {
  "heartRate": MetricData;
  "Blood Oxygen": MetricData;
  "Body Temperature": MetricData;
  "Physical Activity": MetricData;
}

interface UserInfo {
  userId: string;
  patientId: string;
  username: string;
  fullname: string;
  role: string;
}

// Data buffer for 2-minute aggregation
interface DataBuffer {
  heartRate: number[];
  spo2: number[];
  temperature: number[];
  activity: number[];
  timestamps: Date[];
}

// Simple alert state (no persistent tracking)
interface SimpleAlertState {
  isActive: boolean;
  message: string;
}

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
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Force update counter for gauges
  const [updateCounter, setUpdateCounter] = useState(0);

  // Data buffer for 2-minute aggregation
  const [dataBuffer, setDataBuffer] = useState<DataBuffer>({
    heartRate: [],
    spo2: [],
    temperature: [],
    activity: [],
    timestamps: []
  });

  // Simple alert states (just for showing immediate warnings)
  const [heartRateAlert, setHeartRateAlert] = useState<SimpleAlertState>({
    isActive: false,
    message: ''
  });
  const [spo2Alert, setSpo2Alert] = useState<SimpleAlertState>({
    isActive: false,
    message: ''
  });
  const [temperatureAlert, setTemperatureAlert] = useState<SimpleAlertState>({
    isActive: false,
    message: ''
  });

  // Use ref to track if component is mounted
  const isMounted = useRef(true);

  // Store raw acceleration data
  const [accelerationData, setAccelerationData] = useState<{x: number, y: number, z: number} | null>(null);

  const [realTimeData, setRealTimeData] = useState<RealTimeHealthMap>({
    "heartRate": {
      current: "-- bpm",
      pastWeek: [],
      anomalyCheck: (d) => d.some((v) => v < 60 || v > 100),
      unit: "bpm",
      metric_type: "heart_rate",
      timestamps: [],
    },
    "Blood Oxygen": {
      current: "--%",
      pastWeek: [],
      anomalyCheck: (d) => d.some((v) => v < 95),
      unit: "%",
      metric_type: "spo2",
      timestamps: [],
    },
    "Body Temperature": {
      current: "--°C",
      pastWeek: [],
      anomalyCheck: (d) => d.some((v) => v < 36 || v > 38),
      unit: "°C",
      metric_type: "temperature",
      timestamps: [],
    },
    "Physical Activity": {
      current: "Inactive",
      pastWeek: [],
      anomalyCheck: (d) => d.some((v) => v < 20),
      unit: "g",
      metric_type: "activity",
      timestamps: [],
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
    scanForDevices: hookScanForDevices,
    connectToDevice: hookConnectToDevice,
    disconnect: hookDisconnect,
    currentData,
  } = useESP32BLE(updateHealthData);

  // Load current user from AsyncStorage
  useEffect(() => {
    loadCurrentUser();
    return () => {
      console.log('HealthMonitoringScreen unmounting');
      isMounted.current = false;
    };
  }, []);

  // Load historical data when user is loaded
  useEffect(() => {
    if (currentUser?.patientId) {
      loadHistoricalData();
    }
  }, [currentUser]);

  // Reset states when component loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (isMounted.current) {
          setDisconnectError(null);
        }
      };
    }, [])
  );

  // Force update function for gauges
  const forceGaugeUpdate = useCallback(() => {
    setUpdateCounter(prev => prev + 1);
  }, []);

  // Load current user from AsyncStorage
  const loadCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('@health_app_user_id');
      const patientId = await AsyncStorage.getItem('@health_app_patient_id') || userId;
      const username = await AsyncStorage.getItem('@health_app_username');
      const fullname = await AsyncStorage.getItem('@health_app_fullname');
      const role = await AsyncStorage.getItem('@health_app_user_role');

      if (userId) {
        setCurrentUser({
          userId,
          patientId: patientId || userId,
          username: username || '',
          fullname: fullname || '',
          role: role || 'patient',
        });
        console.log('✅ Current user loaded:', { userId, patientId });
      } else {
        console.log('❌ No user logged in');
        Alert.alert(
          'Not Logged In',
          'Please log in to view health data',
          [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
        );
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  // Load historical data from database
  const loadHistoricalData = async () => {
    if (!currentUser?.patientId) return;

    setLoadingHistory(true);
    try {
      // Load last 20 heart rate readings
      const heartRateData = await getMetrics(currentUser.patientId, {
        metric_type: 'heart_rate',
        limit: 20,
        days: 7
      });

      // Load last 20 SpO2 readings
      const spo2Data = await getMetrics(currentUser.patientId, {
        metric_type: 'spo2',
        limit: 20,
        days: 7
      });

      // Load last 20 temperature readings
      const tempData = await getMetrics(currentUser.patientId, {
        metric_type: 'temperature',
        limit: 20,
        days: 7
      });

      // Load anomalies
      const anomalies = await getAnomalies(currentUser.patientId, {
        limit: 10,
        resolved: false
      });

      console.log('📊 Historical data loaded:', {
        heartRate: heartRateData.metrics?.length || 0,
        spo2: spo2Data.metrics?.length || 0,
        temp: tempData.metrics?.length || 0,
        anomalies: anomalies.anomalies?.length || 0
      });

      // Update realTimeData with historical values
      setRealTimeData(prev => ({
        ...prev,
        "heartRate": {
          ...prev["heartRate"],
          pastWeek: heartRateData.metrics?.map((m: any) => m.value) || [],
          timestamps: heartRateData.metrics?.map((m: any) => m.time) || [],
        },
        "Blood Oxygen": {
          ...prev["Blood Oxygen"],
          pastWeek: spo2Data.metrics?.map((m: any) => m.value) || [],
          timestamps: spo2Data.metrics?.map((m: any) => m.time) || [],
        },
        "Body Temperature": {
          ...prev["Body Temperature"],
          pastWeek: tempData.metrics?.map((m: any) => m.value) || [],
          timestamps: tempData.metrics?.map((m: any) => m.time) || [],
        },
      }));

      setHistoricalData({ heartRateData, spo2Data, tempData, anomalies });
      forceGaugeUpdate();

    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Gauges values - fixed with proper dependencies
  const heartRateValue = useMemo(() => {
    const val = parseFloat(realTimeData["heartRate"].current);
    return isNaN(val) ? 0 : val;
  }, [realTimeData["heartRate"].current, updateCounter]);

  const spo2Value = useMemo(() => {
    const val = parseFloat(realTimeData["Blood Oxygen"].current);
    return isNaN(val) ? 0 : val;
  }, [realTimeData["Blood Oxygen"].current, updateCounter]);

  const tempValue = useMemo(() => {
    const val = parseFloat(realTimeData["Body Temperature"].current);
    return isNaN(val) ? 0 : val;
  }, [realTimeData["Body Temperature"].current, updateCounter]);

  const isHeartRateEmpty = useMemo(() => {
    return realTimeData["heartRate"].current.includes("--") ||
           realTimeData["heartRate"].current === "0 bpm";
  }, [realTimeData["heartRate"].current, updateCounter]);

  const isSpO2Empty = useMemo(() => {
    return realTimeData["Blood Oxygen"].current.includes("--") ||
           realTimeData["Blood Oxygen"].current === "0%";
  }, [realTimeData["Blood Oxygen"].current, updateCounter]);

  const isTempEmpty = useMemo(() => {
    return realTimeData["Body Temperature"].current.includes("--") ||
           realTimeData["Body Temperature"].current === "0°C";
  }, [realTimeData["Body Temperature"].current, updateCounter]);

  // Helper: push numeric value into pastWeek with max length
  const pushToPastWeek = (arr: number[], v: number, max = 20) =>
    [...arr.slice(-max + 1), v];

  // Safe state update function
  const safeSetState = <T,>(
    setter: React.Dispatch<React.SetStateAction<T>> | undefined,
    value: T
  ) => {
    if (isMounted.current && typeof setter === 'function') {
      setter(value);
    }
  };

  // Calculate average of array
  const calculateAverage = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
  };

  // Check if value is anomaly
  const isAnomaly = (metricType: string, value: number): boolean => {
    switch(metricType) {
      case 'heart_rate':
        return value < 50 || value > 120;
      case 'spo2':
        return value < 95;
      case 'temperature':
        return value < 36 || value > 38;
      default:
        return false;
    }
  };

  // Improved finger detection
  const isFingerPresent = useCallback((data: ESP32SensorData, hr: number, spo2: number): boolean => {
    // 1. If explicitly provided, use that
    if (data.fingerDetected !== undefined) {
      if (typeof data.fingerDetected === 'boolean') return data.fingerDetected;
      if (typeof data.fingerDetected === 'number') return data.fingerDetected === 1;
      if (typeof data.fingerDetected === 'string') {
        return data.fingerDetected === '1' ||
               data.fingerDetected.toLowerCase() === 'true';
      }
    }

    // 2. If we're getting plausible vital signs, assume finger is present
    const hasPlausibleHeartRate = !Number.isNaN(hr) && hr > 40 && hr < 150;
    const hasPlausibleSpO2 = !Number.isNaN(spo2) && spo2 > 85 && spo2 <= 100;

    if (hasPlausibleHeartRate || hasPlausibleSpO2) {
      return true;
    }

    // 3. Default to false if no evidence
    return false;
  }, []);

  // Helper to convert activity status to numeric value
  const getActivityStatusValue = (status: string): number => {
    switch(status) {
      case 'Running': return 3;
      case 'Walking': return 2;
      case 'Light Activity': return 1;
      default: return 0;
    }
  };

  // Save all metrics to database at once
  const saveAllMetricsToDB = useCallback(async (
    hr: number,
    spo2: number,
    bt: number,
    activityIntensity: number,
    activityStatus: string,
    fingerPresent: boolean,
    steps: number,
    calories: number
  ) => {
    if (!currentUser?.patientId) {
      console.log('❌ No patient ID, cannot save metrics');
      return;
    }

    try {
      // Create a batch of metrics to save
      const timestamp = new Date().toISOString();
      const metricsToSave = [];

      // Always save heart rate if valid
      if (!Number.isNaN(hr) && hr > 0) {
        metricsToSave.push({
          patient_id: currentUser.patientId,
          metric_type: 'heart_rate',
          value: hr,
          unit: 'bpm',
          finger_detected: fingerPresent,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      // Always save SpO2 if valid
      if (!Number.isNaN(spo2) && spo2 > 0) {
        metricsToSave.push({
          patient_id: currentUser.patientId,
          metric_type: 'spo2',
          value: spo2,
          unit: '%',
          finger_detected: fingerPresent,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      // Always save temperature if valid
      if (!Number.isNaN(bt) && bt > 0) {
        metricsToSave.push({
          patient_id: currentUser.patientId,
          metric_type: 'temperature',
          value: bt,
          unit: '°C',
          finger_detected: fingerPresent,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      // Save activity data
      if (activityIntensity > 0) {
        metricsToSave.push({
          patient_id: currentUser.patientId,
          metric_type: 'activity_intensity',
          value: Math.round(activityIntensity * 100) / 100,
          unit: 'g',
          finger_detected: fingerPresent,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });

        metricsToSave.push({
          patient_id: currentUser.patientId,
          metric_type: 'activity_status',
          value: getActivityStatusValue(activityStatus),
          unit: 'status',
          finger_detected: fingerPresent,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      // Save steps and calories occasionally
      if (steps > 0 && steps % 10 === 0) {
        metricsToSave.push({
          patient_id: currentUser.patientId,
          metric_type: 'steps',
          value: steps,
          unit: 'steps',
          finger_detected: fingerPresent,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      if (calories > 0) {
        metricsToSave.push({
          patient_id: currentUser.patientId,
          metric_type: 'calories',
          value: Math.round(calories * 10) / 10,
          unit: 'kcal',
          finger_detected: fingerPresent,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      // Save all metrics in parallel
      if (metricsToSave.length > 0) {
        console.log(` Saving ${metricsToSave.length} metrics to DB:`,
          metricsToSave.map(m => `${m.metric_type}: ${m.value}`).join(', '));

        // Save each metric individually (your API might not support batch)
        await Promise.all(metricsToSave.map(metric => addMetric(metric)));

        console.log(' All metrics saved successfully');
      }
    } catch (error) {
      console.error(' Error saving metrics to DB:', error);
    }
  }, [currentUser, deviceName]);

  // Process and save 2-minute average data
  const processAndSaveAverageData = useCallback(() => {
    if (!currentUser?.patientId) return;

    setDataBuffer(prev => {
      const buffer = { ...prev };

      // Calculate averages
      const avgHeartRate = calculateAverage(buffer.heartRate);
      const avgSpo2 = calculateAverage(buffer.spo2);
      const avgTemperature = calculateAverage(buffer.temperature);
      const avgActivity = calculateAverage(buffer.activity);

      console.log(' 2-minute averages:', {
        heartRate: avgHeartRate.toFixed(1),
        spo2: avgSpo2.toFixed(1),
        temperature: avgTemperature.toFixed(1),
        activity: avgActivity.toFixed(2),
        samples: buffer.heartRate.length
      });

      // Save averages to database
      const timestamp = new Date().toISOString();
      const avgMetrics = [];

      if (avgHeartRate > 0) {
        avgMetrics.push({
          patient_id: currentUser.patientId,
          metric_type: 'heart_rate_avg',
          value: avgHeartRate,
          unit: 'bpm',
          finger_detected: true,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      if (avgSpo2 > 0) {
        avgMetrics.push({
          patient_id: currentUser.patientId,
          metric_type: 'spo2_avg',
          value: avgSpo2,
          unit: '%',
          finger_detected: true,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      if (avgTemperature > 0) {
        avgMetrics.push({
          patient_id: currentUser.patientId,
          metric_type: 'temperature_avg',
          value: avgTemperature,
          unit: '°C',
          finger_detected: true,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      if (avgActivity > 0) {
        avgMetrics.push({
          patient_id: currentUser.patientId,
          metric_type: 'activity_avg',
          value: Math.round(avgActivity * 100) / 100,
          unit: 'g',
          finger_detected: true,
          device_id: deviceName || 'ESP32_BLE',
          timestamp
        });
      }

      // Save all averages
      if (avgMetrics.length > 0) {
        Promise.all(avgMetrics.map(metric => addMetric(metric)))
          .then(() => console.log('✅ Averages saved'))
          .catch(err => console.error('❌ Error saving averages:', err));
      }

      // Clear buffer after processing
      return {
        heartRate: [],
        spo2: [],
        temperature: [],
        activity: [],
        timestamps: []
      };
    });
  }, [currentUser, deviceName]);

  // Add data to buffer and check if 2 minutes have passed
  const addToBuffer = useCallback((
    type: 'heartRate' | 'spo2' | 'temperature' | 'activity',
    value: number
  ) => {
    if (value <= 0 || isNaN(value)) return;

    setDataBuffer(prev => {
      const now = new Date();
      const updated = { ...prev };

      // Add data to appropriate array
      updated[type] = [...prev[type], value];
      updated.timestamps = [...prev.timestamps, now];

      // Check if we have 2 minutes of data
      if (updated.timestamps.length > 0) {
        const firstTimestamp = updated.timestamps[0];
        const timeDiff = (now.getTime() - firstTimestamp.getTime()) / 1000; // in seconds

        if (timeDiff >= 120) { // 2 minutes = 120 seconds
          setTimeout(() => processAndSaveAverageData(), 0);
        }
      }

      // Limit buffer size to prevent memory issues
      if (updated[type].length > 300) { // 5 minutes worth
        updated[type] = updated[type].slice(-240);
        updated.timestamps = updated.timestamps.slice(-240);
      }

      return updated;
    });
  }, [processAndSaveAverageData]);

  // Simple function to check and show immediate alerts (no persistence)
  const checkAndShowAlert = (
    value: number,
    metricType: string,
    thresholdCheck: (val: number) => boolean,
    alertMessage: string,
    setAlertState: React.Dispatch<React.SetStateAction<SimpleAlertState>>
  ) => {
    const isAbnormal = thresholdCheck(value);

    if (isAbnormal) {
      setAlertState({
        isActive: true,
        message: alertMessage
      });

      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        if (isMounted.current) {
          setAlertState({
            isActive: false,
            message: ''
          });
        }
      }, 5000);
    }
  };

  // Specific threshold check functions
  const isHeartRateAbnormal = (value: number) => value < 50 || value > 120;
  const isSpo2Abnormal = (value: number) => value < 95;
  const isTemperatureAbnormal = (value: number) => value < 36 || value > 38;

  // Update state from BLE data and save to DB
  function updateHealthData(data: ESP32SensorData) {
    if (!isMounted.current) return;

    console.log("RECEIVED BLE DATA:", JSON.stringify(data));

    // Defensive parsing
    const hr = Number.isFinite(Number(data.heartRate)) ? Number(data.heartRate) : NaN;
    const spo2 = Number.isFinite(Number(data.spo2)) ? Number(data.spo2) : NaN;
    const bt = Number.isFinite(Number(data.bodyTemperature))
      ? Number(data.bodyTemperature)
      : NaN;

    // Determine if finger is present
    const fingerPresent = isFingerPresent(data, hr, spo2);

    // ========== ACCELERATION DATA ==========
    let activityIntensity = 0;
    let activityStatus = "Inactive";

    if (data.acceleration) {
      console.log("ACCELERATION DATA RECEIVED:", data.acceleration);
      safeSetState(setAccelerationData, data.acceleration);

      const { x, y, z } = data.acceleration;
      activityIntensity = Math.sqrt(x * x + y * y + z * z);

      // Process acceleration for motion detection
      processAcceleration(activityIntensity, x, y, z);

      // Determine activity status
      if (activityIntensity > 2.0) activityStatus = "Running";
      else if (activityIntensity > 1.2) activityStatus = "Walking";
      else if (activityIntensity > 0.1) activityStatus = "Light Activity";
      else activityStatus = "Inactive";

      // Add to buffer for 2-minute aggregation
      addToBuffer('activity', activityIntensity);

      // Update UI
      safeSetState(setRealTimeData, (prev) => {
        if (!isMounted.current) return prev;
        return {
          ...prev,
          "Physical Activity": {
            ...prev["Physical Activity"],
            current: activityStatus,
            pastWeek: pushToPastWeek(prev["Physical Activity"].pastWeek, activityIntensity),
          }
        };
      });
    }

    let shouldUpdateGauges = false;

    safeSetState(setRealTimeData, (prev) => {
      if (!isMounted.current) return prev;

      const updated = { ...prev };

      // Heart Rate
      if (!Number.isNaN(hr) && hr > 0) {
        const newValue = `${hr} bpm`;
        if (updated["heartRate"].current !== newValue) {
          updated["heartRate"] = {
            ...prev["heartRate"],
            current: newValue,
            pastWeek: pushToPastWeek(prev["heartRate"].pastWeek, hr),
          };
          shouldUpdateGauges = true;

          // Add to buffer for 2-minute aggregation
          addToBuffer('heartRate', hr);

          // Check and show immediate alert if needed
          if (fingerPresent) {
            checkAndShowAlert(
              hr,
              'heart_rate',
              isHeartRateAbnormal,
              `⚠️ Abnormal heart rate: ${hr} bpm`,
              setHeartRateAlert
            );
          }
        }
      } else {
        const newValue = fingerPresent ? "0 bpm" : "-- bpm";
        if (updated["heartRate"].current !== newValue) {
          updated["heartRate"] = {
            ...prev["heartRate"],
            current: newValue,
          };
          shouldUpdateGauges = true;
        }
      }

      // Blood Oxygen
      if (!Number.isNaN(spo2) && spo2 > 0) {
        const newValue = `${spo2}%`;
        if (updated["Blood Oxygen"].current !== newValue) {
          updated["Blood Oxygen"] = {
            ...prev["Blood Oxygen"],
            current: newValue,
            pastWeek: pushToPastWeek(prev["Blood Oxygen"].pastWeek, spo2),
          };
          shouldUpdateGauges = true;

          // Add to buffer for 2-minute aggregation
          addToBuffer('spo2', spo2);

          // Check and show immediate alert if needed
          if (fingerPresent) {
            checkAndShowAlert(
              spo2,
              'spo2',
              isSpo2Abnormal,
              `⚠️ Low SpO2: ${spo2}%`,
              setSpo2Alert
            );
          }
        }
      } else {
        const newValue = fingerPresent ? "0%" : "--%";
        if (updated["Blood Oxygen"].current !== newValue) {
          updated["Blood Oxygen"] = {
            ...prev["Blood Oxygen"],
            current: newValue,
          };
          shouldUpdateGauges = true;
        }
      }

      // Body Temperature
      if (!Number.isNaN(bt) && bt > 0) {
        const newValue = `${bt.toFixed(1)}°C`;
        if (updated["Body Temperature"].current !== newValue) {
          updated["Body Temperature"] = {
            ...prev["Body Temperature"],
            current: newValue,
            pastWeek: pushToPastWeek(prev["Body Temperature"].pastWeek, bt),
          };
          shouldUpdateGauges = true;

          // Add to buffer for 2-minute aggregation
          addToBuffer('temperature', bt);

          // Check and show immediate alert if needed
          checkAndShowAlert(
            bt,
            'temperature',
            isTemperatureAbnormal,
            `⚠️ Abnormal temperature: ${bt.toFixed(1)}°C`,
            setTemperatureAlert
          );
        }
      } else {
        const newValue = "--°C";
        if (updated["Body Temperature"].current !== newValue) {
          updated["Body Temperature"] = {
            ...prev["Body Temperature"],
            current: newValue,
          };
          shouldUpdateGauges = true;
        }
      }

      if (shouldUpdateGauges) {
        setTimeout(() => forceGaugeUpdate(), 0);
      }

      return updated;
    });

    // Save ALL metrics to database at once whenever we have heart rate data
    if (!Number.isNaN(hr) && hr > 0) {
      saveAllMetricsToDB(
        hr,
        spo2,
        bt,
        activityIntensity,
        activityStatus,
        fingerPresent,
        motionState.steps,
        motionState.calories
      );
    }
  }

  // Motion processing
  const processAcceleration = (magnitude: number, x: number, y: number, z: number) => {
    if (!isMounted.current) return;

    safeSetState(setMotionState, (prev) => {
      if (!isMounted.current) return prev;

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
        }
      }

      // Fall detection
      const FALL_THRESHOLD = 3.5;
      if (magnitude > FALL_THRESHOLD) {
        updated.fallDetected = true;
        console.log("⚠️ FALL DETECTED!");

        // Save fall event to database immediately
        if (currentUser?.patientId) {
          addMetric({
            patient_id: currentUser.patientId,
            metric_type: 'fall_detected',
            value: 1,
            unit: 'event',
            finger_detected: true,
            device_id: deviceName || 'ESP32_BLE',
            timestamp: new Date().toISOString()
          }).catch(err => console.error('Error saving fall:', err));
        }

        Alert.alert(
          '⚠️ FALL DETECTED',
          'A fall has been detected. Are you okay?',
          [
            { text: "I'm OK", onPress: () => console.log('User OK') },
            {
              text: 'Emergency',
              onPress: () => {
                console.log('Emergency triggered');
                if (currentUser?.patientId) {
                  addMetric({
                    patient_id: currentUser.patientId,
                    metric_type: 'emergency_alert',
                    value: 1,
                    unit: 'event',
                    finger_detected: true,
                    device_id: deviceName || 'ESP32_BLE',
                    timestamp: new Date().toISOString()
                  }).catch(err => console.error('Error saving emergency:', err));
                }
              },
              style: 'destructive'
            }
          ],
          { cancelable: false }
        );

        setTimeout(() => {
          if (isMounted.current) {
            safeSetState(setMotionState, (p) => {
              if (!isMounted.current) return p;
              return { ...p, fallDetected: false };
            });
          }
        }, 3500);
      }

      // Tremor detection
      if (prev.motionIntensity.length >= 10) {
        const recent = prev.motionIntensity.slice(-10);
        const mean = recent.reduce((s, v) => s + v, 0) / recent.length;
        const variance = recent.reduce((s, v) => s + (v - mean) ** 2, 0) / recent.length;
        updated.tremorDetected = variance > 0.2 && magnitude < 2.0;

        if (updated.tremorDetected && !prev.tremorDetected) {
          console.log("⚠️ TREMOR DETECTED!");
          if (currentUser?.patientId) {
            addMetric({
              patient_id: currentUser.patientId,
              metric_type: 'tremor_detected',
              value: 1,
              unit: 'event',
              finger_detected: true,
              device_id: deviceName || 'ESP32_BLE',
              timestamp: new Date().toISOString()
            }).catch(err => console.error('Error saving tremor:', err));
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
    safeSetState(setSelectedMetric, { ...realTimeData[metric], name: metric });
    safeSetState(setIsMetricModalVisible, true);
  };

  const closeMetricModal = () => {
    safeSetState(setIsMetricModalVisible, false);
    safeSetState(setSelectedMetric, null);
  };

  const openScanner = async () => {
    safeSetState(setIsScannerVisible, true);
    try {
      await hookScanForDevices();
    } catch (error) {
      console.error('Error scanning for devices:', error);
      if (isMounted.current) {
        Alert.alert('Error', 'Failed to scan for devices. Please try again.');
      }
    }
  };

  const closeScanner = () => {
    safeSetState(setIsScannerVisible, false);
  };

  const handleDeviceSelect = async (device: BLEDeviceInfo) => {
    try {
      await hookConnectToDevice(device.id);
      safeSetState(setIsScannerVisible, false);
    } catch (error) {
      console.error('Error connecting to device:', error);
      if (isMounted.current) {
        Alert.alert('Connection Error', 'Failed to connect to device. Please try again.');
      }
    }
  };

  // FINAL CLEAN DISCONNECT HANDLER
  const handleDisconnect = async () => {
    if (isDisconnecting) {
      console.log('Disconnect already in progress');
      return;
    }

    console.log('=== SAFE DISCONNECT STARTED ===');

    if (isMounted.current) {
      setIsDisconnecting(true);
    }

    try {
      // Step 1: Clear all UI data first
      console.log('Step 1: Clearing UI data...');

      if (isMounted.current) {
        setAccelerationData(null);
        setRealTimeData({
          "heartRate": { current: "-- bpm", pastWeek: [], anomalyCheck: (d) => d.some((v) => v < 60 || v > 100), unit: "bpm", metric_type: "heart_rate", timestamps: [] },
          "Blood Oxygen": { current: "--%", pastWeek: [], anomalyCheck: (d) => d.some((v) => v < 95), unit: "%", metric_type: "spo2", timestamps: [] },
          "Body Temperature": { current: "--°C", pastWeek: [], anomalyCheck: (d) => d.some((v) => v < 36 || v > 38), unit: "°C", metric_type: "temperature", timestamps: [] },
          "Physical Activity": { current: "Inactive", pastWeek: [], anomalyCheck: (d) => d.some((v) => v < 20), unit: "g", metric_type: "activity", timestamps: [] },
        });
        setMotionState({
          motionIntensity: [],
          steps: 0,
          lastPeakTime: 0,
          fallDetected: false,
          tremorDetected: false,
          calories: 0
        });
        setDataBuffer({
          heartRate: [],
          spo2: [],
          temperature: [],
          activity: [],
          timestamps: []
        });

        // Reset all alert states
        setHeartRateAlert({ isActive: false, message: '' });
        setSpo2Alert({ isActive: false, message: '' });
        setTemperatureAlert({ isActive: false, message: '' });

        forceGaugeUpdate();
      }

      // Step 2: Small delay for UI to update
      await new Promise(resolve => setTimeout(resolve, 50));

      // Step 3: Disconnect BLE device
      console.log('Step 2: Disconnecting BLE...');
      try {
        await hookDisconnect();
        console.log('BLE disconnected successfully');
      } catch (hookError) {
        console.error('BLE disconnect error (ignored):', hookError);
      }

    } catch (error) {
      console.error('Unexpected error during disconnect:', error);
    } finally {
      // Step 4: Reset disconnecting state
      setTimeout(() => {
        if (isMounted.current) {
          setIsDisconnecting(false);
          console.log('=== DISCONNECT COMPLETE ===');
        }
      }, 500);
    }
  };

  // Use callback for disconnect to prevent recreation
  const confirmDisconnect = useCallback(() => {
    Alert.alert(
      'Disconnect Device',
      'Are you sure you want to disconnect?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('Disconnect cancelled');
          }
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: handleDisconnect
        }
      ],
      { cancelable: true }
    );
  }, []);

  // Refresh data from database
  const refreshData = useCallback(() => {
    if (currentUser?.patientId) {
      loadHistoricalData();
    }
  }, [currentUser]);

  if (loadingUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#76c7c0" />
        <Text style={{ color: '#FFF', marginTop: 10 }}>Loading user data...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFF', fontSize: 18, marginBottom: 20 }}>No user logged in</Text>
        <TouchableOpacity
          style={connectionStyles.connectButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={connectionStyles.connectText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Data Monitoring</Text>

      {/* User Info Bar */}
      <View style={userStyles.container}>
        <Text style={userStyles.name}>{currentUser.fullname || currentUser.username}</Text>
        <Text style={userStyles.role}>{currentUser.role}</Text>
        <TouchableOpacity onPress={refreshData} style={userStyles.refreshButton}>
          <Text style={userStyles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Wrap everything in ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
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
                ? `BLE: Connected to ${deviceName ?? "ESP32"}`
                : "BLE Disconnected"}
            </Text>
            {loadingHistory && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <ActivityIndicator size="small" color="#76c7c0" />
                <Text style={{ color: '#76c7c0', fontSize: 12, marginLeft: 5 }}>
                  Loading history...
                </Text>
              </View>
            )}
            {isDisconnecting && (
              <Text style={connectionStyles.disconnectingText}>Disconnecting...</Text>
            )}
            {disconnectError && (
              <Text style={connectionStyles.errorText}>Error: {disconnectError}</Text>
            )}

            {/* Simple alert indicators (auto-hide after 5 seconds) */}
            {heartRateAlert.isActive && (
              <Text style={{ color: '#e53935', fontSize: 11, marginTop: 2 }}>
                {heartRateAlert.message}
              </Text>
            )}
            {spo2Alert.isActive && (
              <Text style={{ color: '#e53935', fontSize: 11, marginTop: 2 }}>
                {spo2Alert.message}
              </Text>
            )}
            {temperatureAlert.isActive && (
              <Text style={{ color: '#e53935', fontSize: 11, marginTop: 2 }}>
                {temperatureAlert.message}
              </Text>
            )}

            {/* Buffer status indicator */}
            {dataBuffer.timestamps.length > 0 && (
              <Text style={{ color: '#76c7c0', fontSize: 10, marginTop: 2 }}>
                📊 Buffer: {Math.round((new Date().getTime() - dataBuffer.timestamps[0]?.getTime()) / 1000)}s / 120s
              </Text>
            )}
          </View>
          {!connected ? (
            <TouchableOpacity
              style={connectionStyles.connectButton}
              onPress={openScanner}
              disabled={connecting || scanning || isDisconnecting}
            >
              <Text style={connectionStyles.connectText}>
                {connecting || scanning ? "Scanning..." : "Connect Device"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[connectionStyles.disconnectButton, isDisconnecting && connectionStyles.disabledButton]}
              onPress={confirmDisconnect}
              disabled={isDisconnecting}
            >
              <Text style={connectionStyles.disconnectText}>
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dashboard Gauges - Fixed with keys that change on update */}
        <View style={gaugeStyles.row}>
          <GaugeCard
            key={`heart-${heartRateValue}-${updateCounter}`}
            title="Heart Rate"
            value={heartRateValue}
            unit=" bpm"
            min={40}
            max={160}
            isEmpty={isHeartRateEmpty}
          />
          <GaugeCard
            key={`spo2-${spo2Value}-${updateCounter}`}
            title="SpO₂"
            value={spo2Value}
            unit="%"
            min={80}
            max={100}
            isEmpty={isSpO2Empty}
          />
          <GaugeCard
            key={`temp-${tempValue}-${updateCounter}`}
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
            { backgroundColor: currentData?.fingerDetected ? "#4CAF50" : "#f44336" }
          ]} />
          <Text style={fingerStyles.text}>
            Finger: {currentData?.fingerDetected ? "Detected" : "Not Detected"}
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

        {/* Health Cards List */}
        <Text style={styles.sectionTitle}>Detailed Metrics</Text>
        <View style={styles.cardContainer}>
          {Object.keys(realTimeData).map((metric) => (
            <HealthDataCard
              key={metric}
              metric={metric}
              value={realTimeData[metric as keyof RealTimeHealthMap].current}
              onPress={() => handleMetricPress(metric as keyof RealTimeHealthMap)}
            />
          ))}
        </View>

        {/* Add some bottom padding for better scrolling experience */}
        <View style={{ height: 20 }} />
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
                onPress={openScanner}
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

// Styles (keeping all your existing styles)
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginTop: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  cardContainer: {
    // No need for paddingBottom here as we have it in scrollContent
  },
});

const userStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 199, 192, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#76c7c0',
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  role: {
    color: '#76c7c0',
    fontSize: 14,
    marginRight: 10,
    textTransform: 'capitalize',
  },
  refreshButton: {
    padding: 5,
    backgroundColor: '#76c7c0',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    color: '#1A1F3E',
    fontSize: 18,
    fontWeight: 'bold',
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
  disconnectingText: {
    fontSize: 12,
    color: "#FFA726",
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#f44336",
    marginTop: 2,
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
    fontSize: 12,
  },
  disconnectButton: {
    backgroundColor: "#f44336",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disconnectText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
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