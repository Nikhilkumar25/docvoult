import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(request, { params }) {
    try {
        const { slug } = await params;
        const { signatureData, email, requestId } = await request.json();

        if (!signatureData || !email || !requestId) {
            return NextResponse.json({ error: 'Missing required signature data' }, { status: 400 });
        }

        const link = await prisma.link.findUnique({
            where: { slug },
            include: { document: true }
        });

        if (!link || !link.isActive) {
            return NextResponse.json({ error: 'Document not found or inactive' }, { status: 404 });
        }

        const signatureRequest = await prisma.signatureRequest.findUnique({
            where: { id: requestId },
        });

        if (!signatureRequest || signatureRequest.documentId !== link.documentId) {
            return NextResponse.json({ error: 'Signature request not found' }, { status: 404 });
        }

        if (signatureRequest.signerEmail.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json({ error: 'Email does not match signature request' }, { status: 403 });
        }

        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        // We could calculate the document hash here if we had the file content, 
        // but for now we'll just store the fact that it was signed.

        const signature = await prisma.$transaction(async (tx) => {
            const sig = await tx.signature.create({
                data: {
                    requestId,
                    signatureData,
                    ipAddress,
                    userAgent,
                }
            });

            await tx.signatureRequest.update({
                where: { id: requestId },
                data: {
                    status: 'signed',
                    signedAt: new Date(),
                }
            });

            return sig;
        });

        return NextResponse.json({ success: true, signature });
    } catch (error) {
        console.error('Error submitting signature:', error);
        return NextResponse.json({ error: 'Failed to submit signature' }, { status: 500 });
    }
}
