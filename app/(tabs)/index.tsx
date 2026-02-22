import { useResults } from '@/context/ResultsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { ScalePressable } from '../../components/ScalePressable';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { AttendanceResponse, AttendanceService, MonthlyAttendance } from '../../services/attendance';
import { AuthService, StudentProfile } from '../../services/auth';

// --- Premium Sync Component ---
const SyncedCard = ({ title, subtitle, icon, loading, loadingText, loadingSubtitle, onPress, isDark, colors, color, subtitleValue }: any) => {
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (loading) {
      rotation.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1);
      // Breathing animation: Scale up and down
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true // Reverse
      );
    } else {
      rotation.value = 0; // Reset
      opacity.value = 1;
    }
  }, [loading, rotation, opacity]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: opacity.value === 1 ? 1 : (opacity.value + 0.2) }], // Scale with opacity for breathing efffect
      opacity: opacity.value,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <ScalePressable
      style={[styles.gridItem, { opacity: loading ? 0.8 : 1 }]} // Slightly higher opacity for premium glass feel
      onPress={onPress}
      disabled={loading}
    >
      <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.gridCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
        <View style={[styles.gridIcon, { backgroundColor: color + '20' }]}>
          {loading ? (
            <Animated.View style={animatedIconStyle}>
              <Ionicons name="sync" size={24} color={color} />
            </Animated.View>
          ) : (
            <Ionicons name={icon} size={24} color={color} />
          )}
        </View>
        <View>
          {loading ? (
            <Animated.View style={animatedTextStyle}>
              <Text style={[styles.gridTitle, { color: colors.text }]}>{loadingText}</Text>
              <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>{loadingSubtitle}</Text>
            </Animated.View>
          ) : (
            <View>
              <Text style={[styles.gridTitle, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>
                {subtitleValue || subtitle}
              </Text>
            </View>
          )}
        </View>
      </BlurView>
    </ScalePressable>
  );
};

