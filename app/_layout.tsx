import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ResultsProvider } from '@/context/ResultsContext';
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';

Sentry.init({
  dsn: 'https://17b997ef256c0a52c45c7291ef485053@o4510928382525440.ingest.us.sentry.io/4510928392683520',
  debug: false,
  integrations: [
    Sentry.reactNavigationIntegration({
      enableTimeToInitialDisplay: true,
    }),
  ],
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ResultsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        </Stack>
      </ResultsProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function App() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

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
        const { registerBackgroundFetchAsync } = await import('@/services/BackgroundFetchService');
        const { NotificationService } = await import('@/services/notification');

        await NotificationService.registerForPushNotificationsAsync();
        await registerBackgroundFetchAsync();
      }

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
            <RootLayoutNav />
          </ResultsProvider>
        </CustomThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(App);
