import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';


export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch all documents with their aggregates
        const documents = await prisma.document.findMany({
            where: { userId },
            include: {
                _count: {
                    select: {
                        views: true,
                        links: true,
                        comments: true,
                    },
                },
                views: {
                    select: { duration: true },
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        const foldersCount = await prisma.folder.count({ where: { userId } });

        // Aggregate statistics
        let totalViews = 0;
        let totalLinks = 0;
        let totalQuestions = 0;
        let unansweredQuestions = 0;
        let totalDuration = 0;

        const docStats = documents.map(doc => {
            const docViews = doc._count.views;
            const docLinks = doc._count.links;
            const docQuestions = doc._count.comments;
            const docDuration = doc.views.reduce((sum, v) => sum + v.duration, 0);
            const docUnanswered = doc.comments.filter(c => !c.response).length;

            totalViews += docViews;
            totalLinks += docLinks;
            totalQuestions += docQuestions;
            totalDuration += docDuration;
            unansweredQuestions += docUnanswered;

            return {
                id: doc.id,
                title: doc.title,
                views: docViews,
                links: docLinks,
                questions: docQuestions,
                unanswered: docUnanswered,
                avgDuration: docViews > 0 ? Math.round(docDuration / docViews) : 0,
            };
        });

        // Sort by views for top documents
        const topDocuments = [...docStats].sort((a, b) => b.views - a.views).slice(0, 5);

        // Recent questions across all documents
        const allQuestions = documents.flatMap(doc =>
            doc.comments.map(c => ({
                ...c,
                documentTitle: doc.title
            }))
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

        return NextResponse.json({
            summary: {
                totalDocuments: documents.length,
                totalFolders: foldersCount,
                totalViews,
                totalLinks,
                totalQuestions,
                unansweredQuestions,
                avgDuration: totalViews > 0 ? Math.round(totalDuration / totalViews) : 0,
            },
            topDocuments,
            recentQuestions: allQuestions,
        });
    } catch (error) {
        console.error('Error fetching aggregate analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
