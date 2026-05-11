import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        members: [
            {
                _id: mongoose.Schema.Types.ObjectId,
                name: String,
                email: String,
            },
        ],
        createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);