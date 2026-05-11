'use client';

import { useState } from 'react';
import axios from 'axios';
import { ReceiptUpload } from './ReceiptUpload';

interface ExpenseFormProps {
    groupId: string;
    members: Array<{ id: string; name: string }>;
    onExpenseAdded: () => void;
}

export function ExpenseForm({ groupId, members, onExpenseAdded }: ExpenseFormProps) {
    const [method, setMethod] = useState<'receipt' | 'manual'>('manual');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(members[0]?.id || '');
    const [category, setCategory] = useState('Other');
    const [splits, setSplits] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    // Initialize splits
    const initializeSplits = (total: number) => {
        const equal = total / members.length;
        const newSplits: Record<string, number> = {};
        members.forEach((m) => {
            newSplits[m.id] = Math.round(equal * 100) / 100;
        });
        setSplits(newSplits);
    };

    const handleReceiptParsed = (data: any) => {
        setReceiptData(data);
        setDescription(data.storeName || 'Receipt');
        setAmount(data.total.toString());
        setCategory(data.category || 'Food');
        initializeSplits(data.total);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAmount(val);
        if (val) {
            initializeSplits(parseFloat(val));
        }
    };

    const handleSplitChange = (memberId: string, value: string) => {
        setSplits((prev) => ({
            ...prev,
            [memberId]: parseFloat(value) || 0,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description || !amount || !paidBy) {
            alert('Please fill all fields');
            return;
        }

        try {
            setLoading(true);

            const expenseSplits = members
                .filter((m) => splits[m.id] && splits[m.id] > 0)
                .map((m) => ({
                    personId: m.id,
                    name: m.name,
                    amount: splits[m.id],
                }));

            const expense = {
                groupId,
                description,
                amount: parseFloat(amount),
                paidBy: {
                    id: paidBy,
                    name: members.find((m) => m.id === paidBy)?.name,
                },
                splits: expenseSplits,
                category,
                receiptData: receiptData || undefined,
            };

            await axios.post('/api/expenses', expense);

            // Reset form
            setDescription('');
            setAmount('');
            setSplits({});
            setReceiptData(null);

            onExpenseAdded();
        } catch (error) {
            alert('Failed to add expense');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>

            {/* Method selector */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setMethod('manual')}
                    className={`px-4 py-2 rounded ${method === 'manual'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                >
                    📝 Manual
                </button>
                <button
                    onClick={() => setMethod('receipt')}
                    className={`px-4 py-2 rounded ${method === 'receipt'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                >
                    📸 Receipt
                </button>
            </div>

            {/* Receipt upload */}
            {method === 'receipt' && (
                <div className="mb-6">
                    <ReceiptUpload onReceiptParsed={handleReceiptParsed} isLoading={loading} />
                    {receiptData && (
                        <div className="mt-4 p-4 bg-blue-50 rounded">
                            <h3 className="font-bold text-sm mb-2">Receipt Items:</h3>
                            <ul className="text-sm space-y-1">
                                {receiptData.items.map((item: any, i: number) => (
                                    <li key={i}>
                                        {item.name}: ${item.price.toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                            <p className="font-bold mt-2">Total: ${receiptData.total.toFixed(2)}</p>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Dinner, Groceries, Uber"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        disabled={loading}
                    />
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium mb-1">Total Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        disabled={loading}
                    />
                </div>

                {/* Paid by */}
                <div>
                    <label className="block text-sm font-medium mb-1">Paid By</label>
                    <select
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        disabled={loading}
                    >
                        {members.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        disabled={loading}
                    >
                        <option value="Food">🍕 Food</option>
                        <option value="Transport">🚗 Transport</option>
                        <option value="Entertainment">🎬 Entertainment</option>
                        <option value="Accommodation">🏨 Accommodation</option>
                        <option value="Other">📦 Other</option>
                    </select>
                </div>

                {/* Splits */}
                <div>
                    <label className="block text-sm font-medium mb-2">Split Amounts</label>
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center gap-2">
                                <label className="w-24 text-sm">{member.name}</label>
                                <input
                                    type="number"
                                    value={splits[member.id] || 0}
                                    onChange={(e) => handleSplitChange(member.id, e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-600">$</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? '⏳ Adding...' : '✅ Add Expense'}
                </button>
            </form>
        </div>
    );
}