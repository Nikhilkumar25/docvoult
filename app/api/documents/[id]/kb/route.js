export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { generateQAPairs } from '@/lib/gemini';

// GET — fetch KB + entries for a document (owner)
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
            include: {
                knowledgeBase: {
                    include: {
                        entries: { orderBy: { sortOrder: 'asc' } },
                        unanswered: {
                            where: { dismissed: false },
                            orderBy: { count: 'desc' },
                        },
                    },
                },
            },
        });

        if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(document.knowledgeBase || null);
    } catch (error) {
        console.error('KB GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch KB' }, { status: 500 });
    }
}

// POST — generate KB from document text
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const document = await prisma.document.findFirst({
            where: {
                id,
                OR: [
                    { userId: session.user.id },
                    { workspace: { ownerId: session.user.id } },
                ]
            },
        });

        if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is missing in .env file.' }, { status: 500 });
        }

        // Create or reset knowledge base
        let kb = await prisma.knowledgeBase.upsert({
            where: { documentId: id },
            create: { documentId: id, status: 'generating' },
            update: { status: 'generating' },
        });

        // Delete old entries on regeneration
        await prisma.kBEntry.deleteMany({ where: { knowledgeBaseId: kb.id } });

        try {
            // Extract text from PDF via Vercel Blob URL
            const pdfResponse = await fetch(document.fileUrl);
            if (!pdfResponse.ok) throw new Error('Could not fetch PDF');

            const pdfBuffer = await pdfResponse.arrayBuffer();
            const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

            // Generate strategic questions via Gemini Multimodal
            const pairs = await generateQAPairs(pdfBase64, document.title);

            // Store entries
            await prisma.kBEntry.createMany({
                data: pairs.map((p, i) => ({
                    knowledgeBaseId: kb.id,
                    question: p.question,
                    answer: p.answer,
                    sortOrder: i,
                })),
            });

            await prisma.knowledgeBase.update({
                where: { id: kb.id },
                data: { status: 'ready' },
            });

            // Re-fetch with entries
            const updated = await prisma.knowledgeBase.findUnique({
                where: { id: kb.id },
                include: {
                    entries: { orderBy: { sortOrder: 'asc' } },
                    unanswered: { where: { dismissed: false }, orderBy: { count: 'desc' } },
                },
            });

            return NextResponse.json(updated);
        } catch (genError) {
            console.error('AI generation error:', genError);
            await prisma.knowledgeBase.update({
                where: { id: kb.id },
                data: { status: 'failed' },
            });
            return NextResponse.json({ error: genError.message || 'AI generation failed' }, { status: 500 });
        }
    } catch (error) {
        console.error('KB POST error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
