import { connectDB } from '@/lib/mongodb';
import { Group } from '@/models/group';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();
        const groups = await Group.find().sort({ createdAt: -1 });
        return NextResponse.json(groups);
    } catch (error) {
        console.error('Failed to fetch groups:', error);
        return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const group = new Group({
            name: body.name,
            description: body.description,
            members: body.members || [],
            createdBy: body.createdBy || 'user-1', // Simplified for now
        });

        await group.save();
        return NextResponse.json(group, { status: 201 });
    } catch (error) {
        console.error('Failed to create group:', error);
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }
}
