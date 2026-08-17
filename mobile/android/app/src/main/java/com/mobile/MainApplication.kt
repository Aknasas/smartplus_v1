package com.mobile

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList = PackageList(this).packages.apply {
        // Add React Native Push Notification Package
        add(ReactNativePushNotificationPackage())
      },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    // Create notification channel for Android 8.0+ (Oreo and above)
    createNotificationChannels()
  }

  /**
   * Create notification channels for different notification types
   * Required for Android 8.0 (API level 26) and above
   */
  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // Reminders Channel
      val remindersChannel = NotificationChannel(
        "reminders",
        "Reminders",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Channel for medication and health reminders"
        enableVibration(true)
        enableLights(true)
        lightColor = android.graphics.Color.YELLOW
        vibrationPattern = longArrayOf(0, 1000, 500, 1000)
        setSound(null, null) // Use default sound
      }

      // Alerts Channel (for emergencies and critical alerts)
      val alertsChannel = NotificationChannel(
        "alerts",
        "Alerts",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Channel for emergency alerts and critical notifications"
        enableVibration(true)
        enableLights(true)
        lightColor = android.graphics.Color.RED
        vibrationPattern = longArrayOf(0, 1000, 500, 1000, 500, 1000)
        setBypassDnd(true) // Allow alerts to bypass Do Not Disturb
      }

      // Health Updates Channel
      val healthChannel = NotificationChannel(
        "health_updates",
        "Health Updates",
        NotificationManager.IMPORTANCE_DEFAULT
      ).apply {
        description = "Channel for daily health updates and achievements"
        enableVibration(true)
        enableLights(true)
        lightColor = android.graphics.Color.GREEN
      }

      // System Channel
      val systemChannel = NotificationChannel(
        "system",
        "System",
        NotificationManager.IMPORTANCE_LOW
      ).apply {
        description = "Channel for system notifications"
        enableVibration(false)
        enableLights(false)
      }

      // Register channels with system
      val notificationManager = getSystemService(NotificationManager::class.java)
      notificationManager?.apply {
        createNotificationChannel(remindersChannel)
        createNotificationChannel(alertsChannel)
        createNotificationChannel(healthChannel)
        createNotificationChannel(systemChannel)
      }
    }
  }
}