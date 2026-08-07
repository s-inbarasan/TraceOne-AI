import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TraceMind AI',
  description: 'AI-powered API observability platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-primary/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
