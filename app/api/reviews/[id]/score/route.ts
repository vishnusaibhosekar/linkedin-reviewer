import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';
import { openrouter, SCORING_MODEL } from '@/lib/ai/openrouter';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const reviewId = resolvedParams.id;

        // Get userId from request body (optional for internal calls)
        const requestBody = await request.json();
        const userId = requestBody.userId;

        // Parse request body to get base64 screenshots
        const screenshotBase64: string[] = requestBody.screenshotBase64 || [];

        // Step 1: Fetch review data
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

        // Check if already completed
        if (review.status === 'completed') {
            return NextResponse.json(
                { error: 'Review already completed', reviewId },
                { status: 400 }
            );
        }

        // Step 2: Ensure PDF is parsed
        let pdfText = review.parsed_pdf_text;
        if (!pdfText) {
            // Call parse endpoint
            const parseResponse = await fetch(`${process.env.NEXT_PUBLIC_INSFORGE_URL}/api/reviews/${reviewId}/parse-pdf`);
            const parseResult = await parseResponse.json();

            if (!parseResult.success) {
                return NextResponse.json(
                    { error: 'Failed to parse PDF' },
                    { status: 500 }
                );
            }

            // Refetch to get the parsed text
            const { data: updatedReview } = await insforge.database
                .from('reviews')
                .select('*')
                .eq('id', reviewId)
                .single();

            pdfText = updatedReview?.parsed_pdf_text;
        }

        if (!pdfText || pdfText.trim().length === 0) {
            return NextResponse.json(
                { error: 'PDF text is empty' },
                { status: 400 }
            );
        }

        // Step 3: Get screenshots — from request body, or fall back to downloading from storage
        let screenshotsToUse = screenshotBase64;

        if (screenshotsToUse.length < 4) {
            // sessionStorage was unavailable on the client — download from InsForge Storage
            if (!review.screenshot_paths || review.screenshot_paths.length < 4) {
                return NextResponse.json(
                    { error: 'Missing screenshots. At least 4 screenshots required.' },
                    { status: 400 }
                );
            }

            console.log('Fetching screenshots from storage (sessionStorage unavailable on client)...');

            screenshotsToUse = await Promise.all(
                (review.screenshot_paths as string[]).map(async (storagePath: string) => {
                    const { data, error: dlError } = await insforge.storage
                        .from('linkedin-screenshots')
                        .download(storagePath);

                    if (dlError || !data) {
                        throw new Error(`Failed to download screenshot from storage: ${storagePath}`);
                    }

                    const buffer = await data.arrayBuffer();
                    const b64 = Buffer.from(buffer).toString('base64');
                    const ext = storagePath.split('.').pop()?.toLowerCase();
                    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
                    return `data:${mime};base64,${b64}`;
                })
            );

            console.log(`Fetched ${screenshotsToUse.length} screenshots from storage`);
        }

        // Step 4: Build LLM prompt
        const systemPrompt = `You are an expert LinkedIn profile analyst with deep knowledge of professional branding, recruitment best practices, and LinkedIn optimization strategies. Your task is to analyze a LinkedIn profile and provide a comprehensive, actionable review.

You will receive:
1. User context (name, experience level, purpose, job title)
2. Full LinkedIn profile data extracted from PDF
3. Four screenshots showing different sections of the profile

Score the profile across 9 categories (0-100 each) with specific weights:
1. Profile Photo & Banner (weight: 10)
2. Headline (weight: 15)
3. About / Summary (weight: 15)
4. Work Experience (weight: 20)
5. Education (weight: 8)
6. Skills & Endorsements (weight: 8)
7. Recommendations (weight: 10)
8. Achievements & Licenses (weight: 7)
9. Activity & Recent Posts (weight: 7)

Scoring guidelines:
- 90-100: Excellent (professional, optimized, best practices followed)
- 70-89: Good (solid foundation, minor improvements needed)
- 50-69: Fair (basic presence, significant gaps)
- 0-49: Poor (incomplete, missing critical elements)

Calculate overall_score as the weighted average of all category scores.

Return ONLY valid JSON matching this exact schema. Do not include any markdown formatting, code blocks, or explanatory text outside the JSON.`;

        const userPrompt = `USER CONTEXT:
- Name: ${review.full_name}
- Experience: ${review.work_experience} years
- Purpose: ${review.purpose}
- Job Title: ${review.current_job_title || 'Not specified'}

LINKEDIN PROFILE DATA (from PDF export):
${pdfText}

SCREENSHOTS PROVIDED:
1. Profile Photo & Banner
2. Skills & Endorsements  
3. Recommendations
4. Activity & Recent Posts

Please analyze the complete profile and return your assessment in the following JSON format:

{
  "overall_score": <number 0-100>,
  "score_band": "<Excellent|Good|Fair|Poor>",
  "category_scores": {
    "profile_photo_banner": { "score": <0-100>, "weight": 10, "findings": ["finding1", "finding2"], "recommendations": ["rec1", "rec2"] },
    "headline": { "score": <0-100>, "weight": 15, "findings": ["finding1", "finding2"], "recommendations": ["rec1", "rec2"] },
    "about_summary": { "score": <0-100>, "weight": 15, "findings": ["finding1", "finding2"], "recommendations": ["rec1", "rec2"] },
    "work_experience": { "score": <0-100>, "weight": 20, "findings": ["finding1", "finding2"], "recommendations": ["rec1", "rec2"] },
    "education": { "score": <0-100>, "weight": 8, "findings": ["finding1", "finding2"], "recommendations": ["rec1", "rec2"] },
    "skills_endorsements": { "score": <0-100>, "weight": 8, "findings": ["finding1", "finding2"], "recommendations": ["rec1", "rec2"] },
    "recommendations": { "score": <0-100>, "weight": 10, "findings": ["finding1", "finding2"], "recommendations": ["rec1", "rec2"] },
    "achievements_licenses": { "score": <0-100>, "weight": 7, "findings": ["finding1", "finding2"], "recommendations": ["rec1", "rec2"] },
    "activity_posts": { "score": <0-100>, "weight": 7, "findings": ["finding1", "finding2"], "recommendations": ["rec1", "rec2"] }
  },
  "recommendations": [
    { "priority": "<high|medium|low>", "category": "<category name>", "action": "<specific action>", "impact": "<expected impact>" }
  ],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"]
}`;

        // Step 5: Call OpenRouter API with base64 images
        console.log('Calling OpenRouter with', screenshotsToUse.length, 'base64 screenshots');
        const completion = await openrouter.chat.completions.create({
            model: SCORING_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: userPrompt },
                        ...screenshotsToUse.map((base64) => ({
                            type: 'image_url' as const,
                            image_url: { url: base64, detail: 'low' as const }
                        }))
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 3000, // Reduced from 4000
            temperature: 0.3,
        });

        console.log('OpenRouter response received');

        // Step 6: Parse and validate response
        if (!completion.choices || completion.choices.length === 0) {
            console.error('OpenRouter response:', JSON.stringify(completion, null, 2));
            return NextResponse.json(
                { error: 'Empty response from AI model' },
                { status: 500 }
            );
        }

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
            return NextResponse.json(
                { error: 'Empty response from AI model' },
                { status: 500 }
            );
        }

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseContent);
        } catch (parseError) {
            console.error('Failed to parse AI response:', responseContent);
            return NextResponse.json(
                { error: 'Invalid JSON response from AI', rawResponse: responseContent.substring(0, 500) },
                { status: 500 }
            );
        }

        // Validate required fields
        if (!parsedResponse.overall_score || !parsedResponse.category_scores) {
            return NextResponse.json(
                { error: 'Incomplete AI response - missing required fields' },
                { status: 500 }
            );
        }

        // Step 7: Save results to database
        const { error: updateError } = await insforge.database
            .from('reviews')
            .update({
                status: 'completed',
                overall_score: parsedResponse.overall_score,
                score_band: parsedResponse.score_band,
                category_scores: parsedResponse.category_scores,
                recommendations: parsedResponse.recommendations,
                strengths: parsedResponse.strengths || [],
                weaknesses: parsedResponse.weaknesses || [],
                model_used: SCORING_MODEL,
                tokens_used: completion.usage?.total_tokens || 0,
                completed_at: new Date().toISOString(),
            })
            .eq('id', reviewId);

        if (updateError) {
            console.error('Failed to save review results:', updateError);
            return NextResponse.json(
                { error: 'Failed to save review results' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            reviewId,
            overall_score: parsedResponse.overall_score,
            score_band: parsedResponse.score_band,
        });

    } catch (error: any) {
        console.error('AI scoring error:', error);

        // Handle specific OpenRouter errors
        if (error.status === 429) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again in a few minutes.' },
                { status: 429 }
            );
        }

        if (error.status === 502 || error.status === 503) {
            return NextResponse.json(
                { error: 'AI service temporarily unavailable. Please retry.' },
                { status: 502 }
            );
        }

        return NextResponse.json(
            { error: 'AI scoring failed', details: error.message },
            { status: 500 }
        );
    }
}
