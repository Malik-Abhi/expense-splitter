import { connectDB } from '@/lib/mongodb';
import { Expense } from '@/models/expense';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const expense = await Expense.findById(id);
        if (!expense) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        }
        return NextResponse.json(expense);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
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
        const expense = await Expense.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json(expense);
    } catch {
        return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        await Expense.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }
}
