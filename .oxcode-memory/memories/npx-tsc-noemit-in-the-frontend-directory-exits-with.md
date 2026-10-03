---
title: `npx tsc --noEmit` in the frontend directory exits with
slug: npx-tsc-noemit-in-the-frontend-directory-exits-with
tags: 
scope: project
updated_at: 2026-10-03T05:50:26.286Z
source: live
hook: `npx tsc --noEmit` in the frontend directory exits with no errors
sessions: s_1790957891618_vcg6g7
---

- `npx tsc --noEmit` in the frontend directory exits with no errors
- `npx next build` in the frontend directory compiles successfully and prerenders all 15 routes, including the new Settings page and all existing feature pages
- The frontend directory's TypeScript configuration (`tsconfig.json`) is set up for strict checking
- The frontend uses Next.js 16 with TypeScript, Tailwind CSS, and shadcn/ui
- The frontend's build process includes checking all feature pages and the new Settings page
- The project's root `package.json` defines `build:frontend` script that runs `npm run build --workspace=frontend`
- The frontend's `package.json` includes dependencies like `axios`, `recharts`, `lucide-react`, `zod`, `clsx`, `tailwind-merge`
- The frontend's `tsconfig.json` is configured for strict TypeScript settings
- The frontend's `src/app/settings/page.tsx` is a client component with ProtectedRoute wrapping
- The frontend's `src/components/layout/Sidebar.tsx` includes a Settings navigation item
- The frontend's `src/context/AuthContext.tsx` provides authentication context and handles user state
- The frontend's `src/lib/api.ts` creates an Axios instance using `NEXT_PUBLIC_API_URL`
- The frontend's `src/hooks/useTasks.ts` exports Zod schemas and hook interfaces for task management
- The frontend's `src/hooks/useUsers.ts` exports Zod schemas and hook interfaces for user management
- The frontend's `src/types/index.ts` defines enums and interfaces used throughout the frontend
- The frontend's `src/app/layout.tsx` wraps children with `AuthProvider` and `QueryClientProvider`
- The frontend's `src/app/tasks/page.tsx` is a client component with `useTasks` hook
- The backend's `src/routes/user.routes.ts` defines user-related routes with authentication and role-based access control
- The backend's `src/controllers/user.controller.ts` implements user CRUD operations with validation and authorization checks
- The backend's `src/services/user.service.ts` provides service layer functions for user operations
- The backend's `src/validators/user.validator.ts` contains Zod schemas for user creation and update
- The backend's `src/app.ts` exports a function `createApp()` that initializes the Express application
- The backend's `tsconfig.json` is configured for strict TypeScript compilation
- The project's root `package.json` includes scripts for building frontend and backend
- The project's root `package.json` includes a `prisma` seed configuration pointing to `tsx prisma/seed.ts`
- The project's `prisma/seed.ts` is the single source of truth for demo data
- The project's `prisma/schema.prisma` is at the default location and contains the database schema
- The project's `backend/src/config/database.ts` configures the Prisma client with global singleton pattern
- The project's `backend/src/services/auth.service.ts` handles authentication logic including registration, login, and token generation
- The project's `backend/src/routes/auth.routes.ts` defines authentication endpoints
- The project's `backend/src/middleware/auth.middleware.ts` authenticates requests with JWT
- The project's `backend/src/middleware/rbac.ts` enforces role-based access control
- The project's `backend/src/utils/password.ts` provides password hashing and comparison utilities
- The project's `backend/src/utils/jwt.ts` generates and verifies JWT tokens
- The project's `backend/src/validators/auth.validator.ts` contains Zod schemas for authentication inputs
- The project's `backend/src/controllers/auth.controller.ts` implements authentication controller methods
- The project's `backend/src/services/activity.service.ts` manages activity logging
- The project's `backend/src/services/notification.service.ts` manages notification handling
- The project's `backend/src/validators/activity.validator.ts` contains Zod schemas for activity validation
- The project's `backend/src/validators/notification.validator.ts` contains Zod schemas for notification validation
- The project's `backend/src/controllers/activity.controller.ts` implements activity controller methods
- The project's `backend/src/controllers/notification.controller.ts` implements notification controller methods
- The project's `backend/src/routes/activity.routes.ts` defines activity-related routes
- The project's `backend/src/routes/notification.routes.ts` defines notification-related routes
- The project's `frontend/src/hooks/useActivities.ts` implements activity data fetching hooks
- The project's `frontend/src/hooks/useNotifications.ts` implements notification data fetching hooks
- The project's `frontend/src/components/notifications/NotificationDropdown.tsx` displays notifications
- The project's `frontend/src/app/notifications/page.tsx` displays notifications page
- The project's `frontend/src/components/layout/Header.tsx` renders the application header
- The project's `frontend/src/components/layout/DashboardLayout.tsx` provides layout structure
- The project
