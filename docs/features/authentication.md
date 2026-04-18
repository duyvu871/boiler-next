# Authentication Feature

Comprehensive authentication system for the Next.js 16 template application, implementing secure user registration, login, and session management with modern UI/UX patterns.

## 🏗️ Architecture Overview

The authentication system follows a modular, section-based architecture:

```
src/sections/auth/
├── data/                    # Business logic layer
│   ├── schemas.ts          # Zod validation schemas
│   ├── action.ts           # Server actions
│   └── index.ts            # Exports
├── view/                   # Presentation layer
│   ├── login-view.tsx      # Login form component
│   ├── register-view.tsx   # Registration form component
│   └── index.ts            # Exports
└── README.md               # Section documentation
```

### Integration Points

- **App Router**: `src/app/(public)/auth/` - Route handlers
- **Components**: `src/components/layout/auth-layout.tsx` - Shared layout
- **UI Components**: `src/components/ui/` - Form inputs and buttons
- **Authentication Library**: `src/lib/auth.ts` - Auth configuration
- **Database**: `prisma/schema.prisma` - User model (to be implemented)

## 🎯 Core Features

### ✅ Implemented Features

- **NextAuth.js Integration**: Complete authentication system with NextAuth.js
- **User Registration**: Complete sign-up flow with validation
- **User Login**: Secure authentication with credentials
- **OAuth Integration**: Google Sign-In support (fully implemented)
- **Session Management**: JWT-based session management with NextAuth.js
- **Server-Side Authentication**: Comprehensive server-side auth helpers
- **Client-Side Authentication**: Custom useAuth hook for client components
- **Role-Based Access Control**: User roles and permissions system
- **Form Validation**: Client and server-side validation using Zod
- **Responsive Design**: Mobile-first responsive layout
- **Error Handling**: Comprehensive error management with logging
- **TypeScript Support**: Fully typed with IntelliSense
- **Loading States**: User feedback during async operations
- **Security Features**: CSRF protection, input validation, secure sessions

### 🚧 Planned Features

- **Password Reset**: Forgot password functionality
- **Email Verification**: Account verification via email
- **Two-Factor Authentication**: Enhanced security
- **Account Settings**: Profile management
- **Social Login Providers**: Additional OAuth providers
- **Advanced Security**: Rate limiting, account lockout

## 📋 Form Schemas & Validation

### Login Schema

```typescript
const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginInput = z.infer<typeof LoginSchema>;
```

### Registration Schema

```typescript
const RegisterSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  email: emailValidation,
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterInput = z.infer<typeof RegisterSchema>;
```

### Advanced Schemas

The system also includes schemas for:
- **Forgot Password**: Email validation for password reset
- **Reset Password**: Token-based password reset
- **Change Password**: For authenticated users
- **Profile Update**: User profile management

## 🔧 NextAuth.js Implementation

### Authentication Configuration

The system now uses NextAuth.js for complete authentication management:

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './db'
import { compare } from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !await compare(credentials.password, user.password)) {
          return null
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role
        token.status = user.status
        token.emailVerified = user.emailVerified
      }
      return token
    },
    session: async ({ session, token }) => {
      session.user.id = token.sub
      session.user.role = token.role
      session.user.status = token.status
      session.user.emailVerified = token.emailVerified
      return session
    }
  }
}

export const NextAuthHandler = NextAuth(authOptions)
```

### Server-Side Authentication Helpers

Complete set of server-side authentication utilities:

```typescript
// src/lib/auth-helpers.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import { Role, UserStatus } from "db/enums";

// Get current session
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

// Get current user
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

// Require authentication - redirect if not authenticated
export async function requireAuth(redirectTo?: string) {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect(redirectTo || '/auth/login');
  }
  return session.user;
}

// Require specific role
export async function requireRole(roles: string | string[], redirectTo?: string) {
  const user = await requireAuth();
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!allowedRoles.includes(user.role)) {
    redirect(redirectTo || '/unauthorized');
  }
  return user;
}

// Permission system
export function getUserPermissions(role: string) {
  const permissions = {
    ADMIN: ['user.create', 'user.read', 'user.update', 'user.delete', 'admin.access'],
    USER: ['profile.read', 'profile.update'],
  };
  return permissions[role as keyof typeof permissions] || permissions.USER;
}

// Check if user has specific permission
export async function hasPermission(permission: string) {
  const session = await getCurrentSession();
  if (!session?.user) return false;
  
  const userPermissions = getUserPermissions(session.user.role);
  return userPermissions.includes(permission);
}
```

## 🔧 Server Actions

### NextAuth Actions Integration

Server actions now integrate with NextAuth.js for authentication:

```typescript
// Example server action with authentication
'use server'

import { requireAuth, requireRole } from '@/lib/auth-helpers'
import { logAuth } from '@/utils/log'

