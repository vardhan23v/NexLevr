# Complete the NexLevr Client & Campaign Management Platform by diagnosing and fixing the currently modified backend/frontend files, creating missing pages (Settings), finalizing the database seed script, running migrations, and verifying full-stack type safety and build integrity.

## Review

Reviewed before you saw it: Step s4 only mounts userRoutes in app.ts, but git status shows untracked route modules for auth, client, campaign, lead, task, activity, notification, and analytics; since app.ts is currently modified, it risks shipping an incomplete API surface if the other routes are not also verified and mounted.; The files array places prisma/seed.ts at the project root and the PROJECT DOSSIER lists prisma as a top-level subfolder, yet step s9 and check c3 previously executed `cd backend && npx prisma ...`; without a schema path override, Prisma would look for schema.prisma inside backend/prisma and fail.; Check c3 relies on `npx prisma db seed`, but the original plan never configured the Prisma seed command in package.json; without a `prisma.seed` field, the CLI cannot locate or run the seed script, so a new step and check have been added to ensure it is configured.; process.exit (asserted by "Database seed script exists and runs successfully") is named nowhere in the task, so this check could only be satisfied by inventing it

## Structure

Files and folders this plan touches or creates:

```
backend/
  src/
    controllers/
      user.controller.ts
    routes/
      user.routes.ts
    services/
      user.service.ts
    app.ts
frontend/
  src/
    app/
      settings/
        page.tsx
      tasks/
        page.tsx
    hooks/
      useTasks.ts
      useUsers.ts
    types/
      index.ts
prisma/
  seed.ts
package.json
README.md
```

- `backend/src/app.ts` - Fix route wiring for user routes and ensure all middleware is correctly applied
- `backend/src/controllers/user.controller.ts` - Fix user CRUD operations with proper role-based access control
- `backend/src/routes/user.routes.ts` - Fix user route definitions and middleware chain
- `backend/src/services/user.service.ts` - Fix user business logic and password hashing on update
- `frontend/src/app/tasks/page.tsx` - Fix task list/kanban integration with working hooks and types
- `frontend/src/hooks/useTasks.ts` - Fix task data fetching, caching, and mutation logic
- `frontend/src/hooks/useUsers.ts` - Fix user data fetching for admin and task assignment flows
- `frontend/src/types/index.ts` - Fix shared TypeScript interfaces to align with backend API contracts
- `frontend/src/app/settings/page.tsx` - Create Settings page for profile management and wire into navigation
- `prisma/seed.ts` - Create complete seed script with realistic demo data for all entities
- `package.json` - Configure Prisma seed command and workspace scripts so npx prisma db seed works
- `README.md` - Update with final setup, environment, and deployment instructions

## Steps

1. **Audit modified backend files**
   Read backend/src/app.ts, backend/src/controllers/user.controller.ts, backend/src/routes/user.routes.ts, and backend/src/services/user.service.ts. Document exactly which imports are broken, which routes are missing from app.ts, and where role checks are incomplete so the fix steps are precise.

2. **Audit modified frontend files**
   Read frontend/src/app/tasks/page.tsx, frontend/src/hooks/useTasks.ts, frontend/src/hooks/useUsers.ts, and frontend/src/types/index.ts. Identify type mismatches, missing error handling, broken imports, and stale query keys that are preventing the UI from compiling or fetching data correctly.

3. **Audit database schema and seed state**
   Read prisma/schema.prisma to confirm all models (User, Client, Campaign, Lead, Task, Activity, Notification) exist with proper relations, indexes, and cascading rules. Check whether prisma/seed.ts exists and what it currently contains.

4. **Fix backend user module and app wiring**
   Edit backend/src/services/user.service.ts to ensure password hashing on create/update and safe filtering by role. Edit backend/src/controllers/user.controller.ts to return consistent API responses and enforce admin-only access for list/create/delete. Edit backend/src/routes/user.routes.ts to apply authMiddleware and roleMiddleware(['ADMIN']) where required. Edit backend/src/app.ts to import and mount userRoutes under /api/users, and verify that auth, client, campaign, lead, task, activity, notification, and analytics routes are also mounted so the full API surface is reachable.
   Interfaces: getAllUsers(): Promise<User[]>, createUser(data: CreateUserInput): Promise<User>, updateUser(id: string, data: UpdateUserInput): Promise<User>, deleteUser(id: string): Promise<void>

