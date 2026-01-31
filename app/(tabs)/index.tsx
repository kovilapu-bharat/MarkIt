import { useResults } from '@/context/ResultsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogout } from '../../hooks/useLogout';
import { AttendanceResponse, AttendanceService, MonthlyAttendance } from '../../services/attendance';
import { AuthService, StudentProfile } from '../../services/auth';

export default function HomeScreen() {
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, toggleTheme, isDark } = useTheme();
  const { showResults } = useResults();

  const fetchData = useCallback(async () => {
    try {
      const isLoggedIn = await AuthService.isLoggedIn();
      if (!isLoggedIn) {
        router.replace('/login');
        return;
      }

      const userProfile = await AuthService.getProfile();
      setProfile(userProfile);

      const data = await AttendanceService.getAttendance();
      if (data) {
        setAttendanceData(data);
        setIsOffline(!!data.isOffline);
      }
    } catch (error) {
      console.error(error);
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

  const { handleLogout, loggingOut } = useLogout();

  const mounted = React.useRef(true);
  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const headerComponent = (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 12, flexShrink: 1 }}>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
            {profile?.name?.split(' ')[0] || 'Student'}
          </Text>
          {isOffline && (
            <View style={[styles.offlineBadge, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="cloud-offline" size={12} color={colors.warning} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.warning, fontSize: 10, fontWeight: '600' }}>OFFLINE MODE</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.iconBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card, marginRight: 8 }]}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loggingOut}
            style={[styles.iconBtn, { borderColor: 'rgba(255, 69, 58, 0.3)', backgroundColor: 'rgba(255, 69, 58, 0.1)' }]}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#FF453A" />
            ) : (
              <Ionicons name="log-out-outline" size={20} color="#FF453A" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: profile?.profileImage || 'https://via.placeholder.com/60' }}
          style={[styles.profileImage, { backgroundColor: colors.badge, borderColor: colors.success }]}
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{profile?.name || 'Student'}</Text>
          <Text style={[styles.profileDept, { color: colors.textSecondary }]}>{profile?.department || 'Department'}</Text>
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: colors.badge }]}>
              <Text style={[styles.badgeText, { color: colors.badgeText }]}>Year {profile?.year || '-'}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.badge }]}>
              <Text style={[styles.badgeText, { color: colors.badgeText }]}>ID: {profile?.rollNo}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.bellBtn, { backgroundColor: colors.badge }]}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <TouchableOpacity
        style={styles.statsRow}
        onPress={() => router.push('/analytics')}
        activeOpacity={0.8}
      >
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginRight: 6 }} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>OVERALL</Text>
          </View>
          <Text style={[styles.statValue, { color: (attendanceData?.overallPercentage || 0) >= 75 ? colors.success : colors.error }]}>
            {attendanceData?.overallPercentage.toFixed(0)}%
          </Text>
          <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>
            {attendanceData?.semesterTotal ? `${attendanceData.semesterTotal.attended} / ${attendanceData.semesterTotal.total} classes` : 'Total Attendance'}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statHeader}>
            <Ionicons
              name={(attendanceData?.overallPercentage || 0) >= 75 ? "trending-up" : "warning"}
              size={16}
              color={(attendanceData?.overallPercentage || 0) >= 75 ? colors.success : colors.warning}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>PREDICTION (75%)</Text>
          </View>
          {(() => {
            const attended = attendanceData?.semesterTotal?.attended || 0;
            const total = attendanceData?.semesterTotal?.total || 0;
            const percentage = attendanceData?.overallPercentage || 0;
            const targetDecimal = 0.75;

            // Always calculate skips, but floor at 0 if below target
            let canSkip = 0;
            if (percentage >= 75) {
              canSkip = Math.floor((attended - targetDecimal * total) / targetDecimal);
            }

            return (
              <>
                <Text style={[styles.statValue, { color: canSkip > 0 ? colors.success : colors.textSecondary, fontSize: 32 }]}>{canSkip}</Text>
                <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>classes you can skip</Text>
              </>
            );
          })()}
        </View>
        <View style={{ position: 'absolute', right: -4, top: '40%', opacity: 0.5 }}>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Academics Section */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Academics</Text>
          <TouchableOpacity
            onPress={() => setShowInfoModal(true)}
            hitSlop={10}
            style={{ marginLeft: 8 }}
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Exam Results Card */}
        <TouchableOpacity
          style={[styles.subjectCard, { backgroundColor: colors.card }]}
          onPress={() => showResults()}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
              <Ionicons name="school-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>Exam Results</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>View semester grades and CGPA</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Attendance</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getColor = (pct: number) => {
    if (pct >= 75) return colors.success;
    if (pct >= 60) return colors.warning;
    return colors.error;
  };

  const CircularProgress = ({ percentage, size = 56 }: { percentage: number; size?: number }) => {
    const color = getColor(percentage);

    return (
      <View style={[styles.circleOuter, { width: size, height: size, borderColor: colors.badge }]}>
        <View style={[styles.circleInner, {
          width: size - 8,
          height: size - 8,
          borderColor: color,
          borderTopColor: percentage < 25 ? colors.badge : color,
          borderRightColor: percentage < 50 ? colors.badge : color,
          borderBottomColor: percentage < 75 ? colors.badge : color,
          backgroundColor: colors.card,
        }]}>
          <Text style={[styles.circleText, { color }]}>{Math.round(percentage)}%</Text>
        </View>
      </View>
    );
  };

  const renderMonthItem = ({ item }: { item: MonthlyAttendance }) => {
    const isLow = item.percentage < 75;
    const isWarning = item.percentage >= 75 && item.percentage < 85;

    return (
      <View
        style={[styles.subjectCard, { backgroundColor: colors.card }]}
      >
        <View style={styles.subjectContent}>
          <Text style={[styles.subjectName, { color: colors.text }]}>{item.month}</Text>
          <Text style={[styles.subjectDetails, { color: colors.textSecondary }]}>
            {item.attended} / {item.total} classes
          </Text>
          <View style={[styles.statusBadge, {
            backgroundColor: isLow ? colors.errorBg : isWarning ? colors.warningBg : colors.successBg
          }]}>
            <Text style={[styles.statusText, {
              color: isLow ? colors.error : isWarning ? colors.warning : colors.success
            }]}>
              {isLow ? 'Low' : isWarning ? 'Warning' : 'Safe'}
            </Text>
          </View>
        </View>
        <CircularProgress percentage={item.percentage} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <FlatList
        data={attendanceData?.months ? [...attendanceData.months] : []}
        keyExtractor={(item) => item.month}
        renderItem={renderMonthItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
        ListHeaderComponent={headerComponent}
      />

      {/* Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showInfoModal}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="shield-checkmark-outline" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Smart Auto-Login</Text>
            </View>

            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              The Student Portal connects safely to the college ERP (erp.nrcmec.org).
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary, marginTop: 8 }]}>
              We use your saved app credentials to <Text style={{ color: colors.success, fontWeight: 'bold' }}>automatically fill</Text> the username and password fields for you.
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  emptyText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalCard: {
    width: '85%',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  bellBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  profileDept: {
    fontSize: 13,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  statSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  subjectCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectContent: {
    flex: 1,
  },
  subjectName: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subjectDetails: {
    fontSize: 13,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  circleOuter: {
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInner: {
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
