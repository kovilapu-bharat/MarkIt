import { Text } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { FeeReceipt, FeeService } from '@/services/FeeService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

// Skeleton Loader Component
const SkeletonLoader = ({ colors, isDark }: { colors: any; isDark: boolean }) => (
    <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        {[1, 2, 3].map((key) => (
            <View
                key={key}
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        padding: 20,
                        marginBottom: 16,
                    }
                ]}
            >
                {/* Header skeleton */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    {/* Icon circle */}
                    <View style={[styles.skeletonLine, {
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        marginRight: 15,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
                    }]} />
                    {/* Text lines */}
                    <View style={{ flex: 1 }}>
                        <View style={[styles.skeletonLine, { width: '60%', height: 16, marginBottom: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }]} />
                        <View style={[styles.skeletonLine, { width: '40%', height: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />
                    </View>
                    {/* Badge */}
                    <View style={[styles.skeletonLine, { width: 50, height: 24, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />
                </View>
                {/* Separator */}
                <View style={{ height: 1, backgroundColor: colors.cardBorder, marginBottom: 16 }} />
                {/* Footer skeleton */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <View style={[styles.skeletonLine, { width: 70, height: 10, marginBottom: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />
                        <View style={[styles.skeletonLine, { width: 120, height: 14, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }]} />
                    </View>
                    <View style={[styles.skeletonLine, { width: 80, height: 22, borderRadius: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }]} />
                </View>
            </View>
        ))}
    </View>
);

export default function FeeReceiptsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [years, setYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');

    const fetchYears = useCallback(async () => {
        try {
            const fetchedYears = await FeeService.getAcademicYears();
            setYears(fetchedYears);
            // Use functional update to avoid dependency on selectedYear
            if (fetchedYears.length > 0) {
                setSelectedYear(prev => prev || fetchedYears[0]);
            } else if (fetchedYears.length === 0) {
                setLoading(false);
            }
        } catch {
            Alert.alert('Error', 'Failed to load academic years');
            setLoading(false);
        }
    }, []);

    const fetchReceipts = useCallback(async (year: string) => {
        if (!year) return;
        setLoading(true);
        try {
            const data = await FeeService.getReceipts(year);
            setReceipts(data);
        } catch {
            Alert.alert('Error', 'Failed to load fee receipts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchYears();
    }, [fetchYears]);

    useEffect(() => {
        if (selectedYear) {
            fetchReceipts(selectedYear);
        }
    }, [selectedYear, fetchReceipts]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchYears();
    };

    // Calculate Total Paid
    const totalPaid = receipts.reduce((sum, item) => {
        // Clean string "₹45,000.00" -> 45000.00
        const amountStr = item.amount.replace(/[^0-9.]/g, '');
        const amount = parseFloat(amountStr) || 0;
        return sum + amount;
    }, 0);

    const formatCurrency = (amount: number) => {
        return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    };

    const renderItem = ({ item, index }: { item: FeeReceipt; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            style={[styles.card, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#888' }]}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={[styles.receiptNo, { color: colors.text }]}>Receipt #{item.receiptNo}</Text>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>{item.date}</Text>
                </View>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.statusText, { color: colors.success }]}>PAID</Text>
                </View>
            </View>

            <View style={[styles.separator, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.cardFooter}>
                <View style={styles.footerContent}>
                    <Text style={[styles.descriptionLabel, { color: colors.textSecondary }]}>Payment For</Text>
                    <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
                </View>
                <Text style={[styles.amount, { color: colors.primary }]}>{item.amount}</Text>
            </View>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={isDark ? [colors.background, '#1a1a2e'] : ['#e0eafc', '#cfdef3']}
                style={styles.background}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <View style={[styles.backButtonCircle, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </View>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Fee Receipts</Text>
            </View>

            {/* Academic Year Selector */}
            <View style={styles.yearSelectorContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={years}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.yearListContent}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedYear(item)}
                        >
                            <Animated.View
                                entering={FadeInRight.delay(index * 100)}
                                style={[
                                    styles.yearChip,
                                    { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)' },
                                    selectedYear === item && { backgroundColor: colors.primary, borderColor: colors.primary },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.yearText,
                                        { color: colors.textSecondary },
                                        selectedYear === item && styles.yearTextSelected,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Total Summary Card */}
            {!loading && receipts.length > 0 && (
                <Animated.View entering={FadeInDown.duration(600)} style={[styles.summaryCard, { shadowColor: colors.primary }]}>
                    <LinearGradient
                        colors={isDark ? [colors.primary, '#3730a3'] : ['#4361ee', '#3f37c9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.summaryGradient}
                    >
                        <View>
                            <Text style={styles.summaryLabel}>Total Paid ({selectedYear})</Text>
                            <Text style={styles.summaryAmount}>{formatCurrency(totalPaid)}</Text>
                        </View>
                        <View style={styles.summaryIcon}>
                            <Ionicons name="wallet-outline" size={32} color="rgba(255,255,255,0.8)" />
                        </View>
                    </LinearGradient>
                </Animated.View>
            )}

            {loading ? (
                <SkeletonLoader colors={colors} isDark={isDark} />
            ) : receipts.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="document-text-outline" size={80} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>No receipts found</Text>
                    <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Select a different year or pull to refresh</Text>
                </View>
            ) : (
                <FlatList
                    data={receipts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
        zIndex: 10,
    },
    backButton: {
        marginRight: 15,
    },
    backButtonCircle: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    yearSelectorContainer: {
        marginBottom: 20,
        height: 45,
    },
    yearListContent: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    yearChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.7)',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.9)',
    },
    yearChipSelected: {
        backgroundColor: '#4361ee',
        borderColor: '#4361ee',
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    yearText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 14,
    },
    yearTextSelected: {
        color: '#fff',
        fontWeight: '700',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        position: 'relative',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8, // Reduced margin
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
    },
    receiptNo: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    date: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 15,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerContent: {
        flex: 1,
    },
    descriptionLabel: {
        fontSize: 11,
        textTransform: 'uppercase',
        color: '#94a3b8',
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '600',
    },
    amount: {
        fontSize: 22,
        fontWeight: '800',
        color: '#4361ee',
    },
    statusBadge: {
        // No absolute positioning, flow naturally in header or separate
        backgroundColor: '#dcfce7',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginLeft: 10,
    },
    statusText: {
        color: '#16a34a',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    emptyText: {
        fontSize: 20,
        color: '#334155',
        fontWeight: '700',
        marginTop: 20,
    },
    emptySubText: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 8,
    },

    // Summary Card Styles
    summaryCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    summaryGradient: {
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    summaryAmount: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
    },
    summaryIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Skeleton Styles
    skeletonCard: {
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    skeletonLine: {
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
    },
});
