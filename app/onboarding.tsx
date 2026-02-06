
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = 'has_seen_onboarding';

interface Slide {
    id: number;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    color: string;
}

const slides: Slide[] = [
    {
        id: 1,
        icon: 'school-outline',
        title: 'Track Attendance',
        subtitle: 'Monitor your attendance percentage in real-time. Never miss the 75% threshold!',
        color: '#3b82f6',
    },
    {
        id: 2,
        icon: 'notifications-outline',
        title: 'Smart Alerts',
        subtitle: 'Get notified when your attendance is marked. Stay updated even in background!',
        color: '#8b5cf6',
    },
    {
        id: 3,
        icon: 'analytics-outline',
        title: 'Predict & Plan',
        subtitle: 'Calculate how many classes you can bunk while staying safe. Plan smarter!',
        color: '#10b981',
    },
    {
        id: 4,
        icon: 'rocket-outline',
        title: 'Ready to Go!',
        subtitle: 'Login with your ERP credentials and take control of your attendance.',
        color: '#f59e0b',
    },
];

export default function Onboarding() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useSharedValue(0);

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
            translateX.value = withSpring(-((currentIndex + 1) * width));
        } else {
            // Mark onboarding as complete
            try {
                await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
                console.log('[Onboarding] Saved key, navigating to login...');
            } catch (e) {
                console.error('[Onboarding] Failed to save key:', e);
            }
            router.replace('/login');
        }
    };

    const handleSkip = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            console.log('[Onboarding] Skipped, saved key...');
        } catch (e) {
            console.error('[Onboarding] Failed to save key on skip:', e);
        }
        router.replace('/login');
    };

    const currentSlide = slides[currentIndex];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Skip Button */}
                {currentIndex < slides.length - 1 && (
                    <Animated.View entering={FadeInUp.delay(200)} style={styles.skipContainer}>
                        <TouchableOpacity onPress={handleSkip}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Icon */}
                    <Animated.View
                        key={currentSlide.id}
                        entering={FadeInDown.duration(500).springify()}
                        style={[styles.iconContainer, { backgroundColor: `${currentSlide.color}20` }]}
                    >
                        <View style={[styles.iconInner, { backgroundColor: `${currentSlide.color}40` }]}>
                            <Ionicons name={currentSlide.icon} size={80} color={currentSlide.color} />
                        </View>
                    </Animated.View>

                    {/* Text */}
                    <Animated.View
                        key={`text-${currentSlide.id}`}
                        entering={FadeInDown.delay(150).duration(500).springify()}
                        style={styles.textContainer}
                    >
                        <Text style={styles.title}>{currentSlide.title}</Text>
                        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
                    </Animated.View>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {slides.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: index === currentIndex ? currentSlide.color : 'rgba(255,255,255,0.3)',
                                        width: index === currentIndex ? 24 : 8,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Next/Get Started Button */}
                    <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
                        <LinearGradient
                            colors={[currentSlide.color, currentSlide.color + 'cc']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextButton}
                        >
                            <Text style={styles.nextButtonText}>
                                {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                            </Text>
                            <Ionicons
                                name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
                                size={20}
                                color="#fff"
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
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
    skipContainer: {
        alignItems: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    skipText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    iconInner: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 24,
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

// Helper to check if onboarding should be shown
export const shouldShowOnboarding = async (): Promise<boolean> => {
    try {
        const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        return hasSeenOnboarding !== 'true';
    } catch {
        return true;
    }
};
