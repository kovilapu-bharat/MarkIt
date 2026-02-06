
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLogout } from '../hooks/useLogout';

export default function Settings() {
    const router = useRouter();
    const { colors, isDark, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const { handleLogout, loggingOut } = useLogout();

    // Mock state for notifications (would be connected to storage in real app)
    const [examAlerts, setExamAlerts] = useState(true);
    const [feeAlerts, setFeeAlerts] = useState(true);

    const handleClearCache = () => {
        Alert.alert(
            "Clear Cache",
            "Are you sure you want to clear all app cache? This will not log you out.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => Alert.alert("Success", "Cache cleared successfully!")
                }
            ]
        );
    };

    const handleShareApp = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            await Share.share({
                message: '📚 Check out MarkIt - the best app for tracking your college attendance!\n\nDownload it now and never miss the 75% threshold again! 🎯',
                title: 'Share MarkIt',
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const SettingItem = ({ icon, title, subtitle, rightElement, onPress, color = colors.primary }: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.cardBorder }]}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress?.();
            }}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
            </View>
            {rightElement}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{title}</Text>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={isDark ? ['#0f172a', '#1e293b'] : ['#f0f9ff', '#e0f2fe']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <SectionHeader title="APPEARANCE" />
                            <SettingItem
                                icon={isDark ? "moon" : "sunny"}
                                title="App Theme"
                                subtitle={isDark ? "Dark Mode" : "Light Mode"}
                                color="#8b5cf6"
                                rightElement={
                                    <Switch
                                        value={isDark}
                                        onValueChange={toggleTheme}
                                        trackColor={{ false: '#767577', true: '#8b5cf6' }}
                                        thumbColor={Platform.OS === 'ios' ? '#fff' : '#f4f3f4'}
                                    />
                                }
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <SectionHeader title="NOTIFICATIONS" />
                            <SettingItem
                                icon="notifications"
                                title="Exam Results"
                                subtitle="Get notified for new grades"
                                color="#f59e0b"
                                rightElement={
                                    <Switch
                                        value={examAlerts}
                                        onValueChange={setExamAlerts}
                                        trackColor={{ false: '#767577', true: '#f59e0b' }}
                                        thumbColor={Platform.OS === 'ios' ? '#fff' : '#f4f3f4'}
                                    />
                                }
                            />
                            <SettingItem
                                icon="receipt"
                                title="Fee Updates"
                                subtitle="Alerts for payments and dues"
                                color="#10b981"
                                rightElement={
                                    <Switch
                                        value={feeAlerts}
                                        onValueChange={setFeeAlerts}
                                        trackColor={{ false: '#767577', true: '#10b981' }}
                                        thumbColor={Platform.OS === 'ios' ? '#fff' : '#f4f3f4'}
                                    />
                                }
                            />
                            {Platform.OS === 'android' && (
                                <SettingItem
                                    icon="battery-charging"
                                    title="Battery Optimization"
                                    subtitle="Allow background updates"
                                    color="#06b6d4"
                                    onPress={() => {
                                        Alert.alert(
                                            "Enable Background Activity",
                                            "To get reliable attendance notifications, please exclude MarkIt from battery optimization.\n\n1. Tap 'Open Settings'\n2. Find 'MarkIt'\n3. Select 'Don't optimize' or 'Unrestricted'",
                                            [
                                                { text: "Cancel", style: "cancel" },
                                                {
                                                    text: "Open Settings",
                                                    onPress: () => Linking.openSettings()
                                                }
                                            ]
                                        );
                                    }}
                                    rightElement={
                                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                    }
                                />
                            )}
                            <SettingItem
                                icon="notifications-circle"
                                title="Test Notifications"
                                subtitle="Send a sample notification"
                                color="#ec4899"
                                onPress={async () => {
                                    try {
                                        const { NotificationService } = await import('../services/notification');

                                        // Send test attendance notification
                                        await NotificationService.sendLocalNotification(
                                            'Attendance Updated! 📚',
                                            'Period 3: Present ✅, Period 5: Absent ❌'
                                        );

                                        // Send test results notification after 2 seconds
                                        setTimeout(async () => {
                                            await NotificationService.sendLocalNotification(
                                                'SCARY HOURS: New Results Declared! 💀',
                                                'Results for Semester 4 are out! Check now.'
                                            );
                                        }, 2000);

                                        // Send test fee notification after 4 seconds
                                        setTimeout(async () => {
                                            await NotificationService.sendLocalNotification(
                                                'New Fee Receipt! 💰',
                                                '1 new payment recorded. Latest: ₹50,000'
                                            );
                                        }, 4000);

                                        Alert.alert('Test Sent!', '3 notifications will appear over the next few seconds.');
                                    } catch {
                                        Alert.alert('Error', 'Could not send test notification. This may be a limitation of Expo Go.');
                                    }
                                }}
                                rightElement={
                                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                }
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <SectionHeader title="SUPPORT & DATA" />
                            <SettingItem
                                icon="trash-bin"
                                title="Clear Cache"
                                subtitle="Free up space"
                                color="#ef4444"
                                onPress={handleClearCache}
                            />
                            <SettingItem
                                icon="shield-checkmark"
                                title="Privacy Policy"
                                subtitle="Read our terms"
                                color="#3b82f6"
                                onPress={() => Alert.alert("Privacy Policy", "MarkIt respects your privacy. All data is processed locally where possible.")}
                            />
                            <SettingItem
                                icon="information-circle"
                                title="About MarkIt"
                                subtitle="v1.0.0"
                                color="#6366f1"
                                onPress={() => Alert.alert("MarkIt v1.0.0", "Designed for students, by students.")}
                            />
                            <SettingItem
                                icon="share-social"
                                title="Share MarkIt"
                                subtitle="Invite your friends"
                                color="#10b981"
                                onPress={handleShareApp}
                                rightElement={
                                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                }
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
                        <TouchableOpacity
                            style={[styles.logoutBtn]}
                            onPress={handleLogout}
                            disabled={loggingOut}
                        >
                            <LinearGradient
                                colors={['#ef4444', '#dc2626']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.logoutGradient}
                            >
                                <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.logoutText}>{loggingOut ? "Logging Out..." : "Log Out"}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <Text style={[styles.credits, { color: colors.textSecondary }]}>
                            Made with ❤️ by Bharat Kumar
                        </Text>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 20,
    },
    card: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    settingSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    logoutBtn: {
        marginTop: 10,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    credits: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 12,
        opacity: 0.6,
    },
});
