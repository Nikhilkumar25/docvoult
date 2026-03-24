import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: documentId } = await params;

        const signatureRequests = await prisma.signatureRequest.findMany({
            where: {
                documentId,
                document: {
                    OR: [
                        { userId: session.user.id },
                        { workspace: { ownerId: session.user.id } },
                        { workspace: { members: { some: { userId: session.user.id } } } }
                    ]
                }
            },
            include: {
                signatures: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(signatureRequests);
    } catch (error) {
        console.error('Error fetching signature requests:', error);
        return NextResponse.json({ error: 'Failed to fetch signature requests' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: documentId } = await params;
        const { signerEmail, signerName } = await request.json();

        if (!signerEmail) {
            return NextResponse.json({ error: 'Signer email is required' }, { status: 400 });
        }

        // Verify ownership/access
        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                OR: [
                    { userId: session.user.id },
                    { workspace: { ownerId: session.user.id } },
                    { workspace: { members: { some: { userId: session.user.id } } } }
                ]
            }
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const signatureRequest = await prisma.signatureRequest.create({
            data: {
                documentId,
                signerEmail,
                signerName,
                status: 'pending'
            }
        });

        return NextResponse.json(signatureRequest);
    } catch (error) {
        console.error('Error creating signature request:', error);
        return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 });
    }
}
