import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { pipeline } from '@xenova/transformers';
import { rephraseAnswer } from '@/lib/gemini';

// Helper for server-side cosine similarity
function cosineSim(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

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
            include: { document: true }
        });

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        // Base comment data
        const commentData = {
            text,
            userName: userName || 'Anonymous',
            askerEmail: askerEmail || null,
            pageNumber: pageNumber ? parseInt(pageNumber) : null,
            documentId: link.documentId,
            viewId: sanitizedViewId,
        };

        // Try AI Autoreply if AI is enabled for this link
        if (link.enableAI) {
            try {
                // 1. Fetch Approved KB entries with embeddings
                const kb = await prisma.knowledgeBase.findUnique({
                    where: { documentId: link.documentId },
                    include: { entries: { where: { isApproved: true } } }
                });

                if (kb && kb.entries.length > 0) {
                    // 2. Load extraction model (Cached if possible, but instantiated here)
                    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
                    const result = await extractor(text, { pooling: 'mean', normalize: true });
                    const questionEmb = Array.from(result.data);

                    let bestMatch = null;
                    let bestScore = 0;

                    for (const entry of kb.entries) {
                        if (!entry.embedding) continue;
                        try {
                            const entryEmb = JSON.parse(entry.embedding);
                            const score = cosineSim(questionEmb, entryEmb);
                            if (score > bestScore) {
                                bestScore = score;
                                bestMatch = entry;
                            }
                        } catch (e) {
                            // ignore parse errors
                        }
                    }

                    // 3. If confident match, generate an AI response
                    if (bestMatch && bestScore > 0.4) {
                        if (bestMatch.category === 'sensitive' || bestMatch.category === 'out-of-scope') {
                            commentData.response = 'This topic is outside what I can share. Please contact the document owner directly.';
                            commentData.responseAt = new Date();
                            commentData.aiAnswered = true;
                        } else {
                            const rephrased = await rephraseAnswer(
                                text,
                                bestMatch.question,
                                bestMatch.answer,
                                link.document.title
                            );
                            commentData.response = rephrased;
                            commentData.responseAt = new Date();
                            commentData.aiAnswered = true;
                        }
                    }
                }
            } catch (aiErr) {
                console.error('Failed to auto-answer with AI:', aiErr);
                // Continue creating the comment without AI answer if it fails
            }
        }

        const comment = await prisma.comment.create({
            data: commentData,
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
