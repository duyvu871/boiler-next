# Environment Variables Documentation

Comprehensive guide for configuring environment variables in the Nextjs 15 starter template

## 🚀 Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` with your configuration
3. Restart your development server

## 📋 Environment Files

### File Priority (highest to lowest)
- `.env.local` - Local overrides (ignored by git)
- `.env.development` - Development-specific
- `.env.production` - Production-specific
- `.env` - Default values (committed to git)
- `.env.example` - Template file (committed to git)

## 🔧 Configuration Sections

### Database Configuration
Required for Prisma and PostgreSQL connection.

```bash
POSTGRES_DB="student_management_dev"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres123"
POSTGRES_HOST_AUTH_METHOD="trust"
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"
DIRECT_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"
```

- **POSTGRES_DB**: Database name
- **POSTGRES_USER**: Database username
- **POSTGRES_PASSWORD**: Database password
- **POSTGRES_HOST_AUTH_METHOD**: PostgreSQL authentication method
- **DATABASE_URL**: Full database connection string for Prisma
- **DIRECT_URL**: Direct database connection (for migrations)

### Redis Configuration
Used for caching, session storage, and rate limiting.

```bash
REDIS_URL="redis://:redis123@localhost:6379"
```

- **REDIS_URL**: Full Redis connection string with password

### NextAuth Configuration
Authentication and session management.

```bash
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000/api/auth"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
JWT_SECRET="your-jwt-secret-key-change-this-in-production"
```

- **NEXTAUTH_URL**: Base URL for NextAuth callbacks
- **AUTH_URL**: Authentication API endpoint
- **NEXTAUTH_SECRET**: Secret for NextAuth (minimum 32 characters)
- **JWT_SECRET**: Secret for JWT tokens (minimum 32 characters)

### Application Configuration
Basic app settings.

```bash
NODE_ENV="development"
APP_VERSION="1.0.0"
PORT="3000"
```

- **NODE_ENV**: Environment mode (`development`, `production`, `test`)
- **APP_VERSION**: Application version
- **PORT**: Server port (optional, defaults to 3000)

### Email Configuration (Optional)
SMTP settings for sending emails.

```bash
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
```

- **SMTP_HOST**: SMTP server hostname
- **SMTP_PORT**: SMTP server port
- **SMTP_USER**: SMTP username
- **SMTP_PASS**: SMTP password

### OAuth Providers (Optional)
Third-party authentication providers.

```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

- **GOOGLE_CLIENT_ID**: Google OAuth client ID
- **GOOGLE_CLIENT_SECRET**: Google OAuth client secret

### File Upload Configuration
Settings for file uploads.

```bash
MAX_FILE_SIZE="5242880" # 5MB in bytes
UPLOAD_DIR="./uploads"
```

- **MAX_FILE_SIZE**: Maximum file size in bytes
- **UPLOAD_DIR**: Directory for storing uploaded files

### Rate Limiting
API rate limiting configuration.

```bash
RATE_LIMIT_WINDOW="900000" # 15 minutes in ms
RATE_LIMIT_MAX="100" # Max requests per window
```

- **RATE_LIMIT_WINDOW**: Time window in milliseconds
- **RATE_LIMIT_MAX**: Maximum requests per window

### Logging Configuration
Application logging settings.

```bash
LOG_LEVEL="info"
LOG_FILE="./logs/app.log"
LOG_TO_FILE="false"
```

- **LOG_LEVEL**: Minimum log level (`error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`)
- **LOG_FILE**: Log file path
- **LOG_TO_FILE**: Enable file logging (`true`/`false`)

### Public Environment Variables
Client-side accessible variables (must start with `NEXT_PUBLIC_`).

```bash
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_APP_NAME="Nextjs 15 template"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_LOG_LEVEL="info"
```

- **NEXT_PUBLIC_BASE_URL**: Public base URL
- **NEXT_PUBLIC_API_URL**: Public API URL
- **NEXT_PUBLIC_APP_NAME**: Application display name
- **NEXT_PUBLIC_APP_VERSION**: Public version number
- **NEXT_PUBLIC_LOG_LEVEL**: Client-side log level (`error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`)

## 🔒 Security Best Practices

### 1. Secret Management
- Use strong, unique secrets (minimum 32 characters)
- Never commit secrets to version control
- Use different secrets for each environment
- Rotate secrets regularly

### 2. Environment Files
- Add `.env.local` to `.gitignore`
- Never commit `.env` files with real secrets
- Use `.env.example` as a template
- Document required variables

### 3. Production Configuration
- Use environment-specific files (`.env.production`)
- Use secure connection strings (SSL enabled)
- Enable proper authentication methods
- Use strong database passwords

## 🛠 Development Setup

### Local Development
1. **Copy template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Start services**:
   ```bash
   # Start PostgreSQL and Redis
   docker compose -f docker compose.dev.yml up -d
   ```

3. **Update database URL**:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/student_management_dev"
   ```

