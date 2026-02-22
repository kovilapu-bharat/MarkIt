
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, Modal, Platform, ScrollView, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
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

            {/* Privacy Policy Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={showPrivacyModal}
                onRequestClose={() => setShowPrivacyModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <LinearGradient
                        colors={isDark ? ['#1e3a5f', '#0f172a'] : ['#3b82f6', '#1d4ed8']}
                        style={styles.policyHeader}
                    >
                        <SafeAreaView>
                            <View style={styles.policyHeaderContent}>
                                <TouchableOpacity onPress={() => setShowPrivacyModal(false)} style={styles.policyBackBtn}>
                                    <Ionicons name="arrow-back" size={24} color="#fff" />
                                </TouchableOpacity>
                                <View style={styles.policyHeaderIcon}>
                                    <Ionicons name="shield-checkmark" size={48} color="#fff" />
                                </View>
                                <Text style={styles.policyHeaderTitle}>Privacy Policy</Text>
                                <Text style={styles.policyHeaderSubtitle}>Last updated: February 2026</Text>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>

                    <ScrollView
                        contentContainerStyle={styles.policyScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Introduction Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                                <Ionicons name="information-circle" size={24} color="#3b82f6" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Introduction</Text>
                            <Text style={[styles.policySectionText, { color: colors.textSecondary }]}>
                                Welcome to Clgpo. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our mobile application.
                            </Text>
                        </View>

                        {/* Data Collection Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                                <Ionicons name="folder-open" size={24} color="#8b5cf6" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Information We Collect</Text>

                            <View style={styles.policyDataItem}>
                                <View style={[styles.policyDataIcon, { backgroundColor: '#10b981' + '20' }]}>
                                    <Ionicons name="key" size={16} color="#10b981" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.policyDataTitle, { color: colors.text }]}>Login Credentials</Text>
                                    <Text style={[styles.policyDataDesc, { color: colors.textSecondary }]}>Stored securely on your device using encrypted storage. Never transmitted to our servers.</Text>
                                </View>
                            </View>

                            <View style={styles.policyDataItem}>
                                <View style={[styles.policyDataIcon, { backgroundColor: '#f59e0b' + '20' }]}>
                                    <Ionicons name="calendar" size={16} color="#f59e0b" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.policyDataTitle, { color: colors.text }]}>Attendance Data</Text>
                                    <Text style={[styles.policyDataDesc, { color: colors.textSecondary }]}>Fetched directly from your college ERP and cached locally for offline access.</Text>
                                </View>
                            </View>

                            <View style={styles.policyDataItem}>
                                <View style={[styles.policyDataIcon, { backgroundColor: '#ec4899' + '20' }]}>
                                    <Ionicons name="person" size={16} color="#ec4899" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.policyDataTitle, { color: colors.text }]}>Profile Information</Text>
                                    <Text style={[styles.policyDataDesc, { color: colors.textSecondary }]}>Basic details (name, roll number, department) retrieved from ERP and stored locally.</Text>
                                </View>
                            </View>
                        </View>

                        {/* Data Usage Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#10b981' + '20' }]}>
                                <Ionicons name="analytics" size={24} color="#10b981" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>How We Use Your Data</Text>

                            {['Display attendance statistics', 'Provide 75% predictions', 'Send smart notifications', 'Enable offline access', 'Improve app experience'].map((item, index) => (
                                <View key={index} style={styles.policyListItem}>
                                    <Ionicons name="checkmark-circle" size={18} color="#10b981" style={{ marginRight: 10 }} />
                                    <Text style={[styles.policyListText, { color: colors.textSecondary }]}>{item}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Security Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#ef4444' + '20' }]}>
                                <Ionicons name="lock-closed" size={24} color="#ef4444" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Data Security</Text>
                            <Text style={[styles.policySectionText, { color: colors.textSecondary, marginBottom: 12 }]}>
                                All sensitive data is stored locally using secure, encrypted storage mechanisms.
                            </Text>

                            {['Device-level encryption', 'No external uploads', 'HTTPS communication', 'No tracking SDKs'].map((item, index) => (
                                <View key={index} style={styles.policyListItem}>
                                    <Ionicons name="shield" size={18} color="#ef4444" style={{ marginRight: 10 }} />
                                    <Text style={[styles.policyListText, { color: colors.textSecondary }]}>{item}</Text>
                                </View>
                            ))}
                        </View>

                        {/* No Sharing Banner */}
                        <LinearGradient
                            colors={isDark ? ['#065f46', '#064e3b'] : ['#d1fae5', '#a7f3d0']}
                            style={styles.policyBanner}
                        >
                            <Ionicons name="checkmark-done-circle" size={32} color={isDark ? '#10b981' : '#047857'} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={[styles.policyBannerTitle, { color: isDark ? '#fff' : '#064e3b' }]}>We Never Share Your Data</Text>
                                <Text style={[styles.policyBannerText, { color: isDark ? '#a7f3d0' : '#047857' }]}>Your data stays on your device and is only transmitted to your college ERP.</Text>
                            </View>
                        </LinearGradient>

                        {/* Your Rights Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#6366f1' + '20' }]}>
                                <Ionicons name="hand-left" size={24} color="#6366f1" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Your Rights</Text>

                            <View style={styles.policyRightsGrid}>
                                <View style={[styles.policyRightItem, { backgroundColor: colors.badge }]}>
                                    <Ionicons name="eye" size={20} color={colors.primary} />
                                    <Text style={[styles.policyRightText, { color: colors.text }]}>Access</Text>
                                </View>
                                <View style={[styles.policyRightItem, { backgroundColor: colors.badge }]}>
                                    <Ionicons name="trash" size={20} color="#ef4444" />
                                    <Text style={[styles.policyRightText, { color: colors.text }]}>Delete</Text>
                                </View>
                                <View style={[styles.policyRightItem, { backgroundColor: colors.badge }]}>
                                    <Ionicons name="log-out" size={20} color="#f59e0b" />
                                    <Text style={[styles.policyRightText, { color: colors.text }]}>Logout</Text>
                                </View>
                                <View style={[styles.policyRightItem, { backgroundColor: colors.badge }]}>
                                    <Ionicons name="close-circle" size={20} color="#8b5cf6" />
                                    <Text style={[styles.policyRightText, { color: colors.text }]}>Uninstall</Text>
                                </View>
                            </View>
                        </View>

                        {/* Contact Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginBottom: 40 }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#06b6d4' + '20' }]}>
                                <Ionicons name="mail" size={24} color="#06b6d4" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Contact Us</Text>
                            <Text style={[styles.policySectionText, { color: colors.textSecondary }]}>
                                Have questions about this Privacy Policy?
                            </Text>
                            <TouchableOpacity
                                style={styles.policyContactBtn}
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL('https://www.linkedin.com/in/bharatkumarkovilapu/'); }}
                            >
                                <Ionicons name="logo-linkedin" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.policyContactBtnText}>Connect on LinkedIn</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Terms of Service Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={showTermsModal}
                onRequestClose={() => setShowTermsModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <LinearGradient
                        colors={isDark ? ['#7c3aed', '#4c1d95'] : ['#8b5cf6', '#6d28d9']}
                        style={styles.policyHeader}
                    >
                        <SafeAreaView>
                            <View style={styles.policyHeaderContent}>
                                <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.policyBackBtn}>
                                    <Ionicons name="arrow-back" size={24} color="#fff" />
                                </TouchableOpacity>
                                <View style={styles.policyHeaderIcon}>
                                    <Ionicons name="document-text" size={48} color="#fff" />
                                </View>
                                <Text style={styles.policyHeaderTitle}>Terms of Service</Text>
                                <Text style={styles.policyHeaderSubtitle}>Last updated: February 2026</Text>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>

                    <ScrollView
                        contentContainerStyle={styles.policyScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Acceptance Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                                <Ionicons name="checkbox" size={24} color="#8b5cf6" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Acceptance of Terms</Text>
                            <Text style={[styles.policySectionText, { color: colors.textSecondary }]}>
                                By downloading, installing, or using Clgpo, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
                            </Text>
                        </View>

                        {/* Service Description Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                                <Ionicons name="apps" size={24} color="#3b82f6" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Description of Service</Text>
                            <Text style={[styles.policySectionText, { color: colors.textSecondary, marginBottom: 12 }]}>
                                Clgpo is a student utility application that helps you track your college attendance by connecting to your ERP system.
                            </Text>

                            {['Real-time attendance tracking', 'Predictions & analytics', 'Exam results viewing', 'Fee receipt management', 'Smart notifications'].map((item, index) => (
                                <View key={index} style={styles.policyListItem}>
                                    <Ionicons name="checkmark-circle" size={18} color="#3b82f6" style={{ marginRight: 10 }} />
                                    <Text style={[styles.policyListText, { color: colors.textSecondary }]}>{item}</Text>
                                </View>
                            ))}
                        </View>

                        {/* User Responsibilities Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#f59e0b' + '20' }]}>
                                <Ionicons name="person-circle" size={24} color="#f59e0b" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>User Responsibilities</Text>

                            {['Keep login credentials confidential', 'Use only for intended purpose', 'Maintain device security', 'No reverse engineering', 'Follow institution policies'].map((item, index) => (
                                <View key={index} style={styles.policyListItem}>
                                    <Ionicons name="alert-circle" size={18} color="#f59e0b" style={{ marginRight: 10 }} />
                                    <Text style={[styles.policyListText, { color: colors.textSecondary }]}>{item}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Disclaimer Banner */}
                        <LinearGradient
                            colors={isDark ? ['#7f1d1d', '#450a0a'] : ['#fef2f2', '#fecaca']}
                            style={styles.policyBanner}
                        >
                            <Ionicons name="warning" size={32} color={isDark ? '#fca5a5' : '#b91c1c'} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={[styles.policyBannerTitle, { color: isDark ? '#fff' : '#7f1d1d' }]}>Disclaimer</Text>
                                <Text style={[styles.policyBannerText, { color: isDark ? '#fecaca' : '#991b1b' }]}>Clgpo is provided &quot;as is&quot; without warranties. Data accuracy depends on ERP system.</Text>
                            </View>
                        </LinearGradient>

                        {/* Liability Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#ef4444' + '20' }]}>
                                <Ionicons name="shield-half" size={24} color="#ef4444" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Limitation of Liability</Text>
                            <Text style={[styles.policySectionText, { color: colors.textSecondary }]}>
                                Clgpo and its developers shall not be liable for any damages arising from use or inability to use the application, incorrect data, or academic decisions made based on app information.
                            </Text>
                        </View>

                        {/* Legal Grid */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#6366f1' + '20' }]}>
                                <Ionicons name="library" size={24} color="#6366f1" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Legal Terms</Text>

                            <View style={styles.policyRightsGrid}>
                                <View style={[styles.policyRightItem, { backgroundColor: colors.badge }]}>
                                    <Ionicons name="bulb" size={20} color="#f59e0b" />
                                    <Text style={[styles.policyRightText, { color: colors.text }]}>IP Rights</Text>
                                </View>
                                <View style={[styles.policyRightItem, { backgroundColor: colors.badge }]}>
                                    <Ionicons name="link" size={20} color="#3b82f6" />
                                    <Text style={[styles.policyRightText, { color: colors.text }]}>Third-Party</Text>
                                </View>
                                <View style={[styles.policyRightItem, { backgroundColor: colors.badge }]}>
                                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                                    <Text style={[styles.policyRightText, { color: colors.text }]}>Termination</Text>
                                </View>
                                <View style={[styles.policyRightItem, { backgroundColor: colors.badge }]}>
                                    <Ionicons name="refresh" size={20} color="#10b981" />
                                    <Text style={[styles.policyRightText, { color: colors.text }]}>Updates</Text>
                                </View>
                            </View>
                        </View>

                        {/* Contact Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginBottom: 40 }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                                <Ionicons name="chatbubbles" size={24} color="#8b5cf6" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Questions?</Text>
                            <Text style={[styles.policySectionText, { color: colors.textSecondary }]}>
                                Have questions about these Terms of Service?
                            </Text>
                            <TouchableOpacity
                                style={[styles.policyContactBtn, { backgroundColor: '#8b5cf6' }]}
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL('https://www.linkedin.com/in/bharatkumarkovilapu/'); }}
                            >
                                <Ionicons name="logo-linkedin" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.policyContactBtnText}>Connect on LinkedIn</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* About Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={showAboutModal}
                onRequestClose={() => setShowAboutModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <LinearGradient
                        colors={isDark ? ['#059669', '#065f46'] : ['#10b981', '#059669']}
                        style={styles.aboutHeader}
                    >
                        <SafeAreaView>
                            <View style={styles.policyHeaderContent}>
                                <TouchableOpacity onPress={() => setShowAboutModal(false)} style={styles.policyBackBtn}>
                                    <Ionicons name="arrow-back" size={24} color="#fff" />
                                </TouchableOpacity>
                                <View style={styles.aboutLogoContainer}>
                                    <LinearGradient
                                        colors={['#fff', '#d1fae5']}
                                        style={styles.aboutLogoInner}
                                    >
                                        <Ionicons name="checkmark-done-circle" size={56} color="#059669" />
                                    </LinearGradient>
                                </View>
                                <Text style={styles.aboutHeaderTitle}>Clgpo</Text>
                                <View style={styles.versionBadge}>
                                    <Text style={styles.versionBadgeText}>Version {Constants.expoConfig?.version || '1.0.0'}</Text>
                                </View>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>

                    <ScrollView
                        contentContainerStyle={styles.policyScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Tagline Banner */}
                        <LinearGradient
                            colors={isDark ? ['#1e3a5f', '#0f172a'] : ['#eff6ff', '#dbeafe']}
                            style={styles.aboutTaglineBanner}
                        >
                            <Ionicons name="sparkles" size={24} color={isDark ? '#60a5fa' : '#2563eb'} />
                            <Text style={[styles.aboutTagline, { color: isDark ? '#93c5fd' : '#1e40af' }]}>
                                Your Personal Attendance Companion
                            </Text>
                        </LinearGradient>

                        {/* Description Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#10b981' + '20' }]}>
                                <Ionicons name="information-circle" size={24} color="#10b981" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>What is Clgpo?</Text>
                            <Text style={[styles.policySectionText, { color: colors.textSecondary }]}>
                                Clgpo is designed specifically for students who want to stay on top of their attendance. Track your attendance, predict future requirements, and never fall below the 75% threshold again!
                            </Text>
                        </View>

                        {/* Features Grid */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                                <Ionicons name="grid" size={24} color="#3b82f6" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Features</Text>

                            <View style={styles.aboutFeaturesGrid}>
                                <View style={[styles.aboutFeatureCard, { backgroundColor: colors.badge }]}>
                                    <View style={[styles.aboutFeatureIcon, { backgroundColor: '#10b981' + '20' }]}>
                                        <Ionicons name="stats-chart" size={24} color="#10b981" />
                                    </View>
                                    <Text style={[styles.aboutFeatureTitle, { color: colors.text }]}>Live Tracking</Text>
                                    <Text style={[styles.aboutFeatureDesc, { color: colors.textSecondary }]}>Real-time updates</Text>
                                </View>

                                <View style={[styles.aboutFeatureCard, { backgroundColor: colors.badge }]}>
                                    <View style={[styles.aboutFeatureIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                                        <Ionicons name="calculator" size={24} color="#3b82f6" />
                                    </View>
                                    <Text style={[styles.aboutFeatureTitle, { color: colors.text }]}>Smart Predictions</Text>
                                    <Text style={[styles.aboutFeatureDesc, { color: colors.textSecondary }]}>Know your limits</Text>
                                </View>

                                <View style={[styles.aboutFeatureCard, { backgroundColor: colors.badge }]}>
                                    <View style={[styles.aboutFeatureIcon, { backgroundColor: '#f59e0b' + '20' }]}>
                                        <Ionicons name="school" size={24} color="#f59e0b" />
                                    </View>
                                    <Text style={[styles.aboutFeatureTitle, { color: colors.text }]}>Results Viewer</Text>
                                    <Text style={[styles.aboutFeatureDesc, { color: colors.textSecondary }]}>Check grades fast</Text>
                                </View>

                                <View style={[styles.aboutFeatureCard, { backgroundColor: colors.badge }]}>
                                    <View style={[styles.aboutFeatureIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                                        <Ionicons name="receipt" size={24} color="#8b5cf6" />
                                    </View>
                                    <Text style={[styles.aboutFeatureTitle, { color: colors.text }]}>Fee Receipts</Text>
                                    <Text style={[styles.aboutFeatureDesc, { color: colors.textSecondary }]}>Easy management</Text>
                                </View>

                                <View style={[styles.aboutFeatureCard, { backgroundColor: colors.badge }]}>
                                    <View style={[styles.aboutFeatureIcon, { backgroundColor: '#ec4899' + '20' }]}>
                                        <Ionicons name="notifications" size={24} color="#ec4899" />
                                    </View>
                                    <Text style={[styles.aboutFeatureTitle, { color: colors.text }]}>Alerts</Text>
                                    <Text style={[styles.aboutFeatureDesc, { color: colors.textSecondary }]}>Never miss updates</Text>
                                </View>

                                <View style={[styles.aboutFeatureCard, { backgroundColor: colors.badge }]}>
                                    <View style={[styles.aboutFeatureIcon, { backgroundColor: '#06b6d4' + '20' }]}>
                                        <Ionicons name="cloud-offline" size={24} color="#06b6d4" />
                                    </View>
                                    <Text style={[styles.aboutFeatureTitle, { color: colors.text }]}>Offline Mode</Text>
                                    <Text style={[styles.aboutFeatureDesc, { color: colors.textSecondary }]}>Works anywhere</Text>
                                </View>
                            </View>
                        </View>

                        {/* Developer Card */}
                        <View style={[styles.policySectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.policySectionIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                                <Ionicons name="code-slash" size={24} color="#8b5cf6" />
                            </View>
                            <Text style={[styles.policySectionTitle, { color: colors.text }]}>Developer</Text>

                            <View style={styles.aboutDeveloperCard}>
                                <LinearGradient
                                    colors={isDark ? ['#4c1d95', '#7c3aed'] : ['#ede9fe', '#ddd6fe']}
                                    style={styles.aboutDevAvatar}
                                >
                                    <Text style={[styles.aboutDevInitial, { color: isDark ? '#fff' : '#7c3aed' }]}>BK</Text>
                                </LinearGradient>
                                <View style={styles.aboutDevInfo}>
                                    <Text style={[styles.aboutDevName, { color: colors.text }]}>Bharat Kumar</Text>
                                    <Text style={[styles.aboutDevRole, { color: colors.textSecondary }]}>Student Developer</Text>
                                </View>
                            </View>
                            <Text style={[styles.policySectionText, { color: colors.textSecondary, textAlign: 'center', marginTop: 12 }]}>
                                Built with ❤️ for fellow students who struggle to keep track of their attendance.
                            </Text>

                            <TouchableOpacity
                                style={[styles.policyContactBtn, { backgroundColor: '#0077b5' }]}
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL('https://www.linkedin.com/in/bharatkumarkovilapu/'); }}
                            >
                                <Ionicons name="logo-linkedin" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.policyContactBtnText}>Connect on LinkedIn</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Special Thanks */}
                        <LinearGradient
                            colors={isDark ? ['#1e3a5f', '#0f172a'] : ['#fef3c7', '#fde68a']}
                            style={[styles.policyBanner, { marginBottom: 20 }]}
                        >
                            <Ionicons name="heart" size={28} color={isDark ? '#fbbf24' : '#d97706'} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={[styles.policyBannerTitle, { color: isDark ? '#fde68a' : '#92400e' }]}>Special Thanks</Text>
                                <Text style={[styles.policyBannerText, { color: isDark ? '#fcd34d' : '#a16207' }]}>To all beta testers who helped make this app better!</Text>
                            </View>
                        </LinearGradient>

                        {/* Copyright */}
                        <Text style={[styles.aboutCopyright, { color: colors.textSecondary }]}>
                            © 2026 Clgpo. All rights reserved.
                        </Text>
                        <Text style={[styles.aboutMadeWith, { color: colors.textSecondary }]}>
                            Made with 💚 in India
                        </Text>
                    </ScrollView>
                </View>
            </Modal>
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
