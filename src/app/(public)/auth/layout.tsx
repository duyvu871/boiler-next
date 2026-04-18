import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Next.js 16',
    default: 'Authentication | Next.js 16',
  },
  description: 'Login or register (Next.js 16 app)',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50">
      {children}
    </div>
  );
}
