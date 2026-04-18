# Logging System - Winston Implementation

Comprehensive logging system using Winston for the Next.js 16 template, supporting multiple transports, log levels, and structured logging.

## 🚀 Features

- ✅ **Multiple Log Levels** - Error, Warn, Info, HTTP, Debug, Verbose, Silly
- ✅ **Environment-based Configuration** - Different settings for development and production
- ✅ **File Rotation** - Automatic log file rotation with size limits
- ✅ **Structured Logging** - JSON format for production, pretty format for development
- ✅ **Colored Output** - Color-coded logs for development
- ✅ **Performance Logging** - Function execution timing
- ✅ **Security Logging** - Security events and threats
- ✅ **HTTP Request Logging** - API request/response logging
- ✅ **Error Handling** - Uncaught exceptions and unhandled rejections
- ✅ **Context-aware** - Rich metadata with each log entry

## 📁 File Structure

```
src/utils/
├── log.ts              # Main logging utility
└── log.md              # This documentation

logs/                   # Log files (production only)
├── error.log           # Error logs only
├── combined.log        # All logs (info and above)
├── http.log            # HTTP request logs
├── exceptions.log      # Uncaught exceptions
└── rejections.log      # Unhandled promise rejections
```

## 🔧 Usage

### 1. Basic Logging

```typescript
import logger, { 
  logError, 
  logWarning, 
  logInfo, 
  logDebug 
} from '@/utils/log';

// Basic logging
logger.info('Application started');
logger.error('Something went wrong');

// Using utility functions
logInfo('User logged in', { userId: '123', email: 'user@example.com' });
logError(new Error('Database connection failed'), { service: 'database' });
logWarning('High memory usage detected', { memoryUsage: '85%' });
logDebug('Processing request', { requestId: 'req-123' });
```

### 2. Specialized Logging

#### Authentication Events

```typescript
import { logAuth } from '@/utils/log';

// Login success
logAuth('LOGIN_SUCCESS', userId, {
  email: user.email,
  loginMethod: 'credentials',
  ipAddress: req.ip,
});

// Login failure
logAuth('LOGIN_FAILED', undefined, {
  email: attemptedEmail,
  reason: 'invalid_credentials',
  ipAddress: req.ip,
});

// Password reset
logAuth('PASSWORD_RESET_REQUESTED', userId, {
  email: user.email,
});
```

#### API Request Logging

```typescript
import { logApiRequest } from '@/utils/log';

// In your API routes or middleware
const startTime = Date.now();

// ... process request ...

const responseTime = Date.now() - startTime;
logApiRequest(
  req.method,
  req.url,
  res.statusCode,
  responseTime,
  req.user?.id,
  {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  }
);
```

#### Server Action Logging

```typescript
import { logServerAction } from '@/utils/log';

export const createUser = async (userData: UserData) => {
  const startTime = Date.now();
  let success = false;
  
  try {
    const user = await prisma.user.create({ data: userData });
    success = true;
    return user;
  } catch (error) {
    logError(error, { action: 'createUser', userData });
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    logServerAction('createUser', success, duration, userData.createdBy, {
      email: userData.email,
      role: userData.role,
    });
  }
};
```

#### Security Logging

```typescript
import { logSecurity } from '@/utils/log';

// Suspicious activity
logSecurity('MULTIPLE_FAILED_LOGINS', 'medium', {
  email: 'attacker@example.com',
  attempts: 5,
  timeWindow: '5 minutes',
  ipAddress: req.ip,
});

// Data breach attempt
logSecurity('UNAUTHORIZED_DATA_ACCESS', 'high', {
  userId: 'user-123',
  attemptedResource: '/api/admin/users',
  ipAddress: req.ip,
});

// Rate limiting triggered
logSecurity('RATE_LIMIT_EXCEEDED', 'low', {
  endpoint: '/api/auth/login',
  ipAddress: req.ip,
  limit: '10 requests/minute',
});
```

#### Performance Logging

