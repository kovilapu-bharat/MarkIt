export const API_CONFIG = {
    BASE_URL: 'https://www.nrcmec.org',
    ENDPOINTS: {
        LOGIN: '/Student/login.php',
        ATTENDANCE: '/Student/Date_wise_attendance.php',
        FEE_RECEIPT: '/Student/Fee_Receipt',
        RESULTS: 'https://erp.nrcmec.org/StudentLogin/Student/overallMarks.aspx',
    },
    HEADERS: {
        USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        CONTENT_TYPE: 'application/x-www-form-urlencoded',
    },
    TIMEOUT: 30000,
    SELECTORS: {
        ATTENDANCE_SUMMARY_TABLE: '.summary-table',
        ATTENDANCE_TABLE: 'table',
        PRESENT_CLASS: 'present',
        ABSENT_CLASS: 'absent',
        NOT_POSTED_CLASS: 'not-posted',
        FEE_RECEIPT_ITEM: '.receipt-item',
        LOGIN_ERROR_INVALID: 'Invalid Credentials',
        LOGIN_ERROR_INCORRECT: 'incorrect',
    }
};
