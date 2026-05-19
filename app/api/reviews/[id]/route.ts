import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

// GET - Get single review details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params in Next.js 16
        const resolvedParams = await params;
        const reviewId = resolvedParams.id;

        const { data, error } = await insforge.database
            .from('reviews')
            .select('*')
            .eq('id', reviewId)
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
