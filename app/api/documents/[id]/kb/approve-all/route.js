export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST — bulk approve all entries
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
            include: { knowledgeBase: true },
        });
        if (!document?.knowledgeBase) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await prisma.kBEntry.updateMany({
            where: { knowledgeBaseId: document.knowledgeBase.id },
            data: { isApproved: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('KB approve-all error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
