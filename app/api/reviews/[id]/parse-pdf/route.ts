import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';
import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const reviewId = resolvedParams.id;

        // Fetch review record
        const { data: review, error: fetchError } = await insforge.database
            .from('reviews')
            .select('*')
            .eq('id', reviewId)
            .single();

        if (fetchError || !review) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        // Check if already parsed
        if (review.parsed_pdf_text) {
            return NextResponse.json({
                success: true,
                textLength: review.parsed_pdf_text.length,
                preview: review.parsed_pdf_text.substring(0, 200),
            });
        }

        // Download PDF from storage
        const { data: pdfData, error: downloadError } = await insforge.storage
            .from('linkedin-pdfs')
            .download(review.pdf_storage_path);

        if (downloadError || !pdfData) {
            return NextResponse.json(
                { error: 'PDF file not found in storage' },
                { status: 404 }
            );
        }

        // Extract text from PDF
        const pdfBuffer = await pdfData.arrayBuffer();

        // Save to temp file for pdf2json
        const tempDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempPdfPath = path.join(tempDir, `${reviewId}.pdf`);
        fs.writeFileSync(tempPdfPath, Buffer.from(pdfBuffer));

        // Parse PDF using pdf2json
        const extractedText = await new Promise<string>((resolve, reject) => {
            const pdfParser = new PDFParser();

            pdfParser.on('pdfParser_dataError', (errData) => {
                const errorMsg = errData instanceof Error ? errData.message : (errData as any).parserError?.message || 'PDF parsing failed';
                reject(new Error(errorMsg));
            });

            pdfParser.on('pdfParser_dataReady', (pdfData) => {
                // Clean up temp file
                try {
                    fs.unlinkSync(tempPdfPath);
                } catch (e) {
                    // Ignore cleanup errors
                }

                // Extract text from all pages
                let text = '';
                if (pdfData && pdfData.Pages) {
                    text = pdfData.Pages.map((page: any) =>
                        page.Texts.map((textItem: any) =>
                            decodeURIComponent(textItem.R.map((r: any) => r.T).join(' '))
                        ).join(' ')
                    ).join('\n');
                }
                resolve(text);
            });

            pdfParser.loadPDF(tempPdfPath);
        });

        if (!extractedText || extractedText.trim().length === 0) {
            return NextResponse.json(
                { error: 'Failed to extract text from PDF' },
                { status: 500 }
            );
        }

        // Save extracted text to database
        const { error: updateError } = await insforge.database
            .from('reviews')
            .update({
                parsed_pdf_text: extractedText,
            })
            .eq('id', reviewId);

        if (updateError) {
            console.error('Failed to save parsed PDF text:', updateError);
            return NextResponse.json(
                { error: 'Failed to save parsed text' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            textLength: extractedText.length,
            preview: extractedText.substring(0, 200),
        });

    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
