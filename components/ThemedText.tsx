import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

export interface TextProps extends RNTextProps {
    weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

export function Text({ style, weight = 'regular', ...rest }: TextProps) {
    let fontFamily = 'Inter_400Regular';

    if (weight === 'medium') fontFamily = 'Inter_500Medium';
    if (weight === 'semibold') fontFamily = 'Inter_600SemiBold';
    if (weight === 'bold') fontFamily = 'Inter_700Bold';
    if (weight === 'extrabold') fontFamily = 'Inter_800ExtraBold';

    // Override fontFamily if explicitly passed in style
    const flattenedStyle = StyleSheet.flatten(style) || {};
    const customStyle = { ...flattenedStyle } as any;

    // If the user explicitly provided a fontWeight, map it to our custom fonts
    if (customStyle.fontWeight) {
        const fw = customStyle.fontWeight;
        if (fw === '500') fontFamily = 'Inter_500Medium';
        else if (fw === '600') fontFamily = 'Inter_600SemiBold';
        else if (fw === 'bold' || fw === '700') fontFamily = 'Inter_700Bold';
        else if (fw === '800' || fw === '900') fontFamily = 'Inter_800ExtraBold';
        else if (fw === 'normal' || fw === '400') fontFamily = 'Inter_400Regular';

        // We can delete fontWeight to avoid clashes with fontFamily
        delete customStyle.fontWeight;
    }

    return <RNText style={[{ fontFamily }, customStyle]} {...rest} />;
}
