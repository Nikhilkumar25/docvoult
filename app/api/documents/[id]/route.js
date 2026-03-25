export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { del } from '@vercel/blob';
import prisma from '@/lib/db';

import { getCached } from '@/lib/memory-cache';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Wrap the entire payload in a 2.5s memory cache to guarantee 0ms latency for polling hits
        const cacheKey = `doc_${id}_${session.user.id}`;
        const payload = await getCached(cacheKey, async () => {
            const document = await prisma.document.findFirst({
                where: {
                    id,
                    OR: [
                        { userId: session.user.id },
                        { workspace: { ownerId: session.user.id } },
                        { workspace: { members: { some: { userId: session.user.id } } } },
                        { signatureRequests: { some: { signerEmail: session.user.email } } }
                    ]
                },
                include: {
                    workspace: { include: { owner: true } },
                    links: {
                        orderBy: { createdAt: 'desc' },
                        include: {
                            _count: { select: { views: true } },
                        },
                    },
                    views: {
                        take: 20, // Only fetch the 20 most recent viewers for the UI table
                        orderBy: { startedAt: 'desc' },
                        include: {
                            link: { select: { slug: true } },
                        },
                    },
                    comments: {
                        orderBy: { createdAt: 'desc' },
                    },
                    knowledgeBase: {
                        select: {
                            id: true,
                            status: true,
                            _count: { select: { entries: true } }
                        }
                    },
                    signatureRequests: {
                        orderBy: { createdAt: 'desc' },
                        include: {
                            signatures: true,
                            activities: {
                                orderBy: { createdAt: 'desc' },
                                take: 5,
                            },
                        }
                    },
                    _count: { select: { views: true } },
                },
            });

            if (!document) {
                return null;
            }

            // 1. Analytics Aggregations executed on Database Engine for performance
            const totalViews = document._count.views;

            // Unique viewers count using raw SQL or grouping: we'll use a simple group by wrapper
            const viewAgg = await prisma.view.aggregate({
                where: { documentId: id },
                _sum: { duration: true },
            });
            const totalDuration = viewAgg._sum.duration || 0;
            const avgDuration = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;

            const uniqueViewersQuery = await prisma.view.groupBy({
                where: { documentId: id, viewerEmail: { not: null } },
                by: ['viewerEmail'],
            });
            const uniqueViewers = uniqueViewersQuery.length;

            // 2. Page Stats Aggregations
            const pageGroups = await prisma.pageView.groupBy({
                by: ['pageNumber'],
                where: { view: { documentId: id } },
                _count: { id: true },
                _sum: { duration: true },
            });

            const pageStats = {};
            for (let i = 1; i <= document.pageCount; i++) {
                pageStats[i] = { views: 0, totalDuration: 0 };
            }

            pageGroups.forEach(group => {
                const pn = group.pageNumber;
                pageStats[pn] = {
                    views: group._count.id,
                    totalDuration: group._sum.duration || 0,
                };
            });

            const actualPageCount = Math.max(document.pageCount, ...Object.keys(pageStats).map(Number), 0);

            // POST-FETCH PRIVACY FILTER: Signers only see their own requests
            const isOwnerOrMember = document.userId === session.user.id || 
                (document.workspaceId && (
                    document.workspace.ownerId === session.user.id || 
                    document.workspace.members.some(m => m.userId === session.user.id)
                ));

            if (!isOwnerOrMember) {
                document.signatureRequests = document.signatureRequests.filter(
                    req => req.signerEmail.toLowerCase() === session.user.email.toLowerCase()
                );
            }

            return {
                ...document,
                pageCount: actualPageCount,
                analytics: {
                    totalViews,
                    uniqueViewers,
                    totalDuration,
                    avgDuration,
                    pageStats,
                },
            };
        }, 2500);

        if (!payload) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        return NextResponse.json(payload);
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
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
        const { folderId, workspaceId } = json;

        const document = await prisma.document.findFirst({
            where: {
                id,
                OR: [
                    { userId: session.user.id },
                    { workspace: { ownerId: session.user.id } },
                    { workspace: { members: { some: { userId: session.user.id } } } }
                ]
            },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const updated = await prisma.document.update({
            where: { id },
            data: {
                folderId: folderId === undefined ? document.folderId : folderId,
                workspaceId: workspaceId === undefined ? document.workspaceId : workspaceId
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
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
            where: {
                id,
                OR: [
                    { userId: session.user.id },
                    { workspace: { ownerId: session.user.id } },
                    { workspace: { members: { some: { userId: session.user.id } } } }
                ]
            },
            include: { workspace: true }
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // DELETION GUARD: Members cannot delete creator's files
        // If it's a workspace document and the user is NOT the owner of the document
        if (document.workspaceId && document.userId !== session.user.id) {
            // Check if the user is at least the workspace creator (they can delete everything in their workspace)
            if (document.workspace?.ownerId !== session.user.id) {
                return NextResponse.json({ error: 'Members cannot delete files created by the workspace creator.' }, { status: 403 });
            }
        }

        // Delete from blob storage
        try {
            await del(document.fileUrl);
        } catch (e) {
            console.error('Error deleting blob:', e);
        }

        await prisma.document.delete({ where: { id } });

        return NextResponse.json({ message: 'Document deleted' });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
