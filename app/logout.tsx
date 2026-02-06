import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthService } from '../services/auth';

export default function LogoutScreen() {
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            await AuthService.logout();
            router.replace('/login');
        };

        performLogout();
    }, [router]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <ActivityIndicator size="large" color="#000" />
        </View>
    );
}
