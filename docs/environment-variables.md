# Environment Variables Documentation

Comprehensive guide for configuring environment variables in the Nextjs 15 starter template

## 🚀 Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Replace placeholder secrets (values containing `ChangeMe` / `Dev*`) with strong random values (use `openssl rand -base64 32` where appropriate). Do not leave required secrets blank.
3. If you change `POSTGRES_HOST_PORT` or `REDIS_HOST_PORT`, update `DATABASE_URL` / `REDIS_URL` so the `localhost:<port>` part matches.
4. Restart the dev server and Docker Compose services after changes.

## 📋 Environment Files

### File Priority (highest to lowest)
- `.env.local` - Local overrides (ignored by git)
- `.env.development` - Development-specific
- `.env.production` - Production-specific
- `.env` - Default values (committed to git)
- `.env.example` - Template file (committed to git)

## 🔧 Configuration Sections

### Docker Compose (host ports)

Used by `docker-compose.dev.yml` and `docker-compose.yml` when you run `docker compose ...`. These only control **published** ports (host → container); inside the stack, services still use `5432`, `6379`, etc.

| Variable | Default | Used for |
|----------|---------|----------|
| `POSTGRES_HOST_PORT` | `5432` | Dev PostgreSQL on the host |
| `REDIS_HOST_PORT` | `6379` | Dev Redis on the host |
| `REDIS_COMMANDER_PORT` | `8081` | Redis Commander (`--profile tools`) |
| `APP_DEV_PORT` | `3000` | Dev Next.js (`app-dev` published port) |
| `PRISMA_STUDIO_PORT` | `5555` | Prisma Studio (`app-dev`) |
| `APP_HOST_PORT` | `3000` | Production `app` service (`docker-compose.yml`) |

**Docker Compose `${VAR}`:** In `docker-compose.dev.yml`, values like `postgresql://${POSTGRES_USER}:...` are interpolated by **Compose** from the file passed to `docker compose --env-file .env.local` — not by Node or dotenv-expand. Define `POSTGRES_USER`, `POSTGRES_PASSWORD`, etc. in `.env.local`; the `app-dev` service gets concrete `DATABASE_URL` / `REDIS_URL` pointing at `postgres-dev` / `redis-dev` on the Compose network.

For **Prisma CLI on the host** (`npm run migrate:dev`, …), keep literal `DATABASE_URL` / `REDIS_URL` in `.env.local` using `localhost` and the published ports (see `.env.example`).

### Database Configuration
Required for Prisma and PostgreSQL connection. The password in `DATABASE_URL` must match `POSTGRES_PASSWORD`.

```bash
POSTGRES_DB="student_management_dev"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your-strong-password"
POSTGRES_HOST_AUTH_METHOD="trust"
DATABASE_URL="postgresql://postgres:your-strong-password@localhost:5432/student_management_dev"
DIRECT_URL="postgresql://postgres:your-strong-password@localhost:5432/student_management_dev"
```

- **POSTGRES_DB**: Database name
- **POSTGRES_USER**: Database username
- **POSTGRES_PASSWORD**: Database password
- **POSTGRES_HOST_AUTH_METHOD**: PostgreSQL authentication method
- **DATABASE_URL**: Full database connection string for Prisma
- **DIRECT_URL**: Direct database connection (for migrations)

### Redis Configuration
Used for caching, session storage, and rate limiting. The password in `REDIS_URL` must match `REDIS_PASSWORD`.

```bash
REDIS_PASSWORD="your-redis-password"
REDIS_URL="redis://:your-redis-password@localhost:6379"
```

- **REDIS_PASSWORD**: Password for Redis (dev Docker and connection string)
- **REDIS_URL**: Full Redis connection URL including password

### Dev tools (Docker)

**Redis Commander** — optional UI for Redis when you use `make dev-full` / Compose `--profile tools`. Port: `REDIS_COMMANDER_PORT`.

**Prisma Studio** — not a Docker service here. It starts **with** the Next.js dev server when you run `npm run dev` (see `package.json`: `concurrently` runs Next on port `3000` and Prisma Studio on **http://localhost:5555**). To open Studio alone: `npm run db:studio`.

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
