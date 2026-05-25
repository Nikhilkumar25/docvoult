export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

async function checkAccess(id, session) {
    return await prisma.document.findFirst({
        where: {
            id,
            OR: [
                { userId: session.user.id },
                { workspace: { ownerId: session.user.id } },
                { workspace: { members: { some: { userId: session.user.id } } } }
            ]
        },
    });
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, linkId } = await params;
        const document = await checkAccess(id, session);
        if (!document) return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });

        await prisma.link.delete({
            where: { id: linkId, documentId: id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting link:', error);
        return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, linkId } = await params;
        const document = await checkAccess(id, session);
        if (!document) return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });

        const body = await request.json();
        
        // Handle slug changes
        let newSlug = body.customSlug?.trim();
        let slugToUpdate = undefined;

        if (newSlug) {
            newSlug = encodeURIComponent(newSlug).replace(/%../g, '').replace(/[^a-zA-Z0-9-]/g, '-');
            
            // Collision check only if slug is changing
            const existingLink = await prisma.link.findUnique({
                where: { slug: newSlug }
            });
            if (existingLink && existingLink.id !== linkId) {
                return NextResponse.json({ error: 'This custom link is already taken. Please choose another.' }, { status: 400 });
            }
            slugToUpdate = newSlug;
        }

        const dataToUpdate = {
            requireEmail: body.requireEmail,
            passcode: body.passcode === '' ? null : body.passcode,
            allowDownload: body.allowDownload,
            requireWatermark: body.requireWatermark,
            enableAI: body.enableAI,
        };

        if (slugToUpdate) dataToUpdate.slug = slugToUpdate;
        if (body.expiresAt !== undefined) {
            dataToUpdate.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
        }

        const updatedLink = await prisma.link.update({
            where: { id: linkId, documentId: id },
            data: dataToUpdate,
            include: {
                _count: { select: { views: true } },
            }
        });

        return NextResponse.json(updatedLink);
    } catch (error) {
        console.error('Error updating link:', error);
        return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
    }
}
