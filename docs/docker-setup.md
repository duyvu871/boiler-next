# Docker Setup Guide

This guide explains how to set up and run the Next.js 16 template using Docker.

## Overview

The project uses different Docker configurations for development and production:

- **Development**: Postgres, Redis, and **app-dev** (Next.js + Prisma Studio via `Dockerfile.dev`) run in Docker; Compose injects DB/Redis URLs for the app container.
- **Production**: Full application stack runs in Docker containers

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0 or higher
- Node.js 18+ (for development mode)
- Make (optional, for using Makefile commands)

## Development Setup

### Quick Start

```bash
cp .env.example .env.local
# Edit secrets in .env.local, then:

# Foreground (logs): Postgres + Redis + app-dev (Next + Prisma Studio)
npm run dev

# Or detached:
make dev
```

`docker compose` interpolates `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`, etc. from `--env-file .env.local` into the `app-dev` service `environment` block (no dotenv-expand in Node).

### With Management Tools

```bash
# Start with Redis Commander (optional Redis UI)
make dev-full

# Or manually:
docker compose -f docker-compose.dev.yml --env-file .env.local --profile tools up -d
```

### Available Services (Development)

Host ports are set in `.env.local` (see `.env.example`). Defaults below match the example file.

| Service | Env port var | Default | Notes |
|---------|----------------|---------|--------|
| PostgreSQL | `POSTGRES_HOST_PORT` | 5432 | User/password: `POSTGRES_*` in `.env.local` |
| Redis | `REDIS_HOST_PORT` | 6379 | Password: `REDIS_PASSWORD` (must match `REDIS_URL`) |
| Redis Commander | `REDIS_COMMANDER_PORT` | 8081 | `--profile tools` |
| Next.js (`app-dev`) | `APP_DEV_PORT` | 3000 | `Dockerfile.dev` |
| Prisma Studio (`app-dev`) | `PRISMA_STUDIO_PORT` | 5555 | Same container as Next |

### Environment Variables

Copy the template and start services:

```bash
cp .env.example .env.local
# Edit secrets (replace ChangeMe / Dev* placeholders), then:
make dev
```

Keep **localhost** `DATABASE_URL` / `REDIS_URL` in `.env.local` for Prisma CLI on the host (`migrate:dev`, …). The **app-dev** container receives different URLs from Compose pointing at `postgres-dev` and `redis-dev`.

### Migrations inside Docker (Makefile)

`make migrate` does **not** require `app-dev` to be running: it uses **`docker compose run --rm`**, which starts **`postgres-dev`** / **`redis-dev`** if needed, runs a one-off **`app-dev`** container, then removes it.

```bash
cp .env.local .env.dev   # or maintain .env.dev with the same keys for Compose interpolation
make migrate
```

`docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev run --rm app-dev sh -c "npx prisma migrate dev && npx prisma generate"`

Then `sudo chown` on `prisma/migrations` for files created as root on the bind mount.

Production: **`make migrate-prod`** runs a one-off **`prisma-migrate-prod`** container (`Dockerfile.dev` + Prisma CLI) on the **production** network, with DB URL pointing at service **`postgres`**. It uses **`run --rm`** and profile **`migrate`** (production `app` image does not ship Prisma CLI):

`docker compose -f docker-compose.yml --env-file .env.prod --profile migrate run --rm prisma-migrate-prod npx prisma migrate deploy`

Postgres must be reachable (e.g. `docker compose ... up -d postgres` or full `make prod`).

## Production Setup

### Quick Start

```bash
# Build and start production environment
make build
make prod

# Or manually:
docker build -t app:latest .
docker compose --env-file .env.production up -d app postgres redis
```

### Available Services (Production)

The published port for the app comes from `APP_HOST_PORT` in `.env.production` (default `3000`).

| Service | Default host port | URL (default) |
|---------|-------------------|----------------|
| Application | `APP_HOST_PORT` (3000) | http://localhost:3000 |

`postgres` and `redis` are not published to the host by default (only reachable from the `app` container on the Compose network).

### Environment Variables

Copy and customize the production environment:

```bash
cp .env.example .env.production
```

**Important**: Change these values in production:
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `NEXTAUTH_URL`
- Database passwords
- Redis password

## Database Management

### Migrations

