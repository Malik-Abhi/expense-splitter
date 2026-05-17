'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faPlus, faReceipt, faTrash, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { ExpenseForm } from '@/app/components/ExpenseForm';
import { ExpenseList } from '@/app/components/ExpenseList';
import { GroupAnalytics } from '@/app/components/GroupAnalytics';
import { ActivityFeed } from '@/app/components/ActivityFeed';
import { SettlementCalculator } from '@/app/components/SettlementCalculator';
import { AppShell, Badge, Button, IconButton, ListItem, Modal, Panel, Paragraph, SegmentedControl, SectionHeader, TextField, Heading } from '@/app/components/ui';

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

interface Activity {
    _id: string;
    type: string;
    message: string;
    createdAt: string;
}

export default function GroupPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;
    const [group, setGroup] = useState<Group | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'expenses' | 'settlements' | 'activity'>('expenses');
    const [memberName, setMemberName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

    const makeMemberId = () => `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const fetchGroupAndExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const [groupRes, expensesRes, activityRes] = await Promise.all([
                axios.get(`/api/groups/${groupId}`),
                axios.get(`/api/expenses?groupId=${groupId}`),
                axios.get(`/api/activities?groupId=${groupId}`),
            ]);
            setGroup(groupRes.data);
            setExpenses(expensesRes.data);
            setActivities(activityRes.data);
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

    const handleDeleteGroup = async () => {
        if (!group) {
            return;
        }

        const confirmed = window.confirm(`Delete ${group.name}? This also removes its expenses and activity.`);
        if (!confirmed) {
            return;
        }

        await axios.delete(`/api/groups/${groupId}`);
        router.push('/');
    };

    const handleExpenseAdded = () => {
        setIsExpenseFormOpen(false);
        fetchGroupAndExpenses();
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
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <Heading>{group.name}</Heading>
                            {group.description && <Paragraph className="mt-2">{group.description}</Paragraph>}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button type="button" variant="primary" onClick={() => setIsExpenseFormOpen(true)} icon={faPlus}>
                                Add Expense
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleDeleteGroup} icon={faTrash} className="border-destructive/40 text-destructive hover:bg-destructive/10">
                                Delete group
                            </Button>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {group.members.map((member) => (
                            <Badge key={member.id}>
                                {member.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                <GroupAnalytics expenses={expenses} members={group.members} />

                <SegmentedControl
                    value={activeTab}
                    onChange={setActiveTab}
                    className="my-8 grid-cols-1 sm:grid-cols-3"
                    options={[
                        { value: 'expenses', label: 'Expenses', icon: faReceipt },
                        { value: 'settlements', label: 'Settlements', icon: faChartLine },
                        { value: 'activity', label: 'Activity', icon: faUsers },
                    ]}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6">
                        <Panel className="p-6">
                            <SectionHeader icon={faUsers} title="Members" />
                            <div className="space-y-2">
                                {group.members.map((member) => (
                                    <ListItem
                                        key={member.id}
                                        title={member.name}
                                        description={member.email}
                                        trailing={
                                            <IconButton
                                                icon={faTrash}
                                                label={`Remove ${member.name}`}
                                                variant="danger"
                                                onClick={() => handleRemoveMember(member.id)}
                                            />
                                        }
                                    />
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
                    </div>

                    {/* Right: Expenses or Settlements */}
                    <div className="lg:col-span-2">
                        {activeTab === 'expenses' ? (
                            <ExpenseList expenses={expenses} />
                        ) : activeTab === 'settlements' ? (
                            <SettlementCalculator expenses={expenses} members={group.members} />
                        ) : (
                            <ActivityFeed activities={activities} />
                        )}
                    </div>
                </div>

                {isExpenseFormOpen && (
                    <Modal title="Add Expense" onClose={() => setIsExpenseFormOpen(false)}>
                        <ExpenseForm
                            groupId={groupId}
                            members={group.members}
                            onExpenseAdded={handleExpenseAdded}
                        />
                    </Modal>
                )}
            </div>
        </AppShell>
    );
}
