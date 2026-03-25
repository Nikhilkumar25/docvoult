export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Fetch all signature requests (inbox + sent)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const tab = searchParams.get('tab') || 'inbox';
        const workspaceId = searchParams.get('workspaceId');

        if (tab === 'inbox') {
            // Signature requests where I am the signer
            const requests = await prisma.signatureRequest.findMany({
                where: {
                    signerEmail: { equals: session.user.email, mode: 'insensitive' },
                },
                include: {
                    document: {
                        select: {
                            id: true,
                            title: true,
                            fileName: true,
                            fileSize: true,
                            pageCount: true,
                            createdAt: true,
                            user: { select: { name: true, email: true } },
                            links: {
                                where: { isActive: true },
                                take: 1,
                                select: { slug: true },
                            },
                        },
                    },
                    signatures: {
                        select: { signedAt: true, signatureData: true },
                        take: 1,
                    },
                    activities: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    },
                    fields: true,
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json(requests);
        }

        if (tab === 'sent') {
            let documentWhere = {};
            if (workspaceId) {
                documentWhere = {
                    workspaceId,
                    OR: [
                        { workspace: { ownerId: session.user.id } },
                        { workspace: { members: { some: { userId: session.user.id } } } },
                    ]
                };
            } else {
                documentWhere = {
                    workspaceId: null,
                    OR: [
                        { userId: session.user.id }
                    ]
                };
            }

            // Signature requests on documents I own/have access to in this scope
            const requests = await prisma.signatureRequest.findMany({
                where: {
                    document: documentWhere,
                },
                include: {
                    document: {
                        select: {
                            id: true,
                            title: true,
                            fileName: true,
                            pageCount: true,
                            links: {
                                where: { isActive: true },
                                take: 1,
                                select: { slug: true },
                            },
                        },
                    },
                    signatures: {
                        select: { signedAt: true, ipAddress: true, signatureData: true },
                        take: 1,
                    },
                    activities: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                    fields: true,
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json(requests);
        }

        return NextResponse.json({ error: 'Invalid tab' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching signatures:', error);
        return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 });
    }
}

// POST - Create a new signature request (from the signatures tab)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { documentId, signerEmail, signerName, role, message, accessCode, expiresAt, order, fields } = await request.json();

        if (!documentId || !signerEmail) {
            return NextResponse.json({ error: 'Document and signer email are required' }, { status: 400 });
        }

        // Verify ownership/access to the document
        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                OR: [
                    { userId: session.user.id },
                    { workspace: { ownerId: session.user.id } },
                    { workspace: { members: { some: { userId: session.user.id } } } },
                ],
            },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
        }

        // Check for duplicate pending request
        const existing = await prisma.signatureRequest.findFirst({
            where: {
                documentId,
                signerEmail: { equals: signerEmail, mode: 'insensitive' },
                status: 'pending',
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'A pending signature request already exists for this signer on this document' }, { status: 409 });
        }

        const signatureRequest = await prisma.$transaction(async (tx) => {
            const req = await tx.signatureRequest.create({
                data: {
                    documentId,
                    signerEmail,
                    signerName: signerName || null,
                    role: role || 'signer',
                    message: message || null,
                    accessCode: accessCode || null,
                    expiresAt: expiresAt ? new Date(expiresAt) : null,
                    order: order || 0,
                    status: 'pending',
                },
            });

            // Create activity log entry
            await tx.signatureActivity.create({
                data: {
                    requestId: req.id,
                    action: 'created',
                    actor: session.user.email,
                    details: `Signature request sent to ${signerEmail}${role && role !== 'signer' ? ` as ${role}` : ''}`,
                },
            });

            if (fields && fields.length > 0) {
                await tx.signatureField.createMany({
                    data: fields.map(f => ({
                        requestId: req.id,
                        pageNumber: f.pageNumber,
                        x: f.x,
                        y: f.y,
                        width: f.width || 120,
                        height: f.height || 60,
                        type: f.type || 'signature'
                    }))
                });
            }

            return req;
        });

        return NextResponse.json(signatureRequest, { status: 201 });
    } catch (error) {
        console.error('Error creating signature request:', error);
        return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 });
    }
}
