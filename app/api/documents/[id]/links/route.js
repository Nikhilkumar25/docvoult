export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const document = await prisma.document.findFirst({
            where: {
                id,
                OR: [
                    { userId: session.user.id },
                    { workspace: { ownerId: session.user.id } },
                    { workspace: { members: { some: { userId: session.user.id } } } }
                ]
            },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const links = await prisma.link.findMany({
            where: { documentId: id },
            include: {
                _count: { select: { views: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(links);
    } catch (error) {
        console.error('Error fetching links:', error);
        return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const document = await prisma.document.findFirst({
            where: {
                id,
                OR: [
                    { userId: session.user.id },
                    { workspace: { ownerId: session.user.id } },
                    { workspace: { members: { some: { userId: session.user.id } } } }
                ]
            },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        let slug = body.customSlug?.trim();

        if (slug) {
            // Remove invalid URI characters and slashes
            slug = encodeURIComponent(slug).replace(/%../g, '').replace(/[^a-zA-Z0-9-]/g, '-');

            // Collision check
            const existingLink = await prisma.link.findUnique({
                where: { slug }
            });
            if (existingLink) {
                return NextResponse.json({ error: 'This custom link is already taken. Please choose another.' }, { status: 400 });
            }
        } else {
            // Fallback to random slug
            slug = uuidv4().replace(/-/g, '').substring(0, 12);
        }

        const link = await prisma.link.create({
            data: {
                slug,
                documentId: id,
                requireEmail: body.requireEmail || false,
                passcode: body.passcode || null,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                allowDownload: body.allowDownload || false,
                requireWatermark: body.requireWatermark || false,
                isActive: true,
            },
        });

        return NextResponse.json(link, { status: 201 });
    } catch (error) {
        console.error('Error creating link:', error);
        return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
    }
}