```typescript
import { logPerformance, createTimer } from '@/utils/log';

// Manual performance logging
logPerformance('Database Query', 150, 'ms', {
  query: 'SELECT * FROM users',
  recordCount: 1000,
});

// Using timer utility
const timer = createTimer('User Registration Process');

// ... perform operations ...

timer.end({
  userId: newUser.id,
  steps: ['validation', 'database_insert', 'email_send'],
});
```

#### Business Event Logging

```typescript
import { logBusiness } from '@/utils/log';

// User registration
logBusiness('USER_REGISTERED', 'user', newUser.id, {
  email: newUser.email,
  role: newUser.role,
  registrationMethod: 'email',
});

// Course enrollment
logBusiness('COURSE_ENROLLED', 'enrollment', enrollmentId, {
  userId: user.id,
  courseId: course.id,
  courseName: course.name,
});

// Payment processed
logBusiness('PAYMENT_PROCESSED', 'payment', paymentId, {
  userId: user.id,
  amount: payment.amount,
  currency: 'VND',
  method: 'credit_card',
});
```

### 3. Function Execution Logging

```typescript
import { logExecution } from '@/utils/log';

// Wrap functions for automatic logging
const createUserWithLogging = logExecution(createUser, 'createUser');

// Or use as decorator
class UserService {
  @logExecution
  async createUser(userData: UserData) {
    // Function implementation
  }
}
```

### 4. Middleware Integration

#### Express.js Middleware

```typescript
import { createRequestLogger, createErrorLogger } from '@/utils/log';

// Request logging middleware
app.use(createRequestLogger());

// Error logging middleware (should be last)
app.use(createErrorLogger());
```

#### Next.js API Route Wrapper

```typescript
import { logApiRequest, logError } from '@/utils/log';

export function withLogging(handler: any) {
  return async (req: any, res: any) => {
    const startTime = Date.now();
    
    try {
      const result = await handler(req, res);
      
      const duration = Date.now() - startTime;
      logApiRequest(
        req.method,
        req.url,
        res.statusCode || 200,
        duration,
        req.user?.id
      );
      
      return result;
    } catch (error) {
      logError(error, {
        method: req.method,
        url: req.url,
        userId: req.user?.id,
      });
      
      const duration = Date.now() - startTime;
      logApiRequest(
        req.method,
        req.url,
        500,
        duration,
        req.user?.id
      );
      
      throw error;
    }
  };
}
```

## 🎯 Log Levels

### Development Environment
- **Debug**: Detailed debugging information
- **Info**: General application flow
- **Warn**: Warning messages
- **Error**: Error conditions
- **HTTP**: HTTP request/response logs

### Production Environment
- **Info**: Important application events
- **Warn**: Warning conditions
- **Error**: Error conditions
- **HTTP**: HTTP request logs

## 📊 Log Formats

### Development Format
```
2024-01-15 10:30:45 [INFO]: User logged in
{
  "userId": "user-123",
  "email": "user@example.com",
  "ipAddress": "192.168.1.1"
}
```

### Production Format
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "User logged in",
  "userId": "user-123",
  "email": "user@example.com",
  "ipAddress": "192.168.1.1"
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Log level (error, warn, info, http, verbose, debug, silly)
LOG_LEVEL=info

# Enable file logging in development
LOG_TO_FILE=true

# Node environment
NODE_ENV=production
```

### Winston Configuration

```typescript
// Custom configuration
const customLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

## 📁 Log Files (Production)

### error.log
- Only error-level logs
- Max size: 10MB
- Max files: 5
- Auto rotation

### combined.log
- All logs from info level and above
- Max size: 10MB
- Max files: 5
- Auto rotation

### http.log
- HTTP request/response logs
- Max size: 10MB
- Max files: 3
- Auto rotation

### exceptions.log
- Uncaught exceptions
- Critical errors
- System crashes

### rejections.log
- Unhandled promise rejections
- Async errors
- Promise failures

## 🔍 Log Analysis

### Common Log Queries

