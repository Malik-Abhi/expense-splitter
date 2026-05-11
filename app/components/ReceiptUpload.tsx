'use client';

import { useState } from 'react';
import axios from 'axios';

interface ReceiptData {
    items: Array<{ name: string; price: number }>;
    total: number;
    storeName: string;
    category: string;
}

interface ReceiptUploadProps {
    onReceiptParsed: (data: ReceiptData) => void;
    isLoading?: boolean;
}

export function ReceiptUpload({ onReceiptParsed, isLoading = false }: ReceiptUploadProps) {
    const [preview, setPreview] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setPreview(base64);
        };
        reader.readAsDataURL(file);

        // Upload and parse
        try {
            setLoading(true);
            setError('');

            // Convert to base64
            const fileReader = new FileReader();
            fileReader.onload = async () => {
                const base64String = (fileReader.result as string).split(',')[1];

                const response = await axios.post('/api/receipts', {
                    imageBase64: base64String,
                });

                onReceiptParsed(response.data);
            };
            fileReader.readAsDataURL(file);
        } catch (err) {
            setError('Failed to parse receipt. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                            className="w-8 h-8 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 5.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 19V6m0 0L8 8m2-2l2 2"
                            />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={loading || isLoading}
                    />
                </label>
            </div>

            {preview && (
                <div className="relative">
                    <img src={preview} alt="Receipt preview" className="w-full rounded-lg max-h-64 object-cover" />
                    <p className="text-xs text-gray-500 mt-2">
                        {loading || isLoading ? '⏳ Claude is analyzing your receipt...' : '✅ Receipt uploaded!'}
                    </p>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>
            )}
        </div>
    );
}