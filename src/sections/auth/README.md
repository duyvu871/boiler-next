# Auth Section

Phần xử lý xác thực (authentication) cho template Next.js 16, bao gồm đăng nhập, đăng ký và quản lý phiên người dùng.

## 🚀 Features

- ✅ **Login & Register Views** - UI components cho đăng nhập và đăng ký
- ✅ **Form Validation** - Validation với Zod schemas
- ✅ **Server Actions** - Xử lý đăng nhập/đăng ký với error handling
- ✅ **OAuth Integration** - Hỗ trợ đăng nhập Google
- ✅ **TypeScript Support** - Fully typed với IntelliSense
- ✅ **Responsive Design** - UI responsive với Mantine + Tailwind
- ✅ **Error Handling** - Xử lý lỗi toàn diện với user-friendly messages

## 📁 File Structure

```
src/sections/auth/
├── data/
│   ├── schemas.ts           # Zod validation schemas
│   ├── action.ts           # Server actions cho auth
│   └── index.ts            # Export tất cả data utilities
├── view/
│   ├── login-view.tsx      # Login form component
│   ├── register-view.tsx   # Register form component
│   └── index.ts            # Export tất cả view components
└── README.md               # Documentation này
```

## 🔧 Usage

### 1. Import Views

```typescript
// Trong app router pages
import { LoginView, RegisterView } from '@/sections/auth/view';

// Hoặc import riêng lẻ
import { LoginView } from '@/sections/auth/view/login-view';
import { RegisterView } from '@/sections/auth/view/register-view';
```

### 2. Import Data & Actions

```typescript
// Import schemas và types
import { 
  LoginSchema, 
  RegisterSchema, 
  type LoginInput, 
  type RegisterInput 
} from '@/sections/auth/data';

// Import server actions
import { loginAction, registerAction } from '@/sections/auth/data';
```

### 3. Sử dụng trong Pages

#### Login Page

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

#### Register Page

```typescript
// app/(public)/auth/register/page.tsx
'use client';

import { RegisterView } from '@/sections/auth/view';
import { registerAction } from '@/sections/auth/data';
import type { RegisterInput } from '@/sections/auth/data';
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
      router.push('/auth/login?message=Registration successful');
    } else {
      setError(result.error.message);
    }
    
    setIsLoading(false);
  };

  return (
    <RegisterView 
      onSubmit={handleRegister} 
      isLoading={isLoading}
      error={error}
    />
  );
}
```

## 📋 Schemas & Validation

### Login Schema

```typescript
const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginInput = z.infer<typeof LoginSchema>;
```

### Register Schema

```typescript
const RegisterSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterInput = z.infer<typeof RegisterSchema>;
```

## 🎯 Server Actions

### Login Action

```typescript
'use server';

import { withServerActionErrorHandling, ValidationError, AuthenticationError } from '@/utils';
import { LoginSchema, type LoginInput } from './schemas';
import { signIn } from '@/lib/auth';

const rawLoginAction = async (data: LoginInput) => {
  // Validate input
  const validatedData = LoginSchema.parse(data);
  
  // Attempt login
  const result = await signIn('credentials', {
    email: validatedData.email,
    password: validatedData.password,
    redirect: false,
  });
  
  if (!result?.ok) {
    throw new AuthenticationError('Invalid email or password');
  }
  
  return { success: true, user: result.user };
};

export const loginAction = withServerActionErrorHandling(rawLoginAction);
```

### Register Action

```typescript
'use server';

import { withServerActionErrorHandling, ValidationError, ConflictError } from '@/utils';
import { RegisterSchema, type RegisterInput } from './schemas';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';

const rawRegisterAction = async (data: RegisterInput) => {
  // Validate input
  const validatedData = RegisterSchema.parse(data);
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });
  
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }
  
  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
  
  return { success: true, user };
};

export const registerAction = withServerActionErrorHandling(rawRegisterAction);
```

## 🎨 UI Components

### LoginView Props

```typescript
interface LoginViewProps {
  onSubmit: (data: LoginInput) => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
}
```

### RegisterView Props

```typescript
interface RegisterViewProps {
  onSubmit: (data: RegisterInput) => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
}
```

### Features

- **Form Validation**: Real-time validation với Zod + React Hook Form
- **Loading States**: Button loading states và form disable
- **Error Handling**: Display error messages với styling
- **OAuth Integration**: Google sign-in buttons
- **Responsive Design**: Mobile-first responsive layout
- **Accessibility**: ARIA labels và keyboard navigation

## 🔒 Security Features

- **Input Validation**: Server-side validation với Zod
- **Password Requirements**: Minimum 6 characters
- **Email Validation**: RFC compliant email validation
- **CSRF Protection**: Built-in với Next.js
- **Rate Limiting**: Ready for integration
- **Password Confirmation**: Double entry for registration

## 🚀 Integration với App Router

### Metadata

```typescript
// app/(public)/auth/login/page.tsx
export const metadata = {
  title: 'Login Page',
  description: 'Login Page description',
};
```

### Layout Integration

```typescript
// app/(public)/auth/layout.tsx
import { AuthLayout } from '@/components/layout/auth-layout';

export default function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
```

## 📊 Error Handling

### Error Types

```typescript
// Validation errors
'VALIDATION_ERROR'     // Invalid input format
'MISSING_REQUIRED_FIELDS'  // Required fields missing

// Authentication errors  
'UNAUTHORIZED'         // Invalid credentials
'TOKEN_EXPIRED'        // Session expired
'ACCOUNT_LOCKED'       // Too many failed attempts

// Registration errors
'ALREADY_EXISTS'       // Email already registered
'WEAK_PASSWORD'        // Password too weak
```

### Error Display

```typescript
// Error handling trong components
if (result.error) {
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      // Show field-specific errors
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
```

## 🔄 State Management

### Local State Pattern

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

## 🧪 Testing

### Unit Tests

```typescript
// __tests__/auth/schemas.test.ts
import { LoginSchema, RegisterSchema } from '@/sections/auth/data';

describe('Auth Schemas', () => {
  test('validates correct login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };
    
    expect(LoginSchema.parse(validData)).toEqual(validData);
  });
  
  test('rejects invalid email', () => {
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
// __tests__/auth/actions.test.ts
import { loginAction, registerAction } from '@/sections/auth/data';

describe('Auth Actions', () => {
  test('login with valid credentials', async () => {
    const result = await loginAction({
      email: 'test@example.com',
      password: 'password123',
    });
    
    expect(result.success).toBe(true);
    expect(result.data.user).toBeDefined();
  });
});
```

## 📝 Best Practices

1. **Always validate input** cả client và server side
2. **Handle loading states** để UX tốt hơn  
3. **Show meaningful error messages** cho users
4. **Use TypeScript** cho type safety
5. **Test auth flows** thoroughly
6. **Implement proper redirects** sau khi auth
7. **Handle edge cases** như network errors
8. **Keep passwords secure** - never log or expose
9. **Implement rate limiting** để prevent abuse
10. **Use HTTPS** trong production

## 🔗 Related Files

- `src/lib/auth.ts` - Auth configuration & helpers
- `src/components/layout/auth-layout.tsx` - Auth page layout
- `src/components/ui/form-*.tsx` - Form input components
- `src/utils/with-error-handling.ts` - Error handling utilities
- `app/(public)/auth/` - Auth route pages
