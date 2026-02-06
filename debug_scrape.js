
const axios = require('axios');
const fs = require('fs');

const LOGIN_URL = 'https://www.nrcmec.org/Student/login.php';
const FEE_URL = 'https://www.nrcmec.org/Student/Fee_Receipt';
const USERNAME = '23X01A6267P';
const PASSWORD = '23X01A6267P';

async function run() {
    try {
        console.log('1. Attempting Login...');

        // Form data for login (standard php login usually expects form-data or x-www-form-urlencoded)
        const params = new URLSearchParams();
        params.append('roll_no', USERNAME);
        params.append('password', PASSWORD);

        const loginResponse = await axios.post(LOGIN_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            maxRedirects: 0, // Prevent auto-redirect to capture cookies
            validateStatus: (status) => status >= 200 && status < 400
        });

        console.log('Login Status:', loginResponse.status);

        // Extract cookies
        let cookies = [];
        if (loginResponse.headers['set-cookie']) {
            cookies = loginResponse.headers['set-cookie'];
        }

        const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
        console.log('Captured Cookies:', cookieHeader);

        if (!cookieHeader) {
            console.error('No cookies received! Login might have failed.');
            // Sometimes failed login still returns 200, check body?
            return;
        }

        console.log('2. Fetching Fee Receipts (POST with academic_year)...');
        const feeParams = new URLSearchParams();
        feeParams.append('academic_year', '2025-26'); // Hardcoded recent year

        const feeResponse = await axios.post(FEE_URL, feeParams, {
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log('Fee Page Status:', feeResponse.status);
        console.log('Fee Page Length:', feeResponse.data.length);

        // Save to file for analysis
        fs.writeFileSync('debug_fee_page.html', feeResponse.data);
        console.log('Saved HTML to debug_fee_page.html');

    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Headers:', err.response.headers);
        }
    }
}

run();
