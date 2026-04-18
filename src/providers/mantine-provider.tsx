'use client';

import { createTheme, MantineProvider as Provider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
  headings: {
    fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
});

export default function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider theme={theme} defaultColorScheme="light">
      {children}
      <Notifications />
    </Provider>
  );
}
