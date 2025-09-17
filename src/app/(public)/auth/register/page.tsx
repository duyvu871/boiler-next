'use client';

import { RegisterView } from 'app/sections/auth/view';
import { registerAction } from 'app/sections/auth/data';
import type { RegisterInput } from 'app/sections/auth/data';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    const result = await registerAction(data);

    if (result.success) {
      // Redirect to login with success message
      router.push('/auth/login?message=Registration successful! Please log in.');
    } else {
      // Display error message
      setError(result.error?.message || 'An unexpected error occurred');
    }

    setIsLoading(false);
  };

  return <RegisterView onSubmit={handleRegister} isLoading={isLoading} error={error} />;
}
