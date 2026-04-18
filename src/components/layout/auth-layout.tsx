'use client';

import { Anchor, Box, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'App';

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <Box
      component="main"
      w="100%"
      mih="100dvh"
      maw="100%"
      bg="var(--mantine-color-gray-0)"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box w="100%" maw={400} mx="auto" px="md" py="xl">
        <Stack gap="lg">
          <Stack gap={4}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
              {appName}
            </Text>
            <Title
              order={1}
              fw={600}
              style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', letterSpacing: '-0.02em' }}
            >
              {title}
            </Title>
            <Text c="dimmed" size="sm" lh={1.5}>
              {subtitle}
            </Text>
          </Stack>
          {children}
        </Stack>
      </Box>
    </Box>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  linkLabel,
}: {
  prompt: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <Text ta="center" size="sm" c="dimmed">
      {prompt}{' '}
      <Anchor component={Link} href={href} fw={500} underline="never" c="dark">
        {linkLabel}
      </Anchor>
    </Text>
  );
}
