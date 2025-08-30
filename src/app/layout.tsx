import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'app/styles/globals.css';
// Providers
import MantineProvider from 'app/providers/mantine-provider';
import ThemeProvider from 'app/providers/theme-provider';
import { SessionProvider } from 'app/providers/session-provider';
import JotaiProvider from 'app/providers/jotai-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js 15 Starter Template',
  description:
    'A modern Next.js 15 starter template with NextAuth.js, TypeScript, and Tailwind CSS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <MantineProvider>
            <SessionProvider>
              <JotaiProvider>
                <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              </JotaiProvider>
            </SessionProvider>
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
