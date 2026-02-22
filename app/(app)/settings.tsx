import { Text } from '@/components/ThemedText';

import { AboutModal } from '@/components/settings/AboutModal';
import { PrivacyModal } from '@/components/settings/PrivacyModal';
import { TermsModal } from '@/components/settings/TermsModal';
import { useTheme } from '@/context/ThemeContext';
import { useLogout } from '@/hooks/useLogout';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Settings() {
    const router = useRouter();
    const { colors, isDark, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const { handleLogout, loggingOut } = useLogout();

    // Mock state for notifications (would be connected to storage in real app)
    const [examAlerts, setExamAlerts] = useState(true);
    const [feeAlerts, setFeeAlerts] = useState(true);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);

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
                message: '📚 Check out Clgpo - the best app for tracking your college attendance!\n\nDownload it now and never miss the 75% threshold again! 🎯',
                title: 'Share Clgpo',
            });
        } catch {
            // Share cancelled or failed
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
                {/* Simple Header */}
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
                                            "To get reliable attendance notifications, please exclude Clgpo from battery optimization.\n\n1. Tap 'Open Settings'\n2. Find 'Clgpo'\n3. Select 'Don't optimize' or 'Unrestricted'",
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
                                subtitle="How we handle your data"
                                color="#3b82f6"
                                onPress={() => setShowPrivacyModal(true)}
                                rightElement={
                                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                }
                            />
                            <SettingItem
                                icon="document-text"
                                title="Terms of Service"
                                subtitle="Usage guidelines"
                                color="#8b5cf6"
                                onPress={() => setShowTermsModal(true)}
                                rightElement={
                                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                }
                            />
                            <SettingItem
                                icon="information-circle"
                                title="About Clgpo"
                                subtitle={`v${Constants.expoConfig?.version || '1.0.0'}`}
                                color="#6366f1"
                                onPress={() => setShowAboutModal(true)}
                                rightElement={
                                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                }
                            />
                            <SettingItem
                                icon="share-social"
                                title="Share Clgpo"
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

            <PrivacyModal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} colors={colors} isDark={isDark} />
            <TermsModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} colors={colors} isDark={isDark} />
            <AboutModal visible={showAboutModal} onClose={() => setShowAboutModal(false)} colors={colors} isDark={isDark} />
        </View >
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
    // Modal styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 20,
        paddingBottom: 40,
    },
    // Policy styles - Enhanced UI
    policyHeader: {
        paddingBottom: 30,
    },
    policyHeaderContent: {
        alignItems: 'center',
        paddingTop: 10,
    },
    policyBackBtn: {
        position: 'absolute',
        top: 10,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    policyHeaderIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    policyHeaderTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    policyHeaderSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    policyScrollContent: {
        padding: 20,
    },
    policySectionCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    policySectionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    policySectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    policySectionText: {
        fontSize: 15,
        lineHeight: 24,
    },
    policyDataItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.2)',
    },
    policyDataIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    policyDataTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    policyDataDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    policyListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    policyListText: {
        fontSize: 15,
        flex: 1,
    },
    policyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    policyBannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    policyBannerText: {
        fontSize: 14,
        lineHeight: 20,
    },
    policyRightsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 10,
    },
    policyRightItem: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
    },
    policyRightText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 10,
    },
    policyContactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#06b6d4',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginTop: 12,
    },
    policyContactBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    policyDate: {
        fontSize: 13,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    policyHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    policyText: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 8,
    },
    // About styles
    aboutLogo: {
        width: 120,
        height: 120,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    aboutAppName: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    aboutVersion: {
        fontSize: 16,
        marginBottom: 24,
    },
    aboutCard: {
        width: '100%',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    aboutDescription: {
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
    },
    aboutSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    featureText: {
        fontSize: 15,
        marginLeft: 12,
    },
    developerName: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    developerRole: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    developerDesc: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    copyright: {
        fontSize: 12,
        marginTop: 20,
        textAlign: 'center',
    },
    // Enhanced About styles
    aboutHeader: {
        paddingBottom: 30,
    },
    aboutLogoContainer: {
        marginBottom: 12,
    },
    aboutLogoInner: {
        width: 100,
        height: 100,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aboutHeaderTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    versionBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    versionBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    aboutTaglineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    aboutTagline: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
        flex: 1,
    },
    aboutFeaturesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8,
    },
    aboutFeatureCard: {
        width: '47%',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    aboutFeatureIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    aboutFeatureTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    aboutFeatureDesc: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 2,
    },
    aboutDeveloperCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    aboutDevAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aboutDevInitial: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    aboutDevInfo: {
        marginLeft: 12,
    },
    aboutDevName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    aboutDevRole: {
        fontSize: 14,
    },
    aboutCopyright: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 4,
    },
    aboutMadeWith: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 40,
    },
});
