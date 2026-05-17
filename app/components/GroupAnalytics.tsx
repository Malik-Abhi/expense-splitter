'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faReceipt, faScaleBalanced, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Heading, Panel, Paragraph, SectionHeader } from './ui';

interface Expense {
    amount: number;
    category: string;
    paidBy: { id: string; name: string };
    splits: Array<{ personId: string; name: string; amount: number }>;
}

interface GroupAnalyticsProps {
    expenses: Expense[];
    members: Array<{ id: string; name: string }>;
}

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

export function GroupAnalytics({ expenses, members }: GroupAnalyticsProps) {
    const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = expenses.reduce<Record<string, number>>((totals, expense) => {
        totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        return totals;
    }, {});
    const paidTotals = expenses.reduce<Record<string, number>>((totals, expense) => {
        totals[expense.paidBy.name] = (totals[expense.paidBy.name] || 0) + expense.amount;
        return totals;
    }, {});
    const topPayer = Object.entries(paidTotals).sort((a, b) => b[1] - a[1])[0];

    const stats = [
        { label: 'Total spend', value: `$${totalSpend.toFixed(2)}`, icon: faChartSimple },
        { label: 'Expenses', value: expenses.length.toString(), icon: faReceipt },
        { label: 'Members', value: members.length.toString(), icon: faUsers },
        { label: 'Top payer', value: topPayer?.[0] || 'None yet', icon: faScaleBalanced },
    ];

    return (
        <Panel className="p-6">
            <SectionHeader title="Dashboard" icon={faChartSimple} />

            <div className="grid gap-3 md:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border bg-background/25 p-4 transition hover:-translate-y-1 hover:border-primary/40">
                        <FontAwesomeIcon icon={stat.icon} className="mb-3 text-primary" />
                        <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                        <p className="mt-1 truncate font-mono text-xl font-bold text-foreground">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <Heading level={3}>Spend by category</Heading>
                {Object.keys(categoryTotals).length === 0 ? (
                    <Paragraph className="mt-2 text-sm">Add expenses to see category analytics.</Paragraph>
                ) : (
                    <div className="mt-4 space-y-3">
                        {Object.entries(categoryTotals).map(([category, value], index) => {
                            const percent = totalSpend ? (value / totalSpend) * 100 : 0;
                            return (
                                <div key={category}>
                                    <div className="mb-1 flex justify-between text-sm">
                                        <span className="font-semibold">{category}</span>
                                        <span className="font-mono">${value.toFixed(2)}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted">
                                        <div
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Panel>
    );
}
