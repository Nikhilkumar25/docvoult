export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCached } from '@/lib/memory-cache';

// GET — public: return approved KB entries for a link
export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        // Verify link exists and is active
        const cacheKeyLink = `viewer_link_kb_${slug}`;
        const link = await getCached(cacheKeyLink, async () => {
            return await prisma.link.findUnique({
                where: { slug },
                include: {
                    document: {
                        include: {
                            knowledgeBase: {
                                include: {
                                    entries: {
                                        where: { isApproved: true },
                                        orderBy: { sortOrder: 'asc' },
                                        select: {
                                            id: true,
                                            question: true,
                                            category: true,
                                            // Do NOT expose answer or embedding to viewer
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }, 5000);

        if (!link || !link.isActive || !link.enableAI) {
            return NextResponse.json({ error: 'AI not available' }, { status: 404 });
        }

        const kb = link.document.knowledgeBase;
        if (!kb || kb.status !== 'ready') {
            return NextResponse.json({ error: 'KB not ready' }, { status: 404 });
        }

        return NextResponse.json({
            documentTitle: link.document.title,
            entries: kb.entries,
        });
    } catch (error) {
        console.error('Viewer KB GET error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
