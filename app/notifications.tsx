import { useTheme } from '@/context/ThemeContext';
import { AppNotification, NotificationService } from '@/services/notification';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationsScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = useCallback(async () => {
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const renderItem = ({ item, index }: { item: AppNotification; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.card, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.7)', borderColor: colors.cardBorder }]}>
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.time, { color: colors.textSecondary }]}>{item.time}</Text>
                    </View>
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
                </View>
            </BlurView>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={isDark ? [colors.background, '#1a1a1a'] : [colors.primary + '10', colors.background]}
                style={StyleSheet.absoluteFill}
            />

            {/* Custom Header */}
            <View style={[styles.screenHeader, { paddingTop: 60 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <View style={[styles.backButtonCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)' }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </View>
                </TouchableOpacity>
                <Text style={[styles.screenTitle, { color: colors.text }]}>Notifications</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary + '50'} style={{ marginBottom: 16 }} />
                            <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '600' }}>No new notifications</Text>
                            <Text style={{ color: colors.textSecondary, opacity: 0.7, marginTop: 4 }}>You're all caught up!</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    screenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
        zIndex: 10,
    },
    backButton: {
        marginRight: 15,
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    list: {
        padding: 20,
        gap: 16,
        paddingTop: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 4,
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        fontWeight: '500',
    },
    contentContainer: {
        marginLeft: 56, // 40 (icon) + 16 (margin)
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
    },
});
