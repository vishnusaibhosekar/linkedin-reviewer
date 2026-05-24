import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const reviewId = resolvedParams.id;

        // Get userId from query params
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized - userId required' },
                { status: 401 }
            );
        }

        // Fetch the review and verify ownership
        const { data, error } = await insforge.database
            .from('reviews')
            .select('*')
            .eq('id', reviewId)
            .eq('user_id', userId) // Only return if user owns this review
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

    } catch (error) {
        console.error('Get review error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
