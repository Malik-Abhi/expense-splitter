'use client';

import { useMemo, useState } from 'react';

interface ExpenseSplit {
    personId: string;
    name: string;
    amount: number;
}

interface ExpenseItem {
    paidBy: { id: string; name: string };
    splits: ExpenseSplit[];
}

interface Settlement {
    from: string;
    to: string;
    amount: number;
}

interface SettlementCalculatorProps {
    expenses: ExpenseItem[];
    members: Array<{ id: string; name: string }>;
}

export function SettlementCalculator({
    expenses,
    members,
}: SettlementCalculatorProps) {
    const [settled, setSettled] = useState<Set<string>>(new Set());

    const settlements = useMemo(() => {
        const balances: Record<string, number> = {};

        // Initialize all members with 0 balance
        members.forEach((m) => {
            balances[m.id] = 0;
        });

        // Calculate balances
        expenses.forEach((expense) => {
            const paidBy = expense.paidBy.id;
            balances[paidBy] += expense.splits.reduce((sum, s) => sum + s.amount, 0);

            expense.splits.forEach((split) => {
                balances[split.personId] -= split.amount;
            });
        });

        // Convert to settlements
        const settlements: Settlement[] = [];
        const debtors = Object.entries(balances)
            .filter(([_, b]) => b < 0)
            .map(([id, b]) => ({ id, amount: Math.abs(b) }));
        const creditors = Object.entries(balances)
            .filter(([_, b]) => b > 0)
            .map(([id, b]) => ({ id, amount: b }));

        // Greedy matching
        while (debtors.length > 0 && creditors.length > 0) {
            const debtor = debtors[0];
            const creditor = creditors[0];
            const amount = Math.min(debtor.amount, creditor.amount);

            settlements.push({
                from: debtor.id,
                to: creditor.id,
                amount,
            });

            debtor.amount -= amount;
            creditor.amount -= amount;

            if (debtor.amount === 0) debtors.shift();
            if (creditor.amount === 0) creditors.shift();
        }

        return settlements;
    }, [expenses, members]);

    const getMemberName = (id: string) => {
        return members.find((m) => m.id === id)?.name || id;
    };

    const toggleSettled = (id: string) => {
        const newSettled = new Set(settled);
        if (newSettled.has(id)) {
            newSettled.delete(id);
        } else {
            newSettled.add(id);
        }
        setSettled(newSettled);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">💸 Settlements</h2>

            {settlements.length === 0 ? (
                <p className="text-gray-500">No settlements needed - everyone is balanced!</p>
            ) : (
                <div className="space-y-3">
                    {settlements.map((settlement, i) => {
                        const id = `${settlement.from}-${settlement.to}-${i}`;
                        const isSettled = settled.has(id);

                        return (
                            <div
                                key={i}
                                className={`p-4 border rounded-lg ${isSettled
                                        ? 'bg-green-50 border-green-300'
                                        : 'bg-yellow-50 border-yellow-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            {getMemberName(settlement.from)} → {getMemberName(settlement.to)}
                                        </p>
                                        <p className="text-lg font-bold text-green-600">
                                            ${settlement.amount.toFixed(2)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleSettled(id)}
                                        className={`px-4 py-2 rounded font-bold ${isSettled
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-200 text-gray-800'
                                            }`}
                                    >
                                        {isSettled ? '✅ Settled' : '⬜ Mark Paid'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}