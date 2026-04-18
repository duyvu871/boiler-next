import { Button, type ButtonProps } from '@mantine/core';
import { forwardRef } from 'react';

interface OAuthButtonProps extends Omit<ButtonProps, 'variant' | 'leftSection' | 'rightSection'> {
  provider?: 'google';
  action?: 'signin' | 'signup';
}

export const OAuthButton = forwardRef<HTMLButtonElement, OAuthButtonProps>(
  ({ provider = 'google', action = 'signin', size = 'sm', children, radius = 'md', ...props }, ref) => {
    const label =
      children ??
      (action === 'signin' ? 'Continue with Google' : 'Sign up with Google');

    if (provider !== 'google') {
      return null;
    }

    return (
      <Button
        ref={ref}
        variant="default"
        size={size}
        fullWidth
        radius={radius}
        color="gray"
        fw={500}
        {...props}
      >
        {label}
      </Button>
    );
  },
);

OAuthButton.displayName = 'OAuthButton';
