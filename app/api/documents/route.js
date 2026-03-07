import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put, del } from '@vercel/blob';
import prisma from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const documents = await prisma.document.findMany({
            where: { userId: session.user.id },
            include: {
                _count: {
                    select: { views: true, links: true },
                },
                views: {
                    orderBy: { startedAt: 'desc' },
                    take: 1,
                    select: { startedAt: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formatted = documents.map((doc) => ({
            id: doc.id,
            title: doc.title,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            pageCount: doc.pageCount,
            createdAt: doc.createdAt,
            totalViews: doc._count.views,
            totalLinks: doc._count.links,
            lastViewedAt: doc.views[0]?.startedAt || null,
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const title = formData.get('title') || file.name.replace(/\.pdf$/i, '');
        const pageCount = parseInt(formData.get('pageCount')) || 1;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Only PDF files are supported' },
                { status: 400 }
            );
        }

        // Upload to Vercel Blob
        const blob = await put(`documents/${session.user.id}/${Date.now()}-${file.name}`, file, {
            access: 'public',
            contentType: 'application/pdf',
        });

        const document = await prisma.document.create({
            data: {
                title,
                fileName: file.name,
                fileUrl: blob.url,
                fileSize: file.size,
                pageCount,
                userId: session.user.id,
            },
        });

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json(
            { error: 'Failed to upload document' },
            { status: 500 }
        );
    }
}
