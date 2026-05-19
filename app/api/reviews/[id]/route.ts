import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

// GET - Get single review details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get current user
        const { data: userData, error: authError } = await insforge.auth.getCurrentUser();

        if (authError || !userData?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = userData.user.id;
        const reviewId = params.id;

        const { data, error } = await insforge.database
            .from('reviews')
            .select('*')
            .eq('id', reviewId)
            .eq('user_id', userId) // RLS check
            .single();

        if (error) {
            if (error.message?.includes('not found') || !data) {
                return NextResponse.json(
                    { error: 'Review not found' },
                    { status: 404 }
                );
            }

            console.error('Database query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch review' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            review: data
        });

    } catch (error) {
        console.error('Get review error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
