export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const folder = await prisma.folder.findUnique({
            where: { id },
            include: {
                parent: true,
            },
        });

        if (!folder || folder.userId !== session.user.id) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        return NextResponse.json(folder);
    } catch (error) {
        console.error('Error fetching folder:', error);
        return NextResponse.json(
            { error: 'Failed to fetch folder' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const folder = await prisma.folder.findUnique({
            where: { id },
        });

        if (!folder || folder.userId !== session.user.id) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        const json = await request.json();
        const { name } = json;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
        }

        const updated = await prisma.folder.update({
            where: { id },
            data: { name: name.trim() },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating folder:', error);
        return NextResponse.json(
            { error: 'Failed to update folder' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const folder = await prisma.folder.findUnique({
            where: { id },
        });

        if (!folder || folder.userId !== session.user.id) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        // Deleting the folder will cascade delete children folders (due to Prisma schema)
        // Documents in this folder will have their folderId set to null (due to onDelete: SetNull)
        await prisma.folder.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting folder:', error);
        return NextResponse.json(
            { error: 'Failed to delete folder' },
            { status: 500 }
        );
    }
}