export default function HomeScreen() {
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  /* New State for Fee Loading */
  const [feeLoading, setFeeLoading] = useState(false);


  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  // @ts-ignore - Consume initFetch and loading state
  const { showResults, initFetch, loading: resultsLoading } = useResults();

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

      // Trigger Results Fetch in Background
      initFetch();

      // Trigger Fees Fetch
      fetchFees();

    } catch {
      // Fetch error handled silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router, initFetch]); // Added initFetch dependency

  const fetchFees = async () => {
    setFeeLoading(true);
    try {
      // Dynamic import to avoid circular dependencies if any
      const { FeeService } = await import('../../services/FeeService');

      // Get current academic year first
      const years = await FeeService.getAcademicYears();
      const currentYear = years.length > 0 ? years[0] : '2025-26';

      await FeeService.getReceipts(currentYear);

    } catch {
      // Fee fetch error handled silently
    } finally {
      setFeeLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ... (Keep existing cleanup and headerComponent code until statsRow) ... 

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
          <ScalePressable
            onPress={() => router.push('/notifications')}
            style={[styles.iconBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card, marginRight: 8 }]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </ScalePressable>
          <ScalePressable
            onPress={() => router.push('/settings' as any)}
            style={[styles.iconBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </ScalePressable>
        </View>
      </View>

      {/* Profile Card with Glassmorphism */}
      <Animated.View entering={FadeInDown.delay(100).duration(800).springify()}>
        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.profileCard, { borderColor: colors.cardBorder, borderWidth: 1, backgroundColor: isDark ? 'rgba(30,30,30,0.5)' : 'rgba(255,255,255,0.7)' }]}>
          <ScalePressable
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
            onPress={() => router.push('/student-profile' as any)}
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
          </ScalePressable>
        </BlurView>
      </Animated.View>

      {/* Stats Row with Glassmorphism */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(800).springify()}
        style={styles.statsRow}
      >
        <View style={{ flex: 1 }}>
          <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.statCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
            <View style={styles.statHeader}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>OVERALL</Text>
            </View>
            <View>
              <AnimatedNumber
                value={attendanceData?.overallPercentage || 0}
                style={[styles.statValue, { color: (attendanceData?.overallPercentage || 0) >= 75 ? colors.success : colors.error }]}
                suffix="%"
              />
              <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>
                {attendanceData?.semesterTotal ? `${attendanceData.semesterTotal.attended} / ${attendanceData.semesterTotal.total} classes` : 'Total Attendance'}
              </Text>
            </View>
          </BlurView>
        </View>

        <View style={{ flex: 1 }}>
          <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.statCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
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
                <View>
                  <AnimatedNumber
                    value={canSkip}
                    style={[styles.statValue, { color: canSkip > 0 ? colors.success : colors.textSecondary, fontSize: 32 }]}
                  />
                  <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>classes you can skip</Text>
                </View>
              );
            })()}
          </BlurView>
        </View>
      </Animated.View>

      {/* Quick Actions Grid */}
      <Animated.View entering={FadeInDown.delay(300).duration(800).springify()} style={{ marginBottom: 24 }}>
        <View style={styles.gridContainer}>
          {/* Exam Results Card */}
          <SyncedCard
            title="Exam Results"
            subtitle="Grades & CGPA"
            icon="school-outline"
            loading={resultsLoading}
            loadingText="Syncing..." // Premium Text
            loadingSubtitle="Checking portal..."
            onPress={() => showResults()}
            isDark={isDark}
            colors={colors}
            color={colors.primary}
          />

          {/* Fee Receipts Card */}
          <SyncedCard
            title="Fee Receipts"
            subtitle="Payment History"
            icon="receipt-outline"
            loading={feeLoading}
            loadingText="Syncing..."
            loadingSubtitle="Fetching records..."
            onPress={() => router.push('/fee-receipts' as any)}
            isDark={isDark}
            colors={colors}
            color={colors.warning}
            subtitleValue={undefined}
          />
        </View>
      </Animated.View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Attendance</Text>
      </View>
    </Animated.View >
  );

  if (loading) {
    const skeletonColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';

    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <LinearGradient
          colors={isDark ? ['#1a1a2e', '#16213e'] : ['#f0f4ff', '#e8f0fe']}
          style={StyleSheet.absoluteFill}
        />
        {/* Skeleton Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <SkeletonLoader width={100} height={14} style={{ backgroundColor: skeletonColor }} />
            <SkeletonLoader width={150} height={24} style={{ marginTop: 8, backgroundColor: skeletonColor }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SkeletonLoader width={44} height={44} borderRadius={22} style={{ backgroundColor: skeletonColor }} />
            <SkeletonLoader width={44} height={44} borderRadius={22} style={{ backgroundColor: skeletonColor }} />
          </View>
        </View>

        {/* Skeleton Profile Card */}
        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.profileCard, { borderColor: colors.cardBorder, borderWidth: 1, backgroundColor: isDark ? 'rgba(30,30,30,0.5)' : 'rgba(255,255,255,0.7)' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <SkeletonLoader width={60} height={60} borderRadius={30} style={{ backgroundColor: skeletonColor }} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <SkeletonLoader width="60%" height={20} style={{ backgroundColor: skeletonColor }} />
              <SkeletonLoader width="40%" height={14} style={{ marginTop: 8, backgroundColor: skeletonColor }} />
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                <SkeletonLoader width={60} height={20} borderRadius={8} style={{ backgroundColor: skeletonColor }} />
                <SkeletonLoader width={80} height={20} borderRadius={8} style={{ backgroundColor: skeletonColor }} />
              </View>
            </View>
          </View>
        </BlurView>

        {/* Skeleton Stats */}
        <View style={styles.statsRow}>
          <View style={{ flex: 1 }}>
            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.statCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
              <View style={styles.statHeader}>
                <SkeletonLoader width={16} height={16} borderRadius={8} style={{ backgroundColor: skeletonColor }} />
                <SkeletonLoader width={60} height={12} style={{ marginLeft: 6, backgroundColor: skeletonColor }} />
              </View>
              <View>
                <SkeletonLoader width={80} height={36} style={{ backgroundColor: skeletonColor }} />
                <SkeletonLoader width={100} height={12} style={{ marginTop: 4, backgroundColor: skeletonColor }} />
              </View>
            </BlurView>
          </View>
          <View style={{ flex: 1 }}>
            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.statCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
              <View style={styles.statHeader}>
                <SkeletonLoader width={16} height={16} borderRadius={8} style={{ backgroundColor: skeletonColor }} />
                <SkeletonLoader width={80} height={12} style={{ marginLeft: 6, backgroundColor: skeletonColor }} />
              </View>
              <View>
                <SkeletonLoader width={40} height={36} style={{ backgroundColor: skeletonColor }} />
                <SkeletonLoader width={120} height={12} style={{ marginTop: 4, backgroundColor: skeletonColor }} />
              </View>
            </BlurView>
          </View>
        </View>

        {/* Skeleton Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <View style={styles.gridContainer}>
            {[1, 2].map((i) => (
              <View key={i} style={[styles.gridItem, { opacity: 1 }]}>
                <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.gridCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
                  <View style={[styles.gridIcon, { backgroundColor: colors.cardBorder }]}>
                    <SkeletonLoader width={24} height={24} borderRadius={12} style={{ backgroundColor: skeletonColor }} />
                  </View>
                  <View>
                    <SkeletonLoader width={100} height={16} style={{ backgroundColor: skeletonColor }} />
                    <SkeletonLoader width={80} height={12} style={{ marginTop: 4, backgroundColor: skeletonColor }} />
                  </View>
                </BlurView>
              </View>
            ))}
          </View>
        </View>

        {/* Skeleton Monthly Attendance List */}
        <View style={styles.sectionHeader}>
          <SkeletonLoader width={180} height={20} style={{ backgroundColor: skeletonColor }} />
        </View>

        <View>
          {[1, 2, 3].map((i) => (
            <BlurView key={i} intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.subjectCard, { backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.cardBorder, borderWidth: 1 }]}>
              <View style={styles.subjectContent}>
                <SkeletonLoader width={100} height={18} style={{ backgroundColor: skeletonColor }} />
                <SkeletonLoader width={140} height={14} style={{ marginTop: 6, backgroundColor: skeletonColor }} />
                <SkeletonLoader width={60} height={20} borderRadius={10} style={{ marginTop: 8, backgroundColor: skeletonColor }} />
              </View>
              <SkeletonLoader width={56} height={56} borderRadius={30} style={{ backgroundColor: skeletonColor }} />
            </BlurView>
          ))}
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
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    height: 115,
    justifyContent: 'space-between',
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
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  gridCard: {
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'flex-start',
    height: 115,
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
