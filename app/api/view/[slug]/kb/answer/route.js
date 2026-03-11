export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { rephraseAnswer } from '@/lib/gemini';

// POST — rephrase a matched answer for the viewer's question
export async function POST(request, { params }) {
    try {
        const { slug } = await params;
        const { question, matchedEntryId } = await request.json();

        if (!question || !matchedEntryId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const link = await prisma.link.findUnique({
            where: { slug },
            include: { document: true },
        });

        if (!link || !link.isActive || !link.enableAI) {
            return NextResponse.json({ error: 'AI not available' }, { status: 404 });
        }

        const entry = await prisma.kBEntry.findUnique({
            where: { id: matchedEntryId },
        });

        if (!entry || !entry.isApproved) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        // Check category
        if (entry.category === 'sensitive' || entry.category === 'out-of-scope') {
            return NextResponse.json({
                answer: 'This topic is outside what I can share. Please contact the document owner directly.',
                category: entry.category,
            });
        }

        const rephrased = await rephraseAnswer(
            question,
            entry.question,
            entry.answer,
            link.document.title
        );

        return NextResponse.json({
            answer: rephrased,
            category: entry.category,
        });
    } catch (error) {
        console.error('Answer rephrase error:', error);
        return NextResponse.json({ error: 'Failed to generate answer' }, { status: 500 });
    }
}
