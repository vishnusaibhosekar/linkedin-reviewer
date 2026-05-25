import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const rewriteOrderId = resolvedParams.id;

        // Get the rewritten profile data from request body
        const body = await request.json();
        const { profileData } = body;

        if (!profileData) {
            return NextResponse.json(
                { error: 'Missing profile data' },
                { status: 400 }
            );
        }

        // Fetch the rewrite order to verify it exists
        const { data: rewriteOrder, error: fetchError } = await insforge.database
            .from('rewrite_orders')
            .select('*')
            .eq('id', rewriteOrderId)
            .single();

        if (fetchError || !rewriteOrder) {
            return NextResponse.json(
                { error: 'Rewrite order not found' },
                { status: 404 }
            );
        }

        // Update the rewrite order with the rewritten profile data
        const { error: updateError } = await insforge.database
            .from('rewrite_orders')
            .update({
                rewritten_profile_data: profileData,
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', rewriteOrderId);

        if (updateError) {
            console.error('Failed to save rewritten profile:', updateError);
            return NextResponse.json(
                { error: 'Failed to save rewritten profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Profile saved successfully',
        });

    } catch (error: any) {
        console.error('Save rewritten profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
