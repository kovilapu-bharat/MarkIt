import { API_CONFIG } from '../constants/config';
import api from './api';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('react-native-cheerio');

export interface FeeReceipt {
    id: string;
    receiptNo: string;
    date: string;
    amount: string;
    academicYear: string;
    description: string;
    downloadLink?: string;
}

export const FeeService = {
    getAcademicYears: async (): Promise<string[]> => {
        try {
            console.log('Fetching fee page to get academic years...');
            const response = await api.get(API_CONFIG.ENDPOINTS.FEE_RECEIPT);
            const html = response.data;
            const $ = cheerio.load(html);

            const years: string[] = [];
            $('#academic_year option').each((i: number, el: any) => {
                const val = $(el).attr('value');
                if (val && val.trim() !== '') {
                    years.push(val.trim());
                }
            });

            return years;
        } catch (error) {
            console.error('Error fetching academic years:', error);
            // Return defaults if fetch fails
            return ['2025-26', '2024-25'];
        }
    },

    getReceipts: async (year: string): Promise<FeeReceipt[]> => {
        try {
            console.log(`Fetching receipts for Academic Year: ${year}`);

            const params = new URLSearchParams();
            params.append('academic_year', year);

            const response = await api.post(API_CONFIG.ENDPOINTS.FEE_RECEIPT, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const html = response.data;
            const $post = cheerio.load(html);
            const receipts: FeeReceipt[] = [];

            // 3. Parse specific .receipt-item cards
            const receiptItems = $post('.receipt-item');
            console.log(`Found ${receiptItems.length} receipt items.`);

            receiptItems.each((i: number, el: any) => {
                try {
                    const $el = $post(el);

                    // Extract Receipt No
                    const receiptNo = $el.find("strong:contains('Receipt No.:')").next('span').text().trim();
                    // Extract Date
                    const date = $el.find("strong:contains('Date of Payment:')").next('span').text().trim();
                    // Extract Total Amount (from valid table row)
                    let amount = $el.find("td:contains('TOTAL')").next('td').text().trim();
                    if (!amount) {
                        amount = $el.find("th:contains('AMOUNT')").parents('table').find('tr:last td:last').text().trim();
                    }
                    // Extract Academic Year
                    const academicYearText = $el.find("td:contains('Academic Year:')").text().trim();
                    const academicYear = academicYearText.replace('Academic Year:', '').trim();
                    // Extract Description
                    const particular = $el.find("table tbody tr").eq(1).find('td').eq(1).text().trim();
                    const description = particular || 'Fee Payment';

                    if (receiptNo) {
                        receipts.push({
                            id: receiptNo,
                            receiptNo: receiptNo,
                            date: date || 'Unknown Date',
                            amount: amount || 'N/A',
                            academicYear: academicYear || year,
                            description: description,
                            downloadLink: undefined
                        });
                    }
                } catch (err) {
                    console.error('Error parsing receipt item:', err);
                }
            });

            console.log(`Parsed ${receipts.length} fee receipts.`);
            return receipts;

        } catch (error) {
            console.error('Error fetching fee receipts:', error);
            throw error;
        }
    }
};
