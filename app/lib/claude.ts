import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Receipt parsing with vision
export async function parseReceiptImage(base64Image: string) {
    try {
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/jpeg',
                                data: base64Image,
                            },
                        },
                        {
                            type: 'text',
                            text: `Please extract the following from this receipt and return ONLY a JSON object (no other text):
{
  "items": [{"name": "item name", "price": number}],
  "total": number,
  "storeName": "store name",
  "category": "Food|Transport|Entertainment|Other"
}

Rules:
- Extract each line item with its price
- Calculate total from items
- Identify the store/restaurant name
- Categorize appropriately
- Return ONLY valid JSON, nothing else`,
                        },
                    ],
                },
            ],
        });

        // Extract JSON from response
        const content = response.content[0];
        if (content.type === 'text') {
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        throw new Error('Failed to parse receipt');
    } catch (error) {
        console.error('Claude receipt parsing error:', error);
        throw error;
    }
}

// Smart split suggestions
export async function suggestSplits(
    items: Array<{ name: string; price: number }>,
    people: Array<{ name: string }>,
    total: number
) {
    try {
        const itemsText = items.map((i) => `- ${i.name}: $${i.price}`).join('\n');
        const peopleText = people.map((p) => p.name).join(', ');

        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 512,
            messages: [
                {
                    role: 'user',
                    content: `Given these receipt items and people, suggest a fair split. Return ONLY a JSON object with no other text:

Items:
${itemsText}

Total: $${total}
People: ${peopleText}

Return this exact format with no other text:
{
  "splits": [
    {"name": "person name", "amount": number, "reasoning": "brief reason"},
    ...
  ]
}

Rules:
- Each person should get items that make sense for them
- Add up to the total
- Include brief reasoning`,
                },
            ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        throw new Error('Failed to suggest splits');
    } catch (error) {
        console.error('Claude split suggestion error:', error);
        throw error;
    }
}