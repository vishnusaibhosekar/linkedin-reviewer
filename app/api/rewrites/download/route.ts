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

        // Determine which bucket to use based on the file path
        // PDF files are in 'linkedin-pdfs' bucket, screenshots in 'linkedin-screenshots', resumes in 'resumes', rewrites in 'rewrites'
        let bucketName = 'rewrites'; // default
        if (storagePath.includes('deliverables/')) {
            bucketName = 'rewrites';
        } else if (storagePath.endsWith('.pdf') || storagePath.endsWith('.docx') || storagePath.endsWith('.doc')) {
            // Could be LinkedIn PDF, resume, or deliverable
            // Check common patterns or default to linkedin-pdfs for .pdf
            if (storagePath.includes('resume') || storagePath.includes('cv')) {
                bucketName = 'resumes';
            } else if (storagePath.includes('deliverable')) {
                bucketName = 'rewrites';
            } else {
                bucketName = 'linkedin-pdfs';
            }
        } else {
            // Image files (png, jpg, jpeg, webp) are screenshots
            bucketName = 'linkedin-screenshots';
        }

        // Use InsForge SDK to download the file
        const { data: blob, error } = await insforge.storage
            .from(bucketName)
            .download(storagePath);

        if (error || !blob) {
            console.error('Storage download error:', error);
            return NextResponse.json(
                { error: 'Failed to download file' },
                { status: 500 }
            );
        }

        // Determine content type based on file extension
        const contentType = storagePath.endsWith('.pdf')
            ? 'application/pdf'
            : storagePath.endsWith('.png') || storagePath.endsWith('.jpg') || storagePath.endsWith('.jpeg')
                ? 'image/jpeg'
                : 'application/octet-stream';

        // Return the file directly as a response
        return new NextResponse(blob, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${storagePath.split('/').pop()}"`,
            },
        });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
