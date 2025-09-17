'use client';

import { LoginView } from 'app/sections/auth/view';
import { loginAction } from 'app/sections/auth/data';
import type { LoginInput } from 'app/sections/auth/data';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams?.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleLogin = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    const result = await loginAction(data);

    if (result.success) {
      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } else {
      // Display error message
      setError(result.error?.message || 'An unexpected error occurred');
    }

    setIsLoading(false);
  };

  return (
    <LoginView
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error}
      successMessage={successMessage}
    />
  );
}
