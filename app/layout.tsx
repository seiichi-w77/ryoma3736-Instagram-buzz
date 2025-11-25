import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Instagram Buzz - Analytics & Engagement Platform',
  description: 'Track and analyze your Instagram performance with powerful insights',
  keywords: ['instagram', 'analytics', 'social media', 'engagement', 'metrics'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 antialiased">
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
