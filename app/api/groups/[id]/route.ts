import { connectDB } from '@/lib/mongodb';
import { Activity } from '@/models/activity';
import { Expense } from '@/models/expense';
import { Group } from '@/models/group';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }
        return NextResponse.json(group);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const body = await req.json();
        const previousGroup = await Group.findById(id);
        const group = await Group.findByIdAndUpdate(id, body, { new: true });
        if (previousGroup && body.members && body.members.length !== previousGroup.members.length) {
            await Activity.create({
                groupId: id,
                type: 'members_updated',
                message: `Members updated in ${group?.name || 'group'}`,
            });
        }
        return NextResponse.json(group);
    } catch {
        return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        await Group.findByIdAndDelete(id);
        await Expense.deleteMany({ groupId: id });
        await Activity.deleteMany({ groupId: id });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
    }
}
