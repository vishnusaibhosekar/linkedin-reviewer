import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || 'test_mode',
});

export async function GET(req: NextRequest) {
    try {
        const products = await client.products.list();
        const productList = (products as any).body?.items || (products as any).data || (products as any).products || [];

        return NextResponse.json({
            success: true,
            environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
            productCount: productList.length,
            products: productList.map((p: any) => ({
                id: p.product_id || p.id,
                name: p.name,
                price: p.price,
                currency: p.currency,
            })),
        });
    } catch (error: any) {
        console.error('[Test] Dodo connection error:', error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: error.status || 500 }
        );
    }
}
