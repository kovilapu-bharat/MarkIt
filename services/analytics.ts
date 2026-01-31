import { DailyAttendance } from './attendance';

export interface TrendPoint {
    date: string; // ISO or display format
    percentage: number;
    totalClasses: number;
}

export const AnalyticsService = {
    /**
     * Calculates the attendance percentage trend over time.
     * Assumes dailyLogs are mixed order, so it sorts them first.
     */
    calculateTrend: (dailyLogs: DailyAttendance[]): TrendPoint[] => {
        // 1. Sort logs chronologically (Oldest first)
        const sortedLogs = [...dailyLogs].sort((a, b) => {
            const [dA, mA, yA] = a.date.split(/[-./\s]/).map(Number);
            const [dB, mB, yB] = b.date.split(/[-./\s]/).map(Number);
            return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
        });

        let cumulativeAttended = 0;
        let cumulativeTotal = 0;
        const trend: TrendPoint[] = [];

        sortedLogs.forEach((log) => {
            const pCount = log.periods.filter((p) => p === 'P').length;
            const aCount = log.periods.filter((p) => p === 'A').length;
            const dayTotal = pCount + aCount;

            if (dayTotal > 0) {
                cumulativeAttended += pCount;
                cumulativeTotal += dayTotal;

                trend.push({
                    date: log.date,
                    percentage: (cumulativeAttended / cumulativeTotal) * 100,
                    totalClasses: cumulativeTotal
                });
            }
        });

        return trend;
    },

    /**
     * Calculates how many MORE classes to attend to reach target,
     * OR how many one can skip while staying above target.
     */
    calculateProjection: (currentAttended: number, currentTotal: number, targetPercent: number) => {
        const targetDecimal = targetPercent / 100;
        const currentPercent = currentTotal > 0 ? currentAttended / currentTotal : 0;

        if (currentPercent >= targetDecimal) {
            // We are safe. How many can we skip?
            // (A) / (N + x) >= T
            // A / T >= N + x
            // x <= A/T - N
            const margin = Math.floor(currentAttended / targetDecimal - currentTotal);
            return { type: 'safe', count: Math.max(0, margin) };
        } else {
            // We are unsafe. How many to attend?
            // (A + x) / (N + x) >= T
            // A + x >= TN + Tx
            // x(1 - T) >= TN - A
            // x >= (TN - A) / (1 - T)
            const needed = Math.ceil((targetDecimal * currentTotal - currentAttended) / (1 - targetDecimal));
            return { type: 'danger', count: Math.max(0, needed) };
        }
    },

    calculateStreak: (dailyLogs: DailyAttendance[]) => {
        // Sort newest first
        const sortedLogs = [...dailyLogs].sort((a, b) => {
            const [dA, mA, yA] = a.date.split(/[-./\s]/).map(Number);
            const [dB, mB, yB] = b.date.split(/[-./\s]/).map(Number);
            return new Date(yB, mB - 1, dB).getTime() - new Date(yA, mA - 1, dA).getTime();
        });

        let currentStreak = 0;
        for (const log of sortedLogs) {
            const hasAbsent = log.periods.includes('A');
            if (hasAbsent) break;
            currentStreak++;
        }
        return currentStreak;
    },

    estimateRecoveryDate: (currentAttended: number, currentTotal: number, targetPercent: number = 75) => {
        const targetDecimal = targetPercent / 100;
        if (currentTotal > 0 && (currentAttended / currentTotal) >= targetDecimal) return null; // Already safe

        const classesNeeded = Math.ceil((targetDecimal * currentTotal - currentAttended) / (1 - targetDecimal));
        // Assume 6 periods per day on average
        const daysNeeded = Math.ceil(classesNeeded / 6);

        const date = new Date();
        date.setDate(date.getDate() + daysNeeded);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    },

    /**
     * Predicts percentage if student attends or misses next N classes
     */
    predictFuture: (currentAttended: number, currentTotal: number, attend: number, miss: number) => {
        const newAttended = currentAttended + attend;
        const newTotal = currentTotal + attend + miss;
        return newTotal === 0 ? 0 : (newAttended / newTotal) * 100;
    }
};
