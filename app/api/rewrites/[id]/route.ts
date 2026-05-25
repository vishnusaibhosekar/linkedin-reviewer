import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const rewriteId = resolvedParams.id;

        // RLS will filter by user_id automatically (cookie-based auth)
        const { data, error } = await insforge.database
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
            .eq('id', rewriteId)  // Query by rewrite order id
            .single();

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
