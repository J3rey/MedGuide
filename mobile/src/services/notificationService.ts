import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure alarm behavior - critical alerts with persistent notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ScheduledAlarm {
  id: string;
  notificationId: string;
  medicationName: string;
  time: string;
  days: string[];
  enabled: boolean;
  snoozeDuration?: number;
  snoozeCount?: number;
}

export interface AlarmAction {
  identifier: string;
  buttonTitle: string;
  textInput?: boolean;
}

/**
 * Request notification permissions
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-alarms', {
      name: 'Medication Alarms',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250, 250, 250],
      lightColor: '#3B82F6',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowCriticalAlerts: true,
        },
        android: {},
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for alarm notifications');
    }
  }

  return token;
}

/**
 * Schedule a notification for a specific time
 */
export async function scheduleAlarmNotification(
  medicationName: string,
  hour: number,
  minute: number,
  days: string[]
): Promise<string> {
  // If daily or all days selected, use daily trigger
  if (days.includes('Daily') || days.length === 7) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Medication Reminder',
        body: `Time to take ${medicationName}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { medicationName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'medication-reminders',
      } as Notifications.DailyTriggerInput,
    });
    return notificationId;
  }

  // For specific days, schedule multiple notifications (one per day)
  const dayNumbers = getDayNumbers(days);
  const notificationIds: string[] = [];
  
  for (const weekday of dayNumbers) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Medication Reminder',
        body: `Time to take ${medicationName}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { medicationName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        channelId: 'medication-reminders',
      } as Notifications.WeeklyTriggerInput,
    });
    notificationIds.push(notificationId);
  }

  // Return JSON array of notification IDs
  return JSON.stringify(notificationIds);
}

/**
 * Cancel a scheduled notification
 */
export async function cancelAlarmNotification(notificationId: string): Promise<void> {
  try {
    // Check if it's a JSON array of IDs
    const ids = JSON.parse(notificationId);
    if (Array.isArray(ids)) {
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } else {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  } catch {
    // Single notification ID
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}

/**
 * Cancel all scheduled alarms
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled alarms
 */
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Setup alarm action categories (dismiss/snooze)
 */
export async function setupAlarmCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync('MEDICATION_ALARM', [
    {
      identifier: 'DISMISS',
      buttonTitle: 'Take Medication',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'SNOOZE_5',
      buttonTitle: 'Snooze 5 min',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'SNOOZE_10',
      buttonTitle: 'Snooze 10 min',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
}

/**
 * Snooze an alarm for specified minutes
 */
export async function snoozeAlarm(
  medicationName: string,
  snoozeMinutes: number
): Promise<string> {
  const triggerDate = new Date();
  triggerDate.setMinutes(triggerDate.getMinutes() + snoozeMinutes);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💊 MEDICATION ALARM (Snoozed)',
      body: `Time to take ${medicationName}`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      vibrate: [0, 250, 250, 250],
      sticky: true,
      autoDismiss: false,
      data: {
        medicationName,
        isAlarm: true,
        isSnoozed: true,
        timestamp: Date.now(),
      },
      categoryIdentifier: 'MEDICATION_ALARM',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: 'medication-alarms',
    },
  });

  return notificationId;
}

/**
 * Dismiss an alarm notification
 */
export async function dismissAlarm(notificationId: string): Promise<void> {
  await Notifications.dismissNotificationAsync(notificationId);
}

/**
 * Convert day names to weekday numbers (1=Monday, 7=Sunday)
 */
function getDayNumbers(days: string[]): number[] {
  const dayMap: { [key: string]: number } = {
    Mon: 2,
    Tue: 3,
    Wed: 4,
    Thu: 5,
    Fri: 6,
    Sat: 7,
    Sun: 1,
  };

  return days.map((day) => dayMap[day]).filter(Boolean);
}

/**
 * Parse time string (HH:MM) to hour and minute
 */
export function parseTime(timeString: string): { hour: number; minute: number } {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
}
