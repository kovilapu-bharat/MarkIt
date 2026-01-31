import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Extrapolation,
    SharedValue,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabConfig {
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    label: string;
}

const TAB_CONFIG: Record<string, TabConfig> = {
    index: {
        icon: 'home-outline',
        activeIcon: 'home',
        label: 'Home',
    },
    login: {
        icon: 'log-in-outline',
        activeIcon: 'log-in',
        label: 'Login',
    },
    explore: {
        icon: 'calendar-outline',
        activeIcon: 'calendar',
        label: 'Calendar',
    },
    predict: {
        icon: 'flag-outline',
        activeIcon: 'flag',
        label: 'Goals',
    },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabBarItemProps {
    route: any;
    index: number;
    state: any;
    descriptors: any;
    navigation: any;
    activeIndex: SharedValue<number>;
}

function TabBarItem({ route, index, state, descriptors, navigation, activeIndex }: TabBarItemProps) {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const config = TAB_CONFIG[route.name] || {
        icon: 'ellipse-outline' as const,
        activeIcon: 'ellipse' as const,
        label: options.title || route.name,
    };

    const onPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    // Animated background style
    const animatedBgStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            activeIndex.value,
            [index - 0.5, index, index + 0.5],
            ['transparent', '#3a3a3c', 'transparent']
        );

        const scale = interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [0.95, 1, 0.95],
            Extrapolation.CLAMP
        );

        return {
            backgroundColor,
            transform: [{ scale }],
        };
    });

    // Animated icon style
    const animatedIconStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            activeIndex.value,
            [index - 0.3, index, index + 0.3],
            [1, 1.1, 1],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale }],
        };
    });

    // Animated label style
    const animatedLabelStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            activeIndex.value,
            [index - 0.4, index, index + 0.4],
            [0, 1, 0],
            Extrapolation.CLAMP
        );
        const translateX = interpolate(
            activeIndex.value,
            [index - 0.4, index, index + 0.4],
            [-5, 0, 5],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{ translateX }],
        };
    });

    return (
        <AnimatedPressable
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={[styles.tab, animatedBgStyle]}
        >
            <Animated.View style={animatedIconStyle}>
                <Ionicons
                    name={isFocused ? config.activeIcon : config.icon}
                    size={22}
                    color={isFocused ? '#fff' : '#666'}
                />
            </Animated.View>
            {isFocused && (
                <Animated.Text style={[styles.label, animatedLabelStyle]}>
                    {config.label}
                </Animated.Text>
            )}
        </AnimatedPressable>
    );
}

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const activeIndex = useSharedValue(state.index);
    const insets = useSafeAreaInsets();

    React.useEffect(() => {
        activeIndex.value = withSpring(state.index, {
            damping: 18,
            stiffness: 180,
            mass: 0.6,
        });
    }, [state.index, activeIndex]);

    return (
        <View style={[styles.container, { bottom: 20 + insets.bottom }]}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    // Filter out hidden routes if needed, but for now just render all
                    // We typically typically filter by options.title or similar if needed
                    // But here we just pass everything to TabBarItem

                    // IMPORTANT: Don't show the 'login' route in the tab bar if it accidentally got into the tab group
                    // But wait, the tab group only contains the screens defined in (tabs)/_layout.tsx
                    // app/login.tsx is OUTSIDE the (tabs) group so it won't appear here.
                    // However, 'index' (which we moved) is now 'login'.
                    // Wait, `app/(tabs)/index` still exists.
                    // `app/(tabs)/explore` exists.
                    // So we are good.

                    return (
                        <TabBarItem
                            key={route.key}
                            route={route}
                            index={index}
                            state={state}
                            descriptors={descriptors}
                            navigation={navigation}
                            activeIndex={activeIndex}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 60,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#1c1c1e',
        borderRadius: 30,
        paddingHorizontal: 8,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 46,
        paddingHorizontal: 18,
        borderRadius: 23,
        gap: 8,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
