import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'app/styles/globals.css';
// Providers
import MantineProvider from 'app/providers/mantine-provider';
import ThemeProvider from 'app/providers/theme-provider';
import SessionProvider from 'app/providers/session-provider';
import JotaiProvider from 'app/providers/jotai-provider';
import QueryProvider from 'app/providers/query-client-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fitting Rooms Pro',
  description:
    'A modern Fitting Rooms Pro for virtual fitting rooms and try-on to choose your clothes',
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
                <QueryProvider>
                  <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
                </QueryProvider>
              </JotaiProvider>
            </SessionProvider>
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
