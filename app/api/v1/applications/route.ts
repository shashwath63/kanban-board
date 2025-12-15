import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
        where: { user_id: user.userId },
        orderBy: [
            { status: 'asc' },
            { position_index: 'asc' },
        ],
    });

    return NextResponse.json(applications);
}

export async function POST(req: Request) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { company_name, job_title, status, date_applied } = await req.json();

        if (!company_name || !job_title || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find the highest position_index for the given status
        const lastApp = await prisma.application.findFirst({
            where: {
                user_id: user.userId,
                status: status,
            },
            orderBy: {
                position_index: 'desc',
            },
        });

        const newPositionIndex = lastApp ? lastApp.position_index + 1 : 0;

        const application = await prisma.application.create({
            data: {
                user_id: user.userId,
                company_name,
                job_title,
                status,
                position_index: newPositionIndex,
                date_applied: date_applied ? new Date(date_applied) : new Date(),
            },
        });

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error('Create application error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
