<h1 align="center">
  <img src="assets/login-page.png" alt="Node.js Best Practices"/>
</h1>

# Job Tracker

A full-stack recruiter-facing job application tracker. Recruiters can manage applicants across a Kanban pipeline, track status history as a timeline, and collaborate through a clean drag-and-drop interface.

---

## Tech Stack

### Monorepo
- **pnpm workspaces** — package manager and monorepo orchestration
- **TypeScript** — end-to-end type safety across all packages

### Frontend (`apps/job-tracker-web`)
- **Next.js 16** (App Router) — React framework with file-based routing and built-in reverse proxy via `rewrites`
- **React 19** — UI library
- **TanStack Query v5** — server state management, caching, and mutations
- **@dnd-kit** — accessible drag-and-drop for the Kanban board
- **shadcn/ui** (base-ui variant) — headless component primitives
- **Tailwind CSS v4** — utility-first styling
- **Axios** — HTTP client with request/response interceptors
- **Sonner** — toast notifications

### Backend (Microservices)
- **Fastify v5** — high-performance Node.js web framework
- **@fastify/autoload** — auto-registers routes and plugins from directory structure
- **@fastify/jwt** — JWT authentication via httpOnly cookies
- **@fastify/swagger** + **@fastify/swagger-ui** — auto-generated OpenAPI docs at `/docs`

### Database
- **PostgreSQL 17** — relational database, one schema per service
- **Prisma 7** (with `@prisma/adapter-pg`) — ORM with generated type-safe client per service
- **Docker Compose** — local PostgreSQL instance with automatic database initialisation

### Shared
- **`libraries/shared-types`** — workspace package exporting shared TypeScript interfaces and enums consumed by both the frontend and backend services

---

## Architecture

```
Browser
  │
  └── Next.js (localhost:3000)
        │  Next.js rewrites strip the service prefix before forwarding:
        │    /api/job/*  ──► job-service  (localhost:3030)
        │    /api/user/* ──► user-service (localhost:3031)
        │
        ├── job-service   — manages job applications and status history
        │     └── PostgreSQL: job_service_db
        │
        └── user-service  — handles authentication and JWT issuance
              └── PostgreSQL: user_service_db
```

**Routing strategy:**
- In local development, Next.js `rewrites` in `next.config.ts` act as a reverse proxy, stripping the service prefix (`/api/job`, `/api/user`) before forwarding requests.
- In production (AWS), API Gateway handles the same prefix-based routing to the appropriate Lambda or EC2 instance. Fastify services remain prefix-agnostic.

**Authentication:**
- JWT tokens are issued by `user-service` and stored as httpOnly cookies (`SameSite=Lax`).
- Each token carries a `jti` (JWT ID). On logout, the `jti` is recorded in a `revoked_tokens` table, invalidating the token server-side.
- Next.js `proxy.ts` (the renamed `middleware.ts` in Next.js 16) performs optimistic cookie checks to redirect unauthenticated users to `/login`.

---

## Project Structure

```
job-tracker-fullstack/
├── apps/
│   ├── job-service/                 # Fastify microservice — job management
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Job, JobStatus, Status models
│   │   │   ├── seed.ts              # 30 sample applicants across 7 departments
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── plugins/             # Fastify plugins (Prisma, JWT auth hook)
│   │       ├── repositories/        # Database access layer (Prisma queries)
│   │       ├── routes/
│   │       │   ├── jobs/            # GET /jobs, POST /jobs, PUT /jobs/:id, DELETE /jobs/:id
│   │       │   └── status/          # GET /status
│   │       └── services/            # Business logic
│   │
│   ├── user-service/                # Fastify microservice — auth & users
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # User, RevokedToken models
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── plugins/             # Fastify plugins (Prisma)
│   │       ├── repositories/        # Database access layer
│   │       ├── routes/
│   │       │   └── users/           # POST /users/auth, POST /users/auth/logout, GET /users/me
│   │       └── services/            # Business logic (bcrypt password verification)
│   │
│   └── job-tracker-web/             # Next.js 16 frontend
│       └── src/
│           ├── app/                 # App Router pages
│           │   ├── page.tsx         # / — Kanban board
│           │   └── login/page.tsx   # /login — authentication
│           ├── components/
│           │   ├── auth/            # LoginCard, LoginHero, SignOutButton
│           │   ├── jobs/            # AddJobModal, EditJobModal, JobDetailModal
│           │   ├── kanban/          # KanbanBoard, KanbanColumn, JobCard
│           │   └── ui/              # shadcn/ui primitives
│           ├── services/
│           │   ├── request.ts       # Axios instance (401 interceptor → /login)
│           │   ├── job-service/     # API wrappers, TanStack Query hooks, mutations
│           │   └── user-service/    # API wrappers, sign-in/sign-out mutations
│           └── proxy.ts             # Route protection (Next.js 16 middleware)
│
├── libraries/
│   └── shared-types/                # Shared TypeScript types (Job, JobStatus, JobDetail)
│
├── docker/
│   └── init-db.sql                  # Creates job_service_db and user_service_db
├── docker-compose.yml               # PostgreSQL 17 with persistent volume
├── pnpm-workspace.yaml              # Workspace: apps/*, libraries/*
└── package.json                     # Root scripts for dev, db, and build
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+
- Docker

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the database

```bash
pnpm db:up
```

This starts a PostgreSQL 17 container and creates both service databases (`job_service_db`, `user_service_db`).

### 3. Run migrations and generate Prisma clients

```bash
pnpm db:migrate
pnpm db:generate
```

### 4. Seed sample data (optional)

```bash
# From the job-service directory
cd apps/job-service && pnpm db:seed
```

Seeds 30 applicants across 7 departments with realistic status progressions.

### 5. Configure environment variables

Each service reads from a `.env` file. The defaults below match the Docker Compose setup:

**`apps/job-service/.env`**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/job_service_db
FASTIFY_PORT=3030
JWT_PUBLIC_KEY=supersecretkey
```

**`apps/user-service/.env`**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/user_service_db
FASTIFY_PORT=3031
JWT_PUBLIC_KEY=supersecretkey
```

**`apps/job-tracker-web/.env.local`**
```env
# Used by next.config.ts rewrites — never exposed to the browser
JOB_SERVICE_URL=http://localhost:3030
USER_SERVICE_URL=http://localhost:3031

# Empty in local dev (same-origin via Next.js rewrites)
# Set to API Gateway base URL in production
NEXT_PUBLIC_API_BASE_URL=
```

### 6. Start the services

```bash
# In separate terminals:
pnpm dev:job-service    # http://localhost:3030  (Swagger: /docs)
pnpm dev:user-service   # http://localhost:3031  (Swagger: /docs)
pnpm dev:frontend       # http://localhost:3000
```

---

## API Overview

### job-service (port 3030)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/jobs` | List all jobs with latest status |
| `POST` | `/jobs` | Create a job |
| `GET` | `/jobs/:id` | Get job with full status timeline |
| `PUT` | `/jobs/:id` | Update job (name, status, remarks) |
| `DELETE` | `/jobs/:id` | Delete a job |
| `GET` | `/status` | List all pipeline statuses |

### user-service (port 3031)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users/auth` | Sign in — sets httpOnly JWT cookie |
| `POST` | `/users/auth/logout` | Sign out — revokes JTI, clears cookie |
| `GET` | `/users/me` | Get current authenticated user |

Interactive Swagger docs are available at `http://localhost:<port>/docs` for both services.
