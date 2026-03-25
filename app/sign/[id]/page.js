import prisma from '@/lib/db';
import { notFound, redirect } from 'next/navigation';

export default async function SignRedirectPage({ params }) {
    const { id } = await params;

    // 1. Find the signature request
    const request = await prisma.signatureRequest.findUnique({
        where: { id },
        include: {
            document: {
                include: {
                    links: {
                        where: { isActive: true },
                        take: 1
                    }
                }
            }
        }
    });

    if (!request) return notFound();

    // 2. We need a link to view the document. 
    // If no link exists, create a temporary internal one or reuse the first active one.
    let linkSlug = request.document.links[0]?.slug;

    if (!linkSlug) {
        // Create a default link if none exists (just for this signing flow)
        const newLink = await prisma.link.create({
            data: {
                documentId: request.documentId,
                slug: `sig-${Math.random().toString(36).substring(2, 10)}`,
                requireEmail: true, // We need email to identify the signer
            }
        });
        linkSlug = newLink.slug;
    }

    // 3. Redirect to the viewer with the signer's email pre-filled via search params
    // The ViewerClient will use this email to automatically identify the signer.
    redirect(`/view/${linkSlug}?email=${encodeURIComponent(request.signerEmail)}`);
}
