import { useTheme } from '@/context/ThemeContext';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DonutChartProps {
    percentage: number;
    radius?: number;
    strokeWidth?: number;
    color?: string;
    max?: number;
}

export default function DonutChart({
    percentage,
    radius = 40,
    strokeWidth = 10,
    color,
    max = 100
}: DonutChartProps) {
    const { colors } = useTheme();
    const activeColor = color || colors.primary;
    const passiveColor = colors.cardBorder || '#E0E0E0';

    const halfCircle = radius + strokeWidth;
    const circumference = 2 * Math.PI * radius;

    const animatedValue = useSharedValue(0);

    useEffect(() => {
        // Animate to target percentage
        // Clamp between 0 and max
        const target = Math.min(Math.max(percentage, 0), max);
        animatedValue.value = withDelay(500, withTiming(target, { duration: 1500 }));
    }, [percentage, max]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - (circumference * animatedValue.value) / max;
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={{ width: halfCircle * 2, height: halfCircle * 2, alignItems: 'center', justifyContent: 'center' }}>
            <Svg
                width={radius * 2 + strokeWidth * 2}
                height={radius * 2 + strokeWidth * 2}
                viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
            >
                <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
                    <Circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke={passiveColor}
                        strokeWidth={strokeWidth}
                        strokeOpacity={0.2}
                        fill="transparent"
                    />
                    <AnimatedCircle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke={activeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </G>
            </Svg>
            <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: radius * 0.5, fontWeight: 'bold', color: colors.text }}>
                    {percentage.toFixed(1)}%
                </Text>
            </View>
        </View>
    );
}
