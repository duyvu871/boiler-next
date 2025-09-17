'use client';

import { MantineProvider as Provider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

export default function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider defaultColorScheme="light">
      {children}
      <Notifications />
    </Provider>
  );
}
