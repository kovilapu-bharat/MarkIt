import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import api from './api';
import { AuthService } from './auth';

// Configure how notifications behave when the app is foregrounded
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
} catch (e) {
    console.log('Error setting notification handler (likely Expo Go limitation):', e);
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
            console.log('Fetching notifications (attendance page)...');
            let response = await api.get('/Student/Date_wise_attendance.php'); // Notifications are here based on user file
            let html = response.data;

            // Session check
            if (html.includes('login.php')) {
                const credentials = await AuthService.getCredentials();
                if (credentials) {
                    await AuthService.login(credentials.studentId, credentials.pass);
                    response = await api.get('/Student/Date_wise_attendance.php');
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

            console.log(`Parsed ${notifications.length} notifications`);

            // Cache
            await saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);

            return notifications;

        } catch (error) {
            console.warn('Notification fetch error:', error);
            const cached = await loadData(STORAGE_KEYS.NOTIFICATIONS);
            if (cached) {
                return cached.map((n: AppNotification) => ({ ...n, isOffline: true }));
            }
            return [];
        }
    },

    registerForPushNotificationsAsync: async () => {
        try {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            // Expo Go check: Notifications might throw here or return mocked status
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }
            // In a real app we would get the token here:
            // token = (await Notifications.getExpoPushTokenAsync()).data;
        } catch (e) {
            console.log('Error registering for notifications (Expo Go limitation?):', e);
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
        } catch (e) {
            console.log('Error sending notification (Expo Go limitation?):', e);
        }
    }
};
