'use client';

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
    const getCategoryEmoji = (category: string) => {
        const emojis: Record<string, string> = {
            Food: '🍕',
            Transport: '🚗',
            Entertainment: '🎬',
            Accommodation: '🏨',
            Other: '📦',
        };
        return emojis[category] || '📦';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Expenses</h2>

            {expenses.length === 0 ? (
                <p className="text-gray-500">No expenses yet</p>
            ) : (
                <div className="space-y-3">
                    {expenses.map((expense) => (
                        <div key={expense._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{getCategoryEmoji(expense.category)}</span>
                                <div>
                                    <p className="font-semibold">{expense.description}</p>
                                    <p className="text-sm text-gray-600">Paid by {expense.paidBy.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(expense.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}