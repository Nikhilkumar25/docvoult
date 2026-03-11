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

        // Admin gate — only the platform admin can access this
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail || session.user.email !== adminEmail) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // ── Platform-wide counts ──
        const [
            totalUsers,
            totalDocuments,
            totalLinks,
            totalViews,
            totalKBs,
            totalKBEntries,
            totalUnanswered,
            totalComments,
            totalPageViews,
            failedKBs,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.document.count(),
            prisma.link.count(),
            prisma.view.count(),
            prisma.knowledgeBase.count(),
            prisma.kBEntry.count(),
            prisma.unansweredQuestion.count(),
            prisma.comment.count(),
            prisma.pageView.count(),
            prisma.knowledgeBase.count({ where: { status: { in: ['error', 'failed'] } } }),
        ]);

        // ── Link feature breakdown ──
        const [aiLinks, watermarkLinks, emailLinks, passcodeLinks] = await Promise.all([
            prisma.link.count({ where: { enableAI: true } }),
            prisma.link.count({ where: { requireWatermark: true } }),
            prisma.link.count({ where: { requireEmail: true } }),
            prisma.link.count({ where: { NOT: { passcode: null } } }),
        ]);

        // ── Aggregate view stats ──
        const viewAgg = await prisma.view.aggregate({
            _sum: { duration: true },
            _count: true,
        });
        const uniqueViewers = await prisma.view.groupBy({
            by: ['viewerEmail'],
            where: { viewerEmail: { not: null } },
        });

        // ── Total file size ──
        const fileSizeAgg = await prisma.document.aggregate({
            _sum: { fileSize: true },
        });

        // ── KB status breakdown ──
        const kbReady = await prisma.knowledgeBase.count({ where: { status: 'ready' } });
        const kbApprovedEntries = await prisma.kBEntry.count({ where: { isApproved: true } });

        // ── User signups per month (last 6 months) ──
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const recentUsers = await prisma.user.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        const signupsByMonth = {};
        recentUsers.forEach(u => {
            const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`;
            signupsByMonth[key] = (signupsByMonth[key] || 0) + 1;
        });

        // ── Top 10 users by document count ──
        const topUsers = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
            orderBy: {
                documents: { _count: 'desc' },
            },
            take: 10,
        });

        // Enrich top users with views received and KB count
        const topUsersEnriched = await Promise.all(
            topUsers.map(async (user) => {
                const [viewsReceived, kbCount] = await Promise.all([
                    prisma.view.count({
                        where: { document: { userId: user.id } },
                    }),
                    prisma.knowledgeBase.count({
                        where: { document: { userId: user.id } },
                    }),
                ]);
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    documents: user._count.documents,
                    viewsReceived,
                    kbCount,
                };
            })
        );

        // ── Recent activity feed (last 20 events) ──
        const [recentSignups, recentUploads, recentViews] = await Promise.all([
            prisma.user.findMany({
                select: { id: true, name: true, email: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.document.findMany({
                select: { id: true, title: true, createdAt: true, user: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.view.findMany({
                select: {
                    id: true,
                    viewerEmail: true,
                    startedAt: true,
                    duration: true,
                    document: { select: { title: true } },
                },
                orderBy: { startedAt: 'desc' },
                take: 10,
            }),
        ]);

        const activityFeed = [
            ...recentSignups.map(u => ({
                type: 'signup',
                label: `${u.name} signed up`,
                detail: u.email,
                timestamp: u.createdAt,
            })),
            ...recentUploads.map(d => ({
                type: 'upload',
                label: `${d.user.name} uploaded "${d.title}"`,
                detail: d.user.email,
                timestamp: d.createdAt,
            })),
            ...recentViews.map(v => ({
                type: 'view',
                label: `${v.viewerEmail || 'Anonymous'} viewed "${v.document.title}"`,
                detail: `${v.duration}s`,
                timestamp: v.startedAt,
            })),
        ]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20);

        return NextResponse.json({
            kpis: {
                totalUsers,
                totalDocuments,
                totalLinks,
                totalViews,
                totalPageViews,
                uniqueViewers: uniqueViewers.length,
                totalKBs,
                totalFileSize: fileSizeAgg._sum.fileSize || 0,
                avgEngagement: totalViews > 0 ? Math.round((viewAgg._sum.duration || 0) / totalViews) : 0,
                totalComments,
            },
            linkFeatures: {
                total: totalLinks,
                ai: aiLinks,
                watermark: watermarkLinks,
                email: emailLinks,
                passcode: passcodeLinks,
            },
            ai: {
                totalKBs,
                kbReady,
                failedKBs,
                totalEntries: totalKBEntries,
                approvedEntries: kbApprovedEntries,
                unanswered: totalUnanswered,
                approvalRate: totalKBEntries > 0 ? Math.round((kbApprovedEntries / totalKBEntries) * 100) : 0,
            },
            signupsByMonth,
            topUsers: topUsersEnriched,
            activityFeed,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
    }
}
