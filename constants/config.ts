export const API_CONFIG = {
    BASE_URL: 'https://www.nrcmec.org',
    ENDPOINTS: {
        LOGIN: '/Student/login.php',
        ATTENDANCE: '/Student/Date_wise_attendance.php',
        RESULTS: 'https://erp.nrcmec.org/StudentLogin/Student/overallMarks.aspx',
    },
    HEADERS: {
        USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        CONTENT_TYPE: 'application/x-www-form-urlencoded',
    },
    TIMEOUT: 30000,
};
