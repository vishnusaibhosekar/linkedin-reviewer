import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { insforge } from '@/lib/auth/insforge';

const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || 'test_mode',
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();

        // Use SDK's official webhook verification and parsing
        const event = await client.webhooks.unwrap(body, {
            headers: Object.fromEntries(req.headers.entries()),
            key: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
        });

        const eventType = event.type;
        const data = event.data;
        const eventId = (event as any).id;

        console.log('[Webhook] Received event:', { eventId, eventType });

        // Idempotency check - verify if this event was already processed
        if (eventId) {
            const { data: existingEvent } = await insforge.database
                .from('webhook_events')
                .select('id')
                .eq('event_id', eventId)
                .single();

            if (existingEvent) {
                console.log('[Webhook] Event already processed, skipping:', eventId);
                return NextResponse.json({ received: true, duplicate: true });
            }
        }

        // Process the event FIRST
        switch (eventType) {
            case 'payment.succeeded':
                await handlePaymentSucceeded(data, eventId);
                break;

            case 'payment.failed':
                await handlePaymentFailed(data, eventId);
                break;

            default:
                console.log('[Webhook] Unhandled event type:', eventType);
        }

        // Record the event AFTER successful processing (idempotency log)
        if (eventId) {
            try {
                await insforge.database
                    .from('webhook_events')
                    .insert({
                        event_id: eventId,
                        event_type: eventType,
                        processed_at: new Date().toISOString(),
                    });
                console.log('[Webhook] Event recorded:', eventId);
            } catch (error: any) {
                // If insert fails (e.g., unique violation from concurrent request), log but don't fail
                console.warn('[Webhook] Failed to record event (may be duplicate):', {
                    eventId,
                    error: error.message,
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('[Webhook] Processing error:', {
            message: error.message,
            stack: error.stack,
        });
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handlePaymentSucceeded(data: any, eventId?: string) {
    const { metadata, amount, currency, payment_id, checkout_session_id } = data;
    const { review_id, product_type } = metadata || {};

    if (!review_id) {
        console.error('[Webhook] Missing review_id in payment metadata:', { eventId, payment_id });
        return;
    }

    console.log('[Webhook] Payment succeeded:', {
        eventId,
        review_id,
        product_type,
        amount,
        currency,
        payment_id,
        checkout_session_id,
    });

    if (product_type === 'linkedin_review') {
        // Update review status to paid (idempotent - only if not already paid)
        const { error } = await insforge.database
            .from('reviews')
            .update({
                payment_status: 'paid',
                payment_amount: amount / 100, // Convert from minor units to INR
                payment_amount_minor: amount,
                payment_currency: currency || 'INR',
                payment_id: payment_id,
                // checkout_session_id already set at checkout creation
            })
            .eq('id', review_id)
            .neq('payment_status', 'paid'); // Idempotency guard

        if (error) {
            console.error('[Webhook] Failed to update review payment status:', {
                review_id,
                error,
            });
        } else {
            console.log('[Webhook] Review marked as paid:', review_id);
        }
    } else if (product_type === 'linkedin_rewrite') {
        // Update rewrite order status (idempotent - only if not already paid)
        // Note: rewrite_order is now created BEFORE payment with status 'pending_payment'
        // Webhook updates it to 'pending' (ready for admin to work on)
        const { error } = await insforge.database
            .from('rewrite_orders')
            .update({
                status: 'pending', // Change from 'pending_payment' to 'pending' (visible to admin)
                payment_status: 'paid',
                payment_amount: amount / 100,
                payment_amount_minor: amount,
                payment_currency: currency || 'INR',
                payment_id: payment_id,
                checkout_session_id: checkout_session_id || null,
            })
            .eq('review_id', review_id)
            .neq('payment_status', 'paid'); // Idempotency guard

        if (error) {
            console.error('[Webhook] Failed to update rewrite payment status:', {
                review_id,
                error,
            });
        } else {
            console.log('[Webhook] Rewrite marked as paid:', review_id);
        }
    }
}

async function handlePaymentFailed(data: any, eventId?: string) {
    const { metadata, payment_id, error_message } = data;
    const { review_id, product_type } = metadata || {};

    if (!review_id) {
        console.error('[Webhook] Missing review_id in failed payment metadata:', { eventId, payment_id });
        return;
    }

    console.log('[Webhook] Payment failed:', {
        eventId,
        review_id,
        product_type,
        payment_id,
        error: error_message || 'Unknown error',
    });

    // Log the failed payment (don't update status yet - user might retry)
    // Could create a payment_attempts table for tracking
}
