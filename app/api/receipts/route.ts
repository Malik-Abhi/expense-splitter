import { parseReceiptImage } from '@/lib/claude';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Parse receipt with Claude
        const receiptData = await parseReceiptImage(imageBase64);

        return NextResponse.json(receiptData);
    } catch (error) {
        console.error('Receipt upload error:', error);
        return NextResponse.json({ error: 'Failed to parse receipt' }, { status: 500 });
    }
}