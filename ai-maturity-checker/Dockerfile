# syntax=docker.io/docker/dockerfile:1
# Optimized for Next.js on Red Hat UBI/OpenShift

# ----------------------------
# Base image
# ----------------------------
FROM registry.access.redhat.com/ubi8/nodejs-20:latest AS base

WORKDIR /opt/app-root/src

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# ----------------------------
# Dependencies stage
# ----------------------------
FROM base AS deps

# Copy package manifests and lockfiles
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Install dependencies
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ----------------------------
# Builder stage
# ----------------------------
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /opt/app-root/src/node_modules ./node_modules

# Copy full source code
COPY . .

# Copy environment example
# COPY .env.example .env.local

# Ensure proper permissions before build
USER root
RUN chmod -R g+rwX /opt/app-root/src
USER 1001

# Build Next.js
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ----------------------------
# Runner stage
# ----------------------------
FROM base AS runner

WORKDIR /opt/app-root/src

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy public folder
COPY --from=builder /opt/app-root/src/public ./public

# Copy Next.js standalone output and static files
COPY --from=builder /opt/app-root/src/.next/standalone ./ 
COPY --from=builder /opt/app-root/src/.next/static ./.next/static

# Ensure OpenShift-friendly permissions
USER root
RUN chmod -R g+rwX /opt/app-root/src
USER 1001

EXPOSE 3000

# Start the Next.js server
CMD ["node", "server.js"]