```bash
# Find all errors in the last hour
grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" logs/error.log

# Count API requests by status code
grep "statusCode" logs/http.log | grep -o '"statusCode":[0-9]*' | sort | uniq -c

# Find failed login attempts
grep "LOGIN_FAILED" logs/combined.log

# Monitor performance issues
grep "PERFORMANCE" logs/combined.log | grep -E "(duration.*[5-9][0-9]{3}|duration.*[0-9]{5,})"
```

### Log Monitoring Tools

Recommended tools for monitoring logs:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Fluentd** for log forwarding
- **Grafana** for visualization
- **Sentry** for error tracking
- **Datadog** for comprehensive monitoring

## 🚨 Error Handling Integration

### With Utils Error Handling System

```typescript
import { withServerActionErrorHandling } from '@/utils';
import { logServerAction, logError } from '@/utils/log';

const rawCreateUser = async (userData: UserData) => {
  const startTime = Date.now();
  
  try {
    const user = await prisma.user.create({ data: userData });
    
    const duration = Date.now() - startTime;
    logServerAction('createUser', true, duration, userData.createdBy);
    
    return user;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(error, { action: 'createUser', userData });
    logServerAction('createUser', false, duration, userData.createdBy);
    
    throw error;
  }
};

export const createUser = withServerActionErrorHandling(rawCreateUser);
```

## 📈 Performance Monitoring

### Database Query Logging

```typescript
import { logDatabase } from '@/utils/log';

// Prisma middleware for query logging
prisma.$use(async (params, next) => {
  const startTime = Date.now();
  
  const result = await next(params);
  
  const duration = Date.now() - startTime;
  logDatabase(`${params.action} ${params.model}`, params.model, {
    duration: `${duration}ms`,
    args: params.args,
  });
  
  return result;
});
```

### Memory Usage Monitoring

```typescript
import { logPerformance } from '@/utils/log';

setInterval(() => {
  const memUsage = process.memoryUsage();
  
  logPerformance('Memory Usage', memUsage.heapUsed / 1024 / 1024, 'MB', {
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
    rss: Math.round(memUsage.rss / 1024 / 1024),
  });
}, 60000); // Every minute
```

## 🔒 Security Considerations

### Sensitive Data Filtering

```typescript
// Don't log sensitive information
const sanitizeUser = (user: any) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  // Don't log password, tokens, etc.
});

logInfo('User created', sanitizeUser(user));
```

### Log Access Control

```bash
# Set proper file permissions for log files
chmod 640 logs/*.log
chown app:app logs/*.log
```

## 🧪 Testing

### Log Testing

```typescript
import logger, { logInfo } from '@/utils/log';

// Mock logger for testing
jest.mock('@/utils/log', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarning: jest.fn(),
}));

// Test logging calls
test('should log user creation', async () => {
  await createUser(userData);
  
  expect(logInfo).toHaveBeenCalledWith(
    'User created',
    expect.objectContaining({
      userId: expect.any(String),
      email: userData.email,
    })
  );
});
```

## 📝 Best Practices

1. **Use appropriate log levels** - Debug for development, Info+ for production
2. **Include context** - Always provide relevant metadata
3. **Don't log sensitive data** - Passwords, tokens, personal information
4. **Use structured logging** - JSON format for production
5. **Monitor log file sizes** - Set up rotation and cleanup
6. **Centralize logging** - Use consistent logging throughout application
7. **Log business events** - Important user actions and system events
8. **Performance logging** - Track slow operations
9. **Security logging** - Monitor security-related events
10. **Error correlation** - Include request IDs to trace errors

## 🔗 Integration Examples

### With Error Boundary

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      componentStack: errorInfo.componentStack,
      type: 'react_error_boundary',
    });
  }
}
```

### With API Routes

```typescript
// app/api/users/route.ts
import { logApiRequest, logError } from '@/utils/log';

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    const users = await getUsers();
    
    const duration = Date.now() - startTime;
    logApiRequest('GET', '/api/users', 200, duration);
    
    return Response.json(users);
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(error, { endpoint: '/api/users', method: 'GET' });
    logApiRequest('GET', '/api/users', 500, duration);
    
    throw error;
  }
}
```

This logging system provides a powerful foundation for effective monitoring, debugging, and maintenance!
