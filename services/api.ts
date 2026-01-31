import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://www.nrcmec.org';
// const API_URL = 'https://www.nrcmec-fake-url-for-test.org';
const COOKIE_KEY = 'auth_cookie';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
    },
});

// Request interceptor to add cookie
api.interceptors.request.use(async (config) => {
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
