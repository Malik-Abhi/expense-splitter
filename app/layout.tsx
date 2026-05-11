import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Split Bills Smartly - AI Expense Splitter',
  description:
    'Upload receipt photos. Claude AI extracts items & suggests fair splits. No more bill drama!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}