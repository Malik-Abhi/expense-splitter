'use client';

import { Heading, ListItem, Paragraph, Panel } from './ui';

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
                        <ListItem
                            key={expense._id}
                            title={expense.description}
                            description={`Paid by ${expense.paidBy.name}`}
                            leading={
                                <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-sm font-black text-primary">
                                    {getCategoryInitial(expense.category)}
                                </span>
                            }
                            trailing={
                                <div className="text-right">
                                    <p className="font-mono text-lg font-black text-primary">${expense.amount.toFixed(2)}</p>
                                    <Paragraph className="text-xs font-bold">
                                        {new Date(expense.createdAt).toLocaleDateString()}
                                    </Paragraph>
                                </div>
                            }
                        />
                    ))}
                </div>
            )}
        </Panel>
    );
}
