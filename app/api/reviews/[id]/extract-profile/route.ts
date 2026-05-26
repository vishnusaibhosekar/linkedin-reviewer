import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';
import { openrouter, SCORING_MODEL } from '@/lib/ai/openrouter';
import os from 'os';
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

        // Get userId from query params (optional for internal calls)
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Fetch review record
        let query = insforge.database
            .from('reviews')
            .select('*')
            .eq('id', reviewId);

        // Add ownership filter if userId provided
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: review, error: fetchError } = await query.single();

        if (fetchError || !review) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        // Check if structured profile data already exists
        if (review.parsed_profile_data) {
            return NextResponse.json({
                success: true,
                textLength: review.parsed_pdf_text?.length || 0,
                preview: review.parsed_pdf_text?.substring(0, 200) || '',
                structuredDataExtracted: true,
                parsed_profile_data: review.parsed_profile_data,
            });
        }

        // If parsed_pdf_text doesn't exist, extract it from PDF
        let extractedText = review.parsed_pdf_text;
        if (!extractedText) {
            console.log('PDF text not found, extracting from PDF...');

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

            // Save to temp file for pdf2json (use OS temp directory for Vercel compatibility)
            const tempDir = os.tmpdir();
            const tempPdfPath = path.join(tempDir, `${reviewId}.pdf`);
            fs.writeFileSync(tempPdfPath, Buffer.from(pdfBuffer));

            // Parse PDF using pdf2json
            extractedText = await new Promise<string>((resolve, reject) => {
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

            console.log('Successfully extracted and saved PDF text');
        }

        // Extract structured profile data using AI (from PDF text + screenshots)
        let structuredProfileData = null;
        try {
            console.log('Starting AI profile extraction for review:', reviewId);
            console.log('Has screenshots:', review.screenshot_paths?.length || 0);

            // Download screenshots if available
            let screenshotBase64: string[] = [];
            if (review.screenshot_paths && review.screenshot_paths.length > 0) {
                console.log('Downloading', review.screenshot_paths.length, 'screenshots...');
                screenshotBase64 = await Promise.all(
                    (review.screenshot_paths as string[]).map(async (storagePath: string) => {
                        try {
                            const { data, error: dlError } = await insforge.storage
                                .from('linkedin-screenshots')
                                .download(storagePath);

                            if (dlError || !data) {
                                console.warn('Failed to download screenshot:', storagePath, dlError);
                                return null;
                            }

                            const buffer = await data.arrayBuffer();
                            const b64 = Buffer.from(buffer).toString('base64');
                            const ext = storagePath.split('.').pop()?.toLowerCase();
                            const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
                            return `data:${mime};base64,${b64}`;
                        } catch (err) {
                            console.error(`Failed to download screenshot: ${storagePath}`, err);
                            return null;
                        }
                    })
                ).then(results => results.filter(Boolean) as string[]);
                console.log('Successfully converted', screenshotBase64.length, 'screenshots to base64');
            } else {
                console.warn('No screenshots available for this review');
            }

            const systemPrompt = `You are an expert data extraction specialist. Extract structured profile information from a LinkedIn profile.

You will receive:
1. Raw text extracted from a LinkedIn PDF export (contains: Name, Location, Headline, Summary, Experience, Education, Top Skills subset, Certifications)
2. Screenshots showing: Profile Photo & Banner, ALL Skills (complete list), Recommendations, Activity/Posts

Extract as much information as possible from BOTH sources. If a field is not found, use an empty string or empty array.

Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text outside the JSON.`;

            const userPrompt = `Extract the complete LinkedIn profile structure from the following sources:

PDF TEXT (contains partial data):
${extractedText}

SCREENSHOTS PROVIDED (${screenshotBase64.length} images):
1. Profile Photo & Banner (may also show Headline and Location)
2. Complete Skills list (all skills, not just top skills)
3. Recommendations section
4. Activity & Posts section

Return ONLY valid JSON matching this exact schema:

{
  "name": "<full name>",
  "headline": "<current headline/title>",
  "about": "<about/summary section text>",
  "location": "<city, state, country>",
  "experience": [
    {
      "title": "<job title>",
      "company": "<company name>",
      "duration": "<date range, e.g., Jan 2020 - Present>",
      "description": "<job description/responsibilities>"
    }
  ],
  "education": [
    {
      "institution": "<school/university name>",
      "degree": "<degree type>",
      "field": "<field of study>",
      "duration": "<date range>"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "achievements": [
    {
      "title": "<achievement/certification name>",
      "issuer": "<issuing organization>",
      "date": "<date>"
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

            const messages: any[] = [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: userPrompt },
                        ...screenshotBase64.map((base64) => ({
                            type: 'image_url' as const,
                            image_url: { url: base64, detail: 'low' as const }
                        }))
                    ]
                }
            ];

            console.log('Calling OpenRouter API with model:', SCORING_MODEL);
            const completion = await openrouter.chat.completions.create({
                model: SCORING_MODEL,
                messages: messages,
                response_format: { type: 'json_object' },
                max_tokens: 3000,
                temperature: 0.1,
            });

            console.log('OpenRouter API response received');
            const responseContent = completion.choices[0]?.message?.content;

            if (!responseContent) {
                console.error('OpenRouter returned empty response');
                throw new Error('AI returned empty response');
            }

            console.log('AI response length:', responseContent.length);
            console.log('AI response preview:', responseContent.substring(0, 200));

            structuredProfileData = JSON.parse(responseContent);
            console.log('Successfully parsed AI response as JSON');

            // Save structured data to database
            const { error: updateError } = await insforge.database
                .from('reviews')
                .update({
                    parsed_profile_data: structuredProfileData,
                })
                .eq('id', reviewId);

            if (updateError) {
                console.error('Failed to save parsed_profile_data to database:', updateError);
                throw new Error(`Database update failed: ${updateError.message}`);
            }

            console.log('Successfully saved parsed_profile_data to database');
        } catch (aiError) {
            console.error('Failed to extract structured profile data:', aiError);
            console.error('AI Error details:', aiError instanceof Error ? aiError.stack : JSON.stringify(aiError));
            // Don't fail the whole parsing if AI extraction fails
        }

        // Refetch the review to get the newly saved parsed_profile_data
        const { data: updatedReview } = await insforge.database
            .from('reviews')
            .select('parsed_profile_data')
            .eq('id', reviewId)
            .single();

        return NextResponse.json({
            success: true,
            textLength: extractedText.length,
            preview: extractedText.substring(0, 200),
            structuredDataExtracted: !!structuredProfileData,
            parsed_profile_data: updatedReview?.parsed_profile_data || null,
        });

    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
