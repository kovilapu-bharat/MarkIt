import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import api from './api';
import { AuthService } from './auth';

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
    }
};
