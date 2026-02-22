import { Text } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet,  View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { Calendar, DateData } from 'react-native-calendars';
import { useSharedValue } from 'react-native-reanimated';

interface SmartBunkPlannerProps {
    currentAttended: number;
    currentTotal: number;
    currentPercentage: number;
    colors: any;
}

// Date state types: 'attend' (green) → 'bunk' (red) → removed
interface DateState {
    type: 'attend' | 'bunk';
    marking: any;
}

export const SmartBunkPlanner = ({ currentAttended, currentTotal, currentPercentage, colors }: SmartBunkPlannerProps) => {
    const [selectedDates, setSelectedDates] = useState<{ [key: string]: DateState }>({});
    const [classesPerDay, setClassesPerDay] = useState(6);

    // Slider shared values
    const progress = useSharedValue(6);
    const min = useSharedValue(1);
    const max = useSharedValue(7);

    // Generate Sundays for the current and next year
    const getSundays = () => {
        const sundays: { [key: string]: any } = {};
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear() + 2, 0, 1); // 2 years range

        let current = new Date(start);
        // Find first Sunday
        while (current.getDay() !== 0) {
            current.setDate(current.getDate() + 1);
        }

        while (current < end) {
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            sundays[dateStr] = {
                disabled: true,
                disableTouchEvent: true,
                customStyles: {
                    container: {
                        backgroundColor: colors.cardBorder ? (colors.cardBorder + '40') : 'rgba(150,150,150,0.1)',
                        borderRadius: 8
                    },
                    text: {
                        color: colors.textSecondary,
                        opacity: 0.5
                    }
                }
            };
            current.setDate(current.getDate() + 7);
        }
        return sundays;
    };

    // Memoize sundays
    const [sundays] = useState(getSundays());

    // Cycle: none → attend (green) → bunk (red) → none
    const onDayPress = (day: DateData) => {
        const date = day.dateString;

        // Prevent selecting Sundays
        if (sundays[date]) return;

        Haptics.selectionAsync();
        const newDates = { ...selectedDates };

        if (!newDates[date]) {
            // First tap: Attend (green)
            newDates[date] = {
                type: 'attend',
                marking: {
                    selected: true,
                    selectedColor: colors.success,
                    customStyles: {
                        container: { borderRadius: 20, elevation: 2 }
                    }
                }
            };
        } else if (newDates[date].type === 'attend') {
            // Second tap: Bunk (red)
            newDates[date] = {
                type: 'bunk',
                marking: {
                    selected: true,
                    selectedColor: colors.error || '#FF3B30',
                    customStyles: {
                        container: { borderRadius: 20, elevation: 2 }
                    }
                }
            };
        } else {
            // Third tap: Remove
            delete newDates[date];
        }
        setSelectedDates(newDates);
    };

    // Build calendar markings from state
    const getMarkedDates = () => {
        const markings: { [key: string]: any } = {};
        Object.entries(selectedDates).forEach(([date, state]) => {
            markings[date] = state.marking;
        });
        return { ...sundays, ...markings };
    };

    // Count attend and bunk days separately
    const attendDays = Object.values(selectedDates).filter(d => d.type === 'attend').length;
    const bunkDays = Object.values(selectedDates).filter(d => d.type === 'bunk').length;
    const attendClasses = attendDays * classesPerDay;
    const bunkClasses = bunkDays * classesPerDay;
    const totalClasses = attendClasses + bunkClasses;

    // Calculate combined effect
    // For bunked classes: total increases, attended stays same
    // For attended classes: both total and attended increase
    const futureTotal = currentTotal + totalClasses;
    const futureAttended = currentAttended + attendClasses; // Only attend classes add to attended
    const futurePercentage = futureTotal > 0 ? (futureAttended / futureTotal) * 100 : currentPercentage;
    const percentChange = futurePercentage - currentPercentage;
    const isSafe = futurePercentage >= 75;
    const hasSelections = attendDays > 0 || bunkDays > 0;

    return (
        <View style={styles.container}>
            {/* Compact legend */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, paddingHorizontal: 8 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.success, marginRight: 4 }} />
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginRight: 12 }}>Attend</Text>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.error, marginRight: 4 }} />
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginRight: 12 }}>Bunk</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Tap to cycle</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, padding: 16 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Ionicons name="calendar" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Plan Your Days</Text>
                </View>

                <Calendar
                    key={colors.text} // Force re-render on theme change
                    onDayPress={onDayPress}
                    markedDates={getMarkedDates()}
                    markingType={'custom'}
                    enableSwipeMonths={true}
                    hideExtraDays={true}
                    theme={{
                        backgroundColor: 'transparent',
                        calendarBackground: 'transparent',
                        textSectionTitleColor: colors.textSecondary,
                        selectedDayBackgroundColor: colors.primary,
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: colors.primary,
                        dayTextColor: colors.text,
                        textDisabledColor: colors.cardBorder,
                        dotColor: colors.primary,
                        selectedDotColor: '#ffffff',
                        arrowColor: colors.primary,
                        disabledArrowColor: colors.cardBorder,
                        monthTextColor: colors.text,
                        indicatorColor: colors.primary,
                        textDayFontWeight: '500',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '600',
                        textDayFontSize: 16,
                        textMonthFontSize: 20,
                        textDayHeaderFontSize: 12,
                        // @ts-ignore
                        'stylesheet.calendar.header': {
                            header: {
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingLeft: 10,
                                paddingRight: 10,
                                marginTop: 6,
                                alignItems: 'center',
                                marginBottom: 10
                            },
                            monthText: {
                                fontSize: 18,
                                fontWeight: '700',
                                color: colors.text,
                                margin: 10
                            }
                        }
                    }}
                    renderArrow={(direction) => (
                        <View style={{
                            backgroundColor: colors.cardBorder,
                            padding: 8,
                            borderRadius: 12,
                            opacity: 0.5
                        }}>
                            <Ionicons name={direction === 'left' ? "chevron-back" : "chevron-forward"} size={18} color={colors.text} />
                        </View>
                    )}
                    style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                        paddingBottom: 10
                    }}
                />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, padding: 16 }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 12 }}>CLASSES PER DAY ESTIMATE</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text }}>{classesPerDay}</Text>
                    <Text style={{ color: colors.textSecondary }}>Classes/Day</Text>
                </View>

                <View style={{ height: 40 }}>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        progress={progress}
                        minimumValue={min}
                        maximumValue={max}
                        step={1}
                        onValueChange={(val) => setClassesPerDay(Math.round(val))}
                        theme={{
                            minimumTrackTintColor: colors.textSecondary,
                            maximumTrackTintColor: colors.cardBorder || '#ccc',
                            bubbleBackgroundColor: '#0000',
                        }}
                        thumbWidth={20}
                        renderBubble={() => null}
                    />
                </View>
            </View>

            {hasSelections && (
                <View style={[styles.resultCard, {
                    backgroundColor: isSafe ? (colors.success + '15') : (colors.error + '15'),
                    borderColor: isSafe ? colors.success : colors.error,
                    borderWidth: 1
                }]}>
                    {/* Selection Summary */}
                    <View style={{ marginBottom: 12 }}>
                        {attendDays > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success, marginRight: 8 }} />
                                <Text style={{ color: colors.text, fontSize: 14 }}>
                                    Attend: <Text style={{ fontWeight: 'bold' }}>{attendDays} days</Text> ({attendClasses} classes)
                                </Text>
                            </View>
                        )}
                        {bunkDays > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.error, marginRight: 8 }} />
                                <Text style={{ color: colors.text, fontSize: 14 }}>
                                    Bunk: <Text style={{ fontWeight: 'bold' }}>{bunkDays} days</Text> ({bunkClasses} classes)
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>New Percentage</Text>
                            <Text style={{
                                fontSize: 32,
                                fontWeight: 'bold',
                                color: isSafe ? colors.success : colors.error
                            }}>
                                {futurePercentage.toFixed(2)}%
                            </Text>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Ionicons
                                    name={percentChange >= 0 ? "arrow-up" : "arrow-down"}
                                    size={16}
                                    color={percentChange >= 0 ? colors.success : colors.error}
                                />
                                <Text style={{
                                    color: percentChange >= 0 ? colors.success : colors.error,
                                    fontWeight: 'bold',
                                    fontSize: 16
                                }}>{percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                                {percentChange >= 0 ? 'Increase' : 'Drop'}
                            </Text>
                        </View>
                    </View>

                    {!isSafe && (
                        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="warning" size={16} color={colors.error} style={{ marginRight: 6 }} />
                            <Text style={{ color: colors.error, fontSize: 13, fontWeight: '600' }}>Warning: Attendance will fall below 75%!</Text>
                        </View>
                    )}
                    {isSafe && currentPercentage < 75 && futurePercentage >= 75 && (
                        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginRight: 6 }} />
                            <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>Great! This will bring you above 75%!</Text>
                        </View>
                    )}
                </View>
            )}


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
    },
    card: {
        borderRadius: 16,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20
    }
});
