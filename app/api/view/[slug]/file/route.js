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

        // 3. Fetch the file from Vercel Blob
        // Since we are on the server, we can fetch the private blob URL
        // We'll proxy the response to the client
        const fileResponse = await fetch(link.document.fileUrl);

        if (!fileResponse.ok) {
            console.error('Failed to fetch from Vercel Blob:', fileResponse.statusText);
            return new Response('Failed to load document source', { status: 502 });
        }

        // 4. Return the stream with correct headers for aggressive caching
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        
        // Encode filename to handle non-ASCII characters (RFC 5987)
        const encodedFileName = encodeURIComponent(link.document.fileName);
        headers.set('Content-Disposition', `inline; filename="document.pdf"; filename*=UTF-8''${encodedFileName}`);
        
        // Cache aggressively: 1 day in browser, 7 days stale-while-revalidate
        headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800, immutable');
        // ETag based on document ID + updatedAt for cache busting on file update
        headers.set('ETag', `"${link.document.id}"`);

        return new Response(fileResponse.body, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Proxy Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
