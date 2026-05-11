'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ExpenseForm } from '@/app/components/ExpenseForm';
import { ExpenseList } from '@/app/components/ExpenseList';
import { SettlementCalculator } from '@/app/components/SettlementCalculator';

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

    useEffect(() => {
        if (groupId) {
            fetchGroupAndExpenses();
        }
    }, [groupId]);

    const fetchGroupAndExpenses = async () => {
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
    };

    if (loading) return <p className="p-8">Loading...</p>;
    if (!group) return <p className="p-8">Group not found</p>;

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">{group.name}</h1>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {group.members.map((member) => (
                            <span
                                key={member.id}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                                {member.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-4 py-2 font-semibold ${activeTab === 'expenses'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600'
                            }`}
                    >
                        📊 Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('settlements')}
                        className={`px-4 py-2 font-semibold ${activeTab === 'settlements'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600'
                            }`}
                    >
                        💸 Settlements
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Expense Form */}
                    <div className="lg:col-span-1">
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
        </main>
    );
}