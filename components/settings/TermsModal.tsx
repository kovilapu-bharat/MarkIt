import { Text } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Linking, Modal, ScrollView, StyleSheet,  TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
    colors: any;
    isDark: boolean;
}

export const TermsModal = ({ visible, onClose, colors, isDark }: TermsModalProps) => {
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
                        colors={isDark ? ['#7c3aed', '#4c1d95'] : ['#8b5cf6', '#6d28d9']}
                        style={[styles.policyHeader, { paddingTop: insets.top }]}
                    >
                        <View style={styles.policyHeaderContent}>
                            <TouchableOpacity onPress={onClose} style={styles.policyBackBtn}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.policyHeaderIcon}>
                                <Ionicons name="document-text" size={48} color="#fff" />
                            </View>
                            <Text style={styles.policyHeaderTitle}>Terms of Service</Text>
                            <Text style={styles.policyHeaderSubtitle}>Last updated: February 2026</Text>
                        </View>
                    </LinearGradient>

                    <View style={styles.policyScrollContent}>
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
