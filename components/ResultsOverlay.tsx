import { Text } from './ThemedText';
import { API_CONFIG } from '@/constants/config';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, RefreshControl, ScrollView, StyleSheet,  TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useResults } from '../context/ResultsContext';
import { useTheme } from '../context/ThemeContext';
import { ResultsService, SemesterResult, SubjectResult } from '../services/results';
import { BacklogTracker, GPATrendChart } from './ResultsEnhancements';

const SubjectRow = ({ subject, isDark, colors }: { subject: SubjectResult, isDark: boolean, colors: typeof Colors.light }) => {
    const isFail = subject.result.toUpperCase() === 'F' ||
        subject.grade.toUpperCase() === 'F' ||
        subject.grade.toLowerCase() === 'ab';

    const isPass = !isFail && (subject.result.toUpperCase().includes('P') || (subject.grade !== '-' && subject.grade !== 'null'));

    const badgeText = subject.result !== '-' ? subject.result : (isFail ? 'F' : 'P');
    const gradeColor = isPass ? colors.success : colors.error;
    const borderColor = colors.cardBorder || (isDark ? '#333' : '#eee');

    return (
        <View style={[styles.subjectRow, { borderBottomColor: borderColor }]}>
            <View style={styles.subjectInfo}>
                <Text style={[styles.subjectName, { color: colors.text }]}>{subject.subjectName}</Text>
                <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>{subject.subjectCode}</Text>
            </View>
            <View style={styles.marksContainer}>
                {subject.internal !== '-' && (
                    <View style={styles.markBox}>
                        <Text style={[styles.markLabel, { color: colors.textSecondary }]}>Int</Text>
                        <Text style={[styles.markValue, { color: colors.text }]}>{subject.internal}</Text>
                    </View>
                )}
                {subject.credits !== '-' && (
                    <View style={styles.markBox}>
                        <Text style={[styles.markLabel, { color: colors.textSecondary }]}>Cr</Text>
                        <Text style={[styles.markValue, { color: colors.text }]}>{subject.credits}</Text>
                    </View>
                )}
                {subject.grade !== '-' && subject.grade !== subject.result && (
                    <View style={styles.markBox}>
                        <Text style={[styles.markLabel, { color: colors.textSecondary }]}>Grd</Text>
                        <Text style={[styles.markValue, { color: colors.text }]}>{subject.grade}</Text>
                    </View>
                )}
                <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '20' }]}>
                    <Text style={[styles.gradeText, { color: gradeColor }]}>{badgeText}</Text>
                </View>
            </View>
        </View>
    );
};

const SemesterCard = ({ semester, isDark, colors }: { semester: SemesterResult, isDark: boolean, colors: typeof Colors.light }) => {
    const [expanded, setExpanded] = useState(false);
    const borderColor = colors.cardBorder || (isDark ? '#333' : '#eee');

    const totalSubjects = semester.subjects.length;
    const passedSubjects = semester.subjects.filter(s => {
        const isFail = s.result.toUpperCase() === 'F' ||
            s.grade.toUpperCase() === 'F' ||
            s.grade.toLowerCase() === 'ab';
        return !isFail && (s.result.toUpperCase().includes('P') || (s.grade !== '-' && s.grade !== 'null'));
    }).length;

    const progress = totalSubjects > 0 ? passedSubjects / totalSubjects : 0;

    return (
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#ccc' }]}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpanded(!expanded)}
                style={[styles.cardHeader, { borderBottomWidth: expanded ? 1 : 0, borderBottomColor: borderColor }]}
            >
                <View>
                    <Text style={[styles.semesterTitle, { color: colors.text }]}>{semester.semester}</Text>
                    <Text style={[styles.sgpaText, { color: colors.textSecondary }]}>
                        SGPA: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{semester.sgpa}</Text>
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={[styles.summaryBadge, { backgroundColor: progress === 1 ? colors.success + '20' : colors.warning + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }]}>
                        <Text style={[styles.summaryText, { color: progress === 1 ? colors.success : colors.warning }]}>
                            {passedSubjects}/{totalSubjects} Passed
                        </Text>
                    </View>
                    <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                </View>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.cardContent}>
                    {semester.subjects.map((subject, idx) => (
                        <Animated.View
                            key={idx}
                            entering={FadeInDown.delay(idx * 50).duration(400).springify()}
                        >
                            <SubjectRow subject={subject} isDark={isDark} colors={colors} />
                        </Animated.View>
                    ))}
                </View>
            )}
        </View>
    );
};

