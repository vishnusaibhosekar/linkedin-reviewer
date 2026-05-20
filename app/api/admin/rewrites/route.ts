import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

// GET - List all rewrite orders for admin
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = insforge.database.from('rewrite_orders').select('*');

        // Filter by status if provided
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching rewrite orders:', error);
            return NextResponse.json(
                { error: 'Failed to fetch orders' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            orders: data || []
        });
    } catch (error) {
        console.error('Error in GET /api/admin/rewrites:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Update rewrite order status
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, status, deliverablePath } = body;

        if (!orderId || !status) {
            return NextResponse.json(
                { error: 'orderId and status are required' },
                { status: 400 }
            );
        }

        const updateData: any = { status };

        // If marking as completed, add deliverable path and completed_at
        if (status === 'completed') {
            if (deliverablePath) {
                updateData.deliverable_path = deliverablePath;
            }
            updateData.completed_at = new Date().toISOString();
        }

        // If marking as in_progress, add due_date (7 business days from now)
        if (status === 'in_progress') {
            updateData.due_date = addBusinessDays(new Date(), 7).toISOString();
        }

        const { data, error } = await insforge.database
            .from('rewrite_orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error('Error updating rewrite order:', error);
            return NextResponse.json(
                { error: 'Failed to update order' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            order: data
        });
    } catch (error) {
        console.error('Error in PATCH /api/admin/rewrites:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;
    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
        }
    }
    return result;
}
