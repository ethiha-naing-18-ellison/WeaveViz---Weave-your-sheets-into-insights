# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages
RUN pnpm --filter @weaveviz/shared build

# Build API
RUN pnpm --filter @weaveviz/api build

# Production stage
FROM node:20-alpine AS production

# Install pnpm and curl for healthcheck
RUN npm install -g pnpm && apk add --no-cache curl

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Generate Prisma client and start
CMD ["sh", "-c", "pnpm prisma generate && pnpm start"]
