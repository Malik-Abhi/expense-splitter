import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Stay', 'Groceries', 'Entertainment', 'Utilities'];
const hashPassword = (password: string) => createHash('sha256').update(password).digest('hex');

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const email = String(body.email || '').toLowerCase().trim();
        const password = String(body.password || '');
        const passwordHash = hashPassword(password);
        const mode = body.mode === 'create-account' ? 'create-account' : 'sign-in';

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        let user = await User.findOne({ email });

        if (mode === 'create-account') {
            if (user) {
                return NextResponse.json({ error: 'Account already exists' }, { status: 409 });
            }

            user = await User.create({
                email,
                password: passwordHash,
                name: email.split('@')[0],
                categories: DEFAULT_CATEGORIES,
                members: [],
            });
        } else if (!user || user.password !== passwordHash) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                currency: user.currency,
                members: user.members || [],
                categories: user.categories?.length ? user.categories : DEFAULT_CATEGORIES,
            },
        });
    } catch (error) {
        console.error('Auth failed:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
