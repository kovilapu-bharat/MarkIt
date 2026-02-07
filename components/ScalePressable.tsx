import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface ScalePressableProps extends PressableProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ScalePressable: React.FC<ScalePressableProps> = ({
    children,
    style,
    scaleTo = 0.96,
    onPressIn,
    onPressOut,
    ...props
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = (event: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSpring(scaleTo, { damping: 10, stiffness: 300 });
        onPressIn?.(event);
    };

    const handlePressOut = (event: any) => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        onPressOut?.(event);
    };

    return (
        <AnimatedPressable
            style={[style, animatedStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            {...props}
        >
            {children}
        </AnimatedPressable>
    );
};