export async function createUserAction(formData: FormData) {
  // Require authentication and specific role
  const user = await requireRole(['ADMIN']);
  
  logAuth('USER_CREATION_ATTEMPT', user.id, {
    email: user.email,
    role: user.role,
  });
  
  // Process the action...
}
```

### Registration Action

```typescript
const rawRegisterAction = async (data: RegisterInput) => {
  // Validate input data
  const validatedData = RegisterSchema.parse(data);
  
  // TODO: Implement database integration
  // Currently uses mock validation for development
  const existingEmails = ['admin@example.com', 'test@example.com'];
  if (existingEmails.includes(validatedData.email)) {
    throw new ConflictError('User with this email already exists');
  }
  
  return {
    user: {
      id: Date.now().toString(),
      name: validatedData.name,
      email: validatedData.email,
      role: 'USER',
      createdAt: new Date().toISOString(),
    },
  };
};

export const registerAction = withServerActionErrorHandling(rawRegisterAction);
```

### Error Handling

All server actions use the `withServerActionErrorHandling` wrapper for consistent error management:

```typescript
// Error types handled:
- ValidationError: Invalid input data
- AuthenticationError: Invalid credentials
- ConflictError: Duplicate resources
- DatabaseError: Database operations
- NetworkError: Connection issues
```

## 🎨 UI Components

## 🎣 Client-Side Authentication Hook

### useAuth Hook

Comprehensive client-side authentication utilities:

```typescript
// src/hooks/use-auth.ts
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Role, UserStatus } from 'db/enums';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const user = session?.user ?? null;
  const isAuthenticated = !!user;

  // Sign in with credentials
  const signInWithCredentials = useCallback(async (
    email: string, 
    password: string,
    redirectTo?: string
  ) => {
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email, password, redirect: false,
        callbackUrl: redirectTo || '/dashboard',
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error === 'CredentialsSignin' 
            ? 'Invalid email or password' 
            : 'Sign in failed',
        };
      }

      if (result?.ok) {
        router.push(redirectTo || '/dashboard');
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Permission checks
  const hasRole = useCallback((roles: string | string[]) => {
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  }, [user]);

  const isAdmin = useCallback(() => hasRole(Role.ADMIN), [hasRole]);
  const isActive = useCallback(() => user?.status === UserStatus.ACTIVE, [user]);

  // Client-side route protection
  const requireAuth = useCallback((redirectTo?: string) => {
    if (!isAuthenticated && status !== 'loading') {
      router.push(redirectTo || '/auth/login');
      return false;
    }
    return true;
  }, [isAuthenticated, status, router]);

  return {
    // User data
    user, session, isAuthenticated,
    isLoading: status === 'loading' || isLoading,

    // Authentication methods
    signInWithCredentials,
    signInWithProvider: (provider: string) => signIn(provider),
    signOut: () => signOut(),
    updateSession: update,

    // Permission checks
    hasRole, isAdmin, isActive,
    isEmailVerified: () => !!user?.emailVerified,
    needsEmailVerification: () => user?.status === UserStatus.PENDING_VERIFICATION,

    // Route protection
    requireAuth,
    requireRole: (roles: string | string[]) => requireAuth() && hasRole(roles),

    // Navigation helpers
    redirectToLogin: (callbackUrl?: string) => {
      const loginUrl = callbackUrl 
        ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : '/auth/login';
      router.push(loginUrl);
    },
  };
}

// Convenience hooks
export function useRequireAuth(redirectTo?: string) {
  const { requireAuth } = useAuth();
  return requireAuth(redirectTo);
}

export function useIsAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin();
}
```

### Hook Usage Examples

```typescript
// In a component that needs authentication
function ProtectedComponent() {
  const { user, isAuthenticated, requireAuth, hasRole } = useAuth();

  useEffect(() => {
    requireAuth('/auth/login');
  }, [requireAuth]);

  if (!isAuthenticated) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {hasRole('ADMIN') && <AdminPanel />}
    </div>
  );
}

