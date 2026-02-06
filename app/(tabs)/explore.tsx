import { useTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AttendanceService, DailyAttendance } from '../../services/attendance';
import { AuthService } from '../../services/auth';

export default function DateWiseScreen() {
  const [days, setDays] = useState<DailyAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const fetchData = useCallback(async () => {
    try {
      const isLoggedIn = await AuthService.isLoggedIn();
      if (!isLoggedIn) {
        router.replace('/login');
        return;
      }

      const data = await AttendanceService.getDateWiseAttendance();
      // Sort in descending order (newest first)
      const sortedDays = data.days.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('-').map(Number);
        const [dayB, monthB, yearB] = b.date.split('-').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB.getTime() - dateA.getTime();
      });
      setDays(sortedDays);
    } catch (error) {
      console.error('Date-wise attendance fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Extract unique months from the data
  const months = useMemo(() => {
    const monthSet = new Set<string>();
    days.forEach(day => {
      // Normalize split to handle -, /, ., or spaces
      const parts = day.date.split(/[-./\s]/);
      if (parts.length >= 3) {
        const monthNum = parseInt(parts[1], 10);
        const year = parts[2];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[monthNum - 1] || 'Unknown';
        monthSet.add(`${monthName} ${year}`);
      }
    });
    return ['All', ...Array.from(monthSet)];
  }, [days]);

  // Filter days by selected month
  const filteredDays = useMemo(() => {
    if (selectedMonth === 'All') return days;

    return days.filter(day => {
      const parts = day.date.split(/[-./\s]/);
      if (parts.length >= 3) {
        const monthNum = parseInt(parts[1], 10);
        const year = parts[2];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[monthNum - 1] || 'Unknown';
        return selectedMonth === `${monthName} ${year}`;
      }
      return false;
    });
  }, [days, selectedMonth]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderPeriodCell = (status: string, index: number) => {
    let bgColor = isDark ? '#3a3a5e' : '#E5E5EA';
    let textColor = colors.textSecondary;

    if (status === 'P') {
      bgColor = colors.successBg;
      textColor = colors.success;
    } else if (status === 'A') {
      bgColor = colors.errorBg;
      textColor = colors.error;
    }

    return (
      <View key={index} style={[styles.periodCell, { backgroundColor: bgColor }]}>
        <Text style={[styles.periodText, { color: textColor }]}>{status === 'null' ? '⁃' : status}</Text>
      </View>
    );
  };

  const renderDayItem = ({ item, index }: { item: DailyAttendance; index: number }) => {
    const absentCount = item.periods.filter(p => p === 'A').length;
    const presentCount = item.periods.filter(p => p === 'P').length;
    // const isGood = absentCount === 0;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        style={[styles.dayCard, { shadowColor: isDark ? '#000' : '#888', backgroundColor: 'transparent' }]}
      >
        <BlurView
          intensity={isDark ? 40 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.7)' }]}
        />
        <View style={[styles.dayAccent, { backgroundColor: absentCount === 0 ? colors.success : colors.error }]} />
        <View style={styles.dayContent}>
          <View style={styles.dayHeader}>
            <View>
              <Text style={[styles.dateText, { color: colors.text }]}>{item.date}</Text>
              <Text style={[styles.dayText, { color: colors.textSecondary }]}>{item.day}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {presentCount > 0 && (
                <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={{ color: colors.success, fontSize: 12, fontWeight: 'bold' }}>P: {presentCount}</Text>
                </View>
              )}
              {absentCount > 0 && (
                <View style={[styles.statusBadge, { backgroundColor: colors.error + '20' }]}>
                  <Text style={{ color: colors.error, fontSize: 12, fontWeight: 'bold' }}>A: {absentCount}</Text>
                </View>
              )}
              {presentCount === 0 && absentCount === 0 && (
                <View style={[styles.statusBadge, { backgroundColor: colors.textSecondary + '20' }]}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: 'bold' }}>-</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.periodsRow}>
            {item.periods.map((status, idx) => renderPeriodCell(status, idx))}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={isDark ? [colors.background, '#1a1a1a'] : [colors.primary + '10', colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <FlatList
        data={filteredDays}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        renderItem={renderDayItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
        ListHeaderComponent={() => (
          <View>
            {/* Title */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Date-wise Attendance</Text>
              <Text style={[styles.headerCount, { color: colors.textSecondary }]}>{filteredDays.length} days</Text>
            </View>

            {/* Month Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterScroll}
            >
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedMonth === month ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                      borderWidth: 1,
                      borderColor: selectedMonth === month ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                    }
                  ]}
                  onPress={() => setSelectedMonth(month)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: colors.textSecondary },
                    selectedMonth === month && { color: '#fff' }
                  ]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Period Legend */}
            <View style={[styles.legendCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.legendTitle, { color: colors.textSecondary }]}>Periods</Text>
              <View style={styles.legendRow}>
                {['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map((p, i) => (
                  <View key={i} style={[styles.legendItem, { backgroundColor: isDark ? '#3a3a5e' : '#E5E5EA' }]}>
                    <Text style={[styles.legendText, { color: colors.text }]}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No attendance records found</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerCount: {
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    width: 40,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayCard: {
    borderRadius: 24,
    flexDirection: 'row',
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  dayAccent: {
    width: 5,
  },
  dayContent: {
    flex: 1,
    padding: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayText: {
    fontSize: 14,
  },
  periodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  periodCell: {
    width: 44,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statsRow: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
