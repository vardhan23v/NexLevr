---
title: Created `prisma/seed.ts` implementing database seeding 
slug: created-prisma-seed-ts-implementing-database-seeding
tags: 
scope: project
updated_at: 2026-10-03T05:49:36.345Z
source: live
hook: Created `prisma/seed.ts` implementing database seeding with safe clear-insert order
sessions: s_1790957891618_vcg6g7
---

• Created `prisma/seed.ts` implementing database seeding with safe clear-insert order
• Seeded 3 users (Admin, Manager, Team Member) with bcrypt-hashed passwords
• Seeded 5 clients across diverse industries
• Seeded 8 campaigns with varied types and statuses
• Seeded 20 leads distributed across all statuses
• Seeded 15 tasks with priorities and due dates
• Seeded 8 activities and 5 notifications
• Updated `backend/package.json` to reference seed script at `../prisma/seed.ts`
• Added `"type": "module"` to `prisma/package.json` for ESM compatibility
• Verified seed execution with count probes and password validation
• Confirmed `npm run typecheck` and `npm run build` pass
• Added `prisma.seed` field to root `package.json` pointing to `tsx prisma/seed.ts`
• Installed `tsx` as a root dev dependency
• Updated root package scripts to invoke Prisma CLI commands directly
• Verified `npx prisma db seed` executes successfully with correct data seeding
• Confirmed Prisma schema resolves at default location `prisma/schema.prisma`
- Running `npx prisma migrate dev --name init` generates and applies a Prisma migration
- Running `npx prisma db seed` executes the seed script at `prisma/seed.ts` to populate the database
- PostgreSQL container is accessible via `docker exec nexlevr-postgres psql -U nexlevr -d nexlevr`
- The database schema is defined in `prisma/schema.prisma`
- Seeded data includes 3 users, 5 clients, 8 campaigns, 20 leads, 15 tasks, 8 activities, and 5 notifications
- Migration file is located at `prisma/migrations/20250101_init/migration.sql`
- The Prisma client connects to the database via `DATABASE_URL` environment variable
- Commands `npx prisma migrate deploy` and `npx prisma db seed` are used to apply migrations and seed data respectively
- Database queries can be executed directly using `psql` inside the PostgreSQL container
- The `prisma/seed.ts` file is the single source of truth for demo data
- The project uses a multi-stage Docker setup for backend and frontend
- The `package.json` at project root contains scripts for database operations including `db:migrate`, `db:seed`, and `db:reset`
