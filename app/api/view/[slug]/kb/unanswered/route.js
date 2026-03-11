export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST — log an unanswered viewer question
export async function POST(request, { params }) {
    try {
        const { slug } = await params;
        const { question } = await request.json();

        if (!question) return NextResponse.json({ error: 'Missing question' }, { status: 400 });

        const link = await prisma.link.findUnique({
            where: { slug },
            include: {
                document: {
                    include: { knowledgeBase: true },
                },
            },
        });

        if (!link?.document?.knowledgeBase) {
            return NextResponse.json({ error: 'KB not found' }, { status: 404 });
        }

        const kbId = link.document.knowledgeBase.id;

        // Check for a similar existing unanswered question (simple substring match)
        const existing = await prisma.unansweredQuestion.findFirst({
            where: {
                knowledgeBaseId: kbId,
                question: { contains: question.substring(0, 30), mode: 'insensitive' },
                dismissed: false,
            },
        });

        if (existing) {
            await prisma.unansweredQuestion.update({
                where: { id: existing.id },
                data: {
                    count: { increment: 1 },
                    lastAskedAt: new Date(),
                },
            });
        } else {
            await prisma.unansweredQuestion.create({
                data: {
                    knowledgeBaseId: kbId,
                    question: question.trim(),
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unanswered log error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
