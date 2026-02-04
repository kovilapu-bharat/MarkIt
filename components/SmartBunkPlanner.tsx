import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { Calendar, DateData } from 'react-native-calendars';
import { useSharedValue } from 'react-native-reanimated';

interface SmartBunkPlannerProps {
    currentAttended: number;
    currentTotal: number;
    currentPercentage: number;
    colors: any;
}

export const SmartBunkPlanner = ({ currentAttended, currentTotal, currentPercentage, colors }: SmartBunkPlannerProps) => {
    const [selectedDates, setSelectedDates] = useState<{ [key: string]: any }>({});
    const [classesPerDay, setClassesPerDay] = useState(6);

    // Slider shared values
    const progress = useSharedValue(6);
    const min = useSharedValue(1);
    const max = useSharedValue(7);

    const onDayPress = (day: DateData) => {
        const date = day.dateString;
        const newDates = { ...selectedDates };

        if (newDates[date]) {
            delete newDates[date];
        } else {
            newDates[date] = {
                selected: true,
                selectedColor: colors.error || '#FF3B30',
                // specific styles to ensure circle
                customStyles: {
                    container: {
                        borderRadius: 20, // ensure circle
                        elevation: 2
                    }
                }
            };
        }
        setSelectedDates(newDates);
    };

    const daysBunked = Object.keys(selectedDates).length;
    const classesMissed = daysBunked * classesPerDay;

    const futureTotal = currentTotal + classesMissed;
    // Attended stays same because we are bunking
    const futurePercentage = futureTotal > 0 ? (currentAttended / futureTotal) * 100 : 0;
    const diff = (currentPercentage - futurePercentage).toFixed(2);

    const isSafe = futurePercentage >= 75;

    return (
        <View style={styles.container}>
            <View style={[styles.card, { backgroundColor: colors.card, padding: 16 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Ionicons name="calendar" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Select Bunk Dates</Text>
                </View>

                <Calendar
                    key={colors.text} // Force re-render on theme change
                    onDayPress={onDayPress}
                    markedDates={selectedDates}
                    markingType={'custom'}
                    enableSwipeMonths={true}
                    hideExtraDays={true}
                    theme={{
                        backgroundColor: 'transparent',
                        calendarBackground: 'transparent',
                        textSectionTitleColor: colors.textSecondary,
                        selectedDayBackgroundColor: colors.error || '#FF3B30',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: colors.primary,
                        dayTextColor: colors.text,
                        textDisabledColor: colors.border,
                        dotColor: colors.primary,
                        selectedDotColor: '#ffffff',
                        arrowColor: colors.primary,
                        disabledArrowColor: colors.border,
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
                            backgroundColor: colors.border, // Better contrast in dark mode than 'background'
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
                            maximumTrackTintColor: colors.border || '#ccc',
                            bubbleBackgroundColor: '#0000',
                        }}
                        thumbWidth={20}
                        renderBubble={() => null}
                    />
                </View>
            </View>

            {daysBunked > 0 && (
                <View style={[styles.resultCard, {
                    backgroundColor: isSafe ? (colors.success + '15') : (colors.error + '15'),
                    borderColor: isSafe ? colors.success : colors.error,
                    borderWidth: 1
                }]}>
                    <View style={{ marginBottom: 8 }}>
                        <Text style={{ color: colors.text, fontSize: 16 }}>
                            If you bunk <Text style={{ fontWeight: 'bold' }}>{daysBunked} days</Text> ({classesMissed} classes):
                        </Text>
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
                                <Ionicons name="arrow-down" size={16} color={colors.error} />
                                <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>{diff}%</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Drop</Text>
                        </View>
                    </View>

                    {!isSafe && (
                        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="warning" size={16} color={colors.error} style={{ marginRight: 6 }} />
                            <Text style={{ color: colors.error, fontSize: 13, fontWeight: '600' }}>Warning: Attendance will fall below 75%!</Text>
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
