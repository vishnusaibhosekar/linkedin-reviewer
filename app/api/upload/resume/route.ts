import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type (PDF or DOCX)
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/msword' // .doc
        ];

        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF and DOCX files are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (20MB max)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 20MB.' },
                { status: 400 }
            );
        }

        // Upload to InsForge Storage
        const { data, error } = await insforge.storage
            .from('resumes')
            .uploadAuto(file);

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            path: data?.key,
            url: data?.url,
            fileName: file.name,
            size: file.size
        });

    } catch (error) {
        console.error('Resume upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
