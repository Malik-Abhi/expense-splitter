import { create } from 'zustand';

interface User {
    id: string;
    name: string;
}

interface Group {
    _id: string;
    name: string;
    description?: string;
    members: User[];
    createdAt: string;
}

interface Expense {
    _id: string;
    groupId: string;
    description: string;
    amount: number;
    paidBy: User;
    splits: Array<{ personId: string; name: string; amount: number }>;
    category: string;
    createdAt: string;
}

interface AppState {
    groups: Group[];
    expenses: Record<string, Expense[]>;
    currentGroup: Group | null;

    // Actions
    setGroups: (groups: Group[]) => void;
    addGroup: (group: Group) => void;
    setCurrentGroup: (group: Group) => void;

    setExpenses: (groupId: string, expenses: Expense[]) => void;
    addExpense: (expense: Expense) => void;
}

export const useAppStore = create<AppState>((set) => ({
    groups: [],
    expenses: {},
    currentGroup: null,

    setGroups: (groups) => set({ groups }),
    addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
    setCurrentGroup: (group) => set({ currentGroup: group }),

    setExpenses: (groupId, expenses) =>
        set((state) => ({ expenses: { ...state.expenses, [groupId]: expenses } })),
    addExpense: (expense) =>
        set((state) => ({
            expenses: {
                ...state.expenses,
                [expense.groupId]: [...(state.expenses[expense.groupId] || []), expense],
            },
        })),
}));