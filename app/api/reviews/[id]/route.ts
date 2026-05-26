import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const reviewId = resolvedParams.id;

        // Get userId from query params (optional for paid reviews)
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // If no userId provided, try to fetch review directly (for payment verification)
        if (!userId) {
            const { data, error } = await insforge.database
                .from('reviews')
                .select('*')
                .eq('id', reviewId)
                .single();

            if (error || !data) {
                return NextResponse.json(
                    { error: 'Review not found' },
                    { status: 404 }
                );
            }

            // Only return if payment is confirmed (webhook processed)
            if (data.payment_status === 'paid') {
                return NextResponse.json({
                    success: true,
                    review: data,
                });
            }

            return NextResponse.json(
                { error: 'Unauthorized - payment not confirmed' },
                { status: 401 }
            );
        }

        // Fetch the review and verify ownership with retry logic
        let attempts = 0;
        const maxAttempts = 2;
        let lastError: any;

        while (attempts < maxAttempts) {
            try {
                const { data, error } = await insforge.database
                    .from('reviews')
                    .select('id, user_id, status, payment_status, full_name, professional_status, overall_score, score_band, category_scores, recommendations, strengths, weaknesses, created_at')
                    .eq('id', reviewId)
                    .eq('user_id', userId)
                    .single();

                if (error || !data) {
                    return NextResponse.json(
                        { error: 'Review not found' },
                        { status: 404 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    review: data,
                });
            } catch (err: any) {
                lastError = err;
                attempts++;

                // If it's a timeout error and we have attempts left, wait and retry
                if (err?.message?.includes('timed out') && attempts < maxAttempts) {
                    console.warn(`Database query timeout (attempt ${attempts}/${maxAttempts}), retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
                } else {
                    throw err; // Re-throw if not timeout or no attempts left
                }
            }
        }

        // If we exhausted all retries
        console.error('Get review error after retries:', lastError);
        return NextResponse.json(
            { error: 'Database request timed out. Please try again.' },
            { status: 504 }
        );

    } catch (error: any) {
        console.error('Get review error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
