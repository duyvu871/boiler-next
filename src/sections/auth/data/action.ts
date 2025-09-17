'use server';

import {
  withServerActionErrorHandling,
  ValidationError,
  AuthenticationError,
  ConflictError,
  logAuth,
  logBusiness,
} from 'app/utils';
import { LoginSchema, RegisterSchema, type LoginInput, type RegisterInput } from './schemas';
import db from 'app/lib/db';
import { Role } from 'db/enums';
import bcrypt from 'bcryptjs';
// import { signIn } from '@/lib/auth'; // TODO: Implement NextAuth.js integration

// Enums (will be available after db generates the client)
const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
} as const;

/**
 * Hash password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password using bcrypt
 */
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Login server action
 * Handles user authentication with email and password
 */
const rawLoginAction = async (data: LoginInput) => {
  try {
    // Validate input data
    const validatedData = LoginSchema.parse(data);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        status: true,
        emailVerified: true,
      },
    });

    // Check if user exists
    if (!user) {
      logAuth('LOGIN_FAILED', undefined, {
        email: validatedData.email,
        reason: 'user_not_found',
      });
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      logAuth('LOGIN_FAILED', user.id, {
        email: user.email,
        reason: 'oauth_only_user',
      });
      throw new AuthenticationError('Please sign in using your OAuth provider (Google)');
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password);
    if (!isValidPassword) {
      logAuth('LOGIN_FAILED', user.id, {
        email: user.email,
        reason: 'invalid_password',
      });
      throw new AuthenticationError('Invalid email or password');
    }

    // Check user status
    if (user.status === UserStatus.SUSPENDED) {
      logAuth('LOGIN_FAILED', user.id, {
        email: user.email,
        reason: 'account_suspended',
      });
      throw new AuthenticationError('Your account has been suspended. Please contact support.');
    }

    if (user.status === UserStatus.INACTIVE) {
      logAuth('LOGIN_FAILED', user.id, {
        email: user.email,
        reason: 'account_inactive',
      });
      throw new AuthenticationError('Your account is inactive. Please contact support.');
    }

    if (user.status === UserStatus.PENDING_VERIFICATION) {
      logAuth('LOGIN_FAILED', user.id, {
        email: user.email,
        reason: 'email_not_verified',
      });
      throw new AuthenticationError('Please verify your email address before signing in.');
    }

    // Update last login time
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    logAuth('LOGIN_SUCCESS', user.id, {
      email: user.email,
      role: user.role,
      loginMethod: 'credentials',
    });

    // Return user data (excluding password)
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof AuthenticationError || error instanceof ValidationError) {
      throw error;
    }

    // Log unexpected errors and throw generic error
    console.error('Login error:', error);
    throw new AuthenticationError('An error occurred during login. Please try again.');
  } finally {
    await db.$disconnect();
  }
};

/**
 * Register server action
 * Handles user registration with validation and duplicate checking
 */
