import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../constants/config';

const CONFIG_CACHE_KEY = 'remote_config_cache';
// Remote config URL - Update with your GitHub repository URL if needed
const REMOTE_CONFIG_URL = 'https://raw.githubusercontent.com/kovilapu-bharat/Clgpo-Config/main/config.json';

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
            }

            // 2. Fetch fresh config in background
            ConfigService.fetchRemoteConfig();
        } catch {
            // Init failed, use defaults
        }
    },

    fetchRemoteConfig: async () => {
        try {
            // fast timeout specifically for config
            const response = await axios.get(REMOTE_CONFIG_URL, { timeout: 5000 });

            if (response.data && response.data.BASE_URL) {
                const newConfig = response.data;
                ConfigService.currentConfig = { ...ConfigService.currentConfig, ...newConfig };

                // Update Cache
                await AsyncStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(newConfig));
            }
        } catch {
            // Remote fetch failed, using cache/default
        }
    },

    get: () => ConfigService.currentConfig,
};
