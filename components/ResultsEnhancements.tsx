import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import { Circle, Defs, Line, Path, Stop, Svg, LinearGradient as SvgGradient, Text as SvgText } from 'react-native-svg';
import { SemesterResult } from '../services/results';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48; // Padding
const CHART_HEIGHT = 180;

// --- GPA Trend Chart ---
export const GPATrendChart = ({ semesters, colors }: { semesters: SemesterResult[], colors: any }) => {
    const data = useMemo(() => {
        return semesters
            .map(s => {
                const sgpa = parseFloat(s.sgpa);
                // Shorten semester label logic
                // e.g. "I/IV I SEM" -> "1-1", "I SEM" -> "1", "Semester 1" -> "1"
                let label = s.semester.replace(/Semester/i, '').trim();

                // Try to detect Year/Sem pattern like "I/IV I SEM" (1st Year, 1st Sem of 4)
                const romMap: { [key: string]: string } = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' };
                const parts = label.split(/[\/\s-]+/);

                if (parts.length >= 2) {
                    // Heuristic: Check if parts are Roman numerals
                    const year = romMap[parts[0]] || parts[0];
                    const sem = romMap[parts[1]] || parts[1];
                    // If we found valid conversions, use them
                    if ((parseInt(year) || romMap[parts[0]]) && (parseInt(sem) || romMap[parts[1]])) {
                        label = `${year}-${sem}`;
                    }
                } else if (romMap[label]) {
                    label = romMap[label];
                }

                return {
                    originalLabel: s.semester,
                    label: label.length > 5 ? label.substring(0, 4) + '..' : label, // Fallback truncate
                    value: isNaN(sgpa) ? 0 : sgpa
                };
            });
    }, [semesters]);

    if (data.length < 2) return null;

    const SIDE_PADDING = 30;
    const VERTICAL_PADDING = 20;
    const GRAPH_WIDTH = CHART_WIDTH - (SIDE_PADDING * 2);
    const GRAPH_HEIGHT = CHART_HEIGHT - (VERTICAL_PADDING * 2);

    // Y-Axis Scale
    const maxVal = 10;
    const minVal = 4;

    const getX = (index: number) => SIDE_PADDING + (index / (data.length - 1)) * GRAPH_WIDTH;
    const getY = (value: number) => VERTICAL_PADDING + GRAPH_HEIGHT - ((value - minVal) / (maxVal - minVal)) * GRAPH_HEIGHT;

    const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value), value: d.value, label: d.label }));

    // Bezier Curve Logic
    const getBezierPath = (pts: typeof points) => {
        if (pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const current = pts[i];
            const next = pts[i + 1];
            const controlX1 = current.x + (next.x - current.x) / 2;
            const controlY1 = current.y;
            const controlX2 = current.x + (next.x - current.x) / 2;
            const controlY2 = next.y;
            d += ` C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${next.x} ${next.y}`;
        }
        return d;
    };

    const pathD = getBezierPath(points);
    const fillPath = `${pathD} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;

    return (
        <View style={[styles.card, { backgroundColor: colors.card, marginBottom: 20 }]}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border || '#eee' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>ACADEMIC PERFORMANCE</Text>
            </View>
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 20}>
                    <Defs>
                        <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.4" />
                            <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                        </SvgGradient>
                    </Defs>

                    {/* Grid Lines */}
                    {[5, 6, 7, 8, 9, 10].map(val => (
                        <Line
                            key={val}
                            x1={SIDE_PADDING} y1={getY(val)}
                            x2={CHART_WIDTH - SIDE_PADDING} y2={getY(val)}
                            stroke={colors.textSecondary}
                            strokeWidth="1"
                            strokeOpacity="0.1"
                            strokeDasharray="4,4"
                        />
                    ))}

                    <Path d={fillPath} fill="url(#grad)" />
                    <Path d={pathD} stroke={colors.primary} strokeWidth="3" fill="none" />

                    {points.map((p, i) => (
                        <React.Fragment key={i}>
                            <Circle cx={p.x} cy={p.y} r="5" fill={colors.card} stroke={colors.primary} strokeWidth="2" />

                            {/* Value Label - Positioned with collision check */}
                            <SvgText
                                x={p.x}
                                y={p.y - 12}
                                fill={colors.text}
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {p.value.toFixed(2)}
                            </SvgText>

                            {/* Semester Label */}
                            <SvgText
                                x={p.x}
                                y={CHART_HEIGHT + 15}
                                fill={colors.textSecondary}
                                fontSize="11"
                                fontWeight="500"
                                textAnchor="middle"
                            >
                                {p.label}
                            </SvgText>
                        </React.Fragment>
                    ))}
                </Svg>
            </View>
        </View>
    );
};

// --- Backlog Tracker ---
export const BacklogTracker = ({ semesters, colors }: { semesters: SemesterResult[], colors: any }) => {
    const backlogs = useMemo(() => {
        const fails: { subject: string, code: string, semester: string }[] = [];
        semesters.forEach(sem => {
            sem.subjects.forEach(sub => {
                // Check fail condition (F grade, absent, or explicitly 'F' result)
                const isFail = sub.result.toUpperCase() === 'F' ||
                    sub.grade.toUpperCase() === 'F' ||
                    sub.grade.toLowerCase() === 'ab';

                if (isFail) {
                    fails.push({
                        subject: sub.subjectName,
                        code: sub.subjectCode,
                        semester: sem.semester
                    });
                }
            });
        });
        return fails;
    }, [semesters]);

    if (backlogs.length === 0) return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.success + '40', borderWidth: 1, marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                <View style={{
                    width: 48, height: 48, borderRadius: 24,
                    backgroundColor: colors.success + '15',
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: 16
                }}>
                    <Ionicons name="shield-checkmark" size={28} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.success, fontSize: 18, fontWeight: 'bold' }}>All Clear!</Text>
                    <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13, marginTop: 2 }}>No active backlogs. Keep it up! 🎉</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.card, { backgroundColor: colors.card, marginBottom: 20, borderColor: colors.error, borderWidth: 1 }]}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border || 'rgba(0,0,0,0.1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.error, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>ACTIVE BACKLOGS ({backlogs.length})</Text>
                <Ionicons name="warning" size={18} color={colors.error} />
            </View>
            <View style={{ padding: 16 }}>
                {backlogs.map((b, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i === backlogs.length - 1 ? 0 : 12 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{b.subject}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{b.code} • {b.semester}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

// --- What-If Calculator ---
export const WhatIfCalculator = ({ cgpa, semesters, colors }: { cgpa: string, semesters: SemesterResult[], colors: any }) => {
    const [nextSemSGPA, setNextSemSGPA] = useState(8.5);
    const [nextSemCredits, setNextSemCredits] = useState(21);

    // Shared values for sliders
    const sgpaProgress = useSharedValue(8.5);
    const sgpaMin = useSharedValue(0);
    const sgpaMax = useSharedValue(10);

    const creditsProgress = useSharedValue(21);
    const creditsMin = useSharedValue(15);
    const creditsMax = useSharedValue(30);

    const currentCGPA = parseFloat(cgpa);

    // Calculate total credits so far
    const totalCredits = useMemo(() => {
        return semesters.reduce((acc, sem) => {
            // Try parsed total credits first, else sum subjects
            // Note: Parser might not set totalCredits, so we look at subjects
            let semCredits = 0;
            if (sem.totalCredits) {
                semCredits = parseFloat(sem.totalCredits);
            } else {
                semCredits = sem.subjects.reduce((sum, sub) => {
                    const c = parseFloat(sub.credits);
                    return !isNaN(c) ? sum + c : sum;
                }, 0);
            }
            return acc + (isNaN(semCredits) ? 0 : semCredits);
        }, 0);
    }, [semesters]);

    if (isNaN(currentCGPA)) return null;

    const newCGPA = ((currentCGPA * totalCredits) + (nextSemSGPA * nextSemCredits)) / (totalCredits + nextSemCredits);
    const diff = newCGPA - currentCGPA;

    return (
        <View style={[styles.card, { backgroundColor: colors.card, marginBottom: 20 }]}>
            <LinearGradient
                colors={[colors.primary + '10', colors.background]}
                style={{ padding: 16 }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>WHAT-IF CALCULATOR 🔮</Text>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: colors.primary, borderRadius: 10 }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>NEXT SEMESTER</Text>
                    </View>
                </View>

                {/* Next SGPA Slider */}
                <View style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Target SGPA</Text>
                        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{nextSemSGPA.toFixed(1)}</Text>
                    </View>
                    <Slider
                        style={{ width: '100%', height: 30 }}
                        progress={sgpaProgress}
                        minimumValue={sgpaMin}
                        maximumValue={sgpaMax}
                        onValueChange={(val) => setNextSemSGPA(Math.round(val * 10) / 10)}
                        theme={{
                            minimumTrackTintColor: colors.primary,
                            maximumTrackTintColor: colors.border || '#ccc',
                            bubbleBackgroundColor: '#0000',
                        }}
                        thumbWidth={16}
                        renderBubble={() => null}
                    />
                </View>

                {/* Credits Slider */}
                <View style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Credits</Text>
                        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{nextSemCredits}</Text>
                    </View>
                    <Slider
                        style={{ width: '100%', height: 30 }}
                        progress={creditsProgress}
                        minimumValue={creditsMin}
                        maximumValue={creditsMax}
                        step={1}
                        onValueChange={(val) => setNextSemCredits(val)}
                        theme={{
                            minimumTrackTintColor: colors.textSecondary,
                            maximumTrackTintColor: colors.border || '#ccc',
                            bubbleBackgroundColor: '#0000',
                        }}
                        thumbWidth={16}
                        renderBubble={() => null}
                    />
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: colors.border || 'rgba(0,0,0,0.05)', paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Predicted CGPA</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>{newCGPA.toFixed(2)}</Text>
                            <Text style={{
                                color: diff >= 0 ? colors.success : colors.error,
                                fontSize: 13,
                                marginLeft: 8,
                                fontWeight: '600'
                            }}>
                                {diff >= 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Based on {totalCredits.toFixed(0)} credits</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    }
});
