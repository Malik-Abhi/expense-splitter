import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        members: [
            {
                id: String,
                name: String,
                email: String,
            },
        ],
        createdBy: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

if (mongoose.models.Group && mongoose.models.Group.schema.path('createdBy')?.instance !== 'String') {
    mongoose.deleteModel('Group');
}

export const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
