
const htmlSnippet = `
    <div class="card">
        <div class="header">OFFICIAL PAYMENT RECEIPT</div>
        <div class="body">
            <div>
                <span>Receipt No.:</span> <span>21605</span>
            </div>
            <div>
                 Date of Payment: 2025-10-21 11:28:49
            </div>
             <div class="row">
                <div class="col">Academic Year: 2025-26</div>
            </div>
             <div class="footer">
                TOTAL ₹5,000.00
            </div>
        </div>
    </div>
    
    <div class="card">
         Unexpected Layout
         Receipt No: 99999
         Amount (Rs.) 10,000.00
    </div>
`;

// Regex Patterns from FeeService.ts
function parse(text: string) {
    console.log("Testing Text:", text);

    const receiptNoMatch = text.match(/Receipt No\.?\s*[:\-]?\s*(\w+)/i);
    const dateMatch = text.match(/Date of Payment\s*[:\-]?\s*([\d- :]+)/i);
    const amountMatch = text.match(/(TOTAL|Amount)\s*[\(Rs\.\)]*[:\-]?\s*[\₹|Rs\.|INR]*\s*([\d,]+\.?\d*)/i);
    const yearMatch = text.match(/Academic Year\s*[:\-]?\s*([\d-]+)/i);

    console.log("Receipt OK?", !!receiptNoMatch, receiptNoMatch ? receiptNoMatch[1] : 'N/A');
    console.log("Date OK?", !!dateMatch, dateMatch ? dateMatch[1] : 'N/A');
    console.log("Amount OK?", !!amountMatch, amountMatch ? amountMatch[2] : 'N/A');
    console.log("Year OK?", !!yearMatch, yearMatch ? yearMatch[1] : 'N/A');
}

// Emulate Cheerio 'text()' behavior (roughly)
const mockCheerioText = htmlSnippet.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
console.log("--- Test 1: Full Body Text Search ---");
parse(mockCheerioText);

console.log("\n--- Test 2: Chunk Splitting Logic ---");
const chunks = mockCheerioText.split(/Receipt No[:.]?/i);
chunks.slice(1).forEach((chunk, i) => {
    console.log(`\nChunk ${i + 1}:`);
    parse("Receipt No: " + chunk); // Re-add prefix
});
