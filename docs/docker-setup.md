# Docker Setup Guide

This guide explains how to set up and run the Nextjs 15 template using Docker.

## Overview

The project uses different Docker configurations for development and production:

- **Development**: Only database and Redis run in Docker containers
- **Production**: Full application stack runs in Docker containers

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0 or higher
- Node.js 18+ (for development mode)
- Make (optional, for using Makefile commands)

## Development Setup

### Quick Start

```bash
# Start database and Redis containers
make dev

# Or manually:
docker compose -f docker compose.dev.yml up -d postgres-dev redis-dev

# Install dependencies and run the app locally
npm install
npm run dev
```

### With Management Tools

```bash
# Start with pgAdmin and Redis Commander
make dev-full

# Or manually:
docker compose -f docker compose.dev.yml --profile tools up -d
```

### Available Services (Development)

| Service | Port | URL | Credentials |
|---------|------|-----|-------------|
| PostgreSQL | 5432 | localhost:5432 | postgres/postgres123 |
| Redis | 6379 | localhost:6379 | Password: redis123 |
| pgAdmin | 5050 | http://localhost:5050 | admin@student-management.dev/admin123 |
| Redis Commander | 8081 | http://localhost:8081 | - |

### Environment Variables

Create `.env.development` file:

```env
NODE_ENV="development"
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/student_management_dev"
REDIS_URL="redis://:redis123@localhost:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-not-for-production"
JWT_SECRET="dev-jwt-secret-not-for-production"
```

## Production Setup

### Quick Start

```bash
# Build and start production environment
make build
make prod

# Or manually:
docker build -t student-management:latest .
docker compose up -d app postgres redis
```

### With Nginx Proxy

```bash
# Start with Nginx reverse proxy
make prod-proxy

# Or manually:
docker compose --profile proxy up -d
```

### With Monitoring

```bash
# Start with Prometheus and Grafana
make prod-monitor

# Or manually:
docker compose --profile monitoring up -d
```

### Available Services (Production)

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Application | 3000 | http://localhost:3000 | Main app |
| Nginx (optional) | 80/443 | http://localhost | Reverse proxy |
| Prometheus (optional) | 9090 | http://localhost:9090 | Metrics |
| Grafana (optional) | 3001 | http://localhost:3001 | Dashboard |

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
docker compose -f docker compose.dev.yml logs postgres-dev

# Restart database container
docker compose -f docker compose.dev.yml restart postgres-dev
```

#### Redis Connection Issues

```bash
# Test Redis connection
docker exec -it student-management-redis-dev redis-cli ping

# Check Redis logs
docker compose -f docker compose.dev.yml logs redis-dev
```

### Health Checks

All containers include health checks. Check status:

```bash
# Check container health
docker ps

# Detailed health check info
docker inspect student-management-postgres-dev | grep -A 10 Health
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

For production, consider these PostgreSQL settings in `docker compose.yml`:

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
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD_FILE}@postgres:5432/student_management

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

### System Monitoring

With monitoring profile enabled:

- **Prometheus**: Metrics collection at http://localhost:9090
- **Grafana**: Dashboards at http://localhost:3001 (admin/admin123)

### Log Aggregation

For production, consider using:

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Fluentd + Elasticsearch
- Grafana Loki

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker exec student-management-postgres pg_dump -U postgres student_management > backup.sql

# Restore backup
docker exec -i student-management-postgres psql -U postgres student_management < backup.sql
```

### Redis Backup

```bash
# Redis automatically saves to /data volume
# Copy backup file
docker cp student-management-redis:/data/dump.rdb ./redis-backup.rdb
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
        run: docker build -t student-management:${{ github.sha }} .
        
      - name: Run tests
        run: |
          docker compose -f docker compose.dev.yml up -d postgres-dev redis-dev
          npm test
          
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          docker tag student-management:${{ github.sha }} student-management:latest
          # Deploy commands here
```

This setup provides a robust, scalable foundation for both development and production environments.


