import { connectDB } from '@/lib/mongodb';
import { Activity } from '@/models/activity';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const groupId = req.nextUrl.searchParams.get('groupId');
        if (!groupId) {
            return NextResponse.json({ error: 'groupId required' }, { status: 400 });
        }

        const activities = await Activity.find({ groupId }).sort({ createdAt: -1 }).limit(30);
        return NextResponse.json(activities);
    } catch (error) {
        console.error('Failed to fetch activities:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