export default function ResultsOverlay() {
    const {
        isVisible,
        hideResults,
        results,
        loading,
        error,
        setResultsData,
        setLoadingState,
        setErrorState,
        fetchSignal
    } = useResults();
    const { colors, isDark } = useTheme();

    // Handle Hardware Back Button
    useEffect(() => {
        const onBackPress = () => {
            if (isVisible) {
                hideResults();
                return true; // Prevent default behavior (exit app)
            }
            return false; // Let default behavior happen
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => backHandler.remove();
    }, [isVisible, hideResults]);

    const onGestureEvent = ({ nativeEvent }: any) => {
        if (nativeEvent.translationX > 50 && nativeEvent.state === State.ACTIVE) {
            hideResults();
        }
    };

    const [viewOriginal, setViewOriginal] = useState(false);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [statusText, setStatusText] = useState('Initializing...');
    const [webViewKey, setWebViewKey] = useState(0);

    // ... (loadCredentials and effects)

    const loadCredentials = useCallback(async () => {
        try {
            const savedUser = await SecureStore.getItemAsync('user_credentials');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                const newUsername = parsed.studentId || '';
                const newPassword = parsed.pass || '';

                // Only update if changed or not set
                if (newUsername !== credentials.username || newPassword !== credentials.password) {
                    setResultsData(null); // Clear old results
                    setCredentials({
                        username: newUsername,
                        password: newPassword
                    });
                    setStatusText('Pre-loading Results...');
                }
            }
        } catch {
            // Error loading credentials
        }
    }, [credentials, setResultsData]);

    useFocusEffect(
        useCallback(() => {
            loadCredentials();
        }, [loadCredentials])
    );

    useEffect(() => {
        // Initial load
        setResultsData(null);
        loadCredentials();
    }, [setResultsData, loadCredentials]);

    const attemptFetch = useCallback(() => {
        setLoadingState(true);
        setErrorState(null);
        setStatusText('Checking for results...');
        // Force WebView reload/remount
        setWebViewKey(prev => prev + 1);
    }, [setLoadingState, setErrorState]);

    // Listen for external fetch triggers
    useEffect(() => {
        if (fetchSignal > 0) {
            attemptFetch();
        }
    }, [fetchSignal, attemptFetch]);

    const toggleView = () => {
        setViewOriginal(!viewOriginal);
    };

    const INJECTED_JAVASCRIPT = `
    (function() {

            function log(msg) {
                window.ReactNativeWebView.postMessage(msg);
            }

            // DEBUG: Log where we are
            log('DEBUG: Loc: ' + window.location.href);
            try {
                log('DEBUG: Title: ' + document.title);
                var bodySnippet = document.body.innerText.substring(0, 100).replace(/\\n/g, ' ');
                log('DEBUG: BodyStart: ' + bodySnippet);
                var inputs = document.querySelectorAll('input');
                log('DEBUG: Inputs: ' + inputs.length);
                for (var i = 0; i < inputs.length; i++) {
                    log('DEBUG: Input[' + i + ']: ' + (inputs[i].id || inputs[i].name || inputs[i].type));
                }
            } catch (e) { }

            function isLoginForm() {
                var body = document.body.innerText.toLowerCase();
                return document.querySelector('input[type="password"]') ||
                    body.includes('sign in') ||
                    body.includes('login') ||
                    body.includes('student office');
            }

            function sendHtml() {
                var html = document.documentElement.outerHTML;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'HTML_SOURCE',
                    html: html
                }));
            }

            if (window.location.href.toLowerCase().includes('overallmarks.aspx') && !isLoginForm()) {
                log('RESULTS_READY');
                sendHtml();
            }

            function tryRefill() {
                var acted = false;

                // 1. Try Username
                var u = document.querySelector('input[placeholder="User Name"]') ||
                    document.querySelector('input[id*="txtUserName"]');

                if (u && "${credentials.username}") {
                    if (u.value !== "${credentials.username}") {
                        log('STATUS: Filling Username...');
                        u.value = "${credentials.username}";
                        u.dispatchEvent(new Event('input', { bubbles: true }));
                        u.dispatchEvent(new Event('change', { bubbles: true }));
                        acted = true;
                    }
                }

                // 2. Try Password
                var p = document.querySelector('input[type="password"]');

                if (p && "${credentials.password}") {
                    if (p.value !== "${credentials.password}") {
                        log('STATUS: Filling Password...');
                        p.value = "${credentials.password}";
                        p.dispatchEvent(new Event('input', { bubbles: true }));
                        p.dispatchEvent(new Event('change', { bubbles: true }));
                        acted = true;
                    }
                }

                // 3. Click Submit/Next if we are on a login form
                if (isLoginForm()) {
                    var btn = document.querySelector('input[type="submit"]') ||
                        document.querySelector('button[type="submit"]') ||
                        document.querySelector('input[value="Next"]') ||
                        document.querySelector('input[value="Submit"]') ||
                        document.querySelector('button'); // Fallback

                    if (btn) {
                        // Only click if we just acted, OR if we haven't clicked in a while (throttle)
                        // For now, let's just click if we found a password field or it looks like a login page
                        if (acted || p) {
                            log('STATUS: Clicking Submit...');
                            btn.click();

                            // Helper: Redirect if stuck
                            setTimeout(function () {
                                if (!window.location.href.toLowerCase().includes('overallmarks')) {
                                    // Only redirect if we definitely succeeded in leaving login (heuristic)
                                    // Actually, let's trust the browser navigation unless we are sure.
                                }
                            }, 3000);
                            return true;
                        }
                    }
                }

                // 4. Dashboard Link (if we are logged in but not on results)
                if (!window.location.href.toLowerCase().includes('overallmarks') && !isLoginForm()) {
                    var xpath = "//a[contains(text(),'Overall Marks Result')]";
                    var dashboardLink = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

                    if (dashboardLink) {
                        log('STATUS: Clicking Result Link...');
                        dashboardLink.click();
                        return true;
                    }
                }
                return acted;
            }

            var lastHtmlLength = 0;
            var lastSendTime = 0;
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (tryRefill()) return;

                    if (window.location.href.toLowerCase().includes('overallmarks.aspx') && !isLoginForm()) {
                        var currentHtml = document.documentElement.outerHTML;
                        var now = Date.now();
                        if (Math.abs(currentHtml.length - lastHtmlLength) > 1000 && (now - lastSendTime > 1000)) {
                            lastHtmlLength = currentHtml.length;
                            lastSendTime = now;
                            log('STATUS: Content updated...');
                            sendHtml();
                        }
                    }
                });
            });

            observer.observe(document.body, { childList: true, subtree: true });

            var attempts = 0;
            var interval = setInterval(function () {
                attempts++;
                var clicked = tryRefill();
                if (clicked || attempts > 200) {
                    clearInterval(interval);
                    observer.disconnect();
                }
            }, 100);
        })();
    true;
    `;

    const handleMessage = async (event: any) => {
        try {
            const msg = event.nativeEvent.data;
            if (msg === 'RESULTS_READY') {
                setStatusText('Parsing results...');
            } else if (msg.startsWith('STATUS:')) {
                setStatusText(msg.replace('STATUS: ', ''));
            } else {
                const data = JSON.parse(msg);
                if (data.type === 'HTML_SOURCE') {
                    const parsed = await ResultsService.parseResults(data.html);
                    if (parsed) {
                        setResultsData(parsed);
                        setLoadingState(false);
                    }
                }
            }
        } catch {
            // Ignore
        }
    };

    // if (!isVisible) return null; // REMOVED to keep WebView alive

    return (
        <View style={[styles.overlayContainer, !isVisible && styles.hiddenContainer]} pointerEvents={isVisible ? 'auto' : 'none'}>
            <View style={[styles.backdrop, { opacity: isVisible ? 1 : 0 }]} />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    activeOffsetX={[0, 50]} // Only activate on right swipe
                    failOffsetY={[-20, 20]} // Fail if vertical swipe is too large
                >
                    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, opacity: isVisible ? 1 : 0, transform: [{ translateY: isVisible ? 0 : 1000 }] }]}>
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee', backgroundColor: colors.card }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={hideResults} style={{ marginRight: 10, padding: 4 }}>
                                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                                </TouchableOpacity>
                                <View>
                                    <Text style={[styles.headerTitle, { color: colors.text }]}>Academic Dashboard</Text>
                                    {/* Removed simple CGPA text here as it's now in the dashboard */}
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={toggleView} style={{ marginRight: 15 }}>
                                    <Ionicons name={viewOriginal ? "list" : "globe-outline"} size={24} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={hideResults} style={styles.closeButton}>
                                    <Ionicons name="close-circle" size={32} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Main Content Area */}
                        <View style={{ flex: 1 }}>
                            <View style={{
                                flex: viewOriginal ? 1 : 0,
                                height: viewOriginal ? '100%' : 1,
                                opacity: viewOriginal ? 1 : 0,
                                overflow: 'hidden'
                            }}>
                                <WebView
                                    key={`${credentials.username}-${webViewKey}`}
                                    source={{ uri: API_CONFIG.ENDPOINTS.RESULTS }}
                                    injectedJavaScript={INJECTED_JAVASCRIPT}
                                    onMessage={handleMessage}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    incognito={true}
                                    cacheEnabled={false}
                                    style={{ flex: 1 }}
                                />
                            </View>

                            {!viewOriginal && (
                                <View style={{ ...StyleSheet.absoluteFillObject }}>
                                    {loading && !results ? (
                                        <View style={styles.centerContainer}>
                                            <ActivityIndicator size="large" color={colors.primary} />
                                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{statusText}</Text>
                                            <TouchableOpacity style={[styles.retryButton, { marginTop: 20, backgroundColor: colors.card }]} onPress={() => setViewOriginal(true)}>
                                                <Text style={[styles.retryText, { color: colors.primary }]}>View Original Page</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : error ? (
                                        <View style={styles.centerContainer}>
                                            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                                            <Text style={[styles.errorText, { color: colors.text }]}>Failed to load results</Text>
                                            <View style={{ height: 20 }} />
                                            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={attemptFetch}>
                                                <Text style={styles.retryText}>Retry</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setViewOriginal(true)}>
                                                <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>View Original Webpage</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <ScrollView
                                            style={styles.scrollContainer}
                                            contentContainerStyle={styles.scrollContent}
                                            refreshControl={
                                                <RefreshControl refreshing={loading} onRefresh={attemptFetch} tintColor={colors.primary} />
                                            }
                                        >
                                            {results?.semesters.length === 0 ? (
                                                <View style={styles.centerContainer}>
                                                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No results found.</Text>
                                                    <Text style={{ color: colors.textSecondary, marginBottom: 20, textAlign: 'center', marginTop: 10 }}>
                                                        The parser couldn&apos;t find your marks table.
                                                    </Text>
                                                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => setViewOriginal(true)}>
                                                        <Text style={styles.retryText}>View Original Page</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <>
                                                    {results && (
                                                        <>
                                                            <BacklogTracker semesters={results.semesters} colors={colors} />
                                                            <GPATrendChart semesters={results.semesters} colors={colors} />


                                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                                                <Text style={[styles.sectionTitle, { color: colors.text }]}>SEMESTER DETAILS</Text>
                                                                <View style={{ height: 1, flex: 1, backgroundColor: colors.textSecondary, marginLeft: 16, opacity: 0.2 }} />
                                                            </View>
                                                        </>
                                                    )}

                                                    {results?.semesters.map((sem, index) => (
                                                        <Animated.View
                                                            key={index}
                                                            entering={FadeInDown.delay(index * 100).duration(600).springify()}
                                                        >
                                                            <SemesterCard semester={sem} isDark={isDark} colors={colors} />
                                                        </Animated.View>
                                                    ))}
                                                </>
                                            )}
                                            <View style={{ height: 40 }} />
                                        </ScrollView>
                                    )}
                                </View>
                            )}
                        </View>
                    </SafeAreaView>
                </PanGestureHandler>
            </GestureHandlerRootView>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
    },
    hiddenContainer: {
        top: 10000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        flex: 1,
        marginTop: 0,
        // borderTopLeftRadius: 20, // Removed for full screen
        // borderTopRightRadius: 20, // Removed for full screen
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    closeButton: {
        padding: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    errorSubText: {
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        borderRadius: 16,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    cardHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    semesterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sgpaText: {
        fontSize: 14,
        marginTop: 4,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryBadge: {
        marginRight: 8,
    },
    summaryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        padding: 0,
    },
    subjectRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    subjectInfo: {
        flex: 1,
        paddingRight: 8,
    },
    subjectName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    subjectCode: {
        fontSize: 12,
    },
    marksContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    markBox: {
        alignItems: 'center',
        width: 35,
        marginRight: 4,
    },
    markLabel: {
        fontSize: 10,
    },
    markValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    gradeBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    gradeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5
    }
});
