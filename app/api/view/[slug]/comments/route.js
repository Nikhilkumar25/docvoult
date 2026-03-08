import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req, { params }) {
    const { slug } = await params;

    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const viewId = searchParams.get('viewId');

        const link = await prisma.link.findUnique({
            where: { slug },
            include: {
                document: {
                    select: {
                        id: true,
                        userId: true,
                    }
                }
            }
        });

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        const isOwner = session?.user?.id === link.document.userId;

        // Strict Privacy Logic:
        // 1. Owners see EVERYTHING for this document.
        // 2. Viewers MUST provide a viewId and only see THEIR comments.
        // 3. If no viewId and not owner, they get nothing.

        const whereClause = {
            documentId: link.document.id,
        };

        if (!isOwner) {
            if (!viewId) {
                return NextResponse.json([]); // No viewId, no comments for public
            }
            whereClause.viewId = viewId;
        }

        const comments = await prisma.comment.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    const { slug } = await params;
    const body = await req.json();
    const { text, userName, askerEmail, pageNumber, viewId } = body;

    if (!text || !text.trim()) {
        return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    // Sanitize viewId: convert string "null" or empty string to actual null
    const sanitizedViewId = (viewId === 'null' || viewId === '') ? null : viewId;

    try {
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { documentId: true }
        });

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        const comment = await prisma.comment.create({
            data: {
                text,
                userName: userName || 'Anonymous',
                askerEmail: askerEmail || null,
                pageNumber: pageNumber ? parseInt(pageNumber) : null,
                documentId: link.documentId,
                viewId: sanitizedViewId,
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);

        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid session. Please refresh the page.' }, { status: 400 });
        }

        if (error.message.includes('Unknown argument')) {
            return NextResponse.json({ error: 'Prisma Client out of sync. Please restart the dev server.' }, { status: 500 });
        }

        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