```bash
# Run migrations (development)
make db-migrate-dev

# Or manually:
npm run migrate:dev
```

### Seeding

```bash
# Seed database with sample data (development)
make db-seed-dev

# Or manually:
npm run db:seed:dev
```

### Reset Database

```bash
# Drop, recreate, migrate and seed (development)
make db-reset-dev

# Or manually:
npm run db:reset:dev
```

## Common Commands

### Development

```bash
# Start development services
make dev

# Stop development services
make dev-stop

# Clean development environment (removes volumes)
make dev-clean

# View logs
make logs-db
make logs-redis
```

### Production

```bash
# Build production image
make build

# Start production environment
make prod

# Stop production environment
make prod-stop

# Clean production environment
make prod-clean

# View application logs
make logs
```

### Development Tools

```bash
# Install dependencies
make install

# Run linting
make lint

# Format code
make format

# Run tests
make test

# Type checking
make type-check
```

## Troubleshooting

### Common Issues

#### Port Conflicts

If ports 5432 or 6379 are already in use:

```bash
# Check what's using the port
netstat -an | grep 5432

# Stop conflicting services
sudo service postgresql stop  # Linux
brew services stop postgresql  # macOS
```

#### Database Connection Issues

```bash
# Check if containers are running
docker ps

# Check container logs
docker compose -f docker-compose.dev.yml --env-file .env.local logs postgres-dev

# Restart database container
docker compose -f docker-compose.dev.yml --env-file .env.local restart postgres-dev
```

#### Redis Connection Issues

```bash
# Test Redis connection (REDIS_PASSWORD is set inside the container)
docker compose -f docker-compose.dev.yml --env-file .env.local exec redis-dev \
  sh -c 'redis-cli --no-auth-warning -a "$REDIS_PASSWORD" ping'

# Check Redis logs
docker compose -f docker-compose.dev.yml --env-file .env.local logs redis-dev
```

### Health Checks

All containers include health checks. Check status:

```bash
docker compose -f docker-compose.dev.yml --env-file .env.local ps
docker inspect "$(docker compose -f docker-compose.dev.yml --env-file .env.local ps -q postgres-dev)" | grep -A 10 Health
```

### Cleanup

```bash
# Remove all containers and volumes
make clean-all

# Remove unused Docker resources
docker system prune -f
docker volume prune -f
```

## Performance Tuning

### PostgreSQL

For production, consider these PostgreSQL settings in `docker-compose.yml`:

```yaml
postgres:
  environment:
    POSTGRES_SHARED_PRELOAD_LIBRARIES: pg_stat_statements
    POSTGRES_MAX_CONNECTIONS: 200
    POSTGRES_SHARED_BUFFERS: 256MB
    POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
```

### Redis

For production Redis optimization:

```yaml
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru --appendonly yes
```

## Security Considerations

### Development

- Default passwords are used for convenience
- Services are exposed on localhost only
- Debug mode is enabled

### Production

- **Change all default passwords**
- Use environment variables for secrets
- Enable SSL/TLS for external connections
- Use Docker secrets for sensitive data
- Regular security updates

### Docker Secrets (Production)

```yaml
services:
  app:
    secrets:
      - db_password
      - jwt_secret
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD_FILE}@postgres:5432/app

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

## Monitoring and Logging

### Application Logs

```bash
# Follow application logs
docker compose logs -f app

# View specific service logs
docker compose logs postgres redis
```

### Log Aggregation

For production, consider using:

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Fluentd + Elasticsearch
- Grafana Loki

## Backup and Recovery

### Database Backup

```bash
# From the project directory (POSTGRES_* are set inside the container)
docker compose --env-file .env.production exec postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup.sql

docker compose --env-file .env.production exec -T postgres \
  sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < backup.sql
```

### Redis Backup

```bash
# Redis persists to a named volume; copy dump from a running redis service:
docker compose --env-file .env.production cp redis:/data/dump.rdb ./redis-backup.rdb
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t app:${{ github.sha }} .
        
      - name: Run tests
        run: |
          docker compose -f docker-compose.dev.yml --env-file .env.local up -d postgres-dev redis-dev
          npm test
          
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          docker tag app:${{ github.sha }} app:latest
          # Deploy commands here
```

This setup provides a robust, scalable foundation for both development and production environments.


