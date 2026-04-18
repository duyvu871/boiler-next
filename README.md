# Next.js 16 Starter Template

## Introduction

A modern, production-ready **Next.js 16 starter template** featuring complete authentication system and enterprise-grade architecture. Built for scalable web applications with **React 19**, **NextAuth.js**, **Prisma**, **PostgreSQL**, **Redis**, and **TypeScript**.

This template provides a **solid foundation** that you can customize and extend for any type of application. The authentication system is fully implemented as a **working example**, while the overall architecture is designed to be **flexible and adaptable** to your specific needs.

Perfect for:

- **SaaS applications** with user management
- **Dashboard applications** with role-based access
- **E-commerce platforms** with authentication
- **Business applications** requiring secure access
- **Educational platforms** and content management
- **Admin panels** and management systems
- **Rapid prototyping** with modern stack

## ✨ Features

### 🔐 Authentication & Authorization

- **NextAuth.js integration** with credentials and OAuth (Google)
- **Role-based access control** (RBAC) with permissions
- **Server-side authentication** helpers and middleware
- **Client-side authentication** hook (`useAuth`)
- **Session management** with JWT tokens
- **Protected routes** and API endpoints

### 🏗️ Architecture & Developer Experience

- **Next.js 16** with App Router and React Server Components
- **TypeScript** with strict type checking
- **Section-based architecture** for feature organization
- **Prisma ORM** with PostgreSQL database
- **Redis caching** for performance
- **Zod validation** for type-safe data handling
- **Winston logging** system with multiple transports
- **Comprehensive error handling** with custom error types
- **Environment configuration** with validation
- **Docker support** for development and production

---

## 🚀 Technology Stack

### Core Framework

- **Next.js 16** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript** - Type-safe JavaScript

### Authentication & Security

- **NextAuth.js** - Complete authentication solution
- **JWT** - Secure token-based sessions
- **Zod** - Runtime type validation
- **bcryptjs** - Password hashing

### Database & Caching

- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Relational database
- **Redis (Upstash)** - Caching and session storage

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Mantine** - Modern React components library
- **next-themes** - Theme management
- **React Hook Form** - Form handling

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Winston** - Comprehensive logging system
- **Husky** - Git hooks for code quality
- **lint-staged** - Run linters on staged files
- **Docker** - Containerization for development

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── (public)/          # Public routes (auth, landing)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── layout/           # Layout components
│   └── ui/               # Base UI components
├── sections/             # Feature-based sections
│   └── auth/             # Authentication section (example)
│       ├── data/         # Business logic & actions
│       └── view/         # UI components
├── hooks/                # Custom React hooks
│   └── use-auth.ts       # Authentication hook
├── lib/                  # Shared utilities
│   ├── auth.ts          # NextAuth configuration
│   ├── auth-helpers.ts  # Server-side auth helpers
│   ├── db.ts            # Database client
│   └── env.ts           # Environment validation
├── providers/           # React context providers
├── store/              # State management (Jotai)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions & error handling
└── styles/             # Global styles

prisma/                 # Database schema & migrations
docs/                   # Project documentation
scripts/                # Development scripts
```

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/duyvu871/boiler-next.git
cd boiler-next

# Install dependencies
npm install
```

### 2. Environment Setup

Copy the example environment file (it contains defaults, Docker host ports, and **non-empty** placeholder secrets you should replace for production):

```bash
cp .env.example .env.local
```

Edit `.env.local`: keep **literal** `DATABASE_URL` / `REDIS_URL` / `DIRECT_URL` on `localhost` for Prisma CLI on the host; Docker Compose injects **overrides** for the `app-dev` container (see [Environment variables](./docs/environment-variables.md)).

### 3. Database Setup (host Prisma CLI)

With Postgres running (`make dev` or `docker compose ...` first):

```bash
npm install
npx prisma generate

# Migrations against localhost URLs in .env.local
npm run migrate:dev

# Seed (optional)
npm run db:seed:dev
```

### 4. Development (Dockerfile.dev)

**`npm run dev`** starts **Postgres + Redis + app-dev** via Compose. The `app-dev` image (`Dockerfile.dev`) runs **Next.js** and **Prisma Studio** inside one container; env comes from `.env.local` plus Compose `environment` (DB/Redis URLs use service names `postgres-dev` / `redis-dev`).

```bash
npm run dev
```

