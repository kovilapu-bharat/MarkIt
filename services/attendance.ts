import { API_CONFIG } from '../constants/config';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import api from './api';
import { AuthService } from './auth';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('react-native-cheerio');

export interface MonthlyAttendance {
    month: string;
    attended: number;
    total: number;
    percentage: number;
}

export interface AttendanceResponse {
    overallPercentage: number;
    semesterTotal: {
        attended: number;
        total: number;
    };
    months: MonthlyAttendance[];
    isOffline?: boolean;
}

export interface DailyAttendance {
    date: string;
    day: string;
    periods: string[]; // Array of 'P', 'A', or '-' for each period
}

export interface DateWiseResponse {
    days: DailyAttendance[];
    isOffline?: boolean;
}

export const AttendanceService = {
    getAttendance: async (): Promise<AttendanceResponse> => {
        try {
            let response = await api.get(API_CONFIG.ENDPOINTS.ATTENDANCE);
            let html = response.data;

            // Check if session expired
            if (html.includes('login.php') || html.includes('Enter Roll No') || html.includes('type="password"')) {
                const credentials = await AuthService.getCredentials();
                if (!credentials) throw new Error('Not logged in');
                await AuthService.login(credentials.studentId, credentials.pass);
                response = await api.get(API_CONFIG.ENDPOINTS.ATTENDANCE);
                html = response.data;
            }

            const $ = cheerio.load(html);

            const months: MonthlyAttendance[] = [];
            let semesterTotal = { attended: 0, total: 0 };
            let overallPercentage = 0;

            // 1. Parse Summary Table
            let summaryTable = $('.summary-table');
            if (summaryTable.length === 0) {
                summaryTable = $('table').filter((i: number, el: any) => {
                    const text = $(el).text();
                    return text.includes('Month') && text.includes('Classes Attended');
                });
            }

            summaryTable.find('tbody tr').each((i: number, el: any) => {
                const tds = $(el).find('td');
                const firstColText = $(tds[0]).text().trim();

                if (firstColText.includes('Semester Total')) {
                    const attended = parseInt($(tds[1]).text().trim(), 10);
                    const total = parseInt($(tds[2]).text().trim(), 10);
                    const percentStr = $(tds[3]).text().trim().replace('%', '');

                    semesterTotal = { attended, total };
                    overallPercentage = parseFloat(percentStr);
                } else if (firstColText && !firstColText.includes('Month')) {
                    months.push({
                        month: firstColText,
                        attended: parseInt($(tds[1]).text().trim(), 10) || 0,
                        total: parseInt($(tds[2]).text().trim(), 10) || 0,
                        percentage: parseFloat($(tds[3]).text().trim().replace('%', '')) || 0
                    });
                }
            });

            const data = {
                overallPercentage,
                semesterTotal,
                months,
                isOffline: false
            };

            await saveData(STORAGE_KEYS.ATTENDANCE, data);
            return data;

        } catch (error: any) {
            // Try fallback to cache
            const cachedData = await loadData(STORAGE_KEYS.ATTENDANCE);
            if (cachedData) {
                return { ...cachedData, isOffline: true };
            }
            throw error;
        }
    },

    getDateWiseAttendance: async (): Promise<DateWiseResponse> => {
        try {
            let response = await api.get(API_CONFIG.ENDPOINTS.ATTENDANCE);
            let html = response.data;

            if (html.includes('login.php') || html.includes('Enter Roll No') || html.includes('type="password"')) {
                const credentials = await AuthService.getCredentials();
                if (!credentials) throw new Error('Not logged in');
                await AuthService.login(credentials.studentId, credentials.pass);
                response = await api.get(API_CONFIG.ENDPOINTS.ATTENDANCE);
                html = response.data;
            }

            const $ = cheerio.load(html);
            const days: DailyAttendance[] = [];

            // Robust parsing: Scan all tables for date rows
            $('table').each((tIdx: number, table: any) => {
                const rows = $(table).find('tr');
                rows.each((rIdx: number, row: any) => {
                    const tds = $(row).find('td');
                    if (tds.length < 3) return;

                    const col1Text = $(tds[0]).text().trim();
                    // Match date: DD-MM-YYYY or similar
                    const dateMatch = col1Text.match(/(\d{1,2}[-./]\d{1,2}[-./]\d{2,4})/);

                    if (dateMatch) {
                        const dateText = dateMatch[0];

                        let dayText = '';
                        const smallTag = $(tds[0]).find('small');
                        if (smallTag.length > 0) {
                            dayText = smallTag.text().trim();
                        } else {
                            dayText = col1Text.replace(dateText, '').trim();
                        }

                        const periods: string[] = [];
                        // Heuristic for period columns
                        const col1Val = $(tds[1]).text().trim();
                        let startIndex = 1;

                        const commonDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
                        if (col1Val.length > 2 && commonDays.some(d => col1Val.toLowerCase().includes(d))) {
                            startIndex = 2;
                        } else if (tds.length >= 8) {
                            startIndex = 2; // Fallback for wide tables
                        }

                        for (let p = startIndex; p < tds.length && periods.length < 8; p++) {
                            const cellText = $(tds[p]).text().trim().replace('-', '').trim();
                            const cellClass = ($(tds[p]).attr('class') || '').toLowerCase();

                            let status = '-';
                            if (cellClass.includes('present')) status = 'P';
                            else if (cellClass.includes('absent')) status = 'A';
                            else if (cellClass.includes('not-posted') || !cellText || cellText.toLowerCase() === 'null') status = '-';
                            else if (cellText.length > 0 && cellText.length <= 2) status = cellText;

                            periods.push(status);
                        }

                        while (periods.length < 6) periods.push('-');

                        days.push({
                            date: dateText,
                            day: dayText,
                            periods: periods.slice(0, 6)
                        });
                    }
                });
            });

            const data = { days, isOffline: false };
            await saveData(STORAGE_KEYS.DATE_WISE_ATTENDANCE, data);
            return data;

        } catch (error: any) {
            const cachedData = await loadData(STORAGE_KEYS.DATE_WISE_ATTENDANCE);
            if (cachedData) return { ...cachedData, isOffline: true };
            throw error;
        }
    }
};
