import { AuthService } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const ONBOARDING_KEY = 'has_seen_onboarding';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            // Check onboarding first
            const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
            console.log('[Index] Onboarding key value:', hasSeenOnboarding, 'Type:', typeof hasSeenOnboarding);

            if (hasSeenOnboarding !== 'true') {
                console.log('[Index] Showing onboarding...');
                setNeedsOnboarding(true);
                setIsLoading(false);
                return;
            }

            console.log('[Index] Onboarding already seen, checking login...');

            // Then check login
            const loggedIn = await AuthService.isLoggedIn();
            setIsLoggedIn(loggedIn);
        } catch (e) {
            console.log('Error checking status:', e);
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

    if (needsOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    if (isLoggedIn) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/login" />;
}

