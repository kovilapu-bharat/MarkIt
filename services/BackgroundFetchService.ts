import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { loadData, STORAGE_KEYS } from '../utils/storage';
import { AttendanceService } from './attendance';
import { NotificationService } from './notification';

import { ResultsService } from './results';

const TASK_NAME = 'BACKGROUND_ATTENDANCE_CHECK';

export const checkAttendanceInBackground = async () => {
    const now = new Date();
    // Simple log to show it ran (in development you'd use console.log)
    console.log(`[BackgroundFetch] Task running at ${now.toISOString()}`);

    try {
        // --- 1. ATTENDANCE CHECK ---
        const oldAttendance = await loadData(STORAGE_KEYS.ATTENDANCE);
        const newAttendance = await AttendanceService.getAttendance();

        if (newAttendance && oldAttendance) {
            const oldTotal = oldAttendance.semesterTotal?.attended || 0;
            const newTotal = newAttendance.semesterTotal?.attended || 0;

            const oldClasses = oldAttendance.semesterTotal?.total || 0;
            const newClasses = newAttendance.semesterTotal?.total || 0;

            // --- ENHANCED: Period-level change detection ---
            // Compare today's periods with cached data
            const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            // Load date-wise attendance separately (different cache)
            const oldDateWise = await loadData(STORAGE_KEYS.DATE_WISE_ATTENDANCE);
            const newDateWise = await AttendanceService.getDateWiseAttendance();

            const oldDaily = oldDateWise?.days || [];
            const newDaily = newDateWise?.days || [];

            const oldToday = oldDaily.find((d: any) => d.date === today);
            const newToday = newDaily.find((d: any) => d.date === today);

            if (newToday && oldToday) {
                const changes: string[] = [];

                newToday.periods.forEach((status: string, idx: number) => {
                    const oldStatus = oldToday.periods[idx] || '-';
                    if (oldStatus === '-' && status !== '-') {
                        const emoji = status === 'P' ? '✅' : '❌';
                        changes.push(`Period ${idx + 1}: ${status === 'P' ? 'Present' : 'Absent'} ${emoji}`);
                    }
                });

                if (changes.length > 0) {
                    await NotificationService.sendLocalNotification(
                        `Attendance Updated! 📚`,
                        changes.join(', ')
                    );
                    return BackgroundFetch.BackgroundFetchResult.NewData;
                }
            }
            // --- END ENHANCED ---

            if (newTotal > oldTotal) {
                // Attendance increased!
                const diff = newTotal - oldTotal;
                await NotificationService.sendLocalNotification(
                    'Attendance Up! 🚀',
                    `You attended ${diff} class${diff > 1 ? 'es' : ''}. New Total: ${newAttendance.overallPercentage}% 🎉`
                );
            } else if (newClasses > oldClasses && newTotal === oldTotal) {
                // Classes happened but didn't attend?
                const diff = newClasses - oldClasses;
                await NotificationService.sendLocalNotification(
                    'Missed a Class? 👀',
                    `${diff} class${diff > 1 ? 'es' : ''} marked while you were away. Attendance: ${newAttendance.overallPercentage}%`
                );
            } else {
                console.log('[BackgroundFetch] No attendance changes detected.');
            }
        } else {
            console.log('[BackgroundFetch] First run or no old attendance data, saving baseline.');
        }

        // --- 2. RESULTS CHECK ---
        // Only run if we have cached results to compare against
        const oldResults = await loadData(STORAGE_KEYS.EXAM_RESULTS);
        if (oldResults) {
            console.log('[BackgroundFetch] Checking for new results...');
            const newResults = await ResultsService.getResults();

            if (newResults && newResults.semesters.length > oldResults.semesters.length) {
                // Find which semesters are new
                const newSemesters = newResults.semesters.filter((ns: any) =>
                    !oldResults.semesters.some((os: any) => os.semester === ns.semester)
                );

                let message = '';
                if (newSemesters.length === 1) {
                    message = `Results for ${newSemesters[0].semester} are out! Check now.`;
                } else if (newSemesters.length > 1) {
                    // If too many (like initial checks), just summary
                    message = `Results for ${newSemesters[0].semester} and ${newSemesters.length - 1} others are out!`;
                } else {
                    message = `New Semester results are out! Check now.`;
                }

                await NotificationService.sendLocalNotification(
                    'SCARY HOURS: New Results Declared! 💀',
                    message
                );
                return BackgroundFetch.BackgroundFetchResult.NewData;
            } else {
                console.log('[BackgroundFetch] No new results detected.');
            }
        } else {
            console.log('[BackgroundFetch] First run or no old results data, saving baseline.');
        }

        // --- 3. FEE RECEIPTS CHECK ---
        const oldFees = await loadData(STORAGE_KEYS.FEE_RECEIPTS);
        if (oldFees && oldFees.length > 0) {
            console.log('[BackgroundFetch] Checking for new fee receipts...');
            const { FeeService } = await import('./FeeService');

            // Get current academic year
            const years = await FeeService.getAcademicYears();
            const currentYear = years[0] || '2025-26';
            const newFees = await FeeService.getReceipts(currentYear);

            if (newFees && newFees.length > oldFees.length) {
                const diff = newFees.length - oldFees.length;
                const latestReceipt = newFees[0]; // Most recent

                await NotificationService.sendLocalNotification(
                    'New Fee Receipt! 💰',
                    `${diff} new payment${diff > 1 ? 's' : ''} recorded. Latest: ₹${latestReceipt?.amount || 'N/A'}`
                );
                return BackgroundFetch.BackgroundFetchResult.NewData;
            } else {
                console.log('[BackgroundFetch] No new fee receipts detected.');
            }
        } else {
            console.log('[BackgroundFetch] First run or no old fee data, saving baseline.');
        }

        return BackgroundFetch.BackgroundFetchResult.NoData;

    } catch (error) {
        console.error('[BackgroundFetch] Failed:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
};

TaskManager.defineTask(TASK_NAME, checkAttendanceInBackground);

export const registerBackgroundFetchAsync = async () => {
    try {
        console.log('[BackgroundFetch] Registering task...');
        // This might fail in Expo Go
        return await BackgroundFetch.registerTaskAsync(TASK_NAME, {
            minimumInterval: 60 * 15, // 15 minutes
            stopOnTerminate: false, // Android
            startOnBoot: true, // Android
        });
    } catch (err) {
        console.log('[BackgroundFetch] Registration failed (Expo Go limitation?):', err);
    }
};

export const unregisterBackgroundFetchAsync = async () => {
    return BackgroundFetch.unregisterTaskAsync(TASK_NAME);
};
