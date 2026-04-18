'use client';

import { Alert, Anchor, Checkbox, Divider, Group, Stack, Text } from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { LoginSchema, type LoginInput } from '../data/schemas';
import { FormInput, FormPasswordInput, FormButton, OAuthButton } from 'app/components/ui';
import { AuthFooterLink, AuthLayout } from 'app/components/layout/auth-layout';

interface LoginViewProps {
  onSubmit: (data: LoginInput) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  successMessage?: string | null;
}

export function LoginView({ onSubmit, isLoading = false, error, successMessage }: LoginViewProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleFormSubmit = async (data: LoginInput) => {
    await onSubmit(data);
  };

  return (
    <AuthLayout title="Sign in" subtitle="Email and password, or Google.">
      <Stack gap="sm">
        <OAuthButton provider="google" action="signin" type="button" />

        <Divider
          label="or"
          labelPosition="center"
          size="xs"
          styles={{ label: { textTransform: 'lowercase', fontSize: '0.75rem' } }}
        />

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack gap="sm">
            {successMessage && (
              <Alert color="green" variant="light" radius="md">
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert color="red" variant="light" radius="md">
                {error}
              </Alert>
            )}

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                label="Email Address"
                placeholder="johndoe@gmail.com"
                required
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <FormPasswordInput
                {...field}
                label="Password"
                placeholder="••••••••"
                required
                error={errors.password?.message}
              />
            )}
          />

            <Group justify="space-between" gap="xs" wrap="nowrap">
              <Checkbox label="Remember me" size="xs" />
              <Anchor component={Link} href="/auth/forgot-password" size="xs" c="dimmed" underline="hover">
                Forgot password?
              </Anchor>
            </Group>

            <FormButton type="submit" variant="primary" fullWidth loading={isLoading} mt="xs">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </FormButton>
          </Stack>
        </form>

        <AuthFooterLink prompt="No account?" href="/auth/register" linkLabel="Create one" />
      </Stack>
    </AuthLayout>
  );
}
