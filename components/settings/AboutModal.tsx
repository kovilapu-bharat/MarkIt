import { Text } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Linking, Modal, ScrollView, StyleSheet,  TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AboutModalProps {
    visible: boolean;
    onClose: () => void;
    colors: any;
    isDark: boolean;
}

export const AboutModal = ({ visible, onClose, colors, isDark }: AboutModalProps) => {
    const insets = useSafeAreaInsets();
    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <LinearGradient
                        colors={isDark ? ['#0f172a', '#1e293b'] : ['#1e293b', '#334155']}
                        style={[styles.aboutHeader, { paddingTop: insets.top }]}
                    >
                        <View style={styles.policyHeaderContent}>
                            <TouchableOpacity onPress={onClose} style={styles.policyBackBtn}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.aboutLogoContainer}>
                                <Image
                                    source={require('../../assets/images/Clgpo.png')}
                                    style={{ width: 80, height: 80, borderRadius: 20 }}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.aboutHeaderTitle}>Clgpo</Text>
                            <View style={styles.versionBadge}>
                                <Text style={styles.versionBadgeText}>Version {Constants.expoConfig?.version || '1.0.0'}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={styles.policyScrollContent}>
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
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    policyHeaderContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    policyBackBtn: {
        position: 'absolute',
        top: 10,
        left: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    policyScrollContent: {
        padding: 20,
    },
    policySectionCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    policySectionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    policySectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    policySectionText: {
        fontSize: 15,
        lineHeight: 24,
    },
    policyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    policyBannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    policyBannerText: {
        fontSize: 13,
        lineHeight: 18,
    },
    policyContactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#06b6d4',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 20,
    },
    policyContactBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    aboutHeader: {
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    aboutLogoContainer: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
    aboutLogoInner: {
        width: 100,
        height: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-10deg' }],
    },
    aboutHeaderTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
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
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        marginTop: 10,
    },
    aboutTagline: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    aboutFeaturesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    aboutFeatureCard: {
        width: '48%',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    aboutFeatureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    aboutFeatureTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    aboutFeatureDesc: {
        fontSize: 12,
        textAlign: 'center',
    },
    aboutDeveloperCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        borderRadius: 16,
        marginTop: 8,
    },
    aboutDevAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    aboutDevInitial: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    aboutDevInfo: {
        flex: 1,
    },
    aboutDevName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    aboutDevRole: {
        fontSize: 14,
    },
    aboutCopyright: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 10,
        fontWeight: '500',
    },
    aboutMadeWith: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 40,
    },
});
