
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
}

export const SkeletonLoader = ({ width, height, borderRadius = 8, style }: SkeletonLoaderProps) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        // Breathing pulse animation
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1500 }),
            -1,
            true // Reverse for smooth breathing
        );
    }, [shimmer]);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            shimmer.value,
            [0, 1],
            [0.3, 0.6] // Subtle lighting change
        );
        return { opacity };
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                { width, height, borderRadius },
                animatedStyle,
                style,
            ]}
        />
    );
};

// Pre-made skeleton patterns
export const CardSkeleton = ({ colors }: { colors: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
            <SkeletonLoader width={50} height={50} borderRadius={25} />
            <View style={styles.cardHeaderText}>
                <SkeletonLoader width={150} height={16} />
                <SkeletonLoader width={100} height={12} style={{ marginTop: 8 }} />
            </View>
        </View>
        <SkeletonLoader width="100%" height={60} style={{ marginTop: 16 }} />
    </View>
);

export const ListSkeleton = ({ count = 3, colors }: { count?: number; colors: any }) => (
    <View>
        {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={[styles.listItem, { borderBottomColor: colors.cardBorder }]}>
                <SkeletonLoader width={40} height={40} borderRadius={10} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <SkeletonLoader width="70%" height={14} />
                    <SkeletonLoader width="50%" height={12} style={{ marginTop: 6 }} />
                </View>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
    },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardHeaderText: {
        marginLeft: 12,
        flex: 1,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
});
