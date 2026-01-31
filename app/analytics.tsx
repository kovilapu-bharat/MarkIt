import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle, Defs, Line, Path, Stop, Svg, LinearGradient as SvgGradient } from 'react-native-svg';
import { AnalyticsService, TrendPoint } from '../services/analytics';
import { AttendanceService } from '../services/attendance';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 220;
const LEFT_PADDING = 30; // Space for Y-axis labels
const CHART_WIDTH = width - 48 - LEFT_PADDING;

const getBezierPath = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const controlX1 = current.x + (next.x - current.x) / 2;
        const controlY1 = current.y;
        const controlX2 = current.x + (next.x - current.x) / 2;
        const controlY2 = next.y;
        d += ` C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${next.x} ${next.y}`;
    }
    return d;
}

export default function AnalyticsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [trend, setTrend] = useState<TrendPoint[]>([]);
    const [stats, setStats] = useState({ attended: 0, total: 0, percentage: 0 });
    const [insights, setInsights] = useState({ streak: 0, recoveryDate: null as string | null });

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;



    useEffect(() => {
        loadData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {
        try {
            const [summaryData, dailyData] = await Promise.all([
                AttendanceService.getAttendance(),
                AttendanceService.getDateWiseAttendance()
            ]);

            if (dailyData?.days) {
                const trendData = AnalyticsService.calculateTrend(dailyData.days);
                setTrend(trendData);
                const streak = AnalyticsService.calculateStreak(dailyData.days);

                let recoveryDate = null;
                if (summaryData) {
                    recoveryDate = AnalyticsService.estimateRecoveryDate(
                        summaryData.semesterTotal.attended,
                        summaryData.semesterTotal.total
                    );
                }
                setInsights({ streak, recoveryDate });
            }

            if (summaryData) {
                setStats({
                    attended: summaryData.semesterTotal.attended,
                    total: summaryData.semesterTotal.total,
                    percentage: summaryData.overallPercentage
                });
            }

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true
            }).start();

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const chartPoints = useMemo(() => {
        return trend.map((t, i) => {
            const stepX = CHART_WIDTH / (trend.length - 1 || 1);
            const x = i * stepX;
            const y = CHART_HEIGHT - (t.percentage / 100) * CHART_HEIGHT;
            return { x, y, data: t };
        });
    }, [trend]);

    // ...

    const handleTouch = useCallback((x: number) => {
        if (chartPoints.length === 0) return;
        const clampedX = Math.max(0, Math.min(x, CHART_WIDTH));
        const stepX = CHART_WIDTH / (chartPoints.length - 1 || 1);
        const index = Math.round(clampedX / stepX);

        if (index >= 0 && index < chartPoints.length) {
            setSelectedIndex((prev) => {
                if (prev !== index) {
                    Haptics.selectionAsync();
                }
                return index;
            });
        }
    }, [chartPoints]);

    // Gesture Handler
    const handleTouchEnd = () => {
        setSelectedIndex(null);
    };

    const panGesture = useMemo(() => Gesture.Pan()
        .activeOffsetX([-10, 10]) // Allow vertical scroll if movement is small horizontally
        .failOffsetY([-10, 10])   // Capture if horizontal movement is detected
        .onBegin((e) => {
            runOnJS(handleTouch)(e.x);
        })
        .onUpdate((e) => {
            runOnJS(handleTouch)(e.x);
        })
        .onFinalize(() => {
            runOnJS(handleTouchEnd)();
        }), [handleTouch]);

    const linePath = useMemo(() => getBezierPath(chartPoints), [chartPoints]);
    const fillPath = linePath ? `${linePath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z` : '';
    const borderColor = colors.cardBorder || colors.textSecondary + '20';

    // Current display values (Selected or Latest)
    const currentPoint = selectedIndex !== null ? chartPoints[selectedIndex] : (chartPoints.length > 0 ? chartPoints[chartPoints.length - 1] : null);
    const displayPercentage = currentPoint ? currentPoint.data.percentage : stats.percentage;
    const displayDate = currentPoint ? currentPoint.data.date : 'Current';

    // Helper for Y-axis labels
    const yLabels = [100, 75, 50, 25, 0];

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />

                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Attendance Analytics</Text>
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.content}>
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>

                            {/* Chart Card */}
                            <View style={[styles.card, { backgroundColor: colors.card, padding: 0, overflow: 'hidden' }]}>
                                <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: borderColor }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>
                                        {selectedIndex !== null ? displayDate.toUpperCase() : 'SEMESTER TREND'}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                        <Text style={{ color: colors.text, fontSize: 36, fontWeight: 'bold' }}>
                                            {displayPercentage.toFixed(1)}%
                                        </Text>
                                        {selectedIndex !== null && (
                                            <Text style={{ color: colors.textSecondary, fontSize: 14, marginLeft: 8 }}>
                                                {currentPoint?.data.totalClasses} classes
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', padding: 20 }}>
                                    {/* Y-Axis Labels */}
                                    <View style={{ width: LEFT_PADDING, justifyContent: 'space-between', paddingVertical: 10, marginRight: 8, height: CHART_HEIGHT }}>
                                        {yLabels.map((label) => (
                                            <Text key={label} style={{ color: colors.textSecondary, fontSize: 10, textAlign: 'right' }}>
                                                {label}
                                            </Text>
                                        ))}
                                    </View>

                                    {/* Chart SVG */}
                                    <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
                                        <Svg height={CHART_HEIGHT} width={CHART_WIDTH} style={{ overflow: 'visible' }}>
                                            <Defs>
                                                <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                                    <Stop offset="0" stopColor={colors.primary} stopOpacity="0.4" />
                                                    <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                                                </SvgGradient>
                                            </Defs>

                                            {/* Grid Lines */}
                                            {yLabels.map((label) => {
                                                const y = CHART_HEIGHT - (label / 100) * CHART_HEIGHT;
                                                return (
                                                    <Line
                                                        key={label}
                                                        x1="0"
                                                        y1={y}
                                                        x2={CHART_WIDTH}
                                                        y2={y}
                                                        stroke={colors.textSecondary}
                                                        strokeWidth="1"
                                                        strokeOpacity="0.1"
                                                    />
                                                );
                                            })}

                                            {/* Target Line (75%) */}
                                            <Line x1="0" y1={CHART_HEIGHT * 0.25} x2={CHART_WIDTH} y2={CHART_HEIGHT * 0.25} stroke={colors.success} strokeWidth="1" strokeDasharray="4,4" opacity={0.6} />

                                            {/* Data Paths */}
                                            <Path d={fillPath} fill="url(#grad)" />
                                            <Path d={linePath} stroke={colors.primary} strokeWidth="3" fill="none" />

                                            {/* Interactive Elements */}
                                            {selectedIndex !== null && currentPoint && (
                                                <>
                                                    <Line
                                                        x1={currentPoint.x} y1={0}
                                                        x2={currentPoint.x} y2={CHART_HEIGHT}
                                                        stroke={colors.textSecondary}
                                                        strokeWidth="1"
                                                        strokeDasharray="4,4"
                                                    />
                                                    <Circle
                                                        cx={currentPoint.x} cy={currentPoint.y} r="8"
                                                        fill={colors.background} stroke={colors.primary} strokeWidth="3"
                                                    />
                                                </>
                                            )}
                                            {selectedIndex === null && chartPoints.length > 0 && (
                                                <Circle
                                                    cx={chartPoints[chartPoints.length - 1].x}
                                                    cy={chartPoints[chartPoints.length - 1].y}
                                                    r="6"
                                                    fill={colors.background}
                                                    stroke={colors.primary}
                                                    strokeWidth="2"
                                                />
                                            )}
                                        </Svg>

                                        {/* Touch Overlay using GestureDetector */}
                                        <GestureDetector gesture={panGesture}>
                                            <View
                                                style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
                                            />
                                        </GestureDetector>
                                    </View>
                                </View>

                                {/* Hint Text */}
                                <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center', opacity: 0.7 }}>
                                        {selectedIndex === null ? 'Drag across to inspect' : 'Release to reset'}
                                    </Text>
                                </View>
                            </View>

                            {/* Insights Grid */}
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INSIGHTS</Text>

                            <View style={styles.gridContainer}>
                                {/* Streak Card - FIRE Gradient */}
                                <LinearGradient
                                    colors={['#FF512F', '#DD2476']} // Orange/Red
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.gradientCard}
                                >
                                    <View style={styles.cardHeader}>
                                        <Ionicons name="flame" size={24} color="#FFF" />
                                        <Text style={styles.cardLabel}>Streak</Text>
                                    </View>
                                    <Text style={styles.cardValue}>{insights.streak} Days</Text>
                                    <Text style={styles.cardSub}>Keep it up!</Text>
                                </LinearGradient>

                                {/* Summary Card - BLUE/VIOLET Gradient */}
                                <LinearGradient
                                    colors={['#4facfe', '#00f2fe']} // Blue/Cyan
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.gradientCard}
                                >
                                    <View style={styles.cardHeader}>
                                        <Ionicons name="school" size={24} color="#FFF" />
                                        <Text style={styles.cardLabel}>Attended</Text>
                                    </View>
                                    <Text style={styles.cardValue}>{stats.attended}/{stats.total}</Text>
                                    <Text style={styles.cardSub}>Classes total</Text>
                                </LinearGradient>
                            </View>

                            {/* Target Date Card - Green/Teal Gradient */}
                            {insights.recoveryDate && (
                                <LinearGradient
                                    colors={['#11998e', '#38ef7d']} // Green
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={[styles.gradientCard, { marginTop: 12, width: '100%' }]}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View>
                                            <Text style={[styles.cardLabel, { marginBottom: 4 }]}>Target 75% Estimate</Text>
                                            <Text style={styles.cardValue}>{insights.recoveryDate}</Text>
                                        </View>
                                        <View style={{ opacity: 0.8 }}>
                                            <Ionicons name="calendar" size={40} color="#FFF" />
                                        </View>
                                    </View>
                                </LinearGradient>
                            )}


                            {/* Safe Zone Message */}
                            {!insights.recoveryDate && (
                                <LinearGradient
                                    colors={['#00b09b', '#96c93d']} // Green Leaf
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={[styles.gradientCard, { marginTop: 12, width: '100%' }]}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <Ionicons name="checkmark-circle" size={32} color="#FFF" />
                                        <View>
                                            <Text style={styles.cardValue}>You&apos;re Safe!</Text>
                                            <Text style={styles.cardSub}>Attendance is above 75%</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            )}

                        </Animated.View>
                    </ScrollView>
                )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backBtn: { padding: 8, marginRight: 8, marginLeft: -8 },
    title: { fontSize: 20, fontWeight: 'bold' },
    content: { padding: 16, paddingBottom: 40 },
    card: { borderRadius: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 16, letterSpacing: 0.5 },
    gridContainer: { flexDirection: 'row', gap: 12 },
    gradientCard: {
        flex: 1,
        padding: 20,
        borderRadius: 20,
        justifyContent: 'space-between',
        minHeight: 120
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    cardLabel: { fontSize: 14, fontWeight: '600', color: '#FFF', opacity: 0.9 },
    cardValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    cardSub: { fontSize: 12, color: '#FFF', opacity: 0.8, marginTop: 4 },
    stepperBtn: {
        width: 48, height: 48, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center'
    }
});