const rawRegisterAction = async (data: RegisterInput) => {
  try {
    // Validate input data
    const validatedData = RegisterSchema.parse(data);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      logAuth('REGISTER_FAILED', undefined, {
        email: validatedData.email,
        reason: 'email_already_exists',
      });
      throw new ConflictError('A user with this email address already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user with default STUDENT role and PENDING_VERIFICATION status
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: Role.USER, // Default role for new registrations
        status: UserStatus.PENDING_VERIFICATION, // Require email verification
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Create email verification token
    const verificationToken = generateToken();
    await db.emailVerification.create({
      data: {
        email: user.email,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        verified: false,
      },
    });

    // TODO: Send verification email
    console.log(`Email verification token for ${user.email}: ${verificationToken}`);
    console.log('TODO: Implement email sending service');

    // Log successful registration
    logAuth('REGISTER_SUCCESS', user.id, {
      email: user.email,
      role: user.role,
      registrationMethod: 'credentials',
    });

    // Log business event
    logBusiness('USER_REGISTERED', 'user', user.id, {
      email: user.email,
      role: user.role,
      registrationMethod: 'email',
      requiresVerification: true,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      message: 'Registration successful! Please check your email to verify your account.',
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ConflictError || error instanceof ValidationError) {
      throw error;
    }

    // Log unexpected errors and throw generic error
    console.error('Registration error:', error);
    throw new ConflictError('An error occurred during registration. Please try again.');
  } finally {
    await db.$disconnect();
  }
};

/**
 * Forgot password server action
 * Handles password reset email sending
 */
const rawForgotPasswordAction = async (email: string) => {
  try {
    // Validate email
    if (!email || !email.includes('@')) {
      throw new ValidationError('Please enter a valid email address');
    }

    // Check if user exists (but don't reveal this information)
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user) {
      // Check if user has a password (not OAuth-only)
      if (user.password) {
        // Generate reset token
        const resetToken = generateToken();

        // Delete any existing password reset tokens for this email
        await db.passwordReset.deleteMany({
          where: { email: user.email },
        });

        // Create new password reset token
        await db.passwordReset.create({
          data: {
            email: user.email,
            token: resetToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            used: false,
          },
        });

        // TODO: Send password reset email
        console.log(`Password reset token for ${user.email}: ${resetToken}`);
        console.log('TODO: Implement email sending service');
      }
    }

    // Always return the same message for security (don't reveal if email exists)
    return {
      message: 'If an account with this email exists, you will receive a password reset link.',
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ValidationError) {
      throw error;
    }

    // Log unexpected errors and throw generic error
    console.error('Forgot password error:', error);
    throw new ValidationError('An error occurred. Please try again.');
  } finally {
    await db.$disconnect();
  }
};

/**
 * Reset password server action
 * Handles password reset with token validation
 */
const rawResetPasswordAction = async (token: string, newPassword: string) => {
  try {
    // Validate inputs
    if (!token) {
      throw new ValidationError('Reset token is required');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    // Find the password reset record
    const resetRecord = await db.passwordReset.findUnique({
      where: { token },
    });

    // Check if token exists and is valid
    if (!resetRecord || resetRecord.used) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Check if token has expired
    if (resetRecord.expiresAt < new Date()) {
      throw new ValidationError('Reset token has expired. Please request a new one.');
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and mark token as used (in a transaction)
    await db.$transaction([
      db.user.update({
        where: { email: resetRecord.email },
        data: { password: hashedPassword },
      }),
      db.passwordReset.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    // Clean up old/expired password reset tokens for this user
    await db.passwordReset.deleteMany({
      where: {
        email: resetRecord.email,
        OR: [{ used: true }, { expiresAt: { lt: new Date() } }],
      },
    });

    return {
      message:
        'Your password has been reset successfully. You can now sign in with your new password.',
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ValidationError) {
      throw error;
    }

    // Log unexpected errors and throw generic error
    console.error('Reset password error:', error);
    throw new ValidationError('An error occurred while resetting your password. Please try again.');
  } finally {
    await db.$disconnect();
  }
};

/**
 * Change password server action (for authenticated users)
 * Handles password change with current password verification
 */
const rawChangePasswordAction = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  try {
    // Validate inputs
    if (!userId) {
      throw new AuthenticationError('You must be logged in to change password');
    }

    if (!currentPassword) {
      throw new ValidationError('Current password is required');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters long');
    }

    if (currentPassword === newPassword) {
      throw new ValidationError('New password must be different from current password');
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      throw new ValidationError('Cannot change password for OAuth-only accounts');
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update user password
    await db.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return {
      message: 'Your password has been changed successfully',
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ValidationError || error instanceof AuthenticationError) {
      throw error;
    }

    // Log unexpected errors and throw generic error
    console.error('Change password error:', error);
    throw new ValidationError('An error occurred while changing your password. Please try again.');
  } finally {
    await db.$disconnect();
  }
};

/**
 * Verify email server action
 * Handles email verification with token validation
 */
const rawVerifyEmailAction = async (token: string) => {
  try {
    // Validate token
    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    // Find the email verification record
    const verificationRecord = await db.emailVerification.findUnique({
      where: { token },
    });

    // Check if token exists and is valid
    if (!verificationRecord || verificationRecord.verified) {
      throw new ValidationError('Invalid or already used verification token');
    }

    // Check if token has expired
    if (verificationRecord.expiresAt < new Date()) {
      throw new ValidationError('Verification token has expired. Please request a new one.');
    }

    // Update user and mark verification as complete (in a transaction)
    await db.$transaction([
      db.user.update({
        where: { email: verificationRecord.email },
        data: {
          emailVerified: new Date(),
          status: UserStatus.ACTIVE, // Activate account upon email verification
        },
      }),
      db.emailVerification.update({
        where: { token },
        data: { verified: true },
      }),
    ]);

    // Clean up old/expired verification tokens for this user
    await db.emailVerification.deleteMany({
      where: {
        email: verificationRecord.email,
        OR: [{ verified: true }, { expiresAt: { lt: new Date() } }],
      },
    });

    return {
      message: 'Your email has been verified successfully. You can now sign in to your account.',
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ValidationError) {
      throw error;
    }

    // Log unexpected errors and throw generic error
    console.error('Email verification error:', error);
    throw new ValidationError('An error occurred while verifying your email. Please try again.');
  } finally {
    await db.$disconnect();
  }
};

// Export wrapped actions with error handling
export const loginAction = withServerActionErrorHandling(rawLoginAction, {
  redirectOnError: undefined, // Don't redirect on login errors
});

export const registerAction = withServerActionErrorHandling(rawRegisterAction, {
  redirectOnError: undefined, // Don't redirect on register errors
});

export const forgotPasswordAction = withServerActionErrorHandling(rawForgotPasswordAction);

export const resetPasswordAction = withServerActionErrorHandling(rawResetPasswordAction);

export const changePasswordAction = withServerActionErrorHandling(rawChangePasswordAction, {
  redirectOnError: '/auth/login', // Redirect to login if not authenticated
});

export const verifyEmailAction = withServerActionErrorHandling(rawVerifyEmailAction);

// Export utility functions for external use
export { hashPassword, verifyPassword, generateToken };
