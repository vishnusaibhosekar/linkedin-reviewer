import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import PDFParser from 'pdf2json';

// Load env before any imports
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function testPDFParsing() {
    console.log('🧪 Testing PDF Parsing with Profile.pdf...\n');

    const pdfPath = path.resolve(process.cwd(), 'Profile.pdf');

    if (!fs.existsSync(pdfPath)) {
        console.error('❌ Profile.pdf not found in current directory');
        process.exit(1);
    }

    try {
        // Read PDF file
        const pdfBuffer = fs.readFileSync(pdfPath);
        const uint8Array = new Uint8Array(pdfBuffer);
        console.log(`📄 PDF file size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);

        // Parse PDF
        console.log('📖 Parsing PDF...');

        const extractedText = await new Promise<string>((resolve, reject) => {
            const pdfParser = new PDFParser();

            pdfParser.on('pdfParser_dataError', (errData) => {
                const errorMsg = errData instanceof Error ? errData.message : (errData as any).parserError?.message || 'PDF parsing failed';
                reject(new Error(errorMsg));
            });

            pdfParser.on('pdfParser_dataReady', (pdfData) => {
                // Extract text from all pages
                let text = '';
                if (pdfData && (pdfData as any).Pages) {
                    text = (pdfData as any).Pages.map((page: any) =>
                        page.Texts.map((textItem: any) =>
                            decodeURIComponent(textItem.R.map((r: any) => r.T).join(' '))
                        ).join(' ')
                    ).join('\n');
                }
                resolve(text);
            });

            pdfParser.loadPDF(pdfPath);
        });

        console.log(`✅ PDF parsed: ${extractedText.length} characters extracted\n`);

        // Display results
        console.log('='.repeat(80));
        console.log('📝 EXTRACTED TEXT PREVIEW (first 1000 characters):');
        console.log('='.repeat(80));
        console.log(extractedText.substring(0, 1000));
        console.log('...\n');
        console.log('='.repeat(80));
        console.log(`📊 Total extracted: ${extractedText.length} characters`);
        console.log('='.repeat(80));

        // Validate extraction
        if (!extractedText || extractedText.trim().length === 0) {
            console.error('\n❌ Failed to extract text from PDF');
            process.exit(1);
        }

        console.log('\n✅ PDF parsing successful!');
        console.log('\n💡 This text will be sent to the AI model for analysis.');

        // Check if it looks like a LinkedIn profile
        const hasLinkedInKeywords = [
            'experience', 'education', 'skills', 'linkedin', 'profile',
            'work', 'job', 'company', 'university'
        ].some(keyword => extractedText.toLowerCase().includes(keyword));

        if (hasLinkedInKeywords) {
            console.log('✅ Extracted text appears to be a LinkedIn profile');
        } else {
            console.log('⚠️  Warning: Extracted text may not be a LinkedIn profile');
        }

    } catch (error: any) {
        console.error('\n❌ PDF parsing failed!');
        console.error('Error:', error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
        process.exit(1);
    }
}

// Run test
testPDFParsing();
