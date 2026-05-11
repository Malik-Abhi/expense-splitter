'use client';

import { Heading, Paragraph, Panel } from './ui';

interface Expense {
    _id: string;
    description: string;
    amount: number;
    paidBy: { name: string };
    category: string;
    createdAt: string;
}

interface ExpenseListProps {
    expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
    const getCategoryInitial = (category: string) => {
        const initials: Record<string, string> = {
            Food: 'F',
            Transport: 'T',
            Entertainment: 'E',
            Accommodation: 'A',
            Other: 'O',
        };
        return initials[category] || 'O';
    };

    return (
        <Panel className="p-6">
            <Heading level={2} className="mb-4">Expenses</Heading>

            {expenses.length === 0 ? (
                <Paragraph>No expenses yet</Paragraph>
            ) : (
                <div className="space-y-3">
                    {expenses.map((expense) => (
                        <div
                            key={expense._id}
                            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/25 p-4 transition hover:border-primary/60"
                        >
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-sm font-black text-primary">
                                    {getCategoryInitial(expense.category)}
                                </span>
                                <div>
                                    <p className="font-extrabold text-foreground">{expense.description}</p>
                                    <p className="text-sm font-bold text-muted-foreground">
                                        Paid by {expense.paidBy.name}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-primary">${expense.amount.toFixed(2)}</p>
                                <p className="text-xs font-bold text-muted-foreground">
                                    {new Date(expense.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
}
