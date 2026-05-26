import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req, { params }) {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const viewId = searchParams.get('viewId');

    try {
        // 1. Validate the link and document
        const link = await prisma.link.findUnique({
            where: { slug },
            include: {
                document: {
                    select: {
                        id: true,
                        fileUrl: true,
                        fileName: true,
                    },
                },
            },
        });

        if (!link || !link.isActive) {
            return new Response('Unauthorized', { status: 401 });
        }

        // 2. Validate session/view if required
        // If it's a private link, we should ensure the viewId is valid
        if (viewId) {
            const view = await prisma.view.findUnique({
                where: { id: viewId },
            });
            if (!view || view.linkId !== link.id) {
                return new Response('Invalid session', { status: 403 });
            }
        } else if (link.requireEmail || link.passcode) {
            // If this link requires auth and no viewId is provided, block it
            // Exceptions can be made for initial load if we use a different token system
            return new Response('Authentication required', { status: 403 });
        }

        // 3. Redirect directly to the Vercel Blob URL
        // This avoids proxying the entire PDF through the serverless function,
        // which causes slow loading and memory/timeout issues for large files.
        return NextResponse.redirect(link.document.fileUrl);

    } catch (error) {
        console.error('Proxy Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
