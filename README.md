# 🟠 SWAPBUDS Frontend

> **Modern React UI for the SWAPBUDS Trading Platform**

A production-ready Next.js 14 application with App Router, shadcn/ui components, and comprehensive error tracking.

[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

---

## 📖 Overview

This is the frontend application for SWAPBUDS, providing an intuitive user interface for browsing, trading, and managing items. Built with Next.js 14 and following modern React best practices.

---

## ✨ Features

### Implemented

- ✅ Authentication UI (login, register, protected routes)
- ✅ Responsive design with shadcn/ui components
- ✅ Form validation with React Hook Form + Zod
- ✅ State management with Zustand (persisted)
- ✅ Data fetching with TanStack Query
- ✅ Error tracking with Sentry (production only)
- ✅ Toast notifications with Sonner
- ✅ JWT token management with Axios interceptors
- ✅ Custom logger utility
- ✅ Path aliases with `@/` prefix

### In Progress

- 🚧 Items marketplace pages
- 🚧 User profile management
- 🚧 Trading interface
- 🚧 Real-time chat UI
- 🚧 Notifications system

---

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **shadcn/ui** - Beautiful, accessible UI components
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Zustand** - Lightweight state management with persistence
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form validation with Zod schemas
- **Sentry** - Error tracking and performance monitoring
- **Axios** - HTTP client with JWT interceptors
- **Sonner** - Toast notifications
- **TypeScript** - Type safety with `@/` path aliases

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- Backend API running (see [backend README](../swapbuds-backend/README.md))

### Installation

```bash
# Install dependencies
yarn install
```

### Environment Setup

Create a `.env.local` file in the root:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Sentry (optional for local dev)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Cloudinary (optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### Running the App

```bash
# Development mode
yarn dev

# Production build
yarn build
yarn start

# Lint
yarn lint

# Format
yarn format
```

### Access Point

- **Frontend:** http://localhost:3000

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/        # Protected routes (home, profile)
│   │   └── home/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Custom components
├── lib/                    # Utilities and configuration
│   ├── api.ts              # Axios instance with interceptors
│   ├── logger.ts           # Custom logger with Sentry
│   └── utils.ts            # Helper functions
├── hooks/                  # Custom React hooks
├── store/                  # Zustand stores
│   └── auth.store.ts       # Auth state management
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles

public/                     # Static assets
components.json             # shadcn/ui configuration
tailwind.config.ts          # TailwindCSS configuration
```

---

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for components:

```bash
# Add new component
npx shadcn-ui@latest add button

# Available components
npx shadcn-ui@latest add [component-name]
```

Installed components:

- Button, Input, Label, Card
- Form, Toast, Dialog
- Avatar, Badge, Separator
- And more...

---

## 🔐 Authentication

### JWT Token Management

Tokens are automatically managed by Axios interceptors:

```typescript
// Stored in Zustand with persistence
const { token, setToken } = useAuthStore();

// Automatically attached to requests
axios.get("/api/items"); // Includes: Authorization: Bearer {token}

// Auto-redirect on 401
// Handled by axios interceptor
```

### Protected Routes

```typescript
// app/(protected)/home/page.tsx
// Automatically checks for auth token
// Redirects to /login if not authenticated
```

---

## 🐛 Error Tracking

### Sentry Integration

Errors are automatically tracked in production:

```typescript
import { logger } from "@/lib/logger";

// Log errors
try {
  // code
} catch (error) {
  logger.error("Something went wrong", { error, context: "ComponentName" });
}

// Log API errors
logger.apiError(error, { url: "/api/items", method: "POST" });
```

**Environment-based logging:**

- **Development:** Logs to console only
- **Production:** Logs to console + sends to Sentry

---

## 📝 Path Aliases

TypeScript path aliases configured in `tsconfig.json`:

```typescript
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/lib/logger";
```

All imports use the `@/` prefix for cleaner code.

---

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI

   ```bash
   npm i -g vercel
   ```

2. Deploy

   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Environment Variables (Production)

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app/api
NEXT_PUBLIC_SENTRY_DSN=your-production-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

---

## 🧪 Testing

```bash
# Run tests (when implemented)
yarn test

# Run tests in watch mode
yarn test:watch

# Coverage
yarn test:coverage
```

---

## 🐛 Troubleshooting

### API Connection Issues

```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check NEXT_PUBLIC_API_URL in .env.local
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
yarn install
```

### Sentry Not Working

```bash
# Verify environment variables
echo $NEXT_PUBLIC_SENTRY_DSN

# Check NODE_ENV (Sentry only works in production)
echo $NODE_ENV
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Main Project README](../README.md)

---

## 📬 Support

For issues and questions:

- Open an issue on [GitHub](https://github.com/BereDarius/swapbuds-frontend/issues)
- Check the [main project](https://github.com/BereDarius/swapbuds)

---

<div align="center">
  <p>Part of the <a href="https://github.com/BereDarius/swapbuds">SWAPBUDS</a> project</p>
  <p>Made with ❤️ using Next.js</p>
</div>
