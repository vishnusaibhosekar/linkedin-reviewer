import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

// POST - Create new review
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            userId,
            fullName,
            professionalStatus,
            workExperience,
            currentJobTitle,
            purpose,
            linkedinUrl,
            pdfPath,
            screenshotPaths,
            paymentStatus = 'pending'
        } = body;

        // Validation
        if (!userId || !fullName || !professionalStatus || !workExperience || !purpose || !linkedinUrl || !pdfPath || !screenshotPaths) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!Array.isArray(screenshotPaths) || screenshotPaths.length < 4) {
            return NextResponse.json(
                { error: '4 screenshots are required (Profile & Banner, Skills & Endorsements, Recommendations, Activity & Posts)' },
                { status: 400 }
            );
        }

        // Insert into database
        const { data, error } = await insforge.database
            .from('reviews')
            .insert({
                user_id: userId,
                status: 'pending',
                payment_status: paymentStatus,
                full_name: fullName,
                professional_status: professionalStatus,
                work_experience: workExperience,
                current_job_title: currentJobTitle || null,
                purpose: purpose,
                linkedin_url: linkedinUrl,
                pdf_storage_path: pdfPath,
                screenshot_paths: screenshotPaths
            })
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            return NextResponse.json(
                { error: 'Failed to create review' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            reviewId: data.id
        });

    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - List user's reviews
export async function GET(request: NextRequest) {
    try {
        // RLS policy filters reviews by auth.uid() — no manual auth check needed
        const { data, error } = await insforge.database
            .from('reviews')
            .select('id, overall_score, score_band, status, created_at, full_name, professional_status')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch reviews' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            reviews: data
        });

    } catch (error) {
        console.error('List reviews error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
