// screens/NotificationsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'health' | 'reminder' | 'emergency' | 'system' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    type: 'navigate' | 'dismiss' | 'snooze';
    screen?: string;
  };
}

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'emergency',
      title: 'Critical Heart Rate Alert',
      message: 'Heart rate detected at 145 bpm for 5 minutes',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: false,
      priority: 'critical',
      action: { type: 'navigate', screen: 'EmergencyAlerts' },
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Medication Reminder',
      message: 'Time to take your afternoon medication',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      priority: 'medium',
      action: { type: 'snooze' },
    },
    {
      id: '3',
      type: 'health',
      title: 'Daily Health Summary',
      message: 'Your daily health score is 85/100. Great job!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      priority: 'low',
    },
    {
      id: '4',
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'You reached 10,000 steps for 7 consecutive days',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      priority: 'medium',
    },
    {
      id: '5',
      type: 'system',
      title: 'App Update Available',
      message: 'Version 1.2.0 is ready to install with new features',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true,
      priority: 'low',
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailAlerts: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '07:00',
  });

  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'emergency') return notification.priority === 'critical';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev =>
              prev.filter(notification => notification.id !== id)
            );
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#e53935';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return 'warning';
      case 'health': return 'monitor-heart';
      case 'reminder': return 'alarm';
      case 'achievement': return 'emoji-events';
      case 'system': return 'system-update';
      default: return 'notifications';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(date, 'MMM d');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {(['all', 'unread', 'emergency'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              filter === tab && styles.filterTabActive,
            ]}
            onPress={() => setFilter(tab)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === tab && styles.filterTabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#76c7c0']}
          />
        }
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.notificationUnread,
              ]}
              onPress={() => markAsRead(notification.id)}
              onLongPress={() => deleteNotification(notification.id)}
            >
              <View style={styles.notificationIconContainer}>
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: getPriorityColor(notification.priority) },
                  ]}
                >
                  <Icon
                    name={getTypeIcon(notification.type)}
                    size={20}
                    color="#fff"
                  />
                </View>
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>

                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>

                <View style={styles.notificationFooter}>
                  <Text style={styles.notificationTime}>
                    {getTimeAgo(notification.timestamp)}
                  </Text>
                  <Text
                    style={[
                      styles.notificationPriority,
                      { color: getPriorityColor(notification.priority) },
                    ]}
                  >
                    {notification.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.notificationAction}
                onPress={() => deleteNotification(notification.id)}
              >
                <Icon name="close" size={20} color="#999" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No notifications found
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'unread'
                ? 'You have read all notifications'
                : filter === 'emergency'
                ? 'No emergency alerts'
                : 'No notifications to display'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={markAllAsRead}
        >
          <Icon name="done-all" size={20} color="#fff" />
          <Text style={styles.markAllButtonText}>
            Mark all as read
          </Text>
        </TouchableOpacity>
      )}

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Notification Settings</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="notifications-active" size={24} color="#333" />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={settings.pushEnabled}
            onValueChange={value =>
              setSettings(prev => ({ ...prev, pushEnabled: value }))
            }
            trackColor={{ false: '#767577', true: '#76c7c0' }}
            thumbColor={settings.pushEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="volume-up" size={24} color="#333" />
            <Text style={styles.settingLabel}>Sound</Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={value =>
              setSettings(prev => ({ ...prev, soundEnabled: value }))
            }
            trackColor={{ false: '#767577', true: '#76c7c0' }}
            thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="vibration" size={24} color="#333" />
            <Text style={styles.settingLabel}>Vibration</Text>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={value =>
              setSettings(prev => ({ ...prev, vibrationEnabled: value }))
            }
            trackColor={{ false: '#767577', true: '#76c7c0' }}
            thumbColor={settings.vibrationEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="bedtime" size={24} color="#333" />
            <Text style={styles.settingLabel}>Quiet Hours</Text>
            <Text style={styles.settingDescription}>
              {settings.quietStart} - {settings.quietEnd}
            </Text>
          </View>
          <Switch
            value={settings.quietHours}
            onValueChange={value =>
              setSettings(prev => ({ ...prev, quietHours: value }))
            }
            trackColor={{ false: '#767577', true: '#76c7c0' }}
            thumbColor={settings.quietHours ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#e53935',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterTabActive: {
    backgroundColor: '#76c7c0',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    padding: 15,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificationUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#76c7c0',
  },
  notificationIconContainer: {
    marginRight: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e53935',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationPriority: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  notificationAction: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  markAllButton: {
    backgroundColor: '#76c7c0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 15,
    borderRadius: 8,
  },
  markAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default NotificationsScreen;