5. **Fix frontend tasks and users integration**
   Edit frontend/src/types/index.ts to match the backend DTOs exactly. Edit frontend/src/hooks/useTasks.ts to use the correct API endpoints from frontend/src/lib/api.ts and handle mutations with proper invalidation. Edit frontend/src/hooks/useUsers.ts to fetch users for assignment dropdowns. Edit frontend/src/app/tasks/page.tsx to consume the fixed hooks, render loading skeletons, empty states, and the task creation modal correctly.
   Interfaces: useTasks(): UseQueryResult<Task[]>, useCreateTask(): UseMutationResult<Task, Error, CreateTaskInput>, useUsers(): UseQueryResult<User[]>

6. **Create Settings page and wire navigation**
   Create frontend/src/app/settings/page.tsx as a protected page wrapped in ProtectedRoute. It should allow the current user to view and update their profile (name, email, password) using the useAuth hook. Add a 'Settings' link to the sidebar in frontend/src/components/layout/Sidebar.tsx if it is missing, pointing to /settings.
   Interfaces: SettingsPage(): JSX.Element

7. **Implement database seed script**
   Create prisma/seed.ts that clears existing data in safe order and inserts: 3 users (Admin, Manager, Team Member with bcrypt-hashed passwords), 5 clients across different industries, 8 campaigns of varied types/statuses, 20 leads distributed across statuses, 15 tasks with priorities and due dates, and corresponding activities/notifications. Use the Prisma client directly and wrap in an async main() function.
   Interfaces: main(): Promise<void>

8. **Configure Prisma seed command**
   Edit root package.json to add a prisma.seed field pointing to the seed script (e.g., using tsx or ts-node). Ensure the Prisma CLI can resolve the schema at the project root. If tsx is not installed, add it as a dev dependency at the root.

9. **Run database migration and seed**
   From the project root, generate and apply the Prisma migration with `npx prisma migrate dev --name init`, then run `npx prisma db seed`. Verify that PostgreSQL contains the seeded data by querying at least the users and clients tables.

10. **Type-check backend**
   Run `npx tsc --noEmit` in the backend directory. Fix any TypeScript errors related to the user module, missing types, or incorrect Prisma client usage. Do not proceed until this exits cleanly.

11. **Type-check and build frontend**
   Run `npx tsc --noEmit` in the frontend directory. If clean, run `next build` to verify the production bundle compiles, including the new Settings page and all existing feature pages. Fix any type or import errors surfaced.

12. **Final integration verification**
   Start the backend server and frontend dev server. Log in as each seeded role (Admin, Manager, Team Member) and verify: dashboard loads with real data, clients CRUD works, campaigns list renders, leads kanban moves cards, tasks page shows tasks, analytics charts populate from API, notifications dropdown fetches items, admin users page is accessible only to Admin, and settings page updates profile.

## Acceptance checks

- Backend TypeScript compiles without errors (`cd backend && npx tsc --noEmit`)
- Frontend TypeScript compiles without errors (`cd frontend && npx tsc --noEmit`)
- Settings page exists in the frontend app directory (`node -e "process.exit(require('fs').existsSync('frontend/src/app/settings/page.tsx')?0:1)"`)
- User routes are mounted in backend app.ts (`node -e "const fs=require('fs'); const t=fs.readFileSync('backend/src/app.ts','utf8'); process.exit(t.includes('/api/users')||t.includes('userRoutes')?0:1)"`)
- Root package.json defines Prisma seed command (`node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8')); process.exit(p.prisma&&p.prisma.seed?0:1)"`)

---

Written by OxCode for you to read. Editing this file does not change the run: use the comment box on the plan card to ask for changes.
