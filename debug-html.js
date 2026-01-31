const fs = require('fs');
const cheerio = require('react-native-cheerio');

const html = fs.readFileSync('attendance.html', 'utf8');
const $ = cheerio.load(html);

console.log('Total attendance tables:', $('.attendance-table').length);

$('.attendance-table').each((tIdx, table) => {
    console.log(`\nTable ${tIdx + 1}:`);
    const rows = $(table).find('tbody tr');
    console.log('Total rows:', rows.length);

    rows.each((rIdx, row) => {
        const tds = $(row).find('td');
        const date = $(tds[0]).text().replace(/\s+/g, ' ').trim();
        const p6Index = 7;

        let rowInfo = `Row ${rIdx}: Date=${date}, Cols=${tds.length}`;

        if (tds.length > p6Index) {
            const p6 = $(tds[p6Index]);
            const cls = p6.attr('class') || '';
            const txt = p6.text().trim();
            rowInfo += `, P6_Class='${cls}', P6_Text='${txt}'`;

            if (txt.toLowerCase() === 'null') {
                console.log('!!! FOUND NULL IN P6 !!!');
                console.log(rowInfo);
            }
            if (cls === '' && txt === '') {
                console.log('!!! FOUND EMPTY P6 !!!');
                console.log(rowInfo);
            }
        } else {
            rowInfo += `, NO P6 COLUMN (len < ${p6Index + 1})`;
        }

        // checking for any "null" text anywhere
        for (let i = 0; i < tds.length; i++) {
            const t = $(tds[i]).text().trim();
            if (t.toLowerCase() === 'null') {
                console.log(`!!! FOUND 'null' text at Col ${i} in Row ${rIdx} !!!`);
            }
        }
    });
});
