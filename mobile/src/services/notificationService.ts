import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface ScheduledAlarm {
  id: string;
  notificationId: string;
  medicationName: string;
  time: string;
  days: string[];
  enabled: boolean;
}

/**
 * Request notification permissions
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-reminders', {
      name: 'Medication Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for notifications');
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
        repeats: true,
        channelId: 'medication-reminders',
      },
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
        repeats: true,
        channelId: 'medication-reminders',
      },
    });
    notificationIds.push(notificationId);
  }

  // Return first notification ID (we'll store all IDs as JSON array)
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
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
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
