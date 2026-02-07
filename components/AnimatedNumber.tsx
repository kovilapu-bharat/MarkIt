import React, { useEffect, useState } from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import {
    Easing,
    runOnJS,
    useAnimatedReaction,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface AnimatedNumberProps extends TextProps {
    value: number;
    style?: TextStyle | TextStyle[];
    duration?: number;
    prefix?: string;
    suffix?: string;
    isInt?: boolean; // If true, rounds to integer
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
    value,
    style,
    duration = 800,
    prefix = '',
    suffix = '',
    isInt = true,
    ...rest
}) => {
    const sv = useSharedValue(0);
    const [displayValue, setDisplayValue] = useState(prefix + '0' + suffix);

    useEffect(() => {
        sv.value = withTiming(value, {
            duration,
            easing: Easing.out(Easing.exp),
        });
    }, [value, duration, sv]);

    useAnimatedReaction(
        () => sv.value,
        (currentValue) => {
            const formatted = isInt
                ? Math.round(currentValue).toString()
                : currentValue.toFixed(1);
            runOnJS(setDisplayValue)(prefix + formatted + suffix);
        }
    );

    return (
        <Text style={style} {...rest}>
            {displayValue}
        </Text>
    );
};
