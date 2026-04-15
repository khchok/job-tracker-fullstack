FROM node:20-alpine AS base
RUN npm install -g pnpm

# Copy monorepo root files needed for workspace resolution
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.json ./

# Copy packages that user-service depends on
COPY libraries/ ./libraries/
COPY apps/user-service/ ./apps/user-service/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build shared libraries first, then generate the Prisma client
RUN pnpm --filter shared-types build
# prisma.config.ts uses env('USER_SERVICE_DATABASE_URL') which Prisma resolves even during
# generate (no actual DB connection is made). A placeholder satisfies the requirement.
RUN USER_SERVICE_DATABASE_URL="postgresql://placeholder@localhost/placeholder" pnpm --filter user-service db:generate

WORKDIR /app/apps/user-service
EXPOSE 3031
ENV NODE_ENV=production

# Use tsx instead of compiling with tsc — Prisma 7 generates pure ESM which tsc with
# module:Node16 (no "type":"module") compiles to broken CJS output.
CMD ["pnpm", "exec", "tsx", "src/server.ts"]
