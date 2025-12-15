import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const data = await req.json();

        // Prevent updating sensitive fields like user_id or id directly if passed
        delete data.id;
        delete data.user_id;
        delete data.created_at;
        delete data.updated_at;

        // If date_applied is string, convert to Date
        if (data.date_applied) {
            data.date_applied = new Date(data.date_applied);
        }

        const application = await prisma.application.update({
            where: {
                id: id,
                user_id: user.userId, // Ensure ownership
            },
            data: data,
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        await prisma.application.delete({
            where: {
                id: id,
                user_id: user.userId,
            },
        });

        return NextResponse.json({ message: 'Application deleted' });
    } catch (error) {
        console.error('Delete application error:', error);
        return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
    }
}
