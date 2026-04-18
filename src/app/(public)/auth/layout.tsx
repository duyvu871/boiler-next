import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Nextjs 15 template',
    default: 'Authentication | Nextjs 15 template',
  },
  description: 'Login or register to Nextjs 15 template',
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
