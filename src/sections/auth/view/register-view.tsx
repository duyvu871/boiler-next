'use client';

import { Alert, Anchor, Checkbox, Divider, Stack, Text } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';

import { RegisterSchema, type RegisterInput } from 'app/sections/auth/data';
import { FormInput, FormPasswordInput, FormButton, OAuthButton } from 'app/components/ui';
import { AuthFooterLink, AuthLayout } from 'app/components/layout/auth-layout';

interface RegisterViewProps {
  onSubmit: (data: RegisterInput) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function RegisterView({ onSubmit, isLoading = false, error }: RegisterViewProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleFormSubmit = async (data: RegisterInput) => {
    await onSubmit(data);
  };

  return (
    <AuthLayout title="Create account" subtitle="A short form — you can use Google instead.">
      <Stack gap="sm">
        <OAuthButton provider="google" action="signup" type="button" />

        <Divider
          label="or"
          labelPosition="center"
          size="xs"
          styles={{ label: { textTransform: 'lowercase', fontSize: '0.75rem' } }}
        />

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack gap="sm">
            {error && (
              <Alert color="red" variant="light" radius="md">
                {error}
              </Alert>
            )}

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  label="Name"
                  placeholder="Your name"
                  required
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  label="Email"
                  placeholder="you@example.com"
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

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <FormPasswordInput
                  {...field}
                  label="Confirm password"
                  placeholder="••••••••"
                  required
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Checkbox
              size="xs"
              label={
                <Text size="xs" c="dimmed" span>
                  I agree to the{' '}
                  <Anchor component={Link} href="/terms" c="dark" underline="hover" span>
                    Terms
                  </Anchor>
                </Text>
              }
            />

            <FormButton type="submit" variant="primary" fullWidth loading={isLoading} mt="xs">
              {isLoading ? 'Creating account…' : 'Create account'}
            </FormButton>
          </Stack>
        </form>

        <AuthFooterLink prompt="Already registered?" href="/auth/login" linkLabel="Sign in" />
      </Stack>
    </AuthLayout>
  );
}
