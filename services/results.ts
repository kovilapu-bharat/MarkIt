import { API_CONFIG } from '../constants/config';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import api from './api';
import { AuthService } from './auth';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('react-native-cheerio');

export interface SubjectResult {
    subjectCode: string;
    subjectName: string;
    internal: string;
    external: string;
    total: string;
    result: string; // P or F
    grade: string;  // Letter Grade (O, A+, B, etc.)
    credits: string;
}

export interface SemesterResult {
    semester: string; // e.g. "1-2"
    sgpa: string;
    subjects: SubjectResult[];
    totalCredits?: string;
}

export interface ResultsData {
    cgpa: string;
    semesters: SemesterResult[];
    isOffline: boolean;
}

export const ResultsService = {
    getResults: async (): Promise<ResultsData> => {
        try {
            console.log('Fetching results page...');
            console.log(`Fetching results from: ${API_CONFIG.ENDPOINTS.RESULTS}`);

            let response = await api.get(API_CONFIG.ENDPOINTS.RESULTS);
            let html = response.data;

            if (html.includes('login.php') || html.includes('Enter Roll No')) {
                console.log('Session expired (results), re-authenticating...');
                const credentials = await AuthService.getCredentials();
                if (!credentials) throw new Error('Not logged in');
                await AuthService.login(credentials.studentId, credentials.pass);
                response = await api.get(API_CONFIG.ENDPOINTS.RESULTS);
                html = response.data;
            }

            return await ResultsService.parseResults(html);

        } catch (error: any) {
            console.warn('Results fetch error:', error.message);
            throw error;
        }
    },

    // Parse HTML content to extract results
    parseResults: async (html: string): Promise<ResultsData> => {
        try {
            const $ = cheerio.load(html);
            const semesters: SemesterResult[] = [];
            let cgpa = 'N/A';

            console.log(`[Parser] Starting Stateful Row Scan. HTML length: ${html.length}`);

            const allRows = $('tr');
            const headerIndices: number[] = [];

            // 1. Identify all "Header" rows
            allRows.each((i: number, row: any) => {
                const txt = $(row).text().toLowerCase();
                if (txt.includes('s.no') && txt.includes('code') && txt.includes('subject')) {
                    headerIndices.push(i);
                }
            });

            console.log(`[Parser] Found ${headerIndices.length} header rows: ${headerIndices.join(', ')}`);

            // 2. Process chunks
            for (let k = 0; k < headerIndices.length; k++) {
                const startIdx = headerIndices[k];
                const endIdx = (k < headerIndices.length - 1) ? headerIndices[k + 1] : allRows.length;

                let semesterName = 'Unknown Semester';
                const subjects: SubjectResult[] = [];
                let sgpa = 'N/A';

                for (let i = startIdx + 1; i < endIdx; i++) {
                    const currentRow = $(allRows[i]);
                    const rowText = currentRow.text().trim();
                    const cleanText = rowText.replace(/\s+/g, ' ');

                    // 2a. Detect Semester Name
                    if ((cleanText.toUpperCase().includes('SEM') || cleanText.toUpperCase().includes('YEAR'))) {
                        if (!cleanText.toLowerCase().includes('subject') && !/^\d+\s/.test(cleanText)) {
                            semesterName = rowText.trim();
                            semesterName = semesterName.replace(/(January|February|March|April|May|June|July|August|September|October|November|December)\s*\d{4}/gi, '').trim();
                        }
                    }

                    // 2b. Detect SGPA
                    if (cleanText.toUpperCase().includes('SGPA') || cleanText.toUpperCase().includes('CREDITS OBTAINED')) {
                        const match = cleanText.match(/SGPA\s*[:=\s]*([0-9.]+)/i);
                        if (match) sgpa = match[1];
                    }

                    // 2c. Detect Subject Data
                    const tds = currentRow.find('td');
                    if (tds.length >= 3) {
                        const firstCol = $(tds[0]).text().trim();
                        if (/^\d+$/.test(firstCol)) {
                            const code = $(tds[1]).text().trim();
                            const name = $(tds[2]).text().trim();

                            // Calculate Grade from Ch columns (3 to N)
                            let gradeFound = '-';
                            const gradeCandidates: string[] = [];

                            // Scan for grades
                            for (let c = 3; c < tds.length; c++) {
                                const cellText = $(tds[c]).text().trim();
                                if (/^[OABCDEFPS]$/i.test(cellText) || /^[A-Z]\+?$/.test(cellText) || cellText.toLowerCase() === 'ab') {
                                    gradeCandidates.push(cellText);
                                }
                            }

                            // Status (P/F) logic - Scan last 3 columns to be safe
                            let status = '-';
                            for (let c = tds.length - 1; c >= Math.max(0, tds.length - 4); c--) {
                                const t = $(tds[c]).text().trim();
                                if (t === 'P' || t === 'F') {
                                    status = t;
                                    break;
                                }
                            }

                            // Intelligent Grade Selection
                            if (gradeCandidates.length > 0) {
                                // Prefer letter grades (O, A, B...) over P/F/Status
                                const last = gradeCandidates[gradeCandidates.length - 1];
                                if (last === status && gradeCandidates.length > 1) {
                                    gradeFound = gradeCandidates[gradeCandidates.length - 2];
                                } else {
                                    gradeFound = last;
                                }

                                const bestLetter = gradeCandidates.slice().reverse().find(g => /^[OABCDE]$/i.test(g) || g.includes('+'));
                                if (bestLetter) {
                                    gradeFound = bestLetter;
                                }
                            }

                            // Fallback for status:
                            if (status === '-') {
                                if (gradeFound === 'F' || gradeFound.toLowerCase() === 'ab') status = 'F';
                                else if (gradeFound !== '-') status = 'P';
                            }

                            // Credits
                            let credits = '-';
                            for (let c = tds.length - 1; c >= 3; c--) {
                                const val = $(tds[c]).text().trim();
                                if (/^[0-9]+(\.[0-9]+)?$/.test(val)) {
                                    const num = parseFloat(val);
                                    if (num > 0 && num <= 10) {
                                        credits = val;
                                        break;
                                    }
                                }
                            }

                            subjects.push({
                                subjectCode: code,
                                subjectName: name,
                                internal: '-',
                                external: '-',
                                total: '-',
                                result: status,
                                grade: gradeFound,
                                credits
                            });
                        }
                    }
                }

                if (subjects.length > 0) {
                    if (semesterName === 'Unknown Semester') {
                        semesterName = `Semester ${semesters.length + 1}`;
                    }
                    semesters.push({
                        semester: semesterName,
                        sgpa,
                        subjects
                    });
                }
            }

            // Global CGPA Check
            const bodyText = $('body').text();
            const cgpaMatches = bodyText.matchAll(/CGPA\s*[:=\s]*([0-9.]+)/gi);
            for (const match of cgpaMatches) {
                const val = parseFloat(match[1]);
                if (val <= 10.0) {
                    cgpa = match[1];
                    break;
                }
            }

            const data = {
                cgpa,
                semesters,
                isOffline: false
            };

            console.log(`[Parser] Row Scan Complete. Extracted ${semesters.length} semesters. CGPA: ${cgpa}`);
            await saveData(STORAGE_KEYS.EXAM_RESULTS, data);
            return data;
        } catch (error: any) {
            console.warn('Results parsing error:', error.message);
            throw error;
        }
    },

    getCachedResults: async (): Promise<ResultsData | null> => {
        const cached = await loadData(STORAGE_KEYS.EXAM_RESULTS);
        if (cached) {
            return { ...cached, isOffline: true };
        }
        return null;
    }
};
