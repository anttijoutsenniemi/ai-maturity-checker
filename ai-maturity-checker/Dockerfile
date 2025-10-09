# syntax=docker.io/docker/dockerfile:1
# This image is optimized for running Next.js applications in Rahti-2 and OpenShift environments.
FROM registry.access.redhat.com/ubi8/nodejs-20:latest AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /opt/app-root/src

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /opt/app-root/src
COPY --from=deps /opt/app-root/src/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED=1

# Use .env.example for production builds
#COPY .env.example .env.local

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /opt/app-root/src

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Set the correct permission for prerender cache
RUN mkdir -p .next/cache/images
COPY --from=builder /opt/app-root/src/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder /opt/app-root/src/.next/standalone ./
COPY --from=builder /opt/app-root/src/.next/static ./.next/static

# Fix permissions for OpenShift/UBI environment
# Using more OpenShift-friendly approach for permissions
USER root
RUN chmod -R g+rwX /opt/app-root/src
USER 1001

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]