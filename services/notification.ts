import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { API_CONFIG } from '../constants/config';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import api from './api';
import { AuthService } from './auth';

// Configure how notifications behave when the app is foregrounded
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
} catch {
    // Notification handler setup may fail in Expo Go
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('react-native-cheerio');

export interface AppNotification {
    id: string; // Use a hash or index as ID
    title: string;
    description: string;
    time: string;
    icon: string;
    isOffline?: boolean;
}

export const NotificationService = {
    getNotifications: async (): Promise<AppNotification[]> => {
        try {
            let response = await api.get(API_CONFIG.ENDPOINTS.ATTENDANCE);
            let html = response.data;

            // Session check
            if (html.includes('login.php')) {
                const credentials = await AuthService.getCredentials();
                if (credentials) {
                    await AuthService.login(credentials.studentId, credentials.pass);
                    response = await api.get(API_CONFIG.ENDPOINTS.ATTENDANCE);
                    html = response.data;
                }
            }

            const $ = cheerio.load(html);
            const notifications: AppNotification[] = [];

            $('.notification-item').each((i: number, el: any) => {
                const title = $(el).find('.notification-message').text().trim();
                const description = $(el).find('.notification-text').text().trim();
                const time = $(el).find('.notification-time').text().trim();
                const icon = $(el).find('.notification-icon').text().trim() || '📢';

                if (title) {
                    notifications.push({
                        id: `notif-${i}`,
                        title,
                        description,
                        time,
                        icon,
                        isOffline: false
                    });
                }
            });



            // Cache
            await saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);

            return notifications;

        } catch {
            const cached = await loadData(STORAGE_KEYS.NOTIFICATIONS);
            if (cached) {
                return cached.map((n: AppNotification) => ({ ...n, isOffline: true }));
            }
            return [];
        }
    },

    registerForPushNotificationsAsync: async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return;
        }

        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        try {
            // Check if we are running in Expo Go or Build
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            if (!projectId) {
                // For development/Expo Go, we can start without it, but real push needs it.
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId: projectId,
            })).data;

            return token;

        } catch {
            // Registration may fail in Expo Go
        }
    },

    sendLocalNotification: async (title: string, body: string) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: title,
                    body: body,
                    sound: 'default',
                },
                trigger: null, // Send immediately
            });
        } catch {
            // Notification scheduling may fail in Expo Go
        }
    },

    getDailyMessage: (percentage: number) => {
        if (percentage >= 90) {
            return {
                title: 'Attendance Star! 🌟',
                body: `You're crushing it with ${percentage}% attendance! Keep up the great work! 🎓`
            };
        } else if (percentage >= 75) {
            return {
                title: 'Looking Good! ✅',
                body: `You're safe at ${percentage}%. Stay consistent to keep that green flag flying! 🚩`
            };
        } else if (percentage >= 65) {
            return {
                title: 'Caution: Attendance Low ⚠️',
                body: `You're at ${percentage}%. Try to attend more classes to reach the safe zone! 🛡️`
            };
        } else {
            return {
                title: 'Attendance Alert! 🚨',
                body: `Critical: You're at ${percentage}%. You need to attend classes immediately to avoid detention! 📉`
            };
        }
    },

    scheduleDailySummary: async (percentage: number) => {
        try {
            // Cancel existing daily summary to update with new percentage
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();

            // Strategy: Cancel all pending notifications that match our "Daily Summary" title or category
            for (const notif of scheduled) {
                // Check if it matches any of our possible titles or the type
                if (notif.content.data?.type === 'daily_summary' ||
                    notif.content.title === 'Daily Attendance Summary 📊' ||
                    notif.content.title?.includes('Attendance')) {
                    await Notifications.cancelScheduledNotificationAsync(notif.identifier);
                }
            }

            const now = new Date();
            let scheduledTime = new Date();
            scheduledTime.setHours(18, 0, 0, 0); // 6:00 PM

            // If it's already past 6 PM, schedule for tomorrow
            if (now > scheduledTime) {
                scheduledTime.setDate(scheduledTime.getDate() + 1);
            }

            const message = NotificationService.getDailyMessage(percentage);

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: message.title,
                    body: message.body,
                    sound: 'default',
                    data: { type: 'daily_summary' }
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: scheduledTime,
                }
            });



        } catch {
            // Scheduling may fail in Expo Go
        }
    }
};
