import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            ownedWorkspaces: {
                include: {
                    members: true,
                    _count: { select: { documents: true, folders: true } }
                }
            },
            workspaceMembers: {
                include: {
                    workspace: {
                        include: {
                            owner: { select: { name: true, email: true } },
                            members: true,
                            _count: { select: { documents: true, folders: true } }
                        }
                    }
                }
            }
        }
    });

    const owned = user.ownedWorkspaces.map(w => ({ ...w, role: 'owner' }));
    const memberOf = user.workspaceMembers.map(m => ({ ...m.workspace, role: 'member' }));

    return NextResponse.json([...owned, ...memberOf]);
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { _count: { select: { ownedWorkspaces: true } } }
        });

        if (user._count.ownedWorkspaces >= 2) {
            return NextResponse.json({ error: 'You can only create up to 2 workspaces.' }, { status: 400 });
        }

        const workspace = await prisma.workspace.create({
            data: {
                name,
                ownerId: user.id
            }
        });

        return NextResponse.json(workspace);
    } catch (error) {
        console.error('Workspace creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
