export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { computeEmbedding, cosineSimilarity } from '@/lib/gemini';

// POST — server-side fallback: match viewer question against KB entries using Gemini embeddings
export async function POST(request, { params }) {
    try {
        const { slug } = await params;
        const { question } = await request.json();

        if (!question) return NextResponse.json({ error: 'Missing question' }, { status: 400 });

        const link = await prisma.link.findUnique({
            where: { slug },
            include: {
                document: {
                    include: {
                        knowledgeBase: {
                            include: {
                                entries: {
                                    where: { isApproved: true },
                                    select: { id: true, question: true, category: true, embedding: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!link?.document?.knowledgeBase || !link.enableAI) {
            return NextResponse.json({ error: 'AI not available' }, { status: 404 });
        }

        const entries = link.document.knowledgeBase.entries;

        // Compute embedding for the viewer's question
        const questionEmbedding = await computeEmbedding(question);
        if (!questionEmbedding) {
            return NextResponse.json({ error: 'Embedding failed' }, { status: 500 });
        }

        // Compute embeddings for entries that don't have one cached, and match
        let bestMatch = null;
        let bestScore = 0;

        for (const entry of entries) {
            let entryEmbedding;
            if (entry.embedding) {
                entryEmbedding = JSON.parse(entry.embedding);
            } else {
                entryEmbedding = await computeEmbedding(entry.question);
                if (entryEmbedding) {
                    // Cache it
                    await prisma.kBEntry.update({
                        where: { id: entry.id },
                        data: { embedding: JSON.stringify(entryEmbedding) },
                    });
                }
            }

            if (!entryEmbedding) continue;

            const score = await cosineSimilarity(questionEmbedding, entryEmbedding);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = entry;
            }
        }

        if (bestScore >= 0.3 && bestMatch) {
            return NextResponse.json({
                matchedEntryId: bestMatch.id,
                matchedQuestion: bestMatch.question,
                category: bestMatch.category,
                score: bestScore,
            });
        }

        return NextResponse.json({ matchedEntryId: null, score: bestScore });
    } catch (error) {
        console.error('Server match error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
