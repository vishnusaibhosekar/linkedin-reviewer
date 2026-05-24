import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { insforge } from '@/lib/auth/insforge';

const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || 'test_mode',
});

export async function POST(req: NextRequest) {
    try {
        const { reviewId, email, userName, userId, metadata, region } = await req.json();

        if (!reviewId || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate Dodo API key is configured
        if (!process.env.DODO_PAYMENTS_API_KEY) {
            console.error('[Checkout] DODO_PAYMENTS_API_KEY is not configured');
            return NextResponse.json(
                { error: 'Payment system not configured. Please contact support.' },
                { status: 500 }
            );
        }

        // Get product ID based on environment and region
        const isLiveMode = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
        const isIndianCustomer = region === 'IN';

        const reviewProductId = isLiveMode
            ? isIndianCustomer
                ? process.env.DODO_LIVE_REVIEW_PRODUCT_ID_IN
                : process.env.DODO_LIVE_REVIEW_PRODUCT_ID_US
            : isIndianCustomer
                ? process.env.DODO_TEST_REVIEW_PRODUCT_ID_IN
                : process.env.DODO_TEST_REVIEW_PRODUCT_ID_US;

        if (!reviewProductId) {
            console.error('[Checkout] Product ID not configured:', {
                isLiveMode,
                isIndianCustomer,
                region,
                DODO_PAYMENTS_ENVIRONMENT: process.env.DODO_PAYMENTS_ENVIRONMENT
            });
            return NextResponse.json(
                { error: 'Payment product not available for your region. Please contact support.' },
                { status: 500 }
            );
        }

        // Validate APP_URL is configured for redirect
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!appUrl) {
            console.error('[Checkout] NEXT_PUBLIC_APP_URL is not configured');
            return NextResponse.json(
                { error: 'Application URL not configured. Please contact support.' },
                { status: 500 }
            );
        }

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
                customer_region: region || 'US', // Track for analytics
                connector_response_reference_id: `review_${reviewId}_${Date.now()}`,
                ...metadata,
            },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment/success?review_id=${reviewId}`,
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
