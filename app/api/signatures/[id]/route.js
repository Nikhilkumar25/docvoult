export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Fetch a single signature request with full activity log
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const signatureRequest = await prisma.signatureRequest.findFirst({
            where: {
                id,
                OR: [
                    { signerEmail: { equals: session.user.email, mode: 'insensitive' } },
                    { document: { userId: session.user.id } },
                    { document: { workspace: { ownerId: session.user.id } } },
                    { document: { workspace: { members: { some: { userId: session.user.id } } } } },
                ],
            },
            include: {
                document: {
                    select: {
                        id: true,
                        title: true,
                        fileName: true,
                        fileSize: true,
                        pageCount: true,
                        user: { select: { name: true, email: true } },
                        links: {
                            where: { isActive: true },
                            take: 1,
                            select: { slug: true },
                        },
                    },
                },
                signatures: true,
                activities: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!signatureRequest) {
            return NextResponse.json({ error: 'Signature request not found' }, { status: 404 });
        }

        return NextResponse.json(signatureRequest);
    } catch (error) {
        console.error('Error fetching signature request:', error);
        return NextResponse.json({ error: 'Failed to fetch signature request' }, { status: 500 });
    }
}

// PATCH - Update signature request (decline, revoke, etc.)
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { action, reason } = await request.json();

        const signatureRequest = await prisma.signatureRequest.findFirst({
            where: {
                id,
                OR: [
                    { signerEmail: { equals: session.user.email, mode: 'insensitive' } },
                    { document: { userId: session.user.id } },
                    { document: { workspace: { ownerId: session.user.id } } },
                ],
            },
            include: { document: true },
        });

        if (!signatureRequest) {
            return NextResponse.json({ error: 'Signature request not found' }, { status: 404 });
        }

        if (action === 'decline') {
            if (signatureRequest.signerEmail.toLowerCase() !== session.user.email.toLowerCase()) {
                return NextResponse.json({ error: 'Only the signer can decline' }, { status: 403 });
            }

            const updated = await prisma.$transaction(async (tx) => {
                const req = await tx.signatureRequest.update({
                    where: { id },
                    data: {
                        status: 'declined',
                        declinedAt: new Date(),
                        declineReason: reason || null,
                    },
                });

                await tx.signatureActivity.create({
                    data: {
                        requestId: id,
                        action: 'declined',
                        actor: session.user.email,
                        details: reason ? `Declined: ${reason}` : 'Signature request declined',
                    },
                });

                return req;
            });

            return NextResponse.json(updated);
        }

        if (action === 'revoke') {
            // Only document owner can revoke
            if (signatureRequest.document.userId !== session.user.id) {
                return NextResponse.json({ error: 'Only the document owner can revoke' }, { status: 403 });
            }

            const updated = await prisma.$transaction(async (tx) => {
                const req = await tx.signatureRequest.update({
                    where: { id },
                    data: { status: 'revoked' },
                });

                await tx.signatureActivity.create({
                    data: {
                        requestId: id,
                        action: 'revoked',
                        actor: session.user.email,
                        details: 'Signature request revoked by document owner',
                    },
                });

                return req;
            });

            return NextResponse.json(updated);
        }

        if (action === 'remind') {
            await prisma.signatureActivity.create({
                data: {
                    requestId: id,
                    action: 'reminded',
                    actor: session.user.email,
                    details: `Reminder sent to ${signatureRequest.signerEmail}`,
                },
            });

            // Return Gmail compose URL
            const subject = encodeURIComponent(`Reminder: Please sign "${signatureRequest.document.title}"`);
            const body = encodeURIComponent(
                `Hi ${signatureRequest.signerName || 'there'},\n\n` +
                `This is a friendly reminder that your signature is still required on "${signatureRequest.document.title}".\n\n` +
                `Please review and sign the document at your earliest convenience.\n\n` +
                `Best regards,\n${session.user.name || 'Document Owner'}`
            );
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(signatureRequest.signerEmail)}&su=${subject}&body=${body}`;

            return NextResponse.json({ success: true, gmailUrl });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating signature request:', error);
        return NextResponse.json({ error: 'Failed to update signature request' }, { status: 500 });
    }
}

// DELETE - Cancel/delete a signature request
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const signatureRequest = await prisma.signatureRequest.findFirst({
            where: {
                id,
                document: {
                    OR: [
                        { userId: session.user.id },
                        { workspace: { ownerId: session.user.id } },
                    ],
                },
                status: { not: 'signed' }, // Cannot delete signed requests
            },
        });

        if (!signatureRequest) {
            return NextResponse.json({ error: 'Cannot delete this request (not found or already signed)' }, { status: 404 });
        }

        await prisma.signatureRequest.delete({ where: { id } });

        return NextResponse.json({ message: 'Signature request deleted' });
    } catch (error) {
        console.error('Error deleting signature request:', error);
        return NextResponse.json({ error: 'Failed to delete signature request' }, { status: 500 });
    }
}