4. **Generate secrets**:
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32

   # Generate JWT_SECRET
   openssl rand -base64 32
   ```

### Docker Development
Environment variables are automatically loaded from `.env.development`.

```bash
# Start with Docker
docker compose -f docker compose.dev.yml up
```

### Production Deployment
1. **Set environment variables** in your hosting platform
2. **Use secure connection strings** with SSL
3. **Enable proper authentication**
4. **Set NODE_ENV=production**

## 🧪 Testing Configuration

For testing, create `.env.test`:

```bash
NODE_ENV="test"
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/student_management_test"
REDIS_URL="redis://:redis123@localhost:6379/1"
NEXTAUTH_SECRET="test-secret-key-minimum-32-characters"
JWT_SECRET="test-jwt-secret-key-minimum-32-chars"
LOG_LEVEL="error"
```

## 📊 Environment Validation

The application automatically validates environment variables using Zod schemas in `src/lib/env.ts`:

```typescript
import { env, getEnv, isDevelopment } from '@/lib/env';

// Type-safe environment access
const dbUrl = env.DATABASE_URL;
const port = env.PORT; // string with validation

// Helper functions
const isDev = isDevelopment;
const dbConfig = getEnv('DATABASE_URL');
```

### Validation Features
- **Type safety**: All variables are properly typed
- **Required validation**: Missing required variables cause startup errors
- **Format validation**: URLs, numbers, and enums are validated
- **Default values**: Sensible defaults for optional variables

## 🔍 Troubleshooting

### Common Issues

1. **"Environment validation failed"**
   - Check all required variables are set
   - Verify variable names match exactly
   - Ensure URLs are properly formatted

2. **Database connection errors**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

3. **Redis connection errors**
   - Verify Redis is running
   - Check REDIS_URL format
   - Verify password if required

4. **NextAuth errors**
   - Ensure NEXTAUTH_SECRET is at least 32 characters
   - Verify NEXTAUTH_URL matches your domain
   - Check OAuth provider credentials

### Debug Commands

```bash
# Check environment loading
npm run dev

# Validate environment in development
node -e "require('./src/lib/env').devUtils.logConfig()"

# Test database connection
npm run db:test

# Test Redis connection
npm run redis:test
```

## 📝 Environment Checklist

### Development Setup ✅
- [ ] `.env.local` created from `.env.example`
- [ ] Database credentials configured
- [ ] Redis credentials configured
- [ ] NextAuth secrets generated
- [ ] Services running (PostgreSQL, Redis)

### Production Deployment ✅
- [ ] All required variables set in hosting platform
- [ ] Secrets are strong and unique
- [ ] Database uses SSL connection
- [ ] Redis uses authentication
- [ ] NEXTAUTH_URL matches production domain
- [ ] LOG_LEVEL set appropriately
- [ ] File upload directory configured

### Security Audit ✅
- [ ] No secrets in version control
- [ ] Strong passwords used
- [ ] SSL enabled for database
- [ ] Authentication enabled for Redis
- [ ] Secrets rotated regularly
- [ ] Environment-specific configurations

This documentation ensures proper configuration and security for all environments in the Nextjs 15 template System.
