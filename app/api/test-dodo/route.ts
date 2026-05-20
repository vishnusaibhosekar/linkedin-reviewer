import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || 'test_mode',
});

export async function GET(req: NextRequest) {
    try {
        console.log('[Test] Checking Dodo connection...');
        console.log('[Test] Environment:', process.env.DODO_PAYMENTS_ENVIRONMENT);
        console.log('[Test] API Key (first 10 chars):', process.env.DODO_PAYMENTS_API_KEY?.substring(0, 10));

        // Try to list products
        const products = await client.products.list();

        const productList = (products as any).data || [];
        console.log('[Test] Products found:', productList.length);
        console.log('[Test] Products:', JSON.stringify(productList, null, 2));

        return NextResponse.json({
            success: true,
            environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
            productCount: productList.length,
            products: productList.map((p: any) => ({
                id: p.id,
                name: p.name,
                type: p.type,
            })),
        });
    } catch (error: any) {
        console.error('[Test] Dodo connection error:', {
            message: error.message,
            status: error.status,
            response: error.response,
        });

        return NextResponse.json(
            {
                success: false,
                error: error.message,
                status: error.status,
            },
            { status: error.status || 500 }
        );
    }
}
