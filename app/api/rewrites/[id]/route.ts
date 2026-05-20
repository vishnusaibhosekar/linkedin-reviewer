import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const rewriteId = resolvedParams.id;
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

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
            .eq('id', rewriteId)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'Rewrite order not found' },
                { status: 404 }
            );
        }

        // Validate ownership
        if (data.user_id !== userId) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            rewrite: data,
        });

    } catch (error) {
        console.error('Get rewrite order error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
