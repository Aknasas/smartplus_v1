import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { parse, isBefore, subMonths } from "date-fns";
import Icon from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get('window');

const AnomalyDetectionScreen = ({ navigation }) => {
  const [allAnomalies] = useState([
    { id: "1", type: "Heart Rate", value: 120, level: "Critical", timestamp: "2024-11-10 10:15 AM" },
    { id: "2", type: "SpO2", value: 88, level: "Warning", timestamp: "2024-11-14 09:50 AM" },
    { id: "3", type: "Blood Pressure", value: 140, level: "Critical", timestamp: "2024-11-01 08:30 PM" },
    { id: "4", type: "Heart Rate", value: 115, level: "Warning", timestamp: "2024-10-25 04:15 PM" },
    { id: "5", type: "SpO2", value: 85, level: "Critical", timestamp: "2024-10-15 11:00 AM" },
    { id: "6", type: "Blood Pressure", value: 130, level: "Warning", timestamp: "2024-09-20 05:45 PM" },
  ]);

  const [graphData, setGraphData] = useState<any>({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('3m');

  useEffect(() => {
    const monthsAgo = selectedTimeframe === '3m' ? 3 : selectedTimeframe === '6m' ? 6 : 12;
    const timeframeAgo = subMonths(new Date(), monthsAgo);

    const filteredAnomalies = allAnomalies.filter((anomaly) => {
      const anomalyDate = parse(anomaly.timestamp, "yyyy-MM-dd hh:mm a", new Date());
      return isBefore(timeframeAgo, anomalyDate);
    });

    const groupedData: any = {};
    filteredAnomalies.forEach((anomaly) => {
      if (!groupedData[anomaly.type]) groupedData[anomaly.type] = [];
      groupedData[anomaly.type].push({ date: anomaly.timestamp, value: anomaly.value });
    });

    setGraphData(groupedData);
  }, [allAnomalies, selectedTimeframe]);

  const getLevelColor = (level: string) => {
    return level === "Critical" ? "#EF5350" : "#FFA726";
  };

  return (
    <View style={styles.container}>
      {/* Screen-specific Header */}
      <View style={styles.screenHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Icon name="exclamation-circle" size={32} color="#FFA726" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.screenTitle}>Anomaly Detection</Text>
            <Text style={styles.screenSubtitle}>AI-powered anomaly detection for your health</Text>
          </View>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeSelector}>
          {['3m', '6m', '1y'].map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeText,
                selectedTimeframe === timeframe && styles.timeframeTextActive
              ]}>
                {timeframe}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScrollView}
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(239, 83, 80, 0.1)' }]}>
            <Icon name="heartbeat" size={24} color="#EF5350" />
            <Text style={[styles.statValue, { color: '#EF5350' }]}>3</Text>
            <Text style={styles.statLabel}>Critical Anomalies</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255, 167, 38, 0.1)' }]}>
            <Icon name="exclamation-triangle" size={24} color="#FFA726" />
            <Text style={[styles.statValue, { color: '#FFA726' }]}>3</Text>
            <Text style={styles.statLabel}>Warnings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(102, 187, 106, 0.1)' }]}>
            <Icon name="check-circle" size={24} color="#66BB6A" />
            <Text style={[styles.statValue, { color: '#66BB6A' }]}>28</Text>
            <Text style={styles.statLabel}>Normal Days</Text>
          </View>
        </View>
      </ScrollView>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Anomaly Trends</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.chartsScrollView}
        >
          {Object.keys(graphData).length > 0 ? (
            Object.keys(graphData).map((metric, index) => {
              const data = graphData[metric];
              const dates = data.map((item: any) => item.date.split(" ")[0].split('-').slice(1).join('/'));
              const values = data.map((item: any) => item.value);
              const recentAnomalies = allAnomalies
                .filter(a => a.type === metric)
                .slice(0, 2);

              return (
                <View key={index} style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                      <Icon
                        name={metric === "Heart Rate" ? "heartbeat" : metric === "SpO2" ? "tint" : "heart"}
                        size={24}
                        color="#FFA726"
                      />
                      <Text style={styles.chartTitle}>{metric}</Text>
                    </View>
                    <Text style={styles.chartSubtitle}>
                      {data.length} anomaly{data.length !== 1 ? 's' : ''} detected
                    </Text>
                  </View>

                  <LineChart
                    data={{
                      labels: dates,
                      datasets: [{ data: values }],
                    }}
                    width={width - 60}
                    height={180}
                    chartConfig={{
                      backgroundGradientFrom: 'rgba(255, 255, 255, 0.05)',
                      backgroundGradientTo: 'rgba(255, 255, 255, 0.02)',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#FFA726"
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: "",
                        stroke: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                    bezier
                    withInnerLines={false}
                    withOuterLines={false}
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                      paddingRight: 20,
                    }}
                  />

                  {/* Recent Anomalies List */}
                  {recentAnomalies.length > 0 && (
                    <View style={styles.recentAnomalies}>
                      <Text style={styles.recentAnomaliesTitle}>Recent Events</Text>
                      {recentAnomalies.map((anomaly, idx) => (
                        <View key={idx} style={styles.anomalyItem}>
                          <View style={[
                            styles.anomalyLevelIndicator,
                            { backgroundColor: getLevelColor(anomaly.level) }
                          ]} />
                          <View style={styles.anomalyContent}>
                            <Text style={styles.anomalyType}>{anomaly.type}</Text>
                            <Text style={styles.anomalyTime}>{anomaly.timestamp}</Text>
                          </View>
                          <View style={styles.anomalyValueContainer}>
                            <Text style={[
                              styles.anomalyValue,
                              { color: getLevelColor(anomaly.level) }
                            ]}>
                              {anomaly.value}
                            </Text>
                            <Text style={styles.anomalyLevel}>{anomaly.level}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.noDataContainer}>
              <View style={styles.noDataIcon}>
                <Icon name="check-circle" size={60} color="rgba(255, 255, 255, 0.3)" />
              </View>
              <Text style={styles.noDataTitle}>No Anomalies Detected</Text>
              <Text style={styles.noDataSubtitle}>
                Great news! No anomalies detected in the last {selectedTimeframe === '3m' ? '3 months' : selectedTimeframe === '6m' ? '6 months' : '1 year'}.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

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
    backgroundColor: 'rgba(255, 167, 38, 0.15)',
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
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#FFA726',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  timeframeTextActive: {
    color: '#0A1D3A',
  },
  statsScrollView: {
    marginTop: 20,
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
  chartsSection: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  chartsScrollView: {
    flex: 1,
  },
  chartCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 12,
  },
  chartSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  recentAnomalies: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  recentAnomaliesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  anomalyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  anomalyLevelIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  anomalyContent: {
    flex: 1,
  },
  anomalyType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  anomalyTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  anomalyValueContainer: {
    alignItems: 'flex-end',
  },
  anomalyValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  anomalyLevel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noDataIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
};

export default AnomalyDetectionScreen;