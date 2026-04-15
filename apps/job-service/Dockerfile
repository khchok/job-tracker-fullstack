FROM node:20-alpine AS base
RUN npm install -g pnpm

# Copy monorepo root files needed for workspace resolution
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.json ./

# Copy packages that job-service depends on
COPY libraries/ ./libraries/
COPY apps/job-service/ ./apps/job-service/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build shared libraries first, then the service
RUN pnpm --filter shared-types build
# prisma.config.ts uses env('JOB_SERVICE_DATABASE_URL') which Prisma resolves even during
# generate (no actual DB connection is made). A placeholder satisfies the requirement.
RUN JOB_SERVICE_DATABASE_URL="postgresql://placeholder@localhost/placeholder" pnpm --filter job-service db:generate
RUN pnpm --filter job-service build

WORKDIR /app/apps/job-service
EXPOSE 3030
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
