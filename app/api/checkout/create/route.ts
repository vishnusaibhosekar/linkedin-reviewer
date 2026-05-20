import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { insforge } from '@/lib/auth/insforge';

const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || 'test_mode',
});

export async function POST(req: NextRequest) {
    try {
        const { reviewId, email, userName, userId, metadata } = await req.json();

        if (!reviewId || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get product ID based on environment
        const isLiveMode = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
        const reviewProductId = isLiveMode
            ? process.env.DODO_LIVE_REVIEW_PRODUCT_ID!
            : process.env.DODO_TEST_REVIEW_PRODUCT_ID!;

        // Create checkout session for LinkedIn AI Review
        const session = await client.checkoutSessions.create({
            product_cart: [
                {
                    product_id: reviewProductId,
                    quantity: 1
                }
            ],
            customer: {
                email: email,
                name: userName || email,
            },
            metadata: {
                review_id: reviewId,
                user_id: userId || '',
                product_type: 'linkedin_review',
                ...metadata,
            },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment/success?review_id=${reviewId}`,
        });

        // Log session creation for traceability
        console.log('[Checkout] Session created:', {
            reviewId,
            sessionId: session.session_id,
            checkoutUrl: session.checkout_url,
        });

        // Persist checkout session ID to database for reconciliation
        await insforge.database
            .from('reviews')
            .update({ checkout_session_id: session.session_id })
            .eq('id', reviewId);

        return NextResponse.json({
            checkoutUrl: session.checkout_url,
        });
    } catch (error: any) {
        console.error('[Checkout] Creation error:', {
            message: error.message,
            status: error.status,
            response: error.response,
        });

        // Return more specific error message
        const errorMessage = error.message || 'Failed to create checkout session';
        const statusCode = error.status || 500;

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
