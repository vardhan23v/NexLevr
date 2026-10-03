---
title: Created `frontend/src/hooks/useTasks.ts` implementing t
slug: created-frontend-src-hooks-usetasks-ts-implementing-t
tags: 
scope: project
updated_at: 2026-10-03T05:38:42.958Z
source: live
hook: Created `frontend/src/hooks/useTasks.ts` implementing task data fetching, filtering, creat
sessions: s_1790957891618_vcg6g7
---

- Created `frontend/src/hooks/useTasks.ts` implementing task data fetching, filtering, creation, updates, status changes, and deletion via API
- Created `frontend/src/app/tasks/page.tsx` with toggle between Kanban and List views
- Created `frontend/src/components/tasks/TaskKanban.tsx` with columns: Todo, In Progress, Review, Completed
- Created `frontend/src/components/tasks/TaskList.tsx` with sortable columns, priority badges, and due-date indicators (red for overdue, yellow for due soon)
- Created `frontend/src/components/tasks/TaskForm.tsx` with user assignment dropdown, client/campaign linking, priority select, and due-date picker
- Implemented status moves via API updates using backend task endpoints
- Added TypeScript types in `frontend/src/types/index.ts` aligned with backend Prisma schema
- Verified end-to-end functionality with probe scripts testing all task operations
- Maintained consistency with existing frontend patterns used for clients, campaigns, and leads
- Ensured role-aware UI behavior matching backend RBAC permissions
- Confirmed application remains runnable with all new components integrated
• Created `frontend/src/hooks/useActivities.ts` to fetch activities with filters
• Created `frontend/src/hooks/useNotifications.ts` to manage notifications with read/unread states
• Implemented `frontend/src/components/dashboard/RecentActivity.tsx` with vertical timeline UI
• Created `frontend/src/components/notifications/NotificationDropdown.tsx` with bell icon, badge, dropdown list, and mark-as-read functionality
• Built `frontend/src/app/notifications/page.tsx` for full paginated notification history
• Updated `frontend/src/components/layout/Header.tsx` to mount notification dropdown
• Fixed typed-routes type error in Header by adding `as const` to NAV_ITEMS
• Removed unused `DashboardLayout` import in `frontend/src/app/clients/page.tsx`
• Verified frontend typechecking and build succeed
• Confirmed backend activity/notification API passes all 31 probe checks
• Backend typechecking passes
• Linting shows 9 pre-existing unrelated errors that were not addressed
- Fixed frontend types to match backend DTOs exactly
- Implemented useTasks hook with TanStack Query for task CRUD operations and invalidation
- Implemented useUsers hook with TanStack Query for user CRUD operations and invalidation
- Updated tasks page to consume new hooks and render loading skeletons, empty states, and modals
- Added QueryClientProvider to wrap app for React Query
- Verified type safety, linting, and build integrity across frontend and backend
• Created `frontend/src/app/settings/page.tsx` as a protected page using `ProtectedRoute` that allows current user to view and update profile (name, email, password) via `useAuth` hook
• Added 'Settings' link to sidebar in `frontend/src/components/layout/Sidebar.tsx` pointing to `/settings`
• Created `frontend/src/components/ui/card.tsx` as missing shadcn component
• Modified `frontend/src/context/AuthContext.tsx` to expose `updateProfile` method that calls `PUT /users/:id` and refreshes local user state
• Updated `backend/src/routes/user.routes.ts` and `backend/src/controllers/user.controller.ts` to allow authenticated users to update their own profile while maintaining admin-only access for list/create/delete operations
• Relaxed role restrictions on `/users/:id` PATCH endpoint so users can update their own profile data but not role or disabled status
• Verified typechecking, linting, and building for both frontend and backend
• Settings page form initializes from current user object but doesn't auto-sync if auth loading state changes after render
