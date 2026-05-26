import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const inputId = resolvedParams.id;

        // First try to find by rewrite_orders.id (direct ID)
        let { data, error } = await insforge.database
            .from('rewrite_orders')
            .select(`
                *,
                reviews (
                    full_name,
                    overall_score,
                    score_band,
                    created_at
                )
            `)
            .eq('id', inputId)
            .single();

        // If not found, try by review_id (for payment verification scenarios)
        if (error || !data) {
            console.log('[Rewrites API] Not found by id, trying review_id:', inputId);

            const result = await insforge.database
                .from('rewrite_orders')
                .select(`
                    *,
                    reviews (
                        full_name,
                        overall_score,
                        score_band,
                        created_at
                    )
                `)
                .eq('review_id', inputId)
                .single();

            data = result.data;
            error = result.error;

            // Only return if payment is confirmed (webhook processed)
            if (data && data.payment_status !== 'paid') {
                return NextResponse.json(
                    { error: 'Payment not confirmed for this rewrite order' },
                    { status: 401 }
                );
            }
        }

        if (error || !data) {
            return NextResponse.json(
                { error: 'Rewrite order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            rewriteOrder: data,
        });

    } catch (error) {
        console.error('Get rewrite order error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
