'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { type Session } from 'next-auth';

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * NextAuth Session Provider wrapper
 */
export default function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      session={session}
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
      basePath="/api/auth"
      baseUrl={process.env.NEXT_PUBLIC_BASE_URL}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
