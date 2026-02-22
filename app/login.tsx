import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthService } from '../services/auth';

const { width, height } = Dimensions.get('window');

// Random starting positions for orbs
const RandomOrb = ({ duration = 10000, size = 200, color = 'rgba(255,255,255,0.1)' }: any) => {
    const sv = useSharedValue(0);

    useEffect(() => {
        sv.value = withRepeat(
            withSequence(
                withTiming(1, { duration: duration / 2 }),
                withTiming(0, { duration: duration / 2 })
            ),
            -1,
            true
        );
    }, [duration, sv]);

    const style = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: sv.value * 100 },
                { translateX: sv.value * 50 },
                { scale: 1 + sv.value * 0.2 }
            ],
            opacity: 0.3 + sv.value * 0.3,
        };
    });

    return (
        <Animated.View
            style={[
                style,
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    top: Math.random() * height,
                    left: Math.random() * width - size / 2,
                }
            ]}
        />
    );
};

export default function LoginScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Animations
    const shakeTranslateX = useSharedValue(0);
    const breather = useSharedValue(1);

    useEffect(() => {
        breather.value = withRepeat(
            withTiming(1.05, { duration: 3000 }),
            -1,
            true
        );
    }, [breather]);

    const animatedLogoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: breather.value }]
    }));

    const triggerShake = () => {
        shakeTranslateX.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withRepeat(withTiming(10, { duration: 100 }), 5, true),
            withTiming(0, { duration: 50 })
        );
    };

    const shakeStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shakeTranslateX.value }],
        };
    });

    const handleLogin = async () => {
        if (!studentId || !password) {
            triggerShake();
            Alert.alert('Missing Info', 'Please enter your Roll Number and Password.');
            return;
        }

        Keyboard.dismiss();
        setLoading(true);
        try {
            await AuthService.login(studentId, password);

            // Success Sequence
            setLoading(false);
            setIsSuccess(true);

            // Delay navigation to show "SYSTEM ONLINE"
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 1500);

        } catch (error: any) {
            setLoading(false);
            triggerShake();
            Alert.alert('Access Denied', error.message || 'Invalid credentials.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar style={isDark ? "light" : "dark"} />

                {/* Background Gradient */}
                {/* Using a subtler gradient that matches app theme */}
                <LinearGradient
                    colors={isDark
                        ? [colors.background, '#1a1a1a']
                        : [colors.primary, colors.background]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.background}
                />

                {/* Animated Background Orbs (Graphix) */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <RandomOrb color={colors.primary} size={300} duration={8000} />
                    <RandomOrb color={isDark ? '#444' : '#fff'} delay={1000} size={200} duration={12000} />
                    <RandomOrb color={colors.primary} delay={2000} size={150} duration={6000} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'center' }}
                >
                    <View style={[styles.content, { marginTop: -insets.top }]}>

                        {/* Header */}
                        <Animated.View
                            entering={FadeInDown.delay(200).duration(1000).springify()}
                            style={styles.header}
                        >
                            <Animated.View style={[{ alignItems: 'center' }, animatedLogoStyle]}>
                                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }]}>
                                    <Ionicons name="school" size={60} color={isDark ? colors.text : '#fff'} />
                                </View>
                                <Text style={[styles.title, { color: isDark ? colors.text : '#fff' }]}>Clgpo</Text>
                                <Text style={[styles.subtitle, { color: isDark ? colors.textSecondary : 'rgba(255,255,255,0.8)' }]}>Student Portal Access</Text>
                                <View style={{ height: 2, width: 50, backgroundColor: isSuccess ? colors.success : colors.primary, marginTop: 10, borderRadius: 1 }} />
                            </Animated.View>
                        </Animated.View>

                        {/* Login Form Card */}
                        <Animated.View entering={FadeInUp.delay(400).duration(1000).springify()}>
                            <Animated.View style={[shakeStyle]}>
                                <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint={isDark ? 'dark' : 'light'} style={[styles.card, { backgroundColor: isDark ? 'rgba(30,30,30,0.6)' : 'rgba(255,255,255,0.8)', borderColor: colors.cardBorder }]}>
                                    <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome Back</Text>

                                    <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Roll Number"
                                            placeholderTextColor={colors.textSecondary}
                                            value={studentId}
                                            onChangeText={text => setStudentId(text.toUpperCase())}
                                            autoCapitalize="characters"
                                            autoCorrect={false}
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                                        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Password"
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={true}
                                            value={password}
                                            onChangeText={setPassword}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            {
                                                backgroundColor: isSuccess ? colors.success : colors.primary,
                                                opacity: (loading || isSuccess) ? 0.9 : 1
                                            }
                                        ]}
                                        onPress={handleLogin}
                                        disabled={loading || isSuccess}
                                        activeOpacity={0.8}
                                    >
                                        {loading ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 10 }} />
                                                <Text style={[styles.buttonText, { fontSize: 14, letterSpacing: 1 }]}>ESTABLISHING CONNECTION...</Text>
                                            </View>
                                        ) : isSuccess ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
                                                <Text style={[styles.buttonText, { letterSpacing: 2 }]}>SYSTEM ONLINE</Text>
                                            </View>
                                        ) : (
                                            <Text style={[styles.buttonText, { letterSpacing: 1 }]}>INITIATE LINK</Text>
                                        )}
                                    </TouchableOpacity>
                                </BlurView>
                            </Animated.View>
                        </Animated.View>

                        {/* Footer */}
                        <Animated.View
                            entering={FadeInUp.delay(600).duration(1000)}
                            style={styles.footer}
                        >
                            <Text style={[styles.footerText, { color: isDark ? colors.textSecondary : '#fff' }]}>Version 1.0.0</Text>
                        </Animated.View>

                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    card: {
        width: width * 0.9,
        borderRadius: 24,
        padding: 30,
        overflow: 'hidden',
        borderWidth: 1,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        marginBottom: 16,
        height: 56,
        paddingHorizontal: 16,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 40,
    },
    footerText: {
        fontSize: 12,
    },
});
