import { Colors } from '@/constants/theme';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    colors: typeof Colors.light;
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    toggleTheme: () => Promise<void>;
}

const THEME_KEY = 'user_theme_preference';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    // Load saved preference on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await SecureStore.getItemAsync(THEME_KEY);
                if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
                    setThemeModeState(savedTheme);
                }
            } catch (e) {
                console.error('Failed to load theme preference', e);
            }
        };
        loadTheme();
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await SecureStore.setItemAsync(THEME_KEY, mode);
    };

    const toggleTheme = async () => {
        // If currently system, assume the active invalid; otherwise simple toggle
        const currentActive = themeMode === 'system' ? systemColorScheme : themeMode;
        const newMode = currentActive === 'dark' ? 'light' : 'dark';
        await setThemeMode(newMode);
    };

    const effectiveTheme = themeMode === 'system'
        ? (systemColorScheme === 'dark' ? 'dark' : 'light')
        : themeMode;

    const colors = Colors[effectiveTheme || 'light'];

    return (
        <ThemeContext.Provider value={{
            themeMode,
            colors,
            isDark: effectiveTheme === 'dark',
            setThemeMode,
            toggleTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
