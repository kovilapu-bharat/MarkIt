
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

interface OfflineIndicatorProps {
    isOffline: boolean;
    colors: any;
}

export const OfflineIndicator = ({ isOffline, colors }: OfflineIndicatorProps) => {
    if (!isOffline) return null;

    return (
        <Animated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeOutUp.duration(300)}
            style={[styles.container, { backgroundColor: colors.warning || '#f59e0b' }]}
        >
            <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
            <Text style={styles.text}>Offline - Showing cached data</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 8,
    },
    text: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});
