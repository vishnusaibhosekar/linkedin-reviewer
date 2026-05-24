import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

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
            console.error('[Rewrite Checkout] DODO_PAYMENTS_API_KEY is not configured');
            return NextResponse.json(
                { error: 'Payment system not configured. Please contact support.' },
                { status: 500 }
            );
        }

        // Get product ID based on environment and region
        const isLiveMode = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
        const isIndianCustomer = region === 'IN';

        const rewriteProductId = isLiveMode
            ? isIndianCustomer
                ? process.env.DODO_LIVE_REWRITE_PRODUCT_ID_IN
                : process.env.DODO_LIVE_REWRITE_PRODUCT_ID_US
            : isIndianCustomer
                ? process.env.DODO_TEST_REWRITE_PRODUCT_ID_IN
                : process.env.DODO_TEST_REWRITE_PRODUCT_ID_US;

        if (!rewriteProductId) {
            console.error('[Rewrite Checkout] Product ID not configured:', {
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
            console.error('[Rewrite Checkout] NEXT_PUBLIC_APP_URL is not configured');
            return NextResponse.json(
                { error: 'Application URL not configured. Please contact support.' },
                { status: 500 }
            );
        }

        // Create checkout session for LinkedIn Rewrite
        const session = await client.checkoutSessions.create({
            product_cart: [
                {
                    product_id: rewriteProductId,
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
                product_type: 'linkedin_rewrite',
                customer_region: region || 'US', // Track for analytics
                connector_response_reference_id: `rewrite_${reviewId}_${Date.now()}`,
                ...metadata,
            },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/review/${reviewId}/rewrite/success`,
        });

        // Persist checkout session ID to database for reconciliation
        // Note: rewrite_orders is created after payment, so we'll update it via webhook
        // But we can store it in metadata for now

        return NextResponse.json({
            checkoutUrl: session.checkout_url,
        });
    } catch (error: any) {
        console.error('Rewrite checkout creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
