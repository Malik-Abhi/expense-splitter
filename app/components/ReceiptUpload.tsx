'use client';

import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Paragraph } from './ui';

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

    const readFileAsDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            setError('');

            const dataUrl = await readFileAsDataUrl(file);
            const base64String = dataUrl.split(',')[1];
            setPreview(dataUrl);

            const response = await axios.post('/api/receipts', {
                imageBase64: base64String,
            });
            onReceiptParsed(response.data);
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
                <label className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background/25 transition hover:border-primary/60 hover:bg-accent/60">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <span className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-accent text-2xl font-black text-primary">
                            ↑
                        </span>
                        <Paragraph className="mb-2 text-sm font-bold">
                            <span className="font-extrabold text-foreground">Click to upload</span> or drag and drop
                        </Paragraph>
                        <Paragraph className="text-xs font-bold">PNG, JPG, GIF up to 10MB</Paragraph>
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
                    <Image
                        src={preview}
                        alt="Receipt preview"
                        width={640}
                        height={360}
                        unoptimized
                        className="max-h-64 w-full rounded-lg object-cover"
                    />
                    <Paragraph className="mt-2 text-xs font-bold">
                        {loading || isLoading ? 'Claude is analyzing your receipt...' : 'Receipt uploaded'}
                    </Paragraph>
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm font-bold text-foreground">
                    {error}
                </div>
            )}
        </div>
    );
}
