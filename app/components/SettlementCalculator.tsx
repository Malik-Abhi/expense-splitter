'use client';

import { useMemo, useState } from 'react';
import { Button, Heading, Panel, Paragraph } from './ui';

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
            .filter((entry) => entry[1] < 0)
            .map(([id, b]) => ({ id, amount: Math.abs(b) }));
        const creditors = Object.entries(balances)
            .filter((entry) => entry[1] > 0)
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
        <Panel className="p-6">
            <Heading level={2} className="mb-4">Settlements</Heading>

            {settlements.length === 0 ? (
                <Paragraph>No settlements needed. Everyone is balanced.</Paragraph>
            ) : (
                <div className="space-y-3">
                    {settlements.map((settlement, i) => {
                        const id = `${settlement.from}-${settlement.to}-${i}`;
                        const isSettled = settled.has(id);

                        return (
                            <div
                                key={i}
                                className={`rounded-lg border p-4 ${isSettled
                                        ? 'border-primary/60 bg-primary/10'
                                        : 'border-border bg-background/25'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-extrabold text-foreground">
                                            {getMemberName(settlement.from)} → {getMemberName(settlement.to)}
                                        </p>
                                        <p className="font-mono text-lg font-black text-primary">
                                            ${settlement.amount.toFixed(2)}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => toggleSettled(id)}
                                        variant={isSettled ? 'primary' : 'secondary'}
                                        className="h-10 shrink-0"
                                    >
                                        {isSettled ? 'Settled' : 'Mark paid'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Panel>
    );
}
