import DonutChart from '@/components/DonutChart';
import { ScalePressable } from '@/components/ScalePressable';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { Text } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { AnalyticsService } from '@/services/analytics';
import { AttendanceService } from '@/services/attendance';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Slider as AwesomeSlider } from 'react-native-awesome-slider';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ... imports
import { SmartBunkPlanner } from '@/components/SmartBunkPlanner';

const PredictSkeleton = ({ colors, insets }: { colors: any; insets: any }) => (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
            <SkeletonLoader width={200} height={28} borderRadius={8} />
        </View>

        <View style={styles.content}>
            {/* Current Status Card */}
            <View style={[styles.card, { backgroundColor: colors.card, padding: 20, marginBottom: 24 }]}>
                <SkeletonLoader width={120} height={13} borderRadius={4} style={{ marginBottom: 16 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                    {/* Donut chart placeholder */}
                    <SkeletonLoader width={100} height={100} borderRadius={50} />
                    {/* Stats */}
                    <View style={{ justifyContent: 'center' }}>
                        <SkeletonLoader width={100} height={24} borderRadius={6} />
                        <SkeletonLoader width={120} height={14} borderRadius={4} style={{ marginTop: 8 }} />
                        <SkeletonLoader width={90} height={24} borderRadius={12} style={{ marginTop: 10 }} />
                    </View>
                </View>
            </View>

            {/* Tab Switcher */}
            <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: colors.card, borderRadius: 12, padding: 4 }}>
                <SkeletonLoader width="48%" height={36} borderRadius={8} style={{ marginRight: '4%' }} />
                <SkeletonLoader width="48%" height={36} borderRadius={8} />
            </View>

            {/* Section Title */}
            <SkeletonLoader width={130} height={13} borderRadius={4} style={{ marginBottom: 16 }} />

            {/* Content Card */}
            <View style={[styles.card, { backgroundColor: colors.card, padding: 20 }]}>
                {/* Calendar grid placeholder */}
                <SkeletonLoader width="100%" height={40} borderRadius={8} style={{ marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <SkeletonLoader key={i} width={36} height={36} borderRadius={8} />
                    ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <SkeletonLoader key={i} width={36} height={36} borderRadius={8} />
                    ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <SkeletonLoader key={i} width={36} height={36} borderRadius={8} />
                    ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <SkeletonLoader key={i} width={36} height={36} borderRadius={8} />
                    ))}
                </View>
            </View>
        </View>
    </View>
);

