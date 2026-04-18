# Architecture (starter template)

This document describes how this **Next.js 15** starter is organized: stack boundaries, folder layout, and conventions. Extend it when you add your own domain features.

---

## Goals

- Keep **route/UI** in `src/app` thin; put reusable domain logic in **`src/sections`** or feature folders as the project grows.
- Prefer **React Server Components** and **Server Actions**; use client components only where interactivity or browser APIs are required.
- Validate inputs with **Zod** at boundaries (forms, actions, API).
- Use **Prisma** as the single database access layer; use **Redis** (when configured) for cache, rate limiting, or sessions as needed.
- Centralize configuration through a validated **env** module instead of scattered `process.env` usage.

---

## High-level request flow

1. Request hits **`src/app`** (App Router).
2. Data loading in **Server Components** or mutations via **Server Actions**.
3. **Zod** validates payloads.
4. **Prisma** persists or reads from PostgreSQL.
5. Optional: **Redis** for cache / limits; then serialize results back to the RSC tree or client.

---

## Repository layout

The template follows a **section-based** structure under `src/` (see root **README** for the full tree). In short:

| Area | Role |
|------|------|
| `src/app` | Routes, layouts, route handlers (`api/`, `auth/`). |
| `src/components` | Shared UI (layout, primitives). |
| `src/sections` | Feature modules (e.g. auth): `data/` (actions, schemas), `view/` (UI). |
| `src/lib` | Integrations: `auth`, `db`, `env`, Redis helpers, etc. |
| `src/hooks` | Client hooks (e.g. `use-auth`). |
| `src/store` | Client state (Jotai) where needed. |
| `prisma` | `schema.prisma`, migrations, seeds. |

Add new features by mirroring the **auth** section pattern or by introducing `src/features/<name>/` if you prefer domain-first folders—stay consistent within the project.

---

## Naming conventions

- **Files and folders**: `kebab-case` (e.g. `auth-layout.tsx`).
- **Components**: `PascalCase` for component names; prefer **named exports** for components.
- **Zod schemas**: suffix with `Schema` where it helps (`LoginSchema`).
- **Server Actions**: verb-led names (`signInUser`, `updateProfile`).

---

## RSC vs client components

- **Default to Server Components**: lists, detail pages, data fetching, SEO-friendly content.
- **Use Client Components** for: forms with heavy interactivity, Jotai/local UI state, browser-only APIs, some Mantine widgets that require client boundaries.

---

## Data and validation

- **Prisma**: one shared client (e.g. `src/lib/db.ts`); avoid instantiating multiple clients in dev.
- **Zod**: define schemas next to actions or in a `schemas.ts` file per section/feature.
- **RBAC**: enforce permissions in server actions, route handlers, or middleware—never rely on hiding buttons alone.

---

## Authentication

The template ships with **Auth.js (NextAuth)** wiring, helpers, and an **auth** section. For detailed behavior and extension points, see **`docs/features/authentication.md`**.

---

## Environment

Copy **`.env.example`** to **`.env.local`** (development) and configure database/Redis/auth secrets. See **`docs/environment-variables.md`**.

---

## Docker

Local PostgreSQL and Redis for development are documented in **`docs/docker-setup.md`**. Prefer **`docker compose`** (Compose V2 plugin), e.g. `make dev` or `docker compose -f docker-compose.dev.yml ...`.
