import type { Metadata } from 'next';
import { Delius_Swash_Caps } from 'next/font/google';
import './globals.css';

const deliusSwashCaps = Delius_Swash_Caps({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-delius-swash-caps',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Splitmint',
  description:
    'Split bills with groups, expenses, and simple settlements.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={deliusSwashCaps.variable}>
      <body>{children}</body>
    </html>
  );
}
