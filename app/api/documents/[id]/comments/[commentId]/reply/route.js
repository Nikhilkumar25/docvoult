import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req, { params }) {
    const { id, commentId } = await params;

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { text } = body;

        if (!text || !text.trim()) {
            return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
        }

        // Verify document ownership
        const document = await prisma.document.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!document || document.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update comment with response
        const comment = await prisma.comment.update({
            where: { id: commentId },
            data: {
                response: text,
                responseAt: new Date(),
            },
        });

        // Mock Email Sending Logic
        // In a real app, you would use Resend, SendGrid, etc.
        console.log('--------------------------------------------------');
        console.log('📧 MOCK EMAIL NOTIFICATION');
        console.log(`To: ${comment.askerEmail || comment.userName}`);
        console.log(`Subject: New response to your question on ${document.title || 'DocsVault Document'}`);
        console.log(`Question: ${comment.text}`);
        console.log(`Response: ${text}`);
        console.log('--------------------------------------------------');

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error replying to question:', error);
        return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
    }
}
