import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

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

        const storagePath = searchParams.get('path');

        if (!storagePath) {
            return NextResponse.json(
                { error: 'Missing storage path parameter' },
                { status: 400 }
            );
        }

        // For now, return the storage path - frontend will use InsForge SDK to get URL
        // In production, you may want to generate signed URLs or use public bucket URLs
        const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
        const downloadUrl = `${baseUrl}/storage/v1/object/rewrites/${storagePath}`;

        return NextResponse.json({
            success: true,
            downloadUrl: downloadUrl
        });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
