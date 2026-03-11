import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Dimensions,
  Animated
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Svg, { Circle, Text as SvgText, G } from "react-native-svg";
import SetTargetScreen from "./SetTargetScreen";

const { width } = Dimensions.get('window');

const initialMetrics = [
  { name: "Steps", value: 8560, target: 10000, unit: "", icon: "walking", color: "#42A5F5" },
  { name: "Heart Rate", value: 75, target: 120, unit: " bpm", icon: "heartbeat", color: "#EF5350" },
  { name: "Calories Burned", value: 450, target: 600, unit: " kcal", icon: "fire", color: "#FF6B6B" },
  { name: "Sleep", value: 7, target: 8, unit: " hrs", icon: "bed", color: "#AB47BC" },
  { name: "Distance", value: 5.6, target: 8, unit: " km", icon: "map-marker", color: "#66BB6A" },
  { name: "Active Minutes", value: 35, target: 60, unit: " min", icon: "clock-o", color: "#FFA726" },
];

const getStatusAndTip = (percentage: number) => {
  if (percentage < 25) return {
    status: "Needs Improvement",
    tip: "Increase activity for better health results",
    color: "#EF5350"
  };
  if (percentage < 50) return {
    status: "Good Start",
    tip: "You are on the right track, keep pushing forward!",
    color: "#FFA726"
  };
  if (percentage < 75) return {
    status: "Excellent Progress",
    tip: "Great work! Maintain consistency for optimal results",
    color: "#42A5F5"
  };
  return {
    status: "Outstanding Achievement",
    tip: "Exceptional performance! You're exceeding your goals",
    color: "#66BB6A"
  };
};

