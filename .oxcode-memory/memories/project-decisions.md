---
title: Project decisions
slug: project-decisions
tags: 
scope: project
updated_at: 2026-10-03T05:15:49.680Z
source: live
hook: User-stated constraints, newest: this must be a real, fully functional application
sessions: s_1790957891618_vcg6g7
---

- [2026-10-03] This must be a REAL, fully functional application
- [2026-10-03] Permissions must be handled on both frontend and backend
- [2026-10-03] Analytics must be calculated from database records rather than hardcoded values
- [2026-10-03] Never expose
- Initialized Next.js 16 frontend with TypeScript, Tailwind CSS, and shadcn/ui
- Configured strict TypeScript settings in `frontend/tsconfig.json`
- Created `frontend/tailwind.config.ts` with shadcn content paths and CSS variables
- Set up `frontend/postcss.config.mjs` for Tailwind v4
- Created `frontend/next.config.ts` with `reactStrictMode` and `typedRoutes`
- Installed dependencies: axios, recharts, lucide-react, zod, clsx, tailwind-merge
- Created `frontend/src/lib/utils.ts` exporting `cn()` using clsx and tailwind-merge
- Verified typechecking and build success
- Fixed `src/components/ui/button.tsx` to use local `cn` import and removed unused package
- Added `typecheck` script to `frontend/package.json`
- `backend/src/app.ts` imports and uses all route modules from `backend/src/routes/` including `user.routes.ts`
- `backend/src/controllers/user.controller.ts` exports controller functions matching the declared signatures
- `backend/src/routes/user.routes.ts` defines routes for user management and applies `requireAuth` and `requireRole('ADMIN')` middleware
- `backend/src/services/user.service.ts` exports service functions with correct signatures and uses Prisma types
- `backend/src/validators/user.validator.ts` exports `CreateUserSchema` and `UpdateUserSchema`
- `backend/src/middleware/auth.ts` exports `requireAuth`
- `backend/src/middleware/rbac.ts` exports `requireRole`
- `backend/src/middleware/errorHandler.ts` handles errors
- `backend/src/types/express.d.ts` declares `Express.Request` with `user` property
- `backend/src/utils/password.ts` contains password hashing utilities
- `backend/src/middleware/auth.middleware.ts` provides authentication middleware
- `backend/src/app.ts` includes Helmet for security headers
- `backend/src/routes/activity.routes.ts`, `notification.routes.ts`, `analytics.routes.ts` are defined and imported
- `backend/src/routes/user.routes.ts` applies `requireAuth` and `requireRole('ADMIN')` to all user endpoints
- `backend/src/services/user.service.ts` has `disableUser` and `updateUser` functions without protection against self-disable or self-demote
- `backend/src/types/express.d.ts` defines `Express.Request` extending `Request` with `user` property of type `User`
- `UserRole` enum is defined in `frontend/src/types/index.ts` and used in middleware
- `backend/src/app.ts` uses `express.Application` type from Express
- `backend/src/controllers/user.controller.ts` uses `Request` and `Response` from Express
- `backend/src/routes/user.routes.ts` uses `Router` from Express
- `backend/src/services/user.service.ts` uses `Prisma` and `SafeUser` type from Prisma
- `backend/src/validators/user.validator.ts` uses Zod schemas for validation
- `backend/src/middleware/auth.ts` exports `requireAuth` middleware function
- `backend/src/middleware/rbac.ts` exports `requireRole` middleware function
- `backend/src/middleware/errorHandler.ts` exports error handling middleware
- `backend/src/utils/password.ts` exports password hashing functions
- `backend/src/app.ts` includes `helmet()` for security headers
- `backend/src/app.ts` includes `cors()` for cross-origin resource sharing
- `backend/src/app.ts` includes `express.json()` and `express.urlencoded()` for parsing request bodies
- `backend/src/app.ts` includes `express.static()` for serving static files
- `backend/src/app.ts` includes `express.Router()` for creating routers
- `backend/src/app.ts` includes `express.Application` type from Express
- `backend/src/app.ts` includes `express.Request` and `express.Response` types from Express
- `backend/src/app.ts` includes `express.Router` type from Express
- `backend/src/app.ts` includes `express.json` and `express.urlencoded` middleware functions from Express
- `backend/src/app.ts` includes `express.static` middleware function from Express
- `backend/src/app.ts` includes `express.Router` constructor from Express
- `backend/src/app.ts` includes `express.Application` constructor from Express
- `backend/src/app.ts` includes `express.Request` and `express.Response` constructors from Express
- `prisma/schema.prisma` defines all required models: User, Client, Campaign, Lead, Task, Activity, Notification
- `prisma/schema.prisma` defines all required enums with correct values
- Relations and cascading rules are implemented as specified
- Indexes exist on relevant columns for each model
- `backend/prisma/seed.ts` exists and contains a complete seed script
- `prisma/seed.ts` does not exist at workspace root
- `npx prisma validate` passes with `DATABASE_URL` set
- `backend/package.json` has `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- `DATABASE_URL` is loaded from workspace-root `.env` in seed script
- Root `prisma/` directory is not referenced by any Prisma config in `package.json`