export default function PredictScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ attended: 0, total: 0, percentage: 0 });
    const [viewMode, setViewMode] = useState<'basic' | 'calendar'>('calendar'); // Default to calendar

    // Existing "Basic" state
    const [predictMode, setPredictMode] = useState<'attend' | 'miss'>('miss');
    const [predictionCount, setPredictionCount] = useState(1);

    // Animation state for "Attend/Miss" tabs
    const [layoutWidth, setLayoutWidth] = useState(0);
    const translateX = useSharedValue(0);

    // Shared values for slider
    const progress = useSharedValue(1);
    const min = useSharedValue(1);
    const max = useSharedValue(20);

    const pillStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }]
        };
    });

    useEffect(() => {
        if (layoutWidth > 0) {
            translateX.value = withSpring(predictMode === 'attend' ? 0 : (layoutWidth - 8) / 2);
        }
    }, [predictMode, layoutWidth, translateX]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const summaryData = await AttendanceService.getAttendance();
            if (summaryData) {
                setStats({
                    attended: summaryData.semesterTotal.attended,
                    total: summaryData.semesterTotal.total,
                    percentage: summaryData.overallPercentage
                });
            }
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const currentPredicted = AnalyticsService.predictFuture(
        stats.attended,
        stats.total,
        predictMode === 'attend' ? predictionCount : 0,
        predictMode === 'miss' ? predictionCount : 0
    );

    const diff = predictMode === 'attend'
        ? (currentPredicted - stats.percentage).toFixed(1)
        : (stats.percentage - currentPredicted).toFixed(1);

    if (loading) {
        return <PredictSkeleton colors={colors} insets={insets} />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Attendance Goals 🎯</Text>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Current Stats */}
                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    style={[styles.card, { backgroundColor: colors.card, padding: 20, marginBottom: 24 }]}
                >
                    <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 16, fontWeight: '600' }}>CURRENT STATUS</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                        <DonutChart percentage={stats.percentage} radius={50} strokeWidth={10} color={stats.percentage >= 75 ? colors.success : colors.primary} />
                        <View style={{ marginLeft: 0, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                                {stats.attended} <Text style={{ fontSize: 16, color: colors.textSecondary }}>/ {stats.total}</Text>
                            </Text>
                            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Classes Attended</Text>

                            <View style={{
                                backgroundColor: stats.percentage >= 75 ? (colors.success + '20') : ((colors.error || '#FF5252') + '20'),
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 12,
                                alignSelf: 'flex-start'
                            }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: stats.percentage >= 75 ? colors.success : (colors.error || '#FF5252') }}>
                                    {stats.percentage >= 75 ? 'On Track 🚀' : 'Risk Zone ⚠️'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Main Feature Switcher */}
                <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: colors.card, borderRadius: 12, padding: 4 }}>
                    <ScalePressable
                        onPress={() => { setViewMode('calendar'); Haptics.selectionAsync(); }}
                        style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: viewMode === 'calendar' ? colors.primary : 'transparent' }}
                    >
                        <Text style={{ fontWeight: '600', color: viewMode === 'calendar' ? '#fff' : colors.textSecondary }}>Smart Planner</Text>
                    </ScalePressable>
                    <ScalePressable
                        onPress={() => { setViewMode('basic'); Haptics.selectionAsync(); }}
                        style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: viewMode === 'basic' ? colors.primary : 'transparent' }}
                    >
                        <Text style={{ fontWeight: '600', color: viewMode === 'basic' ? '#fff' : colors.textSecondary }}>Calculator</Text>
                    </ScalePressable>
                </View>

                {viewMode === 'basic' ? (
                    /* Crystal Ball (Existing) */
                    <Animated.View entering={FadeInDown.springify()}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CRYSTAL BALL</Text>
                        <View style={[styles.card, { backgroundColor: colors.card, padding: 20 }]}>
                            {/* Mode Switch */}
                            <View
                                onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
                                style={{
                                    flexDirection: 'row',
                                    backgroundColor: colors.background,
                                    borderRadius: 12,
                                    padding: 4,
                                    marginBottom: 24,
                                    position: 'relative'
                                }}
                            >
                                <Animated.View style={[{
                                    position: 'absolute',
                                    top: 4,
                                    bottom: 4,
                                    left: 4,
                                    width: layoutWidth > 0 ? (layoutWidth - 8) / 2 : '50%',
                                    borderRadius: 8,
                                    backgroundColor: predictMode === 'attend' ? colors.primary : (colors.error || '#FF5252'),
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }, pillStyle]} />

                                <ScalePressable
                                    onPress={() => { setPredictMode('attend'); Haptics.selectionAsync(); }}
                                    style={styles.tabButton}
                                >
                                    <Text style={{ fontWeight: '600', color: predictMode === 'attend' ? '#FFF' : colors.textSecondary }}>If I Attend</Text>
                                </ScalePressable>
                                <ScalePressable
                                    onPress={() => { setPredictMode('miss'); Haptics.selectionAsync(); }}
                                    style={styles.tabButton}
                                >
                                    <Text style={{ fontWeight: '600', color: predictMode === 'miss' ? '#FFF' : colors.textSecondary }}>If I Miss</Text>
                                </ScalePressable>
                            </View>

                            {/* Slider Controls */}
                            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 }}>
                                    <Text style={{ fontSize: 40, fontWeight: 'bold', color: colors.text }}>{predictionCount}</Text>
                                    <Text style={{ fontSize: 16, color: colors.textSecondary, marginLeft: 6 }}>
                                        Next {predictionCount === 1 ? 'Class' : 'Classes'}
                                    </Text>
                                </View>

                                <View style={{ width: '100%', height: 40, justifyContent: 'center' }}>
                                    <AwesomeSlider
                                        style={{ width: '100%', height: 40 }}
                                        progress={progress}
                                        minimumValue={min}
                                        maximumValue={max}
                                        step={1}
                                        onValueChange={(val: number) => {
                                            const discrete = Math.round(val);
                                            if (discrete !== predictionCount) {
                                                setPredictionCount(discrete);
                                                Haptics.selectionAsync();
                                            }
                                        }}
                                        onHapticFeedback={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                        theme={{
                                            disableMinTrackTintColor: colors.cardBorder || '#E0E0E0',
                                            maximumTrackTintColor: colors.cardBorder || '#E0E0E0',
                                            minimumTrackTintColor: predictMode === 'attend' ? colors.primary : (colors.error || '#FF5252'),
                                            cacheTrackTintColor: '#0000',
                                            bubbleBackgroundColor: '#0000',
                                            heartbeatColor: predictMode === 'attend' ? colors.primary : (colors.error || '#FF5252'),
                                        }}
                                        thumbWidth={16}
                                        renderBubble={() => null}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 0, marginTop: 4 }}>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>1</Text>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>20</Text>
                                </View>
                            </View>

                            {/* Result */}
                            <View style={{ alignItems: 'center', padding: 20, backgroundColor: colors.background, borderRadius: 16 }}>
                                <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}>NEW PERCENTAGE</Text>
                                <Text style={{ fontSize: 42, fontWeight: 'bold', color: predictMode === 'attend' ? colors.success : (colors.error || '#FF5252') }}>
                                    {currentPredicted.toFixed(1)}%
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: predictMode === 'attend' ? colors.success + '20' : (colors.error || '#FF5252') + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                                    <Ionicons name={predictMode === 'attend' ? "trending-up" : "trending-down"} size={16} color={predictMode === 'attend' ? colors.success : (colors.error || '#FF5252')} />
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: predictMode === 'attend' ? colors.success : (colors.error || '#FF5252'), marginLeft: 6 }}>
                                        {predictMode === 'attend' ? `+${diff}%` : `-${diff}%`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                ) : (
                    /* Smart Bunk Planner (New) */
                    <Animated.View entering={FadeInDown.springify()}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PLAN MY BUNKS</Text>
                        <SmartBunkPlanner
                            currentAttended={stats.attended}
                            currentTotal={stats.total}
                            currentPercentage={stats.percentage}
                            colors={colors}
                        />
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold' },
    content: { padding: 20, paddingBottom: 100 },
    card: { borderRadius: 24, marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 16, letterSpacing: 0.5 },
    tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, zIndex: 1 }
});