// Login form integration
function LoginForm() {
  const { signInWithCredentials, isLoading } = useAuth();
  
  const handleSubmit = async (data) => {
    const result = await signInWithCredentials(data.email, data.password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### AuthLayout Component

Provides consistent layout for all authentication pages:

```typescript
interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

// Features:
- Responsive two-column layout
- Brand identity section
- Logo and company branding
- Social media links
- Mobile-optimized design
```

### LoginView Component

```typescript
interface LoginViewProps {
  onSubmit: (data: LoginInput) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  successMessage?: string | null;
}

// Features:
- React Hook Form integration
- Zod validation resolver
- OAuth Google sign-in button
- Remember me checkbox
- Forgot password link
- Error/success message display
- Loading states
```

### RegisterView Component

```typescript
interface RegisterViewProps {
  onSubmit: (data: RegisterInput) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// Features:
- Complete registration form
- Password confirmation validation
- Terms of service agreement
- Real-time form validation
- Password strength indicator (planned)
- Account exists redirect
```

### Form Components

Reusable form components with consistent styling:

```typescript
// Available components:
- FormInput: Text input with validation
- FormPasswordInput: Password input with toggle visibility
- FormButton: Styled button with loading states
- OAuthButton: Social authentication buttons
```

## 🔒 Security Features

### Input Validation

- **Client-side validation**: Real-time feedback using React Hook Form + Zod
- **Server-side validation**: All inputs re-validated on server
- **SQL injection protection**: Parameterized queries (when database is integrated)
- **XSS protection**: Input sanitization and output encoding

### Password Security

- **Minimum requirements**: 6+ characters, mixed case, numbers
- **Password strength meter**: Visual feedback (planned)
- **Secure hashing**: bcrypt/argon2 for password storage (planned)
- **Password confirmation**: Double-entry validation

### Authentication Security

- **CSRF protection**: Built-in with Next.js App Router
- **Rate limiting**: Planned for login attempts
- **Session management**: Secure session handling (planned)
- **OAuth integration**: Google Sign-In with secure token handling

### Data Protection

- **HTTPS enforcement**: Required in production
- **Sensitive data handling**: Passwords never logged or exposed
- **Email validation**: RFC-compliant email verification
- **Input sanitization**: All user inputs cleaned and validated

## 🚀 Integration Guide

### 1. Basic Page Setup

```typescript
// app/(public)/auth/login/page.tsx
'use client';

import { LoginView } from '@/sections/auth/view';
import { loginAction } from '@/sections/auth/data';
import type { LoginInput } from '@/sections/auth/data';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
    
    const result = await loginAction(data);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error.message);
    }
    
    setIsLoading(false);
  };

  return (
    <LoginView 
      onSubmit={handleLogin} 
      isLoading={isLoading}
      error={error}
    />
  );
}
```

### 2. Route Configuration

```typescript
// App Router structure:
app/(public)/auth/
├── login/
│   ├── page.tsx          # Login page
│   └── layout.tsx        # Login-specific layout
├── register/
│   ├── page.tsx          # Registration page
│   └── layout.tsx        # Registration-specific layout
├── forgot-password/      # Planned
├── reset-password/       # Planned
└── layout.tsx            # Shared auth layout
```

### 3. Metadata Configuration

```typescript
// page.tsx
export const metadata = {
  title: 'Login Page',
  description: 'Login Page description',
};
```

## 📊 Error Handling

### Error Types

```typescript
// Authentication errors
'UNAUTHORIZED'           // Invalid credentials
'TOKEN_EXPIRED'          // Session expired
'ACCOUNT_LOCKED'         // Too many failed attempts
'EMAIL_NOT_VERIFIED'     // Account not verified

// Validation errors
'VALIDATION_ERROR'       // Invalid input format
'MISSING_REQUIRED_FIELDS' // Required fields missing
'PASSWORD_TOO_WEAK'      // Password requirements not met

// Registration errors
'ALREADY_EXISTS'         // Email already registered
'INVALID_EMAIL_FORMAT'   // Email format invalid
'TERMS_NOT_ACCEPTED'     // Terms of service not agreed
```

### Error Display Pattern

```typescript
const handleSubmit = async (data) => {
  try {
    const result = await authAction(data);
    
    if (result.success) {
      // Handle success
      router.push('/dashboard');
    } else {
      // Handle specific errors
      switch (result.error.code) {
        case 'VALIDATION_ERROR':
          setFieldErrors(result.error.details);
          break;
        case 'UNAUTHORIZED':
          setError('Invalid email or password');
          break;
        case 'ALREADY_EXISTS':
          setError('An account with this email already exists');
          break;
        default:
          setError('An unexpected error occurred');
      }
    }
  } catch (error) {
    setError('Network error. Please try again.');
  }
};
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Schema validation tests
describe('Auth Schemas', () => {
  test('validates correct login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };
    expect(LoginSchema.parse(validData)).toEqual(validData);
  });
  
  test('rejects invalid email format', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    };
    expect(() => LoginSchema.parse(invalidData)).toThrow();
  });
});
```

### Integration Tests

```typescript
// Server action tests
describe('Auth Actions', () => {
  test('login with valid credentials', async () => {
    const result = await loginAction({
      email: 'admin@example.com',
      password: 'password',
    });
    
    expect(result.success).toBe(true);
    expect(result.data.user).toBeDefined();
  });
  
  test('registration with valid data', async () => {
    const result = await registerAction({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });
    
    expect(result.success).toBe(true);
    expect(result.data.user.email).toBe('john@example.com');
  });
});
```

### Component Tests

```typescript
// UI component tests
describe('LoginView', () => {
  test('renders form fields correctly', () => {
    render(<LoginView onSubmit={mockSubmit} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });
  
  test('displays error messages', () => {
    render(<LoginView onSubmit={mockSubmit} error="Invalid credentials" />);
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
```

## 🔄 State Management

### Local State Pattern

The authentication system uses local component state for form management:

```typescript
const [formState, setFormState] = useState({
  isLoading: false,
  error: null,
  success: false,
});

const handleSubmit = async (data) => {
  setFormState(prev => ({ ...prev, isLoading: true, error: null }));
  
  try {
    const result = await authAction(data);
    
    if (result.success) {
      setFormState(prev => ({ ...prev, success: true }));
      // Handle success (redirect, etc.)
    } else {
      setFormState(prev => ({ 
        ...prev, 
        error: result.error.message 
      }));
    }
  } finally {
    setFormState(prev => ({ ...prev, isLoading: false }));
  }
};
```

### Global State (Planned)

For user session management, the system will integrate with:
- **NextAuth.js**: Session management and OAuth
- **Zustand/Context**: Global user state
- **React Query**: Server state management

## 🔧 Development Setup

### Environment Variables

```bash
# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000/api/auth"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
JWT_SECRET="your-jwt-secret-key-change-this-in-production"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/app"

# Logging (Client-side accessible)
NEXT_PUBLIC_LOG_LEVEL="info"
```

**Required Variables:**
- **NEXTAUTH_SECRET**: Secret for NextAuth (minimum 32 characters)
- **JWT_SECRET**: Secret for JWT tokens (minimum 32 characters)
- **DATABASE_URL**: PostgreSQL connection string
- **NEXTAUTH_URL**: Base URL for authentication callbacks

**Optional Variables:**
- **GOOGLE_CLIENT_ID/SECRET**: For Google OAuth integration
- **NEXT_PUBLIC_LOG_LEVEL**: Client-side logging level

### Database Schema (simplified)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?   // Nullable for OAuth users
  emailVerified DateTime?
  image         String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  
  @@map("users")
}

enum Role {
  ADMIN
  USER
}
```

## 📝 Best Practices

### Development Guidelines

1. **Always validate input** both client and server side
2. **Handle loading states** for better UX
3. **Show meaningful error messages** to users
4. **Use TypeScript** for type safety
5. **Test authentication flows** thoroughly
6. **Implement proper redirects** after authentication
7. **Handle edge cases** like network errors
8. **Keep passwords secure** - never log or expose
9. **Implement rate limiting** to prevent abuse
10. **Use HTTPS** in production

### Code Organization

- **Separation of concerns**: Data, view, and logic layers
- **Reusable components**: Shared UI components
- **Consistent naming**: Follow project naming conventions
- **Error boundaries**: Graceful error handling
- **Performance optimization**: Lazy loading and code splitting

### Security Checklist

- [ ] Input validation on client and server
- [ ] Password complexity requirements
- [ ] CSRF protection enabled
- [ ] SQL injection prevention
- [ ] XSS protection implemented
- [ ] Rate limiting configured
- [ ] HTTPS enforced in production
- [ ] Secure session management
- [ ] OAuth security best practices
- [ ] Regular security audits

## 🔗 Related Documentation

- **Architecture**: `docs/architecture.md` - Overall system architecture
- **Database**: `docs/database.md` - Database schema and migrations
- **API**: `docs/api.md` - API endpoints and specifications
- **Deployment**: `docs/deployment.md` - Production deployment guide
- **Testing**: `docs/testing.md` - Testing strategies and guidelines

## 🚧 Roadmap

### Phase 1 (Completed) ✅
- [x] Basic login/register UI
- [x] Form validation
- [x] NextAuth.js integration
- [x] Real authentication with credentials
- [x] OAuth Google integration
- [x] Server-side authentication helpers
- [x] Client-side authentication hook
- [x] Role-based access control
- [x] Session management
- [x] Error handling with logging
- [x] Responsive design

### Phase 2 (Next)
- [ ] Database integration with Prisma
- [ ] Email verification system
- [ ] Password reset functionality
- [ ] User profile management
- [ ] Advanced security features

### Phase 3 (Future)
- [ ] Role-based access control
- [ ] Two-factor authentication
- [ ] Account settings
- [ ] Social login providers
- [ ] Advanced security features

## 📞 Support

For questions or issues related to the authentication system:

1. **Check the documentation** in this file and related docs
2. **Review the code** in `src/sections/auth/`
3. **Run tests** to verify functionality
4. **Create an issue** in the project repository

---

*Last updated: [Current Date]*
*Version: 1.0.0*
