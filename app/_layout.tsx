import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ResultsProvider } from '../context/ResultsContext';
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  /* Font loading removed as assets/fonts/SpaceMono-Regular.ttf is missing */
  const loaded = true;

  useEffect(() => {
    const prepare = async () => {
      // Small delay so splash logo is visible before fade-out
      await new Promise(resolve => setTimeout(resolve, 300));
      await SplashScreen.hideAsync();
    };

    if (loaded) {
      prepare();

      // Register background tasks and permissions
      const initBackgroundTasks = async () => {
        const { registerBackgroundFetchAsync } = await import('../services/BackgroundFetchService');
        const { NotificationService } = await import('../services/notification');

        await NotificationService.registerForPushNotificationsAsync();
        await registerBackgroundFetchAsync();

        // Initialize Daily Notification with cached data
        const { AttendanceService } = await import('../services/attendance');
        const { STORAGE_KEYS, loadData } = await import('../utils/storage');
        const cachedAttendance = await loadData(STORAGE_KEYS.ATTENDANCE);

        if (cachedAttendance?.overallPercentage) {
          await NotificationService.scheduleDailySummary(cachedAttendance.overallPercentage);
        } else {
          // Try to fetch if nothing cached
          try {
            const newAtt = await AttendanceService.getAttendance();
            if (newAtt?.overallPercentage) {
              await NotificationService.scheduleDailySummary(newAtt.overallPercentage);
            }
          } catch {
            // No data available yet for daily notification
          }
        }
      };

      initBackgroundTasks();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CustomThemeProvider>
          <ResultsProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="student-profile"
                  options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="settings"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                    animation: 'slide_from_right'
                  }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </ThemeProvider>
          </ResultsProvider>
        </CustomThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
