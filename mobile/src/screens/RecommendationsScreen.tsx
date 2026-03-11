import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get('window');

const RecommendationsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const recommendations = [
    {
      category: "Nutrition & Diet",
      icon: "apple",
      color: "#66BB6A",
      tips: [
        "Increase daily water intake to 2-3 liters",
        "Include more leafy greens in your meals",
        "Reduce processed sugar consumption",
        "Eat smaller, more frequent meals",
        "Include omega-3 rich foods (fish, walnuts)"
      ]
    },
    {
      category: "Exercise & Activity",
      icon: "running",
      color: "#42A5F5",
      tips: [
        "Aim for 150 minutes of moderate exercise weekly",
        "Include strength training twice a week",
        "Take walking breaks every hour if sedentary",
        "Try morning yoga for flexibility",
        "Use stairs instead of elevator when possible"
      ]
    },
    {
      category: "Sleep & Rest",
      icon: "bed",
      color: "#AB47BC",
      tips: [
        "Maintain consistent sleep schedule (7-8 hours)",
        "Avoid screens 1 hour before bedtime",
        "Keep bedroom temperature between 18-22°C",
        "Try relaxation techniques before sleep",
        "Avoid caffeine after 4 PM"
      ]
    },
    {
      category: "Stress Management",
      icon: "heartbeat",
      color: "#FFA726",
      tips: [
        "Practice 10 minutes of daily meditation",
        "Take regular breaks during work",
        "Try deep breathing exercises",
        "Maintain work-life balance",
        "Engage in hobbies you enjoy"
      ]
    },
    {
      category: "Health Monitoring",
      icon: "stethoscope",
      color: "#EF5350",
      tips: [
        "Check blood pressure weekly",
        "Monitor glucose levels if diabetic",
        "Track daily step count",
        "Regular health check-ups",
        "Keep health journal"
      ]
    },
    {
      category: "Medication & Supplements",
      icon: "medkit",
      color: "#FFCA28",
      tips: [
        "Take medications at same time daily",
        "Never skip prescribed doses",
        "Store medications properly",
        "Consult doctor before supplements",
        "Keep medication list updated"
      ]
    }
  ];

  const categories = ['All', 'Nutrition', 'Exercise', 'Sleep', 'Stress', 'Monitoring', 'Medication'];

  const filteredRecommendations = selectedCategory === 'All'
    ? recommendations
    : recommendations.filter(rec =>
        rec.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );

  const stats = {
    total: recommendations.reduce((sum, rec) => sum + rec.tips.length, 0),
    completed: 12,
    highPriority: 5,
    daily: 8
  };

  return (
    <View style={styles.container}>
      {/* Screen-specific Header */}
      <View style={styles.screenHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <FontAwesome name="lightbulb-o" size={32} color="#FFCA28" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.screenTitle}>Health Recommendations</Text>
            <Text style={styles.screenSubtitle}>AI-powered personalized health suggestions</Text>
          </View>
        </View>

        {/* Stats Overview */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScrollView}
        >
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 202, 40, 0.1)' }]}>
              <FontAwesome name="lightbulb-o" size={24} color="#FFCA28" />
              <Text style={[styles.statValue, { color: '#FFCA28' }]}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Tips</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(102, 187, 106, 0.1)' }]}>
              <FontAwesome name="check-circle" size={24} color="#66BB6A" />
              <Text style={[styles.statValue, { color: '#66BB6A' }]}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(239, 83, 80, 0.1)' }]}>
              <FontAwesome name="exclamation-triangle" size={24} color="#EF5350" />
              <Text style={[styles.statValue, { color: '#EF5350' }]}>{stats.highPriority}</Text>
              <Text style={styles.statLabel}>High Priority</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(66, 165, 245, 0.1)' }]}>
              <FontAwesome name="calendar" size={24} color="#42A5F5" />
              <Text style={[styles.statValue, { color: '#42A5F5' }]}>{stats.daily}</Text>
              <Text style={styles.statLabel}>Daily Goals</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Category Filter */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScrollView}
        >
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Recommendations List */}
      <View style={styles.recommendationsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Recommendations' : `${selectedCategory} Tips`}
          </Text>
          <Text style={styles.resultsCount}>
            {filteredRecommendations.reduce((sum, rec) => sum + rec.tips.length, 0)} tips
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.recommendationsScrollView}
        >
          {filteredRecommendations.map((section, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: `${section.color}20` }]}>
                  <FontAwesome name={section.icon} size={24} color={section.color} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{section.category}</Text>
                  <Text style={styles.tipsCount}>{section.tips.length} recommendations</Text>
                </View>
                <TouchableOpacity style={styles.expandButton}>
                  <FontAwesome name="chevron-down" size={20} color="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
              </View>

              <View style={styles.tipsList}>
                {section.tips.map((tip, tipIndex) => (
                  <View key={tipIndex} style={styles.tipItem}>
                    <View style={[styles.tipBullet, { backgroundColor: section.color }]} />
                    <View style={styles.tipContent}>
                      <Text style={styles.tipText}>{tip}</Text>
                      <View style={styles.tipActions}>
                        <TouchableOpacity style={styles.tipActionButton}>
                          <FontAwesome name="check" size={14} color="#66BB6A" />
                          <Text style={styles.tipActionText}>Mark Done</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tipActionButton}>
                          <FontAwesome name="flag" size={14} color="#FFA726" />
                          <Text style={styles.tipActionText}>Prioritize</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Action Button */}
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity style={styles.generateButton}>
          <FontAwesome name="refresh" size={20} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.generateButtonText}>Generate New Recommendations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#1A1F3E',
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
    backgroundColor: 'rgba(255, 202, 40, 0.15)',
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
  },
  statsContainer: {
    flexDirection: 'row',
    paddingRight: 40,
  },
  statCard: {
    width: 120,
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  categorySection: {
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
  categoriesScrollView: {
    marginBottom: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingRight: 40,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  categoryButtonTextActive: {
    color: '#FFF',
  },
  recommendationsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  recommendationsScrollView: {
    flex: 1,
  },
  recommendationCard: {
    backgroundColor: 'rgba(26, 31, 62, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  tipsCount: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipsList: {
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 12,
  },
  tipActions: {
    flexDirection: 'row',
  },
  tipActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipActionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 202, 40, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 202, 40, 0.3)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.3,
  },
};

export default RecommendationsScreen;