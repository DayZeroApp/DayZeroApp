// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/** Ensure Android notification channel exists (required on Android 8+) */
export async function ensureAndroidChannelAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

/** Ask for notification permissions */
export async function requestPermissionsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status; // 'granted' | 'denied' | 'undetermined'
}

/** Get Expo push token (good for test pushes via Expo Push API) */
export async function getExpoPushTokenAsync() {
  const { data } = await Notifications.getExpoPushTokenAsync();
  return data; // e.g. "ExponentPushToken[xxxxxxxxxxxxxx]"
}

/** Quick local notification helper (fires after N seconds, or immediately if seconds <= 0) */
export async function scheduleLocalAsync(
  opts: { title?: string; body?: string; seconds?: number } = {}
) {
  const { title = 'Hello 👋', body = 'Local notification', seconds = 3 } = opts;

  // Build a time-interval trigger and cast to the union type
  const trigger =
    seconds && seconds > 0
      ? ({ seconds, repeats: false } as Notifications.TimeIntervalTriggerInput)
      : null;

  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: trigger as Notifications.NotificationTriggerInput | null,
  });
}

/** Foreground listener for received notifications */
export function addForegroundListener(cb: (n: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(cb);
}

/** Listener for user interaction (taps, actions) */
export function addResponseListener(cb: (r: Notifications.NotificationResponse) => void) {
  return Notifications.addNotificationResponseReceivedListener(cb);
}

/* -------------------- Habit helpers -------------------- */

type Habit = { id: string; title: string; targetPerWeek: number; targetTimes?: string[] };

/** One-time setup: ask permission + create Android channel */
export async function ensureNotificationSetup() {
  const status = await requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }
  await ensureAndroidChannelAsync();
  return true;
}

/** Schedule daily reminders for a habit (times like ["09:00","18:30"]), fallback to 9:00 */
export async function scheduleHabitNotifications(habit: Habit) {
  try {
    await cancelHabitNotifications(habit.id);

    if (habit.targetTimes?.length) {
      for (const timeStr of habit.targetTimes) {
        const [hour, minute] = timeStr.split(':').map(Number);
        if (Number.isNaN(hour) || Number.isNaN(minute)) continue;

        const trigger = { hour, minute, repeats: true } as Notifications.CalendarTriggerInput;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for ${habit.title}!`,
            body: `Don't forget to complete your habit. Target: ${habit.targetPerWeek}x per week`,
            data: { habitId: habit.id, type: 'habit_reminder' },
          },
          trigger: trigger as Notifications.NotificationTriggerInput,
        });
      }
    } else {
      const trigger = { hour: 9, minute: 0, repeats: true } as Notifications.CalendarTriggerInput;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${habit.title}!`,
          body: `Don't forget to complete your habit. Target: ${habit.targetPerWeek}x per week`,
          data: { habitId: habit.id, type: 'habit_reminder' },
        },
        trigger: trigger as Notifications.NotificationTriggerInput,
      });
    }

    console.log(`Scheduled notifications for habit: ${habit.title}`);
  } catch (error) {
    console.error('Error scheduling habit notifications:', error);
  }
}

/** Reschedule by canceling old ones then creating new ones */
export async function rescheduleHabitNotifications(habit: Habit) {
  await scheduleHabitNotifications(habit);
}

/** Cancel all scheduled notifs for a specific habit id (using content.data.habitId) */
export async function cancelHabitNotifications(habitId: string) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      const data = (n.content.data || {}) as Record<string, unknown>;
      if (data.habitId === habitId) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
    console.log(`Canceled notifications for habit ID: ${habitId}`);
  } catch (error) {
    console.error('Error canceling habit notifications:', error);
  }
}
