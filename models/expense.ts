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
                paid: { type: Boolean, default: false },
                paidAt: Date,
            },
        ],
        splitMode: { type: String, default: 'equal' },
        status: { type: String, default: 'open' },
        category: { type: String, default: 'Other' }, // Food, Transport, etc.
        receiptData: {
            items: [{ name: String, price: Number }],
            storeName: String,
            imageUrl: String,
            reviewed: { type: Boolean, default: false },
        },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

if (mongoose.models.Expense && mongoose.models.Expense.schema.path('paidBy.id')?.instance !== 'String') {
    mongoose.deleteModel('Expense');
}

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
