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
