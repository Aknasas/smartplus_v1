// mobile/src/screens/AnomalyDetectionScreen.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Modal,
  FlatList
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { subMonths, format } from "date-fns";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";

import { getAnomalies, resolveAnomaly } from "../services/api/anomalies";
import { getMetrics } from "../services/api/metrics";

const { width } = Dimensions.get('window');

// Cache keys
const CACHE_KEYS = {
  ANOMALIES: (userId) => `cached_anomalies_${userId}`,
  METRICS: (userId) => `cached_metrics_${userId}`,
  LAST_UPDATED: (userId) => `last_updated_${userId}`
};

const AnomalyDetectionScreen = () => {
  const navigation = useNavigation();

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [graphData, setGraphData] = useState({});
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Modal state for anomaly lists
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnomalies, setSelectedAnomalies] = useState([]);
  const [modalTitle, setModalTitle] = useState('');

  // Use a ref to track mounted state
  const isMounted = useRef(true);

  // Load current user from AsyncStorage
  useEffect(() => {
    loadCurrentUser();
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load data when user is loaded
  useEffect(() => {
    if (currentUser?.patientId) {
      fetchData();
    }
  }, [currentUser]);

  // Filter anomalies for graph data
  useEffect(() => {
    if (anomalies && Array.isArray(anomalies) && anomalies.length > 0) {
      prepareGraphData();
    } else {
      setGraphData({});
    }
  }, [anomalies]);

  // Debug logging in useEffect (visible in logcat)
  useEffect(() => {
    if (anomalies.length > 0) {
      console.log('🔍 Anomaly Detection - Data loaded:', {
        count: anomalies.length,
        sample: anomalies[0]
      });
    }
  }, [anomalies]);

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (isMounted.current) {
        setIsOffline(!state.isConnected);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load current user from AsyncStorage
  const loadCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('@health_app_user_id');
      const patientId = await AsyncStorage.getItem('@health_app_patient_id') || userId;
      const username = await AsyncStorage.getItem('@health_app_username');
      const fullname = await AsyncStorage.getItem('@health_app_fullname');
      const role = await AsyncStorage.getItem('@health_app_user_role');

      console.log('📱 Anomaly Screen - User loaded:', { userId, patientId, username });

      if (userId) {
        const userData = {
          userId,
          patientId: patientId || userId,
          username: username || '',
          fullname: fullname || '',
          role: role || 'patient',
        };

        if (isMounted.current) {
          setCurrentUser(userData);
        }

        const lastUpdatedStr = await AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATED(userId));
        if (lastUpdatedStr && isMounted.current) {
          setLastUpdated(new Date(JSON.parse(lastUpdatedStr)));
        }
      } else {
        console.log('❌ Anomaly Screen - No user logged in');
        if (isMounted.current) {
          Alert.alert(
            'Not Logged In',
            'Please log in to view anomaly data',
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
          );
        }
      }
    } catch (error) {
      console.error('❌ Anomaly Screen - Error loading user:', error);
    } finally {
      if (isMounted.current) {
        setLoadingUser(false);
      }
    }
  };

  // Load cached data
  const loadCachedData = async () => {
    if (!currentUser?.patientId) return false;

    try {
      const [cachedAnomalies, cachedMetrics] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.ANOMALIES(currentUser.patientId)),
        AsyncStorage.getItem(CACHE_KEYS.METRICS(currentUser.patientId))
      ]);

      let hasData = false;

      if (cachedAnomalies && isMounted.current) {
        const parsedAnomalies = JSON.parse(cachedAnomalies);
        setAnomalies(Array.isArray(parsedAnomalies) ? parsedAnomalies : []);
        hasData = true;
        console.log('📦 Anomaly Screen - Loaded cached anomalies:', parsedAnomalies.length);
      }

      if (cachedMetrics && isMounted.current) {
        const parsedMetrics = JSON.parse(cachedMetrics);
        setHealthMetrics(Array.isArray(parsedMetrics) ? parsedMetrics : []);
        hasData = true;
      }

      return hasData;
    } catch (error) {
      console.error('❌ Anomaly Screen - Error loading cache:', error);
      return false;
    }
  };

  // Save data to cache
  const saveToCache = async (anomaliesData, metricsData) => {
    if (!currentUser?.patientId) return;

    try {
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEYS.ANOMALIES(currentUser.patientId), JSON.stringify(anomaliesData || [])),
        AsyncStorage.setItem(CACHE_KEYS.METRICS(currentUser.patientId), JSON.stringify(metricsData || []))
      ]);
      console.log('💾 Anomaly Screen - Saved to cache:', anomaliesData?.length, 'anomalies');
    } catch (error) {
      console.error('❌ Anomaly Screen - Error saving to cache:', error);
    }
  };

  // Prepare graph data from anomalies
  const prepareGraphData = () => {
    if (!anomalies || !Array.isArray(anomalies) || anomalies.length === 0) {
      setGraphData({});
      return;
    }

    // Log first anomaly structure for debugging (visible in logcat)
    console.log('📊 Anomaly Screen - First anomaly structure:', JSON.stringify(anomalies[0], null, 2));

    const groupedData = {};

    anomalies.forEach((anomaly) => {
      if (!anomaly) return;

      // Try to detect fields from actual data
      const type = anomaly.type || anomaly.metric_type || anomaly.metricType || anomaly.parameter || 'unknown';
      const dateStr = anomaly.detectedAt || anomaly.timestamp || anomaly.createdAt || anomaly.date || anomaly.created_at;
      const value = anomaly.value || anomaly.reading || anomaly.measurement || 0;
      const level = anomaly.level || anomaly.severity || anomaly.priority || 'Warning';

      if (!groupedData[type]) groupedData[type] = [];

      groupedData[type].push({
        id: anomaly.id,
        date: dateStr || new Date().toISOString(),
        value: value,
        level: level,
        original: anomaly // Keep original for modal display
      });
    });

    // Sort each group by date
    Object.keys(groupedData).forEach(key => {
      groupedData[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    if (isMounted.current) {
      setGraphData(groupedData);
      console.log('📊 Anomaly Screen - Graph data prepared:', Object.keys(groupedData).length, 'metric types');
    }
  };

  const fetchData = async () => {
    if (!currentUser?.patientId) {
      console.log('⚠️ Anomaly Screen - No patient ID available');
      return;
    }

    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      const netInfo = await NetInfo.fetch();
      const offline = !netInfo.isConnected;

      if (isMounted.current) {
        setIsOffline(offline);
      }

      if (offline) {
        const hasCache = await loadCachedData();
        if (hasCache && isMounted.current) {
          Alert.alert(
            'Offline Mode',
            'You are currently offline. Showing cached data.',
            [{ text: 'OK' }]
          );
        }
        if (isMounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }

      console.log('📡 Anomaly Screen - Fetching anomalies for:', currentUser.patientId);

      const anomaliesPromise = getAnomalies(currentUser.patientId, { limit: 100 })
        .catch(err => {
          console.warn('⚠️ Anomaly Screen - Failed to fetch anomalies:', err.response?.data || err.message);
          return [];
        });

      const metricsPromise = getMetrics(currentUser.patientId, { limit: 200, days: 30 })
        .catch(err => {
          console.warn('⚠️ Anomaly Screen - Failed to fetch metrics:', err.response?.data || err.message);
          return [];
        });

      const [anomaliesData, metricsData] = await Promise.all([anomaliesPromise, metricsPromise]);

      // Process anomalies data
      let processedAnomalies = [];

      if (Array.isArray(anomaliesData)) {
        processedAnomalies = anomaliesData;
        console.log('✅ Anomaly Screen - Received', anomaliesData.length, 'anomalies (direct array)');
      } else if (anomaliesData?.data && Array.isArray(anomaliesData.data)) {
        processedAnomalies = anomaliesData.data;
        console.log('✅ Anomaly Screen - Received', anomaliesData.data.length, 'anomalies (data.data)');
      } else if (anomaliesData?.anomalies && Array.isArray(anomaliesData.anomalies)) {
        processedAnomalies = anomaliesData.anomalies;
        console.log('✅ Anomaly Screen - Received', anomaliesData.anomalies.length, 'anomalies (data.anomalies)');
      } else if (anomaliesData?.results && Array.isArray(anomaliesData.results)) {
        processedAnomalies = anomaliesData.results;
        console.log('✅ Anomaly Screen - Received', anomaliesData.results.length, 'anomalies (data.results)');
      }

      if (processedAnomalies.length > 0) {
        console.log('🔍 Anomaly Screen - Sample anomaly fields:', Object.keys(processedAnomalies[0]));
      }

      if (isMounted.current) {
        setAnomalies(processedAnomalies);
        setHealthMetrics(Array.isArray(metricsData) ? metricsData : []);

        const now = new Date();
        setLastUpdated(now);

        await AsyncStorage.setItem(
          CACHE_KEYS.LAST_UPDATED(currentUser.patientId),
          JSON.stringify(now.toISOString())
        );

        await saveToCache(processedAnomalies, metricsData || []);
      }

    } catch (error) {
      console.error('❌ Anomaly Screen - Error fetching data:', error);

      const hasCache = await loadCachedData();

      if (isMounted.current) {
        setError('Failed to load fresh data');
        Alert.alert(
          'Connection Error',
          hasCache
            ? 'Failed to load fresh data. Showing cached data.'
            : 'Failed to load anomaly data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [currentUser]);

  const handleResolveAnomaly = async (anomalyId) => {
    if (!currentUser?.patientId || !anomalyId) return;

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Alert.alert('Offline', 'Cannot resolve anomaly while offline');
        return;
      }

      await resolveAnomaly(currentUser.patientId, anomalyId);
      Alert.alert('Success', 'Anomaly marked as resolved');
      fetchData();
    } catch (error) {
      console.error('❌ Anomaly Screen - Error resolving anomaly:', error);
      Alert.alert('Error', 'Failed to resolve anomaly');
    }
  };

  // Handle stat card press - show list of anomalies
  const handleStatPress = (level) => {
    const filtered = anomaliesArray.filter(a =>
      (a.level === level || a.severity === level)
    );

    if (filtered.length === 0) {
      Alert.alert('No Anomalies', `No ${level.toLowerCase()} anomalies found`);
      return;
    }

    setSelectedAnomalies(filtered);
    setModalTitle(`${level} Anomalies (${filtered.length})`);
    setModalVisible(true);
  };

  // Format date for display
  const formatAnomalyDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Unknown date';
    }
  };

  // Get level color
  const getLevelColor = (level) => {
    return level === "Critical" ? "#EF5350" : "#FFA726";
  };

  // Get metric icon
  const getMetricIcon = (metricType) => {
    if (!metricType) return 'exclamation-circle';
    const type = metricType.toLowerCase();
    if (type.includes('heart')) return 'heartbeat';
    if (type.includes('spo2') || type.includes('oxygen')) return 'tint';
    if (type.includes('temp')) return 'thermometer';
    if (type.includes('blood')) return 'heart';
    return 'exclamation-circle';
  };

  // Get metric display name
  const getMetricDisplayName = (metricType) => {
    if (!metricType) return 'Unknown';
    const type = metricType.toLowerCase();
    if (type.includes('heart')) return 'Heart Rate';
    if (type.includes('spo2') || type.includes('oxygen')) return 'SpO2';
    if (type.includes('temp')) return 'Temperature';
    if (type.includes('blood')) return 'Blood Pressure';
    return metricType;
  };

  // Format metric value
  const formatMetricValue = (value, metricType) => {
    if (value === undefined || value === null) return '--';
    if (typeof value === 'number') {
      if (metricType?.includes('temp')) return `${value.toFixed(1)}°C`;
      if (metricType?.includes('heart')) return `${Math.round(value)} BPM`;
      if (metricType?.includes('spo2')) return `${Math.round(value)}%`;
      return value.toString();
    }
    return value.toString();
  };

  // Calculate stats
  const anomaliesArray = Array.isArray(anomalies) ? anomalies : [];
  const criticalCount = anomaliesArray.filter(a =>
    (a?.level === 'Critical' || a?.severity === 'Critical')
  ).length;
  const warningCount = anomaliesArray.filter(a =>
    (a?.level === 'Warning' || a?.severity === 'Warning')
  ).length;
  const resolvedCount = anomaliesArray.filter(a => a?.resolved === true).length;
  const activeCount = anomaliesArray.filter(a => a?.resolved === false).length;

  if (loadingUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFA726" />
        <Text style={{ color: '#FFF', marginTop: 10 }}>Loading user data...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="exclamation-triangle" size={60} color="#EF5350" />
        <Text style={{ color: '#FFF', fontSize: 18, marginTop: 20, textAlign: 'center' }}>
          Not Logged In
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
          Please log in to view anomaly data.
        </Text>
        <TouchableOpacity
          style={[styles.timeframeButton, styles.timeframeButtonActive, { marginTop: 20, paddingHorizontal: 30, paddingVertical: 12 }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.timeframeText, styles.timeframeTextActive]}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User Info Bar */}
      <View style={userStyles.container}>
        <Text style={userStyles.name}>{currentUser.fullname || currentUser.username}</Text>
        <Text style={userStyles.role}>{currentUser.role}</Text>
      </View>

      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Icon name="wifi" size={16} color="#FFF" />
          <Text style={styles.offlineText}>Offline mode - showing cached data</Text>
        </View>
      )}

      {/* Last Updated */}
      {lastUpdated && !isOffline && (
        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
          </Text>
        </View>
      )}

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Icon name="exclamation-circle" size={16} color="#FFF" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.screenHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Icon name="exclamation-circle" size={32} color="#FFA726" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.screenTitle}>Anomaly Detection</Text>
            <Text style={styles.screenSubtitle}>Monitor unusual health patterns</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards - Now Clickable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FFA726"]}
            tintColor="#FFA726"
          />
        }
      >
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: 'rgba(239, 83, 80, 0.1)' }]}
            onPress={() => handleStatPress('Critical')}
          >
            <Icon name="heartbeat" size={24} color="#EF5350" />
            <Text style={[styles.statValue, { color: '#EF5350' }]}>{criticalCount}</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: 'rgba(255, 167, 38, 0.1)' }]}
            onPress={() => handleStatPress('Warning')}
          >
            <Icon name="exclamation-triangle" size={24} color="#FFA726" />
            <Text style={[styles.statValue, { color: '#FFA726' }]}>{warningCount}</Text>
            <Text style={styles.statLabel}>Warnings</Text>
          </TouchableOpacity>

          <View style={[styles.statCard, { backgroundColor: 'rgba(66, 165, 245, 0.1)' }]}>
            <Icon name="bell" size={24} color="#42A5F5" />
            <Text style={[styles.statValue, { color: '#42A5F5' }]}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(102, 187, 106, 0.1)' }]}>
            <Icon name="check-circle" size={24} color="#66BB6A" />
            <Text style={[styles.statValue, { color: '#66BB6A' }]}>{resolvedCount}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      </ScrollView>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Anomaly Trends</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFA726" />
              <Text style={{ color: '#FFF', marginTop: 10 }}>Loading anomalies...</Text>
            </View>
          ) : Object.keys(graphData).length > 0 ? (
            Object.keys(graphData).map((metric, index) => {
              const data = graphData[metric] || [];
              const sortedData = [...data].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
              );

              const dates = sortedData.map(item => {
                try {
                  return format(new Date(item.date), 'MM/dd');
                } catch {
                  return 'N/A';
                }
              }).slice(-7);

              const values = sortedData.map(item => {
                if (typeof item.value === 'number') return item.value;
                if (typeof item.value === 'string' && item.value.includes('/')) {
                  return parseInt(item.value.split('/')[0]);
                }
                return parseFloat(item.value) || 0;
              }).slice(-7);

              const levels = [...new Set(sortedData.map(item => item.level))];

              return (
                <View key={index} style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                      <Icon
                        name={getMetricIcon(metric)}
                        size={24}
                        color="#FFA726"
                      />
                      <Text style={styles.chartTitle}>
                        {getMetricDisplayName(metric)}
                      </Text>
                    </View>
                    <View style={styles.chartBadge}>
                      <Text style={styles.chartSubtitle}>
                        {sortedData.length} anomaly{sortedData.length !== 1 ? 's' : ''}
                      </Text>
                      {levels.map((level, idx) => (
                        <View
                          key={idx}
                          style={[styles.levelDot, { backgroundColor: getLevelColor(level) }]}
                        />
                      ))}
                    </View>
                  </View>

                  {values.length > 1 ? (
                    <LineChart
                      data={{
                        labels: dates,
                        datasets: [{
                          data: values,
                          color: (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
                          strokeWidth: 2
                        }],
                      }}
                      width={width - 60}
                      height={180}
                      chartConfig={{
                        backgroundGradientFrom: 'rgba(255, 255, 255, 0.05)',
                        backgroundGradientTo: 'rgba(255, 255, 255, 0.02)',
                        decimalPlaces: 0,
                        color: () => `rgba(255, 167, 38, 1)`,
                        labelColor: () => `rgba(255, 255, 255, 0.8)`,
                        style: { borderRadius: 16 },
                        propsForDots: {
                          r: "6",
                          strokeWidth: "2",
                          stroke: "#FFA726"
                        },
                      }}
                      bezier
                      style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                  ) : (
                    <View style={styles.noChartDataContainer}>
                      <Text style={styles.noChartDataText}>
                        {values.length === 1 ? 'Only one data point' : 'Insufficient data for chart'}
                      </Text>
                    </View>
                  )}

                  {/* Recent Anomalies List */}
                  {sortedData.slice(0, 3).map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.anomalyItem}
                      onPress={() => item.id ? handleResolveAnomaly(item.id) : null}
                    >
                      <View style={[
                        styles.anomalyLevelIndicator,
                        { backgroundColor: getLevelColor(item.level) }
                      ]} />
                      <View style={styles.anomalyContent}>
                        <Text style={styles.anomalyType}>
                          {getMetricDisplayName(metric)}
                        </Text>
                        <Text style={styles.anomalyTime}>
                          {formatAnomalyDate(item.date)}
                        </Text>
                      </View>
                      <View style={styles.anomalyValueContainer}>
                        <Text style={[
                          styles.anomalyValue,
                          { color: getLevelColor(item.level) }
                        ]}>
                          {formatMetricValue(item.value, metric)}
                        </Text>
                        <Text style={styles.anomalyLevel}>{item.level}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="check-circle" size={60} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.noDataTitle}>No Anomalies Detected</Text>
              <Text style={styles.noDataSubtitle}>
                Your health metrics are within normal ranges
              </Text>
              {anomaliesArray.length === 0 && !loading && (
                <Text style={styles.noDataSubtitle}>
                  Total records in DB: {anomaliesArray.length}
                </Text>
              )}
              {isOffline && (
                <Text style={styles.offlineNote}>
                  *Showing cached data. Connect to internet for real-time updates.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Anomaly List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={modalStyles.closeButton}
              >
                <Icon name="times" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedAnomalies}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              style={modalStyles.list}
              renderItem={({ item }) => (
                <View style={modalStyles.listItem}>
                  <View style={[
                    modalStyles.levelDot,
                    { backgroundColor: getLevelColor(item.level || item.severity) }
                  ]} />
                  <View style={modalStyles.itemContent}>
                    <Text style={modalStyles.itemType}>
                      {getMetricDisplayName(item.type || item.metric_type)}
                    </Text>
                    <Text style={modalStyles.itemDate}>
                      {formatAnomalyDate(item.detectedAt || item.timestamp || item.createdAt)}
                    </Text>
                    <Text style={modalStyles.itemDetails}>
                      Value: {formatMetricValue(item.value, item.type || item.metric_type)}
                    </Text>
                  </View>
                  {!item.resolved && (
                    <TouchableOpacity
                      style={modalStyles.resolveButton}
                      onPress={() => {
                        handleResolveAnomaly(item.id);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={modalStyles.resolveText}>Resolve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
    padding: 16,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA726',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  offlineText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF5350',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  lastUpdatedContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  lastUpdatedText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  screenHeader: {
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 167, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statsScrollView: {
    marginBottom: 0,
    maxHeight: 130,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  chartsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 8,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  noChartDataContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    marginVertical: 8,
  },
  noChartDataText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 14,
  },
  anomalyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  anomalyLevelIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  anomalyContent: {
    flex: 1,
  },
  anomalyType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  anomalyTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  anomalyValueContainer: {
    alignItems: 'flex-end',
  },
  anomalyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  anomalyLevel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  offlineNote: {
    fontSize: 12,
    color: '#FFA726',
    marginTop: 16,
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    width: width - 32,
    maxHeight: '80%',
    backgroundColor: '#1A1F3E',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA726',
  },
  closeButton: {
    padding: 8,
  },
  list: {
    maxHeight: '90%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  levelDot: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resolveButton: {
    backgroundColor: '#66BB6A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  resolveText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default AnomalyDetectionScreen;