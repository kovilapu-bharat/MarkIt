import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../constants/config';
import { ConfigService } from './ConfigService';



const COOKIE_KEY = 'auth_cookie';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'User-Agent': API_CONFIG.HEADERS.USER_AGENT,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
    },
});

// Request interceptor to add cookie and dynamic Base URL
api.interceptors.request.use(async (config) => {
    // 1. Dynamic Base URL from Remote Config
    const dynamicConfig = ConfigService.get();
    config.baseURL = dynamicConfig.BASE_URL;

    // 2. Auth Cookie
    const cookie = await SecureStore.getItemAsync(COOKIE_KEY);
    if (cookie) {
        config.headers.Cookie = cookie;
    }
    return config;
});

export const setAuthCookie = async (cookie: string) => {
    await SecureStore.setItemAsync(COOKIE_KEY, cookie);
};

export const getAuthCookie = async () => {
    return await SecureStore.getItemAsync(COOKIE_KEY);
};

export const clearAuthCookie = async () => {
    await SecureStore.deleteItemAsync(COOKIE_KEY);
};

export default api;
