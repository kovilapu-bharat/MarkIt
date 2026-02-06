import { useResults } from '@/context/ResultsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { AttendanceResponse, AttendanceService, MonthlyAttendance } from '../../services/attendance';
import { AuthService, StudentProfile } from '../../services/auth';

export default function HomeScreen() {
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
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



  const mounted = React.useRef(true);
  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const headerComponent = (
    <Animated.View entering={FadeInDown.duration(800).springify()}>
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
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            style={[styles.iconBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card, marginRight: 8 }]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings' as any)}
            style={[styles.iconBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Card with Glassmorphism */}
      <Animated.View entering={FadeInDown.delay(100).duration(800).springify()}>
        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.profileCard, { borderColor: colors.cardBorder, borderWidth: 1, backgroundColor: isDark ? 'rgba(30,30,30,0.5)' : 'rgba(255,255,255,0.7)' }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
            onPress={() => router.push('/student-profile' as any)}
            activeOpacity={0.7}
          >
            <View>
              <Image
                source={{ uri: profile?.profileImage || 'https://via.placeholder.com/60' }}
                style={[styles.profileImage, { backgroundColor: colors.badge, borderColor: colors.success }]}
              />
              {/* Show hint if no image OR if image is the default placeholder */}
              {(!profile?.profileImage || profile.profileImage.includes('default.png')) && (
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    backgroundColor: '#f59e0b', // Amber
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: colors.card,
                    padding: 4,
                    zIndex: 20,
                    elevation: 5,
                  }}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowPhotoModal(true);
                  }}
                >
                  <Ionicons name="information" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
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
          </TouchableOpacity>
        </BlurView>
      </Animated.View>

      {/* Stats Row with Glassmorphism */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(800).springify()}
        style={styles.statsRow}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => router.push('/analytics')}
          activeOpacity={0.8}
        >
          <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.statCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
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
          </BlurView>
        </TouchableOpacity>

        <View style={{ width: 12 }} />

        <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.statCard, { flex: 1, backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
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
        </BlurView>
      </Animated.View>

      {/* Quick Actions Grid */}
      <Animated.View entering={FadeInDown.delay(300).duration(800).springify()} style={{ marginBottom: 24 }}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Quick Actions</Text>

        <View style={styles.gridContainer}>
          {/* Exam Results Card */}
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => showResults()}
            activeOpacity={0.8}
          >
            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.gridCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
              <View style={[styles.gridIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="school-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.gridTitle, { color: colors.text }]}>Exam Results</Text>
              <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>Grades & CGPA</Text>
            </BlurView>
          </TouchableOpacity>

          {/* Fee Receipts Card */}
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/fee-receipts' as any)}
            activeOpacity={0.8}
          >
            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.gridCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
              <View style={[styles.gridIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="receipt-outline" size={24} color={colors.warning} />
              </View>
              <Text style={[styles.gridTitle, { color: colors.text }]}>Fee Receipts</Text>
              <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>Payment History</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </Animated.View>



      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Attendance</Text>
      </View>
    </Animated.View >
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <LinearGradient
          colors={isDark ? ['#1a1a2e', '#16213e'] : ['#f0f4ff', '#e8f0fe']}
          style={StyleSheet.absoluteFill}
        />
        {/* Skeleton Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <SkeletonLoader width={100} height={14} />
            <SkeletonLoader width={150} height={24} style={{ marginTop: 8 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SkeletonLoader width={44} height={44} borderRadius={22} />
            <SkeletonLoader width={44} height={44} borderRadius={22} />
          </View>
        </View>

        {/* Skeleton Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonLoader width={60} height={60} borderRadius={30} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <SkeletonLoader width="80%" height={18} />
              <SkeletonLoader width="50%" height={14} style={{ marginTop: 8 }} />
            </View>
          </View>
        </View>

        {/* Skeleton Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <View style={[styles.statCard, { backgroundColor: colors.card, flex: 1 }]}>
            <SkeletonLoader width={56} height={56} borderRadius={28} />
            <SkeletonLoader width={60} height={12} style={{ marginTop: 8 }} />
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, flex: 1 }]}>
            <SkeletonLoader width={56} height={56} borderRadius={28} />
            <SkeletonLoader width={60} height={12} style={{ marginTop: 8 }} />
          </View>
        </View>

        {/* Skeleton Quick Actions */}
        <View style={{ marginTop: 16 }}>
          <SkeletonLoader width={120} height={16} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 12 }}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={{ width: '47%' }}>
                <SkeletonLoader width="100%" height={80} borderRadius={16} />
              </View>
            ))}
          </View>
        </View>
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
      <BlurView
        intensity={isDark ? 40 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.subjectCard, {
          backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)',
          borderColor: colors.cardBorder,
          borderWidth: 1
        }]}
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
      </BlurView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? [colors.background, '#1a1a1a'] : [colors.primary + '10', colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <FlatList
        data={attendanceData?.months ? [...attendanceData.months] : []}
        keyExtractor={(item) => item.month}
        renderItem={renderMonthItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
        ListHeaderComponent={headerComponent}
        showsVerticalScrollIndicator={false}
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
      {/* Photo Update Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPhotoModal}
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={styles.modalOverlay}>
          <Animated.View
            entering={FadeInDown.springify().damping(15)}
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, overflow: 'hidden' }]}
          >
            <LinearGradient
              colors={isDark ? [colors.background, colors.card] : [colors.card, colors.background]}
              style={StyleSheet.absoluteFill}
            />

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: colors.primary + '15',
                justifyContent: 'center', alignItems: 'center',
                marginBottom: 16,
                borderWidth: 1, borderColor: colors.primary + '30'
              }}>
                <Ionicons name="image-outline" size={32} color={colors.primary} />
                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.badge, borderRadius: 10, padding: 2 }}>
                  <Ionicons name="cloud-upload" size={12} color={colors.success} />
                </View>
              </View>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: 22 }]}>Update Profile Photo</Text>
            </View>

            <Text style={[styles.modalText, { color: colors.textSecondary, marginBottom: 8 }]}>
              Want to see your picture here?
            </Text>
            <Text style={[styles.modalText, { color: colors.text, fontWeight: '500' }]}>
              Please update your profile photo on the <Text style={{ color: colors.primary }}>College Website</Text>.
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary, fontSize: 12, marginTop: 8 }]}>
              It will sync automatically next time you login!
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary, marginTop: 28, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}
              onPress={() => setShowPhotoModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Understood</Text>
            </TouchableOpacity>
          </Animated.View>
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

  profileCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    overflow: 'hidden', // Fix for Android BlurView border radius
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
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden', // Fix for Android BlurView border radius
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
    overflow: 'hidden', // Fix for Android BlurView border radius
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
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
  gridCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    height: 120,
    justifyContent: 'space-between',
    overflow: 'hidden', // Fix for Android BlurView border radius
  },
  gridIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 12,
  },
});
