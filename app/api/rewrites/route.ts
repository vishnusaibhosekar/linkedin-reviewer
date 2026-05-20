import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

// Helper function to add business days (skip weekends)
function addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        // Skip Saturday (6) and Sunday (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
        }
    }

    return result;
}

// POST - Create rewrite order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            userId,
            reviewId,
            resumePath,
            keyAccomplishments,
            targetRoles,
            tonePreference,
            sectionsToImprove,
            specialRequests,
            contactEmail
        } = body;

        // Validate authentication
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized - userId required' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!reviewId || !resumePath || !keyAccomplishments || !targetRoles || !tonePreference || !sectionsToImprove || !contactEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate tone preference
        const validTones = ['formal', 'conversational', 'bold'];
        if (!validTones.includes(tonePreference)) {
            return NextResponse.json(
                { error: 'Invalid tone preference' },
                { status: 400 }
            );
        }

        // Calculate due date (3 business days from now)
        const now = new Date();
        const dueDate = addBusinessDays(now, 3);

        // Insert into database
        const { data, error } = await insforge.database
            .from('rewrite_orders')
            .insert({
                user_id: userId,
                review_id: reviewId,
                status: 'pending_payment',
                resume_storage_path: resumePath,
                key_accomplishments: keyAccomplishments,
                target_roles: targetRoles,
                tone_preference: tonePreference,
                sections_to_improve: sectionsToImprove,
                special_requests: specialRequests || null,
                contact_email: contactEmail,
                due_date: dueDate.toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            return NextResponse.json(
                { error: 'Failed to create rewrite order' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            rewriteId: data.id,
            dueDate: data.due_date
        });

    } catch (error) {
        console.error('Create rewrite order error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - List user's rewrite orders
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized - userId required' },
                { status: 401 }
            );
        }

        // Fetch rewrite orders with review metadata
        const { data, error } = await insforge.database
            .from('rewrite_orders')
            .select(`
                *,
                reviews (
                    full_name,
                    overall_score,
                    score_band,
                    created_at
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch rewrite orders' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            rewrites: data
        });

    } catch (error) {
        console.error('List rewrite orders error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