🎉 [http://localhost:3000](http://localhost:3000) — Next.js · [http://localhost:5555](http://localhost:5555) — Prisma Studio (ports from `APP_DEV_PORT` / `PRISMA_STUDIO_PORT` in `.env.local`).

Detached stack: `npm run dev:docker:detach`. Stop: `make dev-stop`. Next **only** on the host (no Docker): `npm run dev:next-only`.

### 5. Makefile shortcuts

```bash
make dev        # same stack as npm run dev (detached)
make dev-stop
```

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Docker: Postgres + Redis + app-dev (Next + Prisma Studio, Dockerfile.dev)
npm run dev:docker:detach # Same stack, detached (-d)
npm run dev:next-only    # Next.js on host only (no Docker)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking

# Database
npm run db:generate   # Generate Prisma client
npm run migrate:dev   # Migrations (host, .env.local localhost URLs)
npm run db:seed:dev   # Seed database
npm run db:studio     # Prisma Studio on host only
npm run db:reset:dev  # Reset DB (host)

# Docker & Development
make dev              # Dev stack in background (Compose)
make down           # Stop all Docker services
make logs           # View Docker logs
make clean          # Clean Docker volumes and images

# Testing & Quality
npm run test        # Run tests (when implemented)
npm run test:watch  # Watch mode for tests
```

---

## 🛠️ Key Features

### 📝 Comprehensive Logging System

- **Winston-based logging** with multiple transports
- **Environment-specific configuration** (development vs production)
- **Structured logging** with JSON format for production
- **File rotation** with size limits and automatic cleanup
- **Security logging** for authentication events
- **Performance logging** for monitoring slow operations
- **HTTP request logging** with detailed metadata

### 🚨 Advanced Error Handling

- **Custom error classes** for different error types
- **HOC wrappers** for Server Actions and API routes
- **Automatic error sanitization** in production
- **Detailed error logging** with context and metadata
- **Type-safe error responses** with consistent format
- **Client-side error boundaries** for graceful degradation

### 🏗️ Section-Based Architecture

- **Domain-driven design** with feature-based organization
- **Clear separation** between data, views, and components
- **Reusable components** with consistent patterns
- **Type-safe schemas** with Zod validation
- **Barrel exports** for clean imports
- **Scalable structure** ready for any application domain

### 🔧 Git Hooks & Code Quality

- **Pre-commit hooks** automatically run type checking and linting
- **Commit message validation** enforces conventional commit format
- **Pre-push hooks** run build tests before pushing
- **Lint-staged** only processes changed files for faster commits
- **Automatic code formatting** with Prettier on commit

## 🔐 Authentication Features

### Current Implementation

- ✅ **NextAuth.js integration** with credentials and Google OAuth
- ✅ **Role-based access control** (Admin, User roles)
- ✅ **Server-side authentication** helpers (`requireAuth`, `requireRole`)
- ✅ **Client-side authentication** hook (`useAuth`)
- ✅ **Protected routes** and middleware
- ✅ **Session management** with JWT
- ✅ **Form validation** with Zod schemas
- ✅ **Error handling** and logging

### Usage Examples

#### Server-side Protection

```typescript
// In a Server Component or API route
import { requireAuth, requireRole } from '@/lib/auth-helpers';

export default async function AdminPage() {
  const user = await requireRole(['ADMIN']);
  return <div>Welcome Admin: {user.name}</div>;
}
```

#### Client-side Hook

```typescript
// In a Client Component
import { useAuth } from '@/hooks/use-auth';

function ProfileComponent() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) return <LoginForm />;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

#### Server Actions with Error Handling

```typescript
// Server action with automatic error handling
import { withServerActionErrorHandling } from '@/utils';

const rawCreateItem = async (itemData: ItemData) => {
  // Your business logic here
  return await prisma.item.create({ data: itemData });
};

export const createItem = withServerActionErrorHandling(rawCreateItem);
```

#### Logging Usage

```typescript
// Comprehensive logging examples
import { logAuth, logSecurity, logPerformance } from 'app/utils/log';

// Authentication events
logAuth('LOGIN_SUCCESS', userId, { email, loginMethod: 'credentials' });

// Security events
logSecurity('UNAUTHORIZED_ACCESS', 'medium', { userId, resource: '/admin' });

// Performance monitoring
logPerformance('Database Query', 150, 'ms', { query: 'SELECT * FROM items' });
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret-32-chars-min"
NEXTAUTH_URL="https://your-domain.com"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

### Database Providers

- **Supabase** - PostgreSQL with built-in auth
- **PlanetScale** - MySQL-compatible serverless database
- **Railway** - PostgreSQL with simple deployment
- **Neon** - Serverless PostgreSQL

### Caching Providers

- **Upstash Redis** - Serverless Redis
- **Railway Redis** - Traditional Redis hosting

## 🎨 Customization Guide

This starter template is designed to be **easily customizable** for your specific application needs:

### 🔄 Adapting for Your Project

1. **Update Database Schema**: Modify `prisma/schema.prisma` to match your data models
2. **Create New Sections**: Add feature-specific sections in `src/sections/` following the auth example
3. **Customize Authentication**: Extend the auth system with additional providers or fields
4. **Add Business Logic**: Implement your domain-specific logic in Server Actions
5. **Update Branding**: Change app name, colors, and styling to match your brand

### 📝 Renaming the Project

```bash
# Update package.json
npm pkg set name="your-app-name"

