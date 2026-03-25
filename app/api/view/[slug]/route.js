export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

import { getCached } from '@/lib/memory-cache';

// GET - Validate link and return document info
export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        const cacheKey = `viewer_link_${slug}`;
        const link = await getCached(cacheKey, async () => {
            return await prisma.link.findUnique({
                where: { slug },
                include: {
                    document: {
                        select: {
                            id: true,
                            title: true,
                            pageCount: true,
                            fileUrl: true,
                            fileName: true,
                        },
                    },
                },
            });
        }, 5000); // 5s cache since links rarely change configuration

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        if (!link.isActive) {
            return NextResponse.json({ error: 'This link has been disabled' }, { status: 403 });
        }

        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
        }

        const { searchParams } = new URL(request.url);
        const viewId = searchParams.get('viewId');

        if (viewId) {
            const view = await prisma.view.findUnique({
                where: { id: viewId },
                include: { link: true }
            });

            if (view && view.link.slug === slug && view.link.isActive) {
                // Check expiry
                if (view.link.expiresAt && new Date(view.link.expiresAt) < new Date()) {
                    return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
                }

                // Fetch signature requests for this viewer's email
                const signatureRequests = await prisma.signatureRequest.findMany({
                    where: {
                        documentId: link.documentId,
                        signerEmail: { equals: view.viewerEmail, mode: 'insensitive' },
                    },
                    select: {
                        id: true,
                        signerEmail: true,
                        signerName: true,
                        status: true,
                        role: true,
                        message: true,
                        createdAt: true,
                        signedAt: true,
                    },
                });

                return NextResponse.json({
                    viewId: view.id,
                    viewerEmail: view.viewerEmail,
                    viewerName: view.viewerName,
                    document: {
                        title: link.document.title,
                        pageCount: link.document.pageCount,
                        fileUrl: link.document.fileUrl,
                        fileName: link.document.fileName,
                    },
                    allowDownload: link.allowDownload,
                    requireWatermark: link.requireWatermark,
                    enableAI: link.enableAI,
                    signatureRequests,
                    isRestored: true
                });
            }
        }

        return NextResponse.json({
            requireEmail: link.requireEmail,
            hasPasscode: !!link.passcode,
            allowDownload: link.allowDownload,
            requireWatermark: link.requireWatermark,
            enableAI: link.enableAI,
            document: {
                title: link.document.title,
                pageCount: link.document.pageCount,
                fileName: link.document.fileName,
            },
        });
    } catch (error) {
        console.error('Error validating link:', error);
        return NextResponse.json({ error: 'Failed to validate link' }, { status: 500 });
    }
}

// POST - Submit email/passcode and get document access
export async function POST(request, { params }) {
    try {
        const { slug } = await params;
        const body = await request.json();

        const link = await prisma.link.findUnique({
            where: { slug },
            include: {
                document: {
                    select: {
                        id: true,
                        title: true,
                        pageCount: true,
                        fileUrl: true,
                        fileName: true,
                    },
                },
            },
        });

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        if (!link.isActive) {
            return NextResponse.json({ error: 'This link has been disabled' }, { status: 403 });
        }

        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
        }

        // Validate passcode
        if (link.passcode && body.passcode !== link.passcode) {
            return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 });
        }

        // Validate email requirement
        if (link.requireEmail && !body.email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Create a view record
        const view = await prisma.view.create({
            data: {
                viewerEmail: body.email || null,
                viewerName: body.name || null,
                linkId: link.id,
                documentId: link.document.id,
            },
        });

        // Fetch signature requests for this viewer's email
        let signatureRequests = [];
        if (body.email) {
            signatureRequests = await prisma.signatureRequest.findMany({
                where: {
                    documentId: link.document.id,
                    signerEmail: { equals: body.email, mode: 'insensitive' },
                },
                select: {
                    id: true,
                    signerEmail: true,
                    signerName: true,
                    status: true,
                    role: true,
                    message: true,
                    createdAt: true,
                    signedAt: true,
                },
            });

            // Update viewCount and lastViewedAt for pending requests
            const pendingIds = signatureRequests
                .filter(r => r.status === 'pending')
                .map(r => r.id);
            if (pendingIds.length > 0) {
                await prisma.signatureRequest.updateMany({
                    where: { id: { in: pendingIds } },
                    data: {
                        viewCount: { increment: 1 },
                        lastViewedAt: new Date(),
                    },
                });
            }
        }

        return NextResponse.json({
            viewId: view.id,
            document: {
                title: link.document.title,
                pageCount: link.document.pageCount,
                fileUrl: link.document.fileUrl,
                fileName: link.document.fileName,
            },
            allowDownload: link.allowDownload,
            requireWatermark: link.requireWatermark,
            enableAI: link.enableAI,
            signatureRequests,
        });
    } catch (error) {
        console.error('Error accessing document:', error);
        return NextResponse.json({ error: 'Failed to access document' }, { status: 500 });
    }
}
