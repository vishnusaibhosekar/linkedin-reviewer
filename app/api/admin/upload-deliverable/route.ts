import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/auth/insforge';

// POST - Upload rewrite deliverable
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const orderId = formData.get('orderId') as string;

        if (!file || !orderId) {
            return NextResponse.json(
                { error: 'File and orderId are required' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Only PDF and DOCX files are allowed' },
                { status: 400 }
            );
        }

        // Upload to rewrites bucket
        // Construct file with custom path
        const fileName = `deliverables/${orderId}-${Date.now()}-${file.name}`;
        const customFile = new File([file], fileName, { type: file.type });

        const { data, error } = await insforge.storage
            .from('rewrites')
            .uploadAuto(customFile);

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            storagePath: data?.key || fileName
        });
    } catch (error) {
        console.error('Error in POST /api/admin/upload-deliverable:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
