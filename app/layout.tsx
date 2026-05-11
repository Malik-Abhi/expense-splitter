import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
