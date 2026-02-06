import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    ATTENDANCE: 'attendance_data',
    DATE_WISE_ATTENDANCE: 'date_wise_attendance',
    NOTIFICATIONS: 'notifications_cache',
    EXAM_RESULTS: 'exam_results_cache',
    FEE_RECEIPTS: 'fee_receipts_cache',
    LAST_UPDATED: 'last_updated_timestamp',
};

export const saveData = async (key: string, value: any) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
        return true;
    } catch (e) {
        console.error('Error saving data to storage', e);
        return false;
    }
};

export const loadData = async (key: string) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error loading data from storage', e);
        return null;
    }
};

export const removeData = async (key: string) => {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('Error removing data from storage', e);
        return false;
    }
};

export const clearAllData = async () => {
    try {
        const keys = Object.values(STORAGE_KEYS);
        await AsyncStorage.multiRemove(keys);
        return true;
    } catch (e) {
        console.error('Error clearing storage', e);
        return false;
    }
};
