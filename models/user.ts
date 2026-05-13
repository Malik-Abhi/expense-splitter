import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        currency: { type: String, default: 'USD' },
        members: [
            {
                id: String,
                name: String,
                email: String,
            },
        ],
        categories: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

if (mongoose.models.User && !mongoose.models.User.schema.path('password')) {
    mongoose.deleteModel('User');
}

export const User = mongoose.models.User || mongoose.model('User', userSchema);
