import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../constants/config';
import api from './api';
import { ConfigService } from './ConfigService';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('react-native-cheerio');

const CREDENTIALS_KEY = 'user_credentials';
const PROFILE_KEY = 'user_profile';

export interface StudentProfile {
    name: string;
    rollNo: string;
    department: string;
    year: string;
    profileImage: string;
}

export const AuthService = {
    login: async (studentId: string, pass: string) => {
        try {
            // Step 1: GET request to initialize session
            await api.get(API_CONFIG.ENDPOINTS.LOGIN);

            // Step 2: POST login credentials
            const formData = new URLSearchParams();
            formData.append('roll_no', studentId);
            formData.append('password', pass);

            const loginResponse = await api.post(API_CONFIG.ENDPOINTS.LOGIN, formData.toString(), {
                maxRedirects: 5,
                validateStatus: (status: number) => status >= 200 && status < 400,
            });

            // Extract and save cookie
            const setCookie = loginResponse.headers['set-cookie'];
            if (setCookie) {
                const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
                await SecureStore.setItemAsync('auth_cookie', cookieStr);
            }

            const config = ConfigService.get();
            const responseText = loginResponse.data || '';
            const isLoginPage = responseText.includes('login-form') ||
                responseText.includes('Enter your Roll Number') ||
                responseText.includes(config.SELECTORS?.LOGIN_ERROR_INVALID || 'Invalid Credentials');

            const isSuccessPage = responseText.includes('Dashboard') ||
                responseText.includes('Welcome') ||
                responseText.includes('class="menu-link"') ||
                responseText.includes('logout');

            if (isSuccessPage && !isLoginPage) {
                // Parse profile info from the response
                const $ = cheerio.load(responseText);

                const name = $('#profileName').text().trim() || 'Student';
                const rollNo = studentId;
                const department = $('#profileDepartment').text().trim() || '';

                // Extract year from the profile popup
                let year = '';
                $('p').each((i: number, el: any) => {
                    const text = $(el).text();
                    if (text.includes('Year:')) {
                        const match = text.match(/Year:\s*(\d+)/);
                        if (match) year = match[1];
                    }
                });

                // Extract profile image
                let profileImage = '';
                const popupImg = $('.popup-img').attr('src') || $('img[alt="Profile"]').attr('src');
                if (popupImg) {
                    profileImage = popupImg.startsWith('http')
                        ? popupImg
                        : `${API_CONFIG.BASE_URL}/Student/${popupImg}`;
                }

                const profile: StudentProfile = {
                    name,
                    rollNo,
                    department,
                    year,
                    profileImage
                };



                // Store credentials and profile
                await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ studentId, pass }));
                await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile));

                return profile;
            } else if (responseText.includes(config.SELECTORS?.LOGIN_ERROR_INVALID || 'Invalid Credentials') || responseText.includes(config.SELECTORS?.LOGIN_ERROR_INCORRECT || 'incorrect')) {
                throw new Error('Invalid credentials. Please check your Roll Number and Password.');
            } else {
                throw new Error('Login failed. Please verify your credentials.');
            }

        } catch (error: any) {
            throw error;
        }
    },

    logout: async () => {
        try {
            await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
            await SecureStore.deleteItemAsync(PROFILE_KEY);
            // Clear auth cookie
            await SecureStore.deleteItemAsync('auth_cookie');
        } catch {
            // Even if delete fails, proceed to let the user "logout" locally
        }
    },

    isLoggedIn: async () => {
        const creds = await SecureStore.getItemAsync(CREDENTIALS_KEY);
        return !!creds;
    },

    getCredentials: async () => {
        const creds = await SecureStore.getItemAsync(CREDENTIALS_KEY);
        return creds ? JSON.parse(creds) : null;
    },

    getProfile: async (): Promise<StudentProfile | null> => {
        const profile = await SecureStore.getItemAsync(PROFILE_KEY);
        return profile ? JSON.parse(profile) : null;
    },

    checkBiometrics: async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    },

    loginWithBiometrics: async () => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to continue',
            fallbackLabel: 'Use Passcode',
        });

        if (result.success) {
            const credsStr = await SecureStore.getItemAsync(CREDENTIALS_KEY);
            if (credsStr) {
                const { studentId, pass } = JSON.parse(credsStr);
                return AuthService.login(studentId, pass);
            } else {
                throw new Error('No credentials stored. Please login manually first.');
            }
        } else {
            throw new Error('Biometric authentication failed');
        }
    }
};
