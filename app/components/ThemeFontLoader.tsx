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

const extractGoogleFontFamilies = (value: string) => {
    return value
        .split(',')
        .map((family) => family.trim().replace(/^['"]|['"]$/g, ''))
        .filter((family) => Boolean(family) && !SYSTEM_FONTS.has(family.toLowerCase()));
};

const createPreconnectLink = (href: string, crossOrigin = false) => {
    if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
        return;
    }

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (crossOrigin) {
        link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
};

const createFontStylesheet = (families: string[]) => {
    const encodedFamilies = families.map((family) =>
        encodeURIComponent(family).replace(/%20/g, '+')
    );

    const href = `https://fonts.googleapis.com/css2?${encodedFamilies
        .map((family) => `family=${family}`)
        .join('&')}&display=swap`;
console.log('Loading font stylesheet:', href);
    if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
        return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
};

export function ThemeFontLoader() {
    useEffect(() => {
        const computedStyle = window.getComputedStyle(document.documentElement);

        const fontFamilies = ['--font-sans', '--font-serif', '--font-mono']
            .flatMap((token) => extractGoogleFontFamilies(computedStyle.getPropertyValue(token)))
            .filter((fontFamily, index, array) => array.indexOf(fontFamily) === index);

        if (fontFamilies.length === 0) {
            return;
        }

        createPreconnectLink('https://fonts.googleapis.com');
        createPreconnectLink('https://fonts.gstatic.com', true);
        createFontStylesheet(fontFamilies);
    }, []);

    return null;
}
