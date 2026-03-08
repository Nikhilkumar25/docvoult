import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

export async function POST(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: workspaceId } = await params;
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { members: true, owner: true }
        });

        if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

        // Only owner can add members
        if (workspace.owner.email !== session.user.email) {
            return NextResponse.json({ error: 'Only the workspace owner can add members.' }, { status: 403 });
        }

        // Limit of 3 members
        if (workspace.members.length >= 3) {
            return NextResponse.json({ error: 'This workspace already has the maximum of 3 members.' }, { status: 400 });
        }

        // Cannot add yourself or the owner
        if (email === workspace.owner.email) {
            return NextResponse.json({ error: 'You are already the owner of this workspace.' }, { status: 400 });
        }

        // Check if already a member
        const existingMember = await prisma.workspaceMember.findFirst({
            where: { workspaceId, userEmail: email }
        });
        if (existingMember) return NextResponse.json({ error: 'User is already a member.' }, { status: 400 });

        // Find if user already exists in the system
        const invitedUser = await prisma.user.findUnique({ where: { email } });

        const member = await prisma.workspaceMember.create({
            data: {
                workspaceId,
                userEmail: email,
                userId: invitedUser?.id || null
            }
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error('Membership error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: workspaceId } = await params;
    const { email } = await req.json();

    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { owner: true }
        });

        // Only owner or the member themselves can remove
        if (workspace.owner.email !== session.user.email && session.user.email !== email) {
            return NextResponse.json({ error: 'Unauthorized to remove this member.' }, { status: 403 });
        }

        await prisma.workspaceMember.delete({
            where: { workspaceId_userEmail: { workspaceId, userEmail: email } }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Member removal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
