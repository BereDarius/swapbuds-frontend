# Stage 1: Builder
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install ONLY dependencies needed to build Next.js (skip all dev tools)
RUN yarn install --frozen-lockfile --production \
    && yarn add -D next @next/bundle-analyzer \
    && yarn add -D typescript @types/node @types/react @types/react-dom

# Copy source code
COPY . .

# Build Next.js in production mode with standalone output
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production
# Disable Sentry source map upload in Docker builds
ENV SENTRY_UPLOAD_DRY_RUN=true
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn build

# Stage 2: Runner
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only the necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Start Next.js server
CMD ["node", "server.js"]
