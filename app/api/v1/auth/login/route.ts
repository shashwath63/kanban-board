import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = generateToken(user.id);

        return NextResponse.json({ message: 'Login successful', token }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
