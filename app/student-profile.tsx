import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { AuthService, StudentProfile } from '../services/auth';

const { width } = Dimensions.get('window');

export default function StudentProfileScreen() {
    const router = useRouter();
    useTheme();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const shimmerValue = useSharedValue(-1);

    useEffect(() => {
        const loadProfile = async () => {
            const data = await AuthService.getProfile();
            setProfile(data);
        };
        loadProfile();

        shimmerValue.value = withRepeat(
            withTiming(1, { duration: 2500 }),
            -1,
            false
        );
    }, [shimmerValue]);



    const shimmerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: interpolate(shimmerValue.value, [-1, 1], [-width, width]) }
            ],
            opacity: 0.3
        };
    });

    return (
        <View style={styles.container}>
            {/* Backdrop Blur & Overlay */}
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />

            <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />

            <View style={styles.modalContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Student Identity</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <Ionicons name="close-circle" size={36} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                </View>

                {/* Card Container */}
                <View style={styles.cardContainer}>

                    {/* ID Card */}
                    <View style={styles.idCard}>
                        <LinearGradient
                            colors={['#0f172a', '#1e293b', '#0f172a']} // Dark Slate Premium
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            {/* Watermark */}
                            <View style={styles.watermarkContainer}>
                                <Ionicons name="school" size={200} color="rgba(255,255,255,0.03)" />
                            </View>

                            {/* Gold Header Stripe */}
                            <LinearGradient
                                colors={['#FFD700', '#FDB931', '#FFD700']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.goldStripe}
                            />

                            <View style={styles.contentPadding}>
                                <View style={styles.collegeHeader}>
                                    <View style={styles.logoCircle}>
                                        <Ionicons name="school" size={20} color="#0f172a" />
                                    </View>
                                    <View>
                                        <Text style={styles.collegeName}>NRCM ENGINEERING</Text>
                                        <Text style={styles.collegeSub}>Autonomous Institution</Text>
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <View style={styles.photoFrame}>
                                        {profile?.profileImage ? (
                                            <Image source={{ uri: profile.profileImage }} style={styles.photo} />
                                        ) : (
                                            <View style={styles.photoPlaceholder}>
                                                <Ionicons name="person" size={50} color="#94a3b8" />
                                            </View>
                                        )}
                                        {/* Verified Badge */}
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                                        </View>
                                    </View>

                                    <View style={styles.details}>
                                        <Text style={styles.studentName}>{profile?.name || 'LOADING...'}</Text>
                                        <Text style={styles.rollNo}>{profile?.rollNo || '...'}</Text>
                                        <View style={styles.pillRow}>
                                            <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.pill}>
                                                <Text style={styles.pillText}>{profile?.year ? `YEAR ${profile.year}` : 'Student'}</Text>
                                            </LinearGradient>
                                            <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                                <Text style={styles.pillText}>{profile?.department || 'N/A'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.footerRow}>
                                    <View style={styles.footerInfo}>
                                        <View style={styles.infoBlock}>
                                            <Text style={styles.footerLabel}>VALID UNTIL</Text>
                                            <Text style={styles.footerValue}>{`MAY ${new Date().getFullYear() + 4}`}</Text>
                                        </View>
                                        <View style={styles.dividerVertical} />
                                        <View style={styles.infoBlock}>
                                            <Text style={styles.footerLabel}>ROLL NO</Text>
                                            <Text style={styles.footerValue}>{profile?.rollNo || '...'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Holographic Shine Overlay */}
                            <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]} pointerEvents="none">
                                <LinearGradient
                                    colors={['transparent', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ flex: 1, transform: [{ skewX: '-20deg' }] }}
                                />
                            </Animated.View>

                        </LinearGradient>
                    </View>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.95,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    closeBtn: {
        opacity: 0.8
    },

    // Card Styles
    cardContainer: {
        width: width * 0.88,
        aspectRatio: 0.65, // Standard ID Card ratio (approx)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 20,
    },
    idCard: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: '#0f172a',
    },
    cardGradient: {
        flex: 1,
    },
    goldStripe: {
        height: 6,
        width: '100%',
    },
    contentPadding: {
        flex: 1,
        padding: 24,
    },
    watermarkContainer: {
        position: 'absolute',
        bottom: -50,
        right: -50,
        opacity: 0.1,
        transform: [{ rotate: '-15deg' }]
    },

    collegeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        gap: 12,
    },
    logoCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFD700', // Gold
        justifyContent: 'center',
        alignItems: 'center',
    },
    collegeName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1.5,
    },
    collegeSub: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    cardBody: {
        alignItems: 'center',
        marginBottom: 20,
    },
    photoFrame: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: '#FFD700',
        padding: 4,
        marginBottom: 20,
        position: 'relative',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 66,
        backgroundColor: '#e2e8f0',
    },
    photoPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 66,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 2,
    },

    details: {
        alignItems: 'center',
        width: '100%',
    },
    studentName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    rollNo: {
        color: '#94a3b8',
        fontSize: 16,
        fontFamily: 'monospace', // Tech feel
        letterSpacing: 2,
        marginBottom: 16,
    },
    pillRow: {
        flexDirection: 'row',
        gap: 10,
    },
    pill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    pillText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
        marginBottom: 20,
    },

    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    infoBlock: {
        alignItems: 'center',
    },
    dividerVertical: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    footerLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 1,
    },
    footerValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
