import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { ApplicationStatus } from '@/types';

export async function PATCH(req: Request) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { applicationId, newStatus, newIndex } = await req.json();

        if (!applicationId || !newStatus || newIndex === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Transaction to ensure consistency
        await prisma.$transaction(async (tx) => {
            const application = await tx.application.findUnique({
                where: { id: applicationId },
            });

            if (!application || application.user_id !== user.userId) {
                throw new Error('Application not found');
            }

            const oldStatus = application.status;
            const oldIndex = application.position_index;

            if (oldStatus === newStatus) {
                // Moving within the same column
                if (oldIndex === newIndex) return; // No change

                if (newIndex > oldIndex) {
                    // Moving down: Shift items between oldIndex + 1 and newIndex UP (-1)
                    await tx.application.updateMany({
                        where: {
                            user_id: user.userId,
                            status: oldStatus,
                            position_index: {
                                gt: oldIndex,
                                lte: newIndex,
                            },
                        },
                        data: {
                            position_index: { decrement: 1 },
                        },
                    });
                } else {
                    // Moving up: Shift items between newIndex and oldIndex - 1 DOWN (+1)
                    await tx.application.updateMany({
                        where: {
                            user_id: user.userId,
                            status: oldStatus,
                            position_index: {
                                gte: newIndex,
                                lt: oldIndex,
                            },
                        },
                        data: {
                            position_index: { increment: 1 },
                        },
                    });
                }
            } else {
                // Moving to a different column
                // 1. Shift items in old column (fill the gap)
                await tx.application.updateMany({
                    where: {
                        user_id: user.userId,
                        status: oldStatus,
                        position_index: { gt: oldIndex },
                    },
                    data: {
                        position_index: { decrement: 1 },
                    },
                });

                // 2. Shift items in new column (make space)
                await tx.application.updateMany({
                    where: {
                        user_id: user.userId,
                        status: newStatus as ApplicationStatus,
                        position_index: { gte: newIndex },
                    },
                    data: {
                        position_index: { increment: 1 },
                    },
                });
            }

            // Update the target application
            await tx.application.update({
                where: { id: applicationId },
                data: {
                    status: newStatus as ApplicationStatus,
                    position_index: newIndex,
                },
            });
        });

        return NextResponse.json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Reorder error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
