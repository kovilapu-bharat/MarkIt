import { AuthService } from '@/services/auth';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const loggedIn = await AuthService.isLoggedIn();
            setIsLoggedIn(loggedIn);
        } catch (e) {
            console.log('Error checking login status:', e);
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (isLoggedIn) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/login" />;
}
