export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put, del } from '@vercel/blob';
import prisma from '@/lib/db';
import { getCached } from '@/lib/memory-cache';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const folderId = searchParams.get('folderId');
        const workspaceId = searchParams.get('workspaceId');

        let whereClause;
        if (workspaceId) {
            // Workspace mode: show docs in this workspace (if user is owner or member)
            whereClause = {
                workspaceId,
                folderId: folderId || null,
                OR: [
                    { workspace: { ownerId: session.user.id } },
                    { workspace: { members: { some: { userId: session.user.id } } } }
                ]
            };
        } else {
            // Personal mode: show only user's own docs without a workspace
            whereClause = {
                userId: session.user.id,
                workspaceId: null,
                folderId: folderId || null,
            };
        }

        const cacheKey = `dashboard_docs_${session.user.id}_${workspaceId || 'personal'}_${folderId || 'root'}`;
        const formatted = await getCached(cacheKey, async () => {
            const documents = await prisma.document.findMany({
                where: whereClause,
                include: {
                    user: { select: { name: true, email: true } },
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

            return documents.map((doc) => ({
                id: doc.id,
                title: doc.title,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                pageCount: doc.pageCount,
                createdAt: doc.createdAt,
                totalViews: doc._count.views,
                totalLinks: doc._count.links,
                lastViewedAt: doc.views[0]?.startedAt || null,
                uploadedBy: doc.user?.name || 'Unknown',
                isOwner: doc.userId === session.user.id,
            }));
        }, 2500);

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
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
        const folderId = formData.get('folderId');
        const workspaceId = formData.get('workspaceId');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
        }

        // Verify workspace membership if uploading to a workspace
        if (workspaceId) {
            const workspace = await prisma.workspace.findFirst({
                where: {
                    id: workspaceId,
                    OR: [
                        { ownerId: session.user.id },
                        { members: { some: { userId: session.user.id } } }
                    ]
                }
            });
            if (!workspace) {
                return NextResponse.json({ error: 'You do not have access to this workspace.' }, { status: 403 });
            }
        }

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
                folderId: folderId || null,
                workspaceId: workspaceId || null,
            },
        });

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }
}
