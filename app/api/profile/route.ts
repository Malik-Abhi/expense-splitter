import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const email = req.nextUrl.searchParams.get('email')?.toLowerCase();
        if (!email) {
            return NextResponse.json({ error: 'email required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const email = String(body.email || '').toLowerCase();

        if (!email) {
            return NextResponse.json({ error: 'email required' }, { status: 400 });
        }

        const user = await User.findOneAndUpdate(
            { email },
            {
                name: body.name,
                currency: body.currency,
                members: body.members || [],
                categories: body.categories || [],
            },
            { new: true }
        );

        return NextResponse.json(user);
    } catch (error) {
        console.error('Failed to update profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
