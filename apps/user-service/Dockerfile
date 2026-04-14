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

# Build shared libraries first, then the service
RUN pnpm --filter shared-types build
RUN pnpm --filter user-service db:generate
RUN pnpm --filter user-service build

WORKDIR /app/apps/user-service
EXPOSE 3031
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
