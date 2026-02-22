import { Text } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Linking, Modal, ScrollView, StyleSheet,  TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PrivacyModalProps {
    visible: boolean;
    onClose: () => void;
    colors: any;
    isDark: boolean;
}

export const PrivacyModal = ({ visible, onClose, colors, isDark }: PrivacyModalProps) => {
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
                        colors={isDark ? ['#1e3a5f', '#0f172a'] : ['#3b82f6', '#1d4ed8']}
                        style={[styles.policyHeader, { paddingTop: insets.top }]}
                    >
                        <View style={styles.policyHeaderContent}>
                            <TouchableOpacity onPress={onClose} style={styles.policyBackBtn}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.policyHeaderIcon}>
                                <Ionicons name="shield-checkmark" size={48} color="#fff" />
                            </View>
                            <Text style={styles.policyHeaderTitle}>Privacy Policy</Text>
                            <Text style={styles.policyHeaderSubtitle}>Last updated: February 2026</Text>
                        </View>
                    </LinearGradient>

                    <View style={styles.policyScrollContent}>
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
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal >
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    policyHeader: {
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
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
    policyHeaderIcon: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    policyHeaderTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    policyHeaderSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
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
    policyDataItem: {
        flexDirection: 'row',
        marginTop: 16,
    },
    policyDataIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    policyDataTitle: {
        fontSize: 16,
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
        marginTop: 12,
    },
    policyListText: {
        fontSize: 15,
        flex: 1,
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
    policyRightsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    policyRightItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    policyRightText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
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
});
