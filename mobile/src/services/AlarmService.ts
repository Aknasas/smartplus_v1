// mobile/src/services/AlarmService.ts
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';

interface Reminder {
  reminder_id: number;
  title: string;
  description?: string;
  scheduled_datetime: string;
  alarm_enabled: boolean;
  is_completed?: boolean;
  extra_info?: string;
}

class AlarmService {
  private initialized: boolean = false;

  constructor() {
    this.configure();
  }

  private configure(): void {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('PushNotification TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('PushNotification NOTIFICATION:', notification);

        if (notification.userInteraction) {
          console.log('User tapped notification:', notification);
        }

        notification.finish(PushNotification.FetchResult.NoData);
      },
      onAction: function (notification) {
        console.log('PushNotification ACTION:', notification.action);
        console.log('PushNotification NOTIFICATION:', notification);
      },
      onRegistrationError: function(err) {
        console.error('PushNotification Registration Error:', err.message, err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  async requestPermissions(): Promise<void> {
    try {
      console.log('Requesting notification permissions...');

      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
        }
      }

      this.createChannels();
      this.initialized = true;
      console.log('AlarmService initialized successfully');
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  createChannels(): void {
    console.log('Creating notification channels...');

    PushNotification.createChannel(
      {
        channelId: 'reminders',
        channelName: 'Health Reminders',
        channelDescription: 'Notifications for health reminders',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
        vibration: 300,
      },
      (created) => console.log(`Create channel 'reminders' returned: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'alerts',
        channelName: 'Health Alerts',
        channelDescription: 'Important health alerts',
        playSound: true,
        soundName: 'default',
        importance: 5,
        vibrate: true,
        vibration: 500,
      },
      (created) => console.log(`Create channel 'alerts' returned: ${created}`)
    );
  }

  async scheduleReminder(reminder: Reminder): Promise<void> {
    if (!this.initialized) {
      console.log('AlarmService not initialized, initializing...');
      await this.requestPermissions();
    }

    const scheduledTime = new Date(reminder.scheduled_datetime);
    const now = new Date();

    console.log(`Scheduling reminder: ${reminder.title} at ${scheduledTime.toLocaleString()}`);
    console.log(`Current time: ${now.toLocaleString()}`);
    console.log(`Time difference: ${(scheduledTime.getTime() - now.getTime()) / 60000} minutes`);

    if (scheduledTime <= now) {
      console.log('Reminder time is in the past, not scheduling');
      return;
    }

    try {
      PushNotification.localNotificationSchedule({
        id: reminder.reminder_id,
        channelId: 'reminders',
        title: reminder.title,
        message: reminder.description || reminder.extra_info || 'Time for your reminder',
        date: scheduledTime,
        allowWhileIdle: true,
        smallIcon: 'ic_launcher',
        largeIcon: 'ic_launcher',
        vibrate: true,
        vibration: 300,
        priority: 'high',
        importance: 'high',
        playSound: true,
        soundName: 'default',
        number: 1,
        userInfo: {
          reminder_id: reminder.reminder_id,
          title: reminder.title,
        },
      });

      console.log(`✅ Reminder scheduled successfully for ID: ${reminder.reminder_id}`);
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  }

  cancelReminder(reminderId: number): void {
    console.log(`Cancelling reminder ID: ${reminderId}`);
    try {
      PushNotification.cancelLocalNotification(reminderId.toString());
      console.log(`✅ Reminder cancelled: ${reminderId}`);
    } catch (error) {
      console.error('Error canceling reminder:', error);
    }
  }

  cancelAllReminders(): void {
    console.log('Cancelling all reminders');
    try {
      PushNotification.cancelAllLocalNotifications();
      console.log('✅ All reminders cancelled');
    } catch (error) {
      console.error('Error canceling all reminders:', error);
    }
  }

  async checkAndSchedulePendingReminders(reminders: Reminder[]): Promise<void> {
    console.log(`Checking ${reminders.length} pending reminders...`);

    if (!this.initialized) {
      await this.requestPermissions();
    }

    let scheduled = 0;
    for (const reminder of reminders) {
      const scheduledTime = new Date(reminder.scheduled_datetime);
      const now = new Date();

      if (scheduledTime > now && reminder.alarm_enabled && !reminder.is_completed) {
        await this.scheduleReminder(reminder);
        scheduled++;
      }
    }

    console.log(`Scheduled ${scheduled} out of ${reminders.length} reminders`);
  }

  sendTestNotification(title: string, message: string): void {
    console.log(`Sending test notification: ${title}`);
    PushNotification.localNotification({
      channelId: 'reminders',
      title: title,
      message: message,
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });
  }
}

export default new AlarmService();