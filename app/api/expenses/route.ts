import { connectDB } from '@/lib/mongodb';
import { Activity } from '@/models/activity';
import { Expense } from '@/models/expense';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const groupId = req.nextUrl.searchParams.get('groupId');

        if (!groupId) {
            return NextResponse.json({ error: 'groupId required' }, { status: 400 });
        }

        const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 });
        return NextResponse.json(expenses);
    } catch (error) {
        console.error('Failed to fetch expenses:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const expense = new Expense({
            groupId: body.groupId,
            description: body.description,
            amount: body.amount,
            paidBy: body.paidBy,
            splits: body.splits,
            splitMode: body.splitMode || 'equal',
            category: body.category || 'Other',
            receiptData: body.receiptData,
        });

        await expense.save();
        await Activity.create({
            groupId: body.groupId,
            type: 'expense_added',
            actor: body.paidBy?.name,
            amount: body.amount,
            message: `${body.paidBy?.name || 'Someone'} added ${body.description} for $${Number(body.amount || 0).toFixed(2)}`,
        });
        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        console.error('Failed to create expense:', error);
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
    }
}
