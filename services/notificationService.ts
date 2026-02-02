// services/notificationService.ts

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Routine } from '../storage/routineStorage';
import { format, addMinutes, parse, startOfDay, isAfter } from 'date-fns';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('routine-reminders', {
        name: 'Routine Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleRoutineNotifications(routines: Routine[]): Promise<void> {
  try {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Cannot schedule notifications without permission');
      return;
    }

    const today = startOfDay(new Date());
    const enabledRoutines = routines.filter(r => r.enabled);

    for (const routine of enabledRoutines) {
      // Parse start and end times
      const [startHour, startMinute] = routine.startTime.split(':').map(Number);
      const [endHour, endMinute] = routine.endTime.split(':').map(Number);

      // Schedule for next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + dayOffset);
        targetDate.setHours(startHour, startMinute, 0, 0);

        // Only schedule if in the future
        if (isAfter(targetDate, new Date())) {
          // Schedule start notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ Time for ${routine.title}!`,
              body: `Your ${routine.title} routine is starting now.`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              data: {
                type: 'routine-start',
                routineId: routine.id,
                routineTitle: routine.title,
                date: format(targetDate, 'yyyy-MM-dd'),
              },
            },
            trigger: targetDate,
          });

          // Schedule end reminder (5 minutes before end time)
          const endTime = new Date(targetDate);
          endTime.setHours(endHour, endMinute, 0, 0);
          const reminderTime = addMinutes(endTime, -5);

          // Only schedule if reminder time is in the future
          if (isAfter(reminderTime, new Date())) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `📝 How was ${routine.title}?`,
                body: `Your ${routine.title} routine ends in 5 minutes. Time to write your report!`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: {
                  type: 'routine-report',
                  routineId: routine.id,
                  routineTitle: routine.title,
                  date: format(targetDate, 'yyyy-MM-dd'),
                },
              },
              trigger: reminderTime,
            });
          }
        }
      }
    }

    console.log(`Scheduled notifications for ${enabledRoutines.length} routines`);
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

// Listen for notification responses (when user taps notification)
export function setupNotificationListener(
  onNotificationReceived: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(onNotificationReceived);
}

// Listen for notification responses (when user taps notification)
export function setupNotificationResponseListener(
  onResponse: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(onResponse);
}
