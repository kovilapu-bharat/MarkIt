import { AuthService } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const ONBOARDING_KEY = 'has_seen_onboarding';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            // Check onboarding first
            const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);

            if (hasSeenOnboarding !== 'true') {
                router.replace('/(auth)/onboarding');
                return;
            }

            // Then check login
            const loggedIn = await AuthService.isLoggedIn();
            setIsLoggedIn(loggedIn);
        } catch {
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (isLoggedIn) {
        return <Redirect href="/(app)/(tabs)" />;
    }

    return <Redirect href="/(auth)/login" />;
}
