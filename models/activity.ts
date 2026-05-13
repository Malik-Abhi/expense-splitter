import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
    {
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
        type: { type: String, required: true },
        message: { type: String, required: true },
        actor: { type: String },
        amount: { type: Number },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
