# Utils Library

Comprehensive utility library built on Next.js 16 with App Router, TypeScript, and Tailwind CSS.

## 🚀 Features

- ✅ **Error Handling & Response System** - Error handling system and response standardization
- ✅ **Validation Utilities** - Validation functions with Zod schemas
- ✅ **Formatting Functions** - Format date, currency, phone number, etc.
- ✅ **Helper Functions** - Debounce, throttle, deep clone, object manipulation
- ✅ **Class Name Utilities** - Merge Tailwind CSS classes
- ✅ **Tailwind Variants** - Type-safe component variants
- ✅ **TypeScript Support** - Fully typed with IntelliSense
- ✅ **Server Actions & API Routes** - HOCs with error handling
- ✅ **Authentication & Authorization** - Auth helpers

## 📁 File Structure

```
src/utils/
├── response.ts              # Response types, error classes, builders
├── with-error-handling.ts   # HOCs for error handling
├── examples/               
│   └── error-handling-examples.ts  # Usage examples
├── index.ts                # Export all utilities
└── README.md               # This documentation
```

## 🔧 Usage

### 1. Server Actions

```typescript
import { withServerActionErrorHandling, ValidationError } from '@/utils';

// Raw action
const rawCreateUser = async (userData: { name: string; email: string }) => {
  if (!userData.email.includes('@')) {
    throw new ValidationError('Invalid email format');
  }
  return { id: '1', ...userData };
};

// Wrapped with error handling
export const createUser = withServerActionErrorHandling(rawCreateUser);

// Usage in component
const handleSubmit = async (formData: FormData) => {
  const result = await createUser({
    name: formData.get('name') as string,
    email: formData.get('email') as string,
  });
  
  if (result.success) {
    console.log('User created:', result.data);
  } else {
    console.error('Error:', result.error.message);
    // Handle different error codes
    switch (result.error.code) {
      case 'VALIDATION_ERROR':
        // Show validation error
        break;
      case 'UNAUTHORIZED':
        // Redirect to login
        break;
    }
  }
};
```

### 2. API Routes

```typescript
// app/api/users/route.ts
import { withApiErrorHandling, apiSuccess, ValidationError } from '@/utils';

const handler = async (request: Request) => {
  if (request.method === 'GET') {
    const users = await getUsers();
    return apiSuccess(users, 'Users retrieved successfully');
  }
  
  if (request.method === 'POST') {
    const body = await request.json();
    
    if (!body.name) {
      throw new ValidationError('Name is required');
    }
    
    const user = await createUser(body);
    return apiSuccess(user, 'User created', 201);
  }
  
  throw new Error('Method not allowed');
};

export const GET = withApiErrorHandling(handler);
export const POST = withApiErrorHandling(handler, {
  logErrors: true,
  enableCors: true,
});
```

### 3. Auth-Required Actions

```typescript
import { withAuthServerAction, AuthenticationError } from '@/utils';

const rawUpdateProfile = async (userId: string, data: any) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new AuthenticationError();
  }
  
  // Update logic
  return updatedProfile;
};

export const updateProfile = withAuthServerAction(rawUpdateProfile, {
  redirectTo: '/auth/login',  // Auto redirect on auth error
});
```

## 📋 Available Error Classes

```typescript
// Authentication & Authorization
throw new AuthenticationError('Login required');
throw new AuthorizationError('Access forbidden');

// Validation
throw new ValidationError('Invalid input', validationDetails);

// Resource
throw new NotFoundError('User');  // "User not found"
throw new ConflictError('Email already exists');

// Custom
throw new AppError('CUSTOM_CODE', 'Custom message', 400);
```

## 🎯 Response Format

### Success Response
```typescript
{
  success: true,
  data: any,
  message?: string
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## 🔍 Error Codes

```typescript
// Authentication
'UNAUTHORIZED'         // 401
'FORBIDDEN'           // 403
'TOKEN_EXPIRED'       // 401
'INVALID_CREDENTIALS' // 401

// Validation  
'VALIDATION_ERROR'           // 400
'MISSING_REQUIRED_FIELDS'    // 400
'INVALID_INPUT'              // 400

// Resource
'NOT_FOUND'          // 404
'ALREADY_EXISTS'     // 409

// Server
'INTERNAL_ERROR'           // 500
'DATABASE_ERROR'           // 500
'EXTERNAL_SERVICE_ERROR'   // 500

// Rate Limiting
'RATE_LIMIT_EXCEEDED'      // 429
```

## 🛠 Advanced Usage

### Validation with Zod

```typescript
import { withValidatedServerAction, ValidationError } from '@/utils';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const rawCreateUser = async (data: z.infer<typeof CreateUserSchema>) => {
  // Business logic
  return user;
};

const validateUserData = async ([data]: [any]) => {
  const result = CreateUserSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError('Invalid user data', result.error.issues);
  }
};

export const createUser = withValidatedServerAction(rawCreateUser, validateUserData);
```

### Custom Logging

```typescript
import { withDevLogging } from '@/utils';

// Enhanced logging only in development
const createUser = withDevLogging(
  withServerActionErrorHandling(rawCreateUser)
);
```

### CORS API Routes

```typescript
import { withCorsApi } from '@/utils';

const handler = async (request: Request) => {
  // API logic
};

export const GET = withCorsApi(handler);
export const POST = withCorsApi(handler);
```

## 🔒 Security Features

- Automatic error sanitization in production
- Detailed error info only in development  
- Request logging with user-agent and URL
- Rate limiting integration ready
- CORS configuration

## 🎨 Client-Side Integration

```typescript
// React component
const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    setLoading(true);
    setError(null);
    
    const result = await myServerAction();
    
    if (result.success) {
      // Handle success
      toast.success('Action completed!');
    } else {
      // Handle error
      setError(result.error.message);
      
      // Specific error handling
      if (result.error.code === 'UNAUTHORIZED') {
        router.push('/auth/login');
      }
    }
    
    setLoading(false);
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </div>
  );
};
```

## 📊 Monitoring & Debugging

All errors are logged with format:

```typescript
{
  message: string,
  code: string,
  details?: any,
  action?: string,      // Server Action name
  method?: string,      // HTTP method for API
  url?: string,         // Request URL
  userAgent?: string,   // User agent
  timestamp: string,
  duration?: string     // Execution time
}
```

## 🚀 Best Practices

1. **Always use HOCs** for error handling
2. **Throw specific error classes** instead of generic Error
3. **Handle errors on client side** based on error codes
4. **Log errors** in production for debugging
5. **Sanitize error details** in production
6. **Use TypeScript** for type safety
7. **Test error scenarios** thoroughly

## 🔄 Migration from Legacy System

```typescript
// Before
const action = async (data: any) => {
  try {
    const result = await doSomething(data);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// After
const rawAction = async (data: any) => {
  return await doSomething(data); // Let HOC handle errors
};

export const action = withServerActionErrorHandling(rawAction);
```
