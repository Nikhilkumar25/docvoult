export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request, { params }) {
    try {
        const { slug } = params;
        const { fieldId, requestId, signatureData, email, name } = await request.json();

        if (!fieldId || !requestId) {
            return NextResponse.json({ error: 'Missing field or request ID' }, { status: 400 });
        }

        const field = await prisma.signatureField.update({
            where: { id: fieldId, requestId: requestId },
            data: {
                status: 'affirmed',
                affirmedAt: new Date()
            }
        });

        // Create activity log
        await prisma.signatureActivity.create({
            data: {
                requestId,
                action: 'affirmed',
                actor: email || 'Anonymous',
                details: `Affirmed signature at field on page ${field.pageNumber}`,
            }
        });

        // Check if ALL fields for this request are now affirmed
        const remaining = await prisma.signatureField.count({
            where: { requestId, status: 'pending' }
        });

        if (remaining === 0) {
            // All fields affirmed, mark the request as signed if not already
            const req = await prisma.signatureRequest.findUnique({ where: { id: requestId } });
            if (req.status !== 'signed') {
                await prisma.signatureRequest.update({
                    where: { id: requestId },
                    data: { status: 'signed', signedAt: new Date() }
                });
                
                // If signatureData is provided, ensure a Signature record exists
                if (signatureData) {
                    await prisma.signature.create({
                        data: {
                            requestId,
                            signatureData,
                            ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
                        }
                    });
                }
            }
        }

        return NextResponse.json({ success: true, allAffirmed: remaining === 0, field });
    } catch (error) {
        console.error('Error affirming field:', error);
        return NextResponse.json({ error: 'Failed to affirm field' }, { status: 500 });
    }
}
