'use client';

import { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKeyboard, faReceipt, faScaleBalanced } from '@fortawesome/free-solid-svg-icons';
import { ReceiptUpload } from './ReceiptUpload';
import { Button, Paragraph, SegmentedControl, SelectField, TextField } from './ui';

interface ReceiptData {
    items: Array<{ name: string; price: number }>;
    total: number;
    storeName?: string;
    category?: string;
}

interface ExpenseFormProps {
    groupId: string;
    members: Array<{ id: string; name: string }>;
    onExpenseAdded: () => void;
}

type SplitMode = 'equal' | 'exact' | 'percent' | 'shares';

export function ExpenseForm({ groupId, members, onExpenseAdded }: ExpenseFormProps) {
    const [categories] = useState<string[]>(() => {
        if (typeof window === 'undefined') {
            return ['Food', 'Transport', 'Stay', 'Groceries', 'Entertainment', 'Utilities', 'Other'];
        }

        const storedCategories = window.localStorage.getItem('splitmint-categories');
        return storedCategories
            ? (JSON.parse(storedCategories) as string[])
            : ['Food', 'Transport', 'Stay', 'Groceries', 'Entertainment', 'Utilities', 'Other'];
    });
    const [method, setMethod] = useState<'receipt' | 'manual'>('manual');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(members[0]?.id || '');
    const [category, setCategory] = useState('Other');
    const [splitMode, setSplitMode] = useState<SplitMode>('equal');
    const [splits, setSplits] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

    const validateSplits = (total: number, mode: SplitMode, values: Record<string, number>) => {
        if (total <= 0) {
            return 'Total amount must be greater than zero.';
        }

        if (mode === 'exact') {
            const exactSum = members.reduce((sum, member) => sum + (values[member.id] || 0), 0);
            if (Math.abs(exactSum - total) > 0.01) {
                return `Exact amounts must sum to ${total.toFixed(2)}. Current total is ${exactSum.toFixed(2)}.`;
            }
        }

        if (mode === 'percent') {
            const percentSum = members.reduce((sum, member) => sum + (values[member.id] || 0), 0);
            if (Math.abs(percentSum - 100) > 0.5) {
                return 'Percent allocations must total 100%.';
            }
        }

        if (mode === 'shares') {
            const sharesTotal = members.reduce((sum, member) => sum + (values[member.id] || 0), 0);
            if (sharesTotal <= 0) {
                return 'Enter at least one share value for split shares.';
            }
        }

        return null;
    };

    const calculateSplits = (total: number, mode: SplitMode, values: Record<string, number>) => {
        if (members.length === 0) {
            return {};
        }

        const newSplits: Record<string, number> = {};

        if (mode === 'equal') {
            const equal = total / members.length;
            members.forEach((m) => {
                newSplits[m.id] = Math.round(equal * 100) / 100;
            });
            return newSplits;
        }

        if (mode === 'percent') {
            members.forEach((m) => {
                newSplits[m.id] = Math.round(total * ((values[m.id] || 0) / 100) * 100) / 100;
            });
            return newSplits;
        }

        if (mode === 'shares') {
            const totalShares = members.reduce((sum, m) => sum + (values[m.id] || 0), 0) || members.length;
            members.forEach((m) => {
                const memberShares = values[m.id] || 1;
                newSplits[m.id] = Math.round((total * memberShares / totalShares) * 100) / 100;
            });
            return newSplits;
        }

        return values;
    };

    const initializeSplits = (total: number, mode = splitMode) => {
        setSplits(calculateSplits(total, mode, splits));
    };

    const handleReceiptParsed = (data: ReceiptData) => {
        setReceiptData(data);
        setDescription(data.storeName || 'Receipt');
        setAmount(data.total.toString());
        setCategory(data.category || 'Food');
        initializeSplits(data.total);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormError(null);
        setAmount(val);
        if (val) {
            initializeSplits(parseFloat(val));
        }
    };

    const handleSplitChange = (memberId: string, value: string) => {
        setFormError(null);
        const rawValue = parseFloat(value) || 0;
        const total = parseFloat(amount) || 0;

        if (splitMode === 'exact') {
            const otherAmount = members.reduce(
                (sum, member) => (member.id === memberId ? sum : sum + (splits[member.id] || 0)),
                0
            );
            const maxAllowed = Math.max(0, total - otherAmount);
            setSplits((prev) => ({
                ...prev,
                [memberId]: Math.min(rawValue, maxAllowed),
            }));
            return;
        }

        if (splitMode === 'percent') {
            const otherPercent = members.reduce(
                (sum, member) => (member.id === memberId ? sum : sum + (splits[member.id] || 0)),
                0
            );
            const maxAllowed = Math.max(0, 100 - otherPercent);
            setSplits((prev) => ({
                ...prev,
                [memberId]: Math.min(rawValue, maxAllowed),
            }));
            return;
        }

        setSplits((prev) => ({
            ...prev,
            [memberId]: rawValue,
        }));
    };

    const handleSplitModeChange = (mode: SplitMode) => {
        setSplitMode(mode);
        const total = parseFloat(amount) || 0;
        if (mode === 'equal') {
            setSplits(calculateSplits(total, mode, splits));
        } else if (mode === 'shares') {
            const shares = Object.fromEntries(members.map((member) => [member.id, splits[member.id] || 1]));
            setSplits(shares);
        } else {
            setSplits({});
        }
    };

    const displaySplitAmount = (memberId: string) => {
        const total = parseFloat(amount) || 0;
        if (splitMode === 'percent') {
            return Math.round(total * ((splits[memberId] || 0) / 100) * 100) / 100;
        }
        if (splitMode === 'shares') {
            const calculated = calculateSplits(total, splitMode, splits);
            return calculated[memberId] || 0;
        }
        return splits[memberId] || 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description || !amount || !paidBy) {
            alert('Please fill all fields');
            return;
        }

        try {
            setLoading(true);

            const total = parseFloat(amount) || 0;
            const validationError = validateSplits(total, splitMode, splits);
            if (validationError) {
                setFormError(validationError);
                setLoading(false);
                return;
            }

            const expenseSplits = members
                .map((m) => ({
                    personId: m.id,
                    name: m.name,
                    amount: displaySplitAmount(m.id),
                }))
                .filter((split) => split.amount > 0);

            const expense = {
                groupId,
                description,
                amount: parseFloat(amount),
                paidBy: {
                    id: paidBy,
                    name: members.find((m) => m.id === paidBy)?.name,
                },
                splits: expenseSplits,
                splitMode,
                category,
                receiptData: receiptData ? { ...receiptData, reviewed: true } : undefined,
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
        <div className="p-6">
            <SegmentedControl
                value={method}
                onChange={setMethod}
                className="mb-6 grid-cols-2"
                options={[
                    { value: 'manual', label: 'Manual', icon: faKeyboard },
                    { value: 'receipt', label: 'Receipt', icon: faReceipt },
                ]}
            />

            {method === 'receipt' && (
                <div className="mb-6">
                    <ReceiptUpload onReceiptParsed={handleReceiptParsed} isLoading={loading} />
                    {receiptData && (
                        <div className="mt-4 rounded-lg border border-border bg-muted p-4">
                            <h3 className="mb-3 text-sm font-black text-foreground">AI receipt review</h3>
                            <div className="space-y-2">
                                {receiptData.items.map((item, i) => (
                                    <div key={`${item.name}-${i}`} className="grid grid-cols-[1fr_6rem] gap-2">
                                        <input
                                            value={item.name}
                                            onChange={(event) => {
                                                const nextItems = [...receiptData.items];
                                                nextItems[i] = { ...item, name: event.target.value };
                                                setReceiptData({ ...receiptData, items: nextItems });
                                            }}
                                            className="input-field h-9 px-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(event) => {
                                                const nextItems = [...receiptData.items];
                                                nextItems[i] = { ...item, price: parseFloat(event.target.value) || 0 };
                                                const total = nextItems.reduce((sum, nextItem) => sum + nextItem.price, 0);
                                                setReceiptData({ ...receiptData, items: nextItems, total });
                                                setAmount(total.toFixed(2));
                                                initializeSplits(total);
                                            }}
                                            className="input-field h-9 px-2 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                            <Paragraph className="mt-3 font-extrabold text-foreground">Reviewed total: ${receiptData.total.toFixed(2)}</Paragraph>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                    label="Description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Dinner, groceries, cab"
                    disabled={loading}
                />

                <TextField
                    label="Total amount"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    step="0.01"
                    disabled={loading}
                />

                <SelectField label="Paid by" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} disabled={loading}>
                    {members.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </SelectField>

                <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading}>
                    {categories.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </SelectField>

                <div>
                    <label className="mb-2 block text-sm font-extrabold text-foreground">Split mode</label>
                    <SegmentedControl
                        value={splitMode}
                        onChange={handleSplitModeChange}
                        className="grid-cols-2"
                        options={[
                            { value: 'equal', label: 'Equal' },
                            { value: 'exact', label: 'Exact' },
                            { value: 'percent', label: 'Percent' },
                            { value: 'shares', label: 'Shares' },
                        ]}
                    />
                </div>

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-extrabold text-foreground">
                        <FontAwesomeIcon icon={faScaleBalanced} />
                        Split amounts
                    </label>
                    {formError && (
                        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {formError}
                        </div>
                    )}
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div key={member.id} className="grid gap-2 rounded-md border border-border bg-background/25 p-3 sm:grid-cols-[7rem_1fr_4rem] sm:items-center">
                                <span className="truncate text-sm font-bold text-muted-foreground">
                                    {member.name}
                                </span>
                                <input
                                    type="number"
                                    value={splits[member.id] || ''}
                                    onChange={(e) => handleSplitChange(member.id, e.target.value)}
                                    placeholder={splitMode === 'percent' ? '0%' : splitMode === 'shares' ? '1' : '0.00'}
                                    step="0.01"
                                    readOnly={splitMode === 'equal'}
                                    className="input-field h-11 min-w-0 flex-1 px-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/35"
                                    disabled={loading}
                                />
                                <span className="text-right text-sm font-bold text-muted-foreground">
                                    ${displaySplitAmount(member.id).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={
                        loading ||
                        !description ||
                        !amount ||
                        !!validateSplits(parseFloat(amount) || 0, splitMode, splits)
                    }
                    className="w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Adding...' : 'Add expense'}
                </Button>
            </form>
        </div>
    );
}
