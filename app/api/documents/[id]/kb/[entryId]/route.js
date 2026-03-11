export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// PATCH — edit an entry
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, entryId } = await params;
        const body = await request.json();

        // Verify ownership
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

        const updated = await prisma.kBEntry.update({
            where: { id: entryId },
            data: {
                ...(body.question !== undefined && { question: body.question }),
                ...(body.answer !== undefined && { answer: body.answer }),
                ...(body.category !== undefined && { category: body.category }),
                ...(body.isApproved !== undefined && { isApproved: body.isApproved }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('KB entry PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }
}

// DELETE — remove an entry
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, entryId } = await params;

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

        await prisma.kBEntry.delete({ where: { id: entryId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('KB entry DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }
}
