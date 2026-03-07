import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST - Track page view and time spent
export async function POST(request, { params }) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { viewId, pageNumber, duration, totalDuration } = body;

        if (!viewId || !pageNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify view exists and belongs to this slug's link
        const view = await prisma.view.findFirst({
            where: {
                id: viewId,
                link: { slug },
            },
        });

        if (!view) {
            return NextResponse.json({ error: 'Invalid view session' }, { status: 404 });
        }

        // Upsert page view - update duration if same page, create if new
        const existingPageView = await prisma.pageView.findFirst({
            where: {
                viewId,
                pageNumber,
            },
        });

        if (existingPageView) {
            await prisma.pageView.update({
                where: { id: existingPageView.id },
                data: {
                    duration: existingPageView.duration + (duration || 0),
                },
            });
        } else {
            await prisma.pageView.create({
                data: {
                    viewId,
                    pageNumber,
                    duration: duration || 0,
                },
            });
        }

        // Update the view's last active time and total duration
        const pageViewCount = await prisma.pageView.count({
            where: { viewId },
        });

        await prisma.view.update({
            where: { id: viewId },
            data: {
                lastActiveAt: new Date(),
                completedPages: pageViewCount,
                duration: totalDuration || view.duration,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking page view:', error);
        return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }
}
