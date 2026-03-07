export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - Validate link and return document info
export async function GET(request, { params }) {
    try {
        const { slug } = await params;

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

        return NextResponse.json({
            requireEmail: link.requireEmail,
            hasPasscode: !!link.passcode,
            allowDownload: link.allowDownload,
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

        return NextResponse.json({
            viewId: view.id,
            document: {
                title: link.document.title,
                pageCount: link.document.pageCount,
                fileUrl: link.document.fileUrl,
                fileName: link.document.fileName,
            },
            allowDownload: link.allowDownload,
        });
    } catch (error) {
        console.error('Error accessing document:', error);
        return NextResponse.json({ error: 'Failed to access document' }, { status: 500 });
    }
}
