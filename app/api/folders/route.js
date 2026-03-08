export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');
        const workspaceId = searchParams.get('workspaceId');

        let whereClause;
        if (workspaceId) {
            whereClause = {
                workspaceId,
                parentId: parentId || null,
                OR: [
                    { workspace: { ownerId: session.user.id } },
                    { workspace: { members: { some: { userId: session.user.id } } } }
                ]
            };
        } else {
            whereClause = {
                userId: session.user.id,
                workspaceId: null,
                parentId: parentId || null,
            };
        }

        const folders = await prisma.folder.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { documents: true, children: true },
                },
            },
        });

        return NextResponse.json(folders);
    } catch (error) {
        console.error('Error fetching folders:', error);
        return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const json = await request.json();
        const { name, parentId, workspaceId } = json;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
        }

        // Verify workspace membership if creating in a workspace
        if (workspaceId) {
            const workspace = await prisma.workspace.findFirst({
                where: {
                    id: workspaceId,
                    OR: [
                        { ownerId: session.user.id },
                        { members: { some: { userId: session.user.id } } }
                    ]
                }
            });
            if (!workspace) {
                return NextResponse.json({ error: 'You do not have access to this workspace.' }, { status: 403 });
            }
        }

        const folder = await prisma.folder.create({
            data: {
                name: name.trim(),
                userId: session.user.id,
                parentId: parentId || null,
                workspaceId: workspaceId || null,
            },
        });

        return NextResponse.json(folder, { status: 201 });
    } catch (error) {
        console.error('Error creating folder:', error);
        return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }
}