export default function ProgressTrackingScreen({ navigation }) {
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [selectedMetric, setSelectedMetric] = useState(initialMetrics[0]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const metric = metrics[currentMetricIndex];
  const percentage = (metric.value / metric.target) * 100;
  const { status, tip, color } = getStatusAndTip(percentage);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Animation when metric changes
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentMetricIndex]);

  const handleSaveTarget = (newTarget: number) => {
    if (isNaN(newTarget) || newTarget <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid number for the target.");
      return;
    }
    const updatedMetrics = [...metrics];
    updatedMetrics[currentMetricIndex].target = newTarget;
    setMetrics(updatedMetrics);
    setIsModalVisible(false);
  };

  const handleMetricSelect = (index: number) => {
    setCurrentMetricIndex(index);
    setSelectedMetric(metrics[index]);
  };

  const getProgressStats = () => {
    const totalProgress = metrics.reduce((sum, m) => sum + ((m.value / m.target) * 100), 0);
    const averageProgress = totalProgress / metrics.length;
    const completed = metrics.filter(m => (m.value / m.target) >= 1).length;

    return {
      averageProgress: averageProgress.toFixed(1),
      completed,
      total: metrics.length,
      streak: 7 // Example streak days
    };
  };

  const stats = getProgressStats();

  // Format the value for display
  const formatValue = (value, unit) => {
    if (unit === "") return value.toString();
    return `${value}${unit}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen-specific Header */}
        <View style={styles.screenHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Icon name="line-chart" size={32} color="#42A5F5" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.screenTitle}>Progress Tracking</Text>
              <Text style={styles.screenSubtitle}>Track your health goals and achievements</Text>
            </View>
          </View>

          {/* Stats Overview */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsScrollView}
          >
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: 'rgba(66, 165, 245, 0.1)' }]}>
                <Icon name="chart-line" size={20} color="#42A5F5" />
                <Text style={[styles.statValue, { color: '#42A5F5' }]}>{stats.averageProgress}%</Text>
                <Text style={styles.statLabel}>Avg Progress</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(102, 187, 106, 0.1)' }]}>
                <Icon name="check-circle" size={20} color="#66BB6A" />
                <Text style={[styles.statValue, { color: '#66BB6A' }]}>{stats.completed}/{stats.total}</Text>
                <Text style={styles.statLabel}>Goals Met</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255, 167, 38, 0.1)' }]}>
                <Icon name="fire" size={20} color="#FFA726" />
                <Text style={[styles.statValue, { color: '#FFA726' }]}>{stats.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(239, 83, 80, 0.1)' }]}>
                <Icon name="trophy" size={20} color="#EF5350" />
                <Text style={[styles.statValue, { color: '#EF5350' }]}>85%</Text>
                <Text style={styles.statLabel}>Overall Score</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Metrics Selector */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Select Metric</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.metricsScrollView}
          >
            <View style={styles.metricsContainer}>
              {metrics.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.metricButton,
                    currentMetricIndex === index && styles.metricButtonActive
                  ]}
                  onPress={() => handleMetricSelect(index)}
                >
                  <View style={[
                    styles.metricIconContainer,
                    { backgroundColor: currentMetricIndex === index ? item.color : 'rgba(255, 255, 255, 0.05)' }
                  ]}>
                    <Icon
                      name={item.icon}
                      size={20}
                      color={currentMetricIndex === index ? "#FFF" : item.color}
                    />
                  </View>
                  <Text style={[
                    styles.metricButtonText,
                    currentMetricIndex === index && { color: item.color }
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Main Progress Circle */}
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={[styles.progressIcon, { backgroundColor: `${metric.color}20` }]}>
                <Icon name={metric.icon} size={28} color={metric.color} />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.metricName}>{metric.name}</Text>
                <Text style={styles.metricTarget}>Target: {formatValue(metric.target, metric.unit)}</Text>
              </View>
            </View>

            <View style={styles.progressCircleContainer}>
              <Svg height={240} width={240}>
                {/* Background circle */}
                <Circle
                  cx="120"
                  cy="120"
                  r="100"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="12"
                  fill="none"
                />

                {/* Progress circle */}
                <Circle
                  cx="120"
                  cy="120"
                  r="100"
                  stroke={metric.color}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 100}`}
                  strokeDashoffset={`${2 * Math.PI * 100 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 120 120)"
                />

                {/* Inner content */}
                <G>
                  <SvgText
                    x="120"
                    y="105"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="36"
                    fontWeight="700"
                    fill="#FFF"
                  >
                    {`${Math.round(percentage)}%`}
                  </SvgText>
                  <SvgText
                    x="120"
                    y="135"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="16"
                    fill="rgba(255, 255, 255, 0.7)"
                  >
                    {`${formatValue(metric.value, metric.unit)} / ${formatValue(metric.target, metric.unit)}`}
                  </SvgText>
                </G>
              </Svg>
            </View>

            {/* Progress Details */}
            <View style={styles.progressDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Current</Text>
                  <Text style={[styles.detailValue, { color: metric.color }]}>
                    {formatValue(metric.value, metric.unit)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Target</Text>
                  <Text style={styles.detailValue}>{formatValue(metric.target, metric.unit)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Remaining</Text>
                  <Text style={styles.detailValue}>
                    {formatValue(Math.max(0, metric.target - metric.value), metric.unit)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderColor: color }]}>
          <View style={styles.statusHeader}>
            <Icon name="star" size={20} color={color} />
            <Text style={[styles.statusTitle, { color }]}>{status}</Text>
          </View>
          <Text style={styles.statusTip}>{tip}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgba(66, 165, 245, 0.1)', borderColor: '#42A5F5' }]}
            onPress={() => {
              const newIndex = (currentMetricIndex - 1 + metrics.length) % metrics.length;
              handleMetricSelect(newIndex);
            }}
          >
            <Icon name="chevron-left" size={20} color="#42A5F5" />
            {/*<Text style={[styles.actionButtonText, { color: '#42A5F5' }]}>Previous</Text>*/}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="pencil" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={[styles.actionButtonText, { color: '#FFF' }]}>Edit Target</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgba(102, 187, 106, 0.1)', borderColor: '#66BB6A' }]}
            onPress={() => {
              const newIndex = (currentMetricIndex + 1) % metrics.length;
              handleMetricSelect(newIndex);
            }}
          >
            {/*<Text style={[styles.actionButtonText, { color: '#66BB6A' }]}>Next</Text>*/}
            <Icon name="chevron-right" size={20} color="#66BB6A" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Target Edit Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SetTargetScreen
          metric={metric}
          onSave={handleSaveTarget}
          onClose={() => setIsModalVisible(false)}
        />
      </Modal>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
  },
  scrollContent: {
    paddingBottom: 30, // Extra padding at the bottom for better scrolling
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
    maxHeight: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingRight: 40,
    height: 110,
  },
  statCard: {
    width: 110,
    height: 100,
    borderRadius: 16,
    padding: 15,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 6,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  metricsSection: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  metricsScrollView: {
    marginBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingRight: 40,
  },
  metricButton: {
    alignItems: 'center',
    marginRight: 16,
  },
  metricButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  metricIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressContainer: {
    paddingHorizontal: 20,
  },
  progressCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  metricTarget: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressDetails: {
    marginTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  statusCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  statusTip: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30, // Changed from paddingBottom to marginBottom for scroll layout
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 6,
  },
  editButton: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
    flex: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
};

export default ProgressTrackingScreen;