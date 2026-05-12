'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faReceipt, faTrash, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { ExpenseForm } from '@/app/components/ExpenseForm';
import { ExpenseList } from '@/app/components/ExpenseList';
import { SettlementCalculator } from '@/app/components/SettlementCalculator';
import { AppShell, Button, Heading, Panel, Paragraph, TextField } from '@/app/components/ui';

interface Group {
    _id: string;
    name: string;
    description?: string;
    members: Array<{ id: string; name: string; email?: string }>;
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
    const [memberName, setMemberName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');

    const makeMemberId = () => `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
            void Promise.resolve().then(fetchGroupAndExpenses);
        }
    }, [fetchGroupAndExpenses, groupId]);

    const updateMembers = async (members: Group['members']) => {
        if (!group) {
            return;
        }

        const response = await axios.put(`/api/groups/${groupId}`, { members });
        setGroup(response.data);
    };

    const handleAddMember = async () => {
        if (!group || !memberName.trim()) {
            return;
        }

        await updateMembers([
            ...group.members,
            {
                id: makeMemberId(),
                name: memberName.trim(),
                email: memberEmail.trim() || undefined,
            },
        ]);
        setMemberName('');
        setMemberEmail('');
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!group) {
            return;
        }

        await updateMembers(group.members.filter((member) => member.id !== memberId));
    };

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
                    {group.description && <Paragraph className="mt-2">{group.description}</Paragraph>}
                    <div className="mt-5 flex flex-wrap gap-2">
                        {group.members.map((member) => (
                            <span
                                key={member.id}
                                className="rounded-full border border-border bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground"
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
                        <FontAwesomeIcon icon={faReceipt} />
                        Expenses
                    </Button>
                    <Button
                        type="button"
                        variant={activeTab === 'settlements' ? 'primary' : 'ghost'}
                        onClick={() => setActiveTab('settlements')}
                        className="h-11 min-w-36 shadow-none"
                    >
                        <FontAwesomeIcon icon={faChartLine} />
                        Settlements
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6">
                        <Panel className="p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <FontAwesomeIcon icon={faUsers} className="text-primary" />
                                <Heading level={2}>Members</Heading>
                            </div>
                            <div className="space-y-2">
                                {group.members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between rounded-md border border-border bg-background/25 p-3 transition hover:border-primary/40">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-foreground">{member.name}</p>
                                            {member.email && <p className="truncate text-sm text-muted-foreground">{member.email}</p>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="rounded-md px-2 py-1 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                                            aria-label={`Remove ${member.name}`}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 space-y-3">
                                <TextField label="Name" value={memberName} onChange={(event) => setMemberName(event.target.value)} />
                                <TextField label="Email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} />
                                <Button type="button" variant="secondary" onClick={handleAddMember} className="w-full">
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    Add member
                                </Button>
                            </div>
                        </Panel>
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