# Update database name in environment files
# Change from: nextjs_starter_dev
# To: your_app_name_dev

# Update app metadata in src/app/layout.tsx
# Update NEXT_PUBLIC_APP_NAME in .env files
```

### 🗂️ Adding New Features

```bash
# 1. Create a new section
mkdir -p src/sections/your-feature/{data,view,components}

# 2. Add your data models to Prisma schema
# 3. Create migration
npm run db:migrate

# 4. Implement your feature following the auth section pattern
```

## 🔧 Troubleshooting

### Common Issues

#### Environment Validation Failed

```bash
Error: Environment validation failed:
SMTP_PORT: SMTP_PORT must be a number or empty
```

**Solution**: Ensure empty environment variables are set as empty strings `""` in your `.env` files.

#### Database Connection Issues

```bash
Error: Can't reach database server
```

**Solutions**:

1. Make sure PostgreSQL is running: `docker compose -f docker-compose.dev.yml up -d`
2. Check your `DATABASE_URL` in `.env.local`
3. Run database migrations: `npm run db:migrate`

#### NextAuth Configuration Errors

```bash
Error: NEXTAUTH_SECRET must be at least 32 characters
```

**Solution**: Generate a proper secret:

```bash
openssl rand -base64 32
```

#### Hydration Mismatch Warnings

This is expected when using `next-themes` and is handled with `suppressHydrationWarning`.

#### Git Commit Message Format Error

```bash
❌ Invalid commit message format!
```

**Solution**: Use conventional commit format:

```bash
git commit -m "feat(auth): add login functionality"
git commit -m "fix(ui): resolve button styling issue"
git commit -m "docs: update README with Husky setup"
```

**Valid types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

### Debug Commands

```bash
# Check environment configuration
npm run dev  # Will show validation errors

# Test database connection
npm run db:studio

# View Docker logs
make logs

# Reset everything
make clean && make dev
```

## 📚 Documentation

- **[Architecture Guide](./docs/architecture.md)** - System architecture and patterns
- **[Authentication Guide](./docs/features/authentication.md)** - Complete auth documentation
- **[Environment Variables](./docs/environment-variables.md)** - Configuration guide
- **[Docker Setup](./docs/docker-setup.md)** - Docker development guide
- **[Utils Library](./src/utils/README.md)** - Error handling and utilities
- **[Logging System](./src/utils/log.md)** - Comprehensive logging documentation
- **[Sections Architecture](./src/sections/README.md)** - Feature-based organization guide
- **[Providers Guide](./src/providers/README.md)** - React Context providers documentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🎯 What's Next?

This starter template provides a solid foundation for building modern web applications. Consider extending it with:

### 🔜 Extensible Features

- **Email verification** system with templates
- **Password reset** functionality with secure tokens
- **User profile management** with avatar uploads
- **Admin dashboard** for content management
- **API rate limiting** with Redis
- **Real-time notifications** with WebSockets
- **File upload** system with cloud storage
- **Multi-language support** (i18n)
- **Payment integration** (Stripe, PayPal)
- **Content management** system
- **Search functionality** with full-text search

### 🧪 Testing & Quality

- **Unit tests** with Jest and React Testing Library
- **Integration tests** with Playwright
- **E2E testing** for critical user flows
- **Performance monitoring** with analytics
- **Security auditing** and vulnerability scanning

### 🚀 DevOps & Deployment

- **CI/CD pipeline** with GitHub Actions
- **Automated deployments** to Vercel/AWS
- **Database migrations** in production
- **Monitoring and alerting** setup
- **Backup and disaster recovery** procedures

### 📊 Analytics & Monitoring

- **Error tracking** with Sentry
- **Performance monitoring** with custom metrics
- **Application analytics** with privacy-first approach
- **Log aggregation** with ELK stack
- **Health checks** and uptime monitoring
- **Custom dashboards** for business metrics

Happy coding! 🚀
