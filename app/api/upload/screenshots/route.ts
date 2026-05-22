import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const slot = formData.get('slot') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PNG, JPG, and WEBP are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 400 }
            );
        }

        // Generate unique filename to avoid 409 conflicts
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 9);
        const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        const extension = file.name.split('.').pop();
        const uniqueFileName = `${timestamp}-${randomId}-${originalName}.${extension}`;

        // Create a new File object with the unique name (preserves size and type)
        const renamedFile = new File([file], uniqueFileName, {
            type: file.type,
            lastModified: Date.now()
        });

        // Upload to InsForge Storage with unique filename
        const { data, error } = await insforge.storage
            .from('linkedin-screenshots')
            .upload(uniqueFileName, renamedFile);

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
            size: file.size,
            slot: slot
        });

    } catch (error) {
        console.error('Screenshots upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
