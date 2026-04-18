# Makefile
# Development and production commands

.PHONY: help dev dev-db dev-stop dev-clean build prod prod-stop prod-clean logs db-migrate db-seed test lint format migrate migrate-prod

# Default target
help:
	@echo "Nextjs 15 template - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start Postgres + Redis + app-dev (Next + Prisma Studio in Docker)"
	@echo "  make dev-full     - Start development with management tools"
	@echo "  make dev-stop     - Stop development environment"
	@echo "  make dev-clean    - Stop and remove development containers/volumes"
	@echo ""
	@echo "Production:"
	@echo "  make build        - Build production Docker image"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-stop    - Stop production environment"
	@echo "  make prod-clean   - Stop and remove production containers/volumes"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate-dev - Run development database migrations"
	@echo "  make db-migrate-prod - Run production database migrations"
	@echo "  make db-seed-dev  - Seed development database with sample data"
	@echo "  make db-reset-dev - Reset development database (migrate + seed)"
	@echo "  make db-push-dev  - Push schema to development database (no migrations)"
	@echo "  make db-push-prod - Push schema to production database (no migrations)"
	@echo "  make migrate       - prisma migrate dev + generate inside app-dev (needs stack up; --env-file .env.local)"
	@echo "  make migrate-prod  - prisma migrate deploy inside app (prod stack; --env-file .env.prod)"
	@echo ""
	@echo "Development Tools:"
	@echo "  make install      - Install dependencies"
	@echo "  make lint         - Run linting"
	@echo "  make format       - Format code"
	@echo "  make test         - Run tests"
	@echo "  make type-check   - Run TypeScript type checking"
	@echo ""
	@echo "Utilities:"
	@echo "  make logs         - View application logs"
	@echo "  make logs-db      - View database logs"
	@echo "  make logs-redis   - View Redis logs"
	@echo "  make clean-all    - Clean everything (dev + prod)"

# Development Environment
dev:
	@echo "🚀 Starting development stack (Postgres + Redis + Next/Prisma Studio)..."
	docker compose -f docker-compose.dev.yml --env-file .env.local up -d --build postgres-dev redis-dev app-dev
	@echo "✅ Development stack started!"
	@echo "   Next.js:    http://localhost:3000 (set APP_DEV_PORT in .env.local to change)"
	@echo "   Prisma UI: http://localhost:5555 (set PRISMA_STUDIO_PORT in .env.local to change)"
	@echo "   PostgreSQL / Redis: ports from POSTGRES_HOST_PORT / REDIS_HOST_PORT in .env.local"

dev-full:
	@echo "🚀 Starting development environment with management tools..."
	docker compose -f docker-compose.dev.yml --profile tools --env-file .env.local up -d
	@echo "✅ Development services with tools started!"
	@echo "   PostgreSQL: localhost:5432"
	@echo "   Redis: localhost:6379"
	@echo "   Next + Prisma Studio: same as make dev (app-dev)"
	@echo "   Redis Commander: http://localhost:8081"

dev-stop:
	@echo "🛑 Stopping development environment..."
	docker compose -f docker-compose.dev.yml --env-file .env.local down
	@echo "✅ Development environment stopped"

dev-clean:
	@echo "🧹 Cleaning development environment..."
	docker compose -f docker-compose.dev.yml --env-file .env.local down -v --remove-orphans
	docker volume prune -f
	@echo "✅ Development environment cleaned"

# Production Environment
build:
	@echo "🔨 Building production Docker image..."
	docker build -t nextjs-15-template:latest .
	@echo "✅ Production image built successfully"

prod:
	@echo "🚀 Starting production environment..."
	docker compose --env-file .env.production up -d app postgres redis
	@echo "✅ Production environment started!"
	@echo "   Application: http://localhost:3000"

prod-stop:
	@echo "🛑 Stopping production environment..."
	docker compose --env-file .env.production down
	@echo "✅ Production environment stopped"

prod-clean:
	@echo "🧹 Cleaning production environment..."
	docker compose --env-file .env.production down -v --remove-orphans
	docker volume prune -f
	@echo "✅ Production environment cleaned"

# Database Commands
db-migrate-dev:
	@echo "📊 Running development database migrations..."
	npm run migrate:dev
	@echo "✅ Development database migrations completed"

db-migrate-prod:
	@echo "📊 Running production database migrations..."
	npm run migrate:deploy
	@echo "✅ Production database migrations completed"

db-seed-dev:
	@echo "🌱 Seeding development database..."
	npm run db:seed:dev
	@echo "✅ Development database seeded"

db-reset-dev:
	@echo "🔄 Resetting development database..."
	npm run db:reset:dev
	@echo "✅ Development database reset completed"

db-push-dev:
	@echo "📊 Pushing schema to development database..."
	npm run db:push:dev
	@echo "✅ Development database push completed"

db-push-prod:
	@echo "📊 Pushing schema to production database..."
	npm run db:push:prod
	@echo "✅ Production database push completed"

# Prisma in Docker: `run --rm` starts deps if needed, removes the one-off container after (no long-running app-dev required)
migrate:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev run --rm app-dev sh -c "npx prisma migrate dev && npx prisma generate"
	sudo chown -R $$(id -u):$$(id -g) prisma/migrations

migrate-prod:
	docker compose -f docker-compose.yml --env-file .env.prod --profile migrate run --rm prisma-migrate-prod npx prisma migrate deploy

# Development Tools
install:
	@echo "📦 Installing dependencies..."
	npm ci
	@echo "✅ Dependencies installed"

lint:
	@echo "🔍 Running linting..."
	npm run lint
	@echo "✅ Linting completed"

format:
	@echo "💅 Formatting code..."
	npm run format
	@echo "✅ Code formatted"

test:
	@echo "🧪 Running tests..."
	npm run test
	@echo "✅ Tests completed"

type-check:
	@echo "📝 Running TypeScript type checking..."
	npm run type-check
	@echo "✅ Type checking completed"

# Logs
logs:
	@echo "📋 Viewing application logs..."
	docker compose --env-file .env.production logs -f app

logs-db:
	@echo "📋 Viewing database logs..."
	docker compose -f docker-compose.dev.yml --env-file .env.local logs -f postgres-dev

logs-redis:
	@echo "📋 Viewing Redis logs..."
	docker compose -f docker-compose.dev.yml --env-file .env.local logs -f redis-dev

# Cleanup
clean-all:
	@echo "🧹 Cleaning all environments..."
	docker compose -f docker-compose.dev.yml --env-file .env.local down -v --remove-orphans || true
	docker compose --env-file .env.production down -v --remove-orphans || true
	docker system prune -f
	docker volume prune -f
	@echo "✅ All environments cleaned"

# Quick development setup
setup-dev: install dev db-migrate-dev db-seed-dev
	@echo "🎉 Development environment setup completed!"
	@echo "   Run 'npm run dev' to start the application"

# Quick production setup
setup-prod: build prod db-migrate-prod
	@echo "🎉 Production environment setup completed!"
	@echo "   Application available at http://localhost:3000"


