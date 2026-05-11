'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ExpenseForm } from '@/app/components/ExpenseForm';
import { ExpenseList } from '@/app/components/ExpenseList';
import { SettlementCalculator } from '@/app/components/SettlementCalculator';
import { AppShell, Button, Heading, Panel, Paragraph } from '@/app/components/ui';

interface Group {
    _id: string;
    name: string;
    description?: string;
    members: Array<{ id: string; name: string }>;
}

interface Expense {
    _id: string;
    description: string;
    amount: number;
    paidBy: { id: string; name: string };
    splits: Array<{ personId: string; name: string; amount: number }>;
    category: string;
    createdAt: string;
}

export default function GroupPage() {
    const params = useParams();
    const groupId = params.id as string;
    const [group, setGroup] = useState<Group | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'expenses' | 'settlements'>('expenses');

    const fetchGroupAndExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const [groupRes, expensesRes] = await Promise.all([
                axios.get(`/api/groups/${groupId}`),
                axios.get(`/api/expenses?groupId=${groupId}`),
            ]);
            setGroup(groupRes.data);
            setExpenses(expensesRes.data);
        } catch (error) {
            console.error('Failed to fetch group:', error);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        if (groupId) {
            fetchGroupAndExpenses();
        }
    }, [fetchGroupAndExpenses, groupId]);

    if (loading) {
        return (
            <AppShell>
                <div className="mx-auto max-w-5xl px-6 py-14">
                    <Panel className="grid min-h-80 place-items-center p-10">
                        <Paragraph>Loading group...</Paragraph>
                    </Panel>
                </div>
            </AppShell>
        );
    }

    if (!group) {
        return (
            <AppShell>
                <div className="mx-auto max-w-5xl px-6 py-14">
                    <Panel className="grid min-h-80 place-items-center p-10 text-center">
                        <div>
                            <Heading level={2}>Group not found</Heading>
                            <Paragraph className="mt-2">This group may have been deleted.</Paragraph>
                        </div>
                    </Panel>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
                <div className="mb-8">
                    <Heading>{group.name}</Heading>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {group.members.map((member) => (
                            <span
                                key={member.id}
                                className="rounded-full border border-border bg-muted px-3 py-1 text-sm font-extrabold text-muted-foreground"
                            >
                                {member.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mb-8 inline-grid rounded-lg bg-accent p-1 sm:grid-cols-2">
                    <Button
                        type="button"
                        variant={activeTab === 'expenses' ? 'primary' : 'ghost'}
                        onClick={() => setActiveTab('expenses')}
                        className="h-11 min-w-36 shadow-none"
                    >
                        Expenses
                    </Button>
                    <Button
                        type="button"
                        variant={activeTab === 'settlements' ? 'primary' : 'ghost'}
                        onClick={() => setActiveTab('settlements')}
                        className="h-11 min-w-36 shadow-none"
                    >
                        Settlements
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div>
                        <ExpenseForm
                            groupId={groupId}
                            members={group.members}
                            onExpenseAdded={fetchGroupAndExpenses}
                        />
                    </div>

                    {/* Right: Expenses or Settlements */}
                    <div className="lg:col-span-2">
                        {activeTab === 'expenses' ? (
                            <ExpenseList expenses={expenses} />
                        ) : (
                            <SettlementCalculator expenses={expenses} members={group.members} />
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
