import prisma from '@/lib/db';
import ViewerClient from './ViewerClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const link = await prisma.link.findUnique({
        where: { slug },
        include: { document: true }
    });

    if (!link) return { title: 'Document Not Found' };

    return {
        title: `Viewing: ${link.document.title} | DocsVault`,
        description: 'Securely view this document on DocsVault.',
    };
}

export default async function ViewPage({ params, searchParams }) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const viewId = resolvedSearchParams?.viewId;

    try {
        // Server-side validation
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

        if (!link || !link.isActive) {
            return notFound();
        }

        // Check if expired
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            return (
                <div className="error-page">
                    <div className="error-content">
                        <h1>Link Expired</h1>
                        <p>This document link is no longer active.</p>
                    </div>
                </div>
            );
        }

        let initialData = {
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
            slug,
        };

        // If viewId is provided, try to restore session on server
        if (viewId && viewId !== 'null') {
            const view = await prisma.view.findUnique({
                where: { id: viewId },
                include: { link: true }
            });

            if (view && view.link.slug === slug && view.link.isActive) {
                initialData = {
                    ...initialData,
                    viewId: view.id,
                    viewerEmail: view.viewerEmail,
                    viewerName: view.viewerName,
                    document: {
                        ...initialData.document,
                        fileUrl: link.document.fileUrl,
                    },
                    isRestored: true
                };
            }
        }

        return <ViewerClient initialData={initialData} />;

    } catch (error) {
        console.error('Server-side view load error:', error);
        return (
            <div className="error-page">
                <div className="error-content">
                    <h1>Error Loading Document</h1>
                    <p>Something went wrong on our end. Please try again later.</p>
                </div>
            </div>
        );
    }
}
