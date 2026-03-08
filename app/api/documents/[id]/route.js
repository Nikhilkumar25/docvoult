export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { del } from '@vercel/blob';
import prisma from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const document = await prisma.document.findFirst({
            where: { id, userId: session.user.id },
            include: {
                links: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: { select: { views: true } },
                    },
                },
                views: {
                    orderBy: { startedAt: 'desc' },
                    include: {
                        link: { select: { slug: true } },
                        pageViews: {
                            orderBy: { pageNumber: 'asc' },
                        },
                    },
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { views: true } },
            },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Compute analytics summary
        const totalViews = document._count.views;
        const uniqueViewers = new Set(
            document.views.filter((v) => v.viewerEmail).map((v) => v.viewerEmail)
        ).size;
        const totalDuration = document.views.reduce((sum, v) => sum + v.duration, 0);
        const avgDuration = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;

        // Page-level analytics
        const pageStats = {};

        // Initialize with known page count
        for (let i = 1; i <= document.pageCount; i++) {
            pageStats[i] = { views: 0, totalDuration: 0 };
        }

        document.views.forEach((view) => {
            view.pageViews.forEach((pv) => {
                // If we encounter a page number higher than current pageCount, initialize it
                if (!pageStats[pv.pageNumber]) {
                    pageStats[pv.pageNumber] = { views: 0, totalDuration: 0 };
                }
                pageStats[pv.pageNumber].views += 1;
                pageStats[pv.pageNumber].totalDuration += pv.duration;
            });
        });

        // Ensure pageCount reflects reality if analytics found more pages
        const actualPageCount = Math.max(document.pageCount, ...Object.keys(pageStats).map(Number), 0);

        return NextResponse.json({
            ...document,
            pageCount: actualPageCount,
            analytics: {
                totalViews,
                uniqueViewers,
                totalDuration,
                avgDuration,
                pageStats,
            },
        });
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json(
            { error: 'Failed to fetch document' },
            { status: 500 }
        );
    }
}
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const json = await request.json();
        const { folderId } = json;

        const document = await prisma.document.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const updated = await prisma.document.update({
            where: { id },
            data: { folderId: folderId || null },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json(
            { error: 'Failed to update document' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const document = await prisma.document.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Delete from blob storage
        try {
            await del(document.fileUrl);
        } catch (e) {
            console.error('Error deleting blob:', e);
        }

        // Delete from database (cascades to links, views, pageviews)
        await prisma.document.delete({ where: { id } });

        return NextResponse.json({ message: 'Document deleted' });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Failed to delete document' },
            { status: 500 }
        );
    }
}
