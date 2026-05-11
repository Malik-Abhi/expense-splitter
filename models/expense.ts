import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
    {
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        paidBy: {
            id: String,
            name: String,
        },
        splits: [
            {
                personId: String,
                name: String,
                amount: Number,
            },
        ],
        category: { type: String, default: 'Other' }, // Food, Transport, etc.
        receiptData: {
            items: [{ name: String, price: Number }],
            storeName: String,
            imageUrl: String,
        },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
