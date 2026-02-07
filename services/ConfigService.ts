import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../constants/config';

const CONFIG_CACHE_KEY = 'remote_config_cache';
// TODO: Replace with your actual GitHub Raw JSON URL
const REMOTE_CONFIG_URL = 'https://raw.githubusercontent.com/your-username/Clgpo-Config/master/config.json';

export interface RemoteConfig {
    BASE_URL: string;
    ENDPOINTS: {
        LOGIN: string;
        ATTENDANCE: string;
        RESULTS: string;
    };
    TIMEOUT: number;
}

export const ConfigService = {
    // Start with default local config
    currentConfig: { ...API_CONFIG },

    initialize: async () => {
        try {
            // 1. Load from Cache first (fast)
            const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                ConfigService.currentConfig = { ...ConfigService.currentConfig, ...parsed };
                console.log('ConfigService: Loaded from cache');
            }

            // 2. Fetch fresh config in background
            ConfigService.fetchRemoteConfig();
        } catch (e) {
            console.log('ConfigService: Init error', e);
        }
    },

    fetchRemoteConfig: async () => {
        try {
            console.log('ConfigService: Checking for remote updates...');
            // fast timeout specifically for config
            const response = await axios.get(REMOTE_CONFIG_URL, { timeout: 5000 });

            if (response.data && response.data.BASE_URL) {
                const newConfig = response.data;
                ConfigService.currentConfig = { ...ConfigService.currentConfig, ...newConfig };

                // Update Cache
                await AsyncStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(newConfig));
                console.log('ConfigService: Updated from remote');
            }
        } catch (e) {
            console.log('ConfigService: Remote fetch failed (using cache/default)', e);
        }
    },

    get: () => ConfigService.currentConfig,
};
