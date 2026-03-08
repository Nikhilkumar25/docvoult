export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { hash } from 'bcrypt-ts';
import prisma from '@/lib/db';

export async function POST(request) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        // Link any existing workspace memberships
        await prisma.workspaceMember.updateMany({
            where: { userEmail: email },
            data: { userId: user.id }
        });

        return NextResponse.json(
            { message: 'Account created successfully', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
