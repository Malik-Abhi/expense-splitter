'use client';

import { useEffect } from 'react';

const SYSTEM_FONTS = new Set([
    'arial',
    'blinkmacsystemfont',
    'cursive',
    'emoji',
    'fantasy',
    'georgia',
    'helvetica',
    'monospace',
    'sans-serif',
    'serif',
    'system-ui',
    'ui-monospace',
    'ui-sans-serif',
    'ui-serif',
]);

const extractFontFamily = (value: string) => {
    const firstFamily = value
        .split(',')[0]
        ?.trim()
        .replace(/^["']|["']$/g, '');

    if (!firstFamily || SYSTEM_FONTS.has(firstFamily.toLowerCase())) {
        return null;
    }

    return firstFamily;
};

export function ThemeFontLoader() {
    useEffect(() => {
        const computedStyle = window.getComputedStyle(document.documentElement);
        const fontFamilies = ['--font-sans', '--font-serif', '--font-mono']
            .map((token) => extractFontFamily(computedStyle.getPropertyValue(token)))
            .filter((fontFamily): fontFamily is string => Boolean(fontFamily));

        const uniqueFonts = Array.from(new Set(fontFamilies));

        uniqueFonts.forEach((fontFamily) => {
            const linkId = `google-font-${fontFamily.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            if (document.getElementById(linkId)) {
                return;
            }

            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily).replace(/%20/g, '+')}&display=swap`;
            document.head.appendChild(link);
        });
    }, []);

    return null;
}
