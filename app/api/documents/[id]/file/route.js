export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put, del } from '@vercel/blob';
import prisma from '@/lib/db';

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify the document exists and the user is authorized to update it
        const document = await prisma.document.findFirst({
            where: {
                id,
                OR: [
                    { userId: session.user.id },
                    { workspace: { ownerId: session.user.id } }
                ]
            },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const pageCount = parseInt(formData.get('pageCount')) || document.pageCount;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
        }

        // 1. Delete the old file from Vercel Blob
        try {
            await del(document.fileUrl);
        } catch (e) {
            console.error('Failed to delete old blob, proceeding anyway:', e);
        }

        // 2. Upload the new file to Vercel Blob
        const blob = await put(`documents/${session.user.id}/${Date.now()}-${file.name}`, file, {
            access: 'public',
            contentType: 'application/pdf',
        });

        // 3. Update the Document record
        const updatedDoc = await prisma.document.update({
            where: { id },
            data: {
                fileName: file.name,
                fileUrl: blob.url,
                fileSize: file.size,
                pageCount: pageCount,
            },
        });

        return NextResponse.json(updatedDoc, { status: 200 });
    } catch (error) {
        console.error('Error updating document file:', error);
        return NextResponse.json({ error: 'Failed to update document file' }, { status: 500 });
    }
}
