---
title: `backend/src/validators/task.validator.ts` contains Zod
slug: backend-src-validators-task-validator-ts-contains-zod
tags: 
scope: project
updated_at: 2026-10-02T18:42:11.551Z
source: live
hook: `backend/src/validators/task.validator.ts` contains Zod schemas `CreateTaskSchema`, `Updat
sessions: s_1790957891618_vcg6g7
---

- `backend/src/validators/task.validator.ts` contains Zod schemas `CreateTaskSchema`, `UpdateTaskSchema`, `UpdateTaskStatusSchema` with fields: title, description, assignedUserId, clientId, campaignId, priority, dueDate, status
- `backend/src/services/task.service.ts` implements CRUD operations with Prisma client, includes relations for assignedUser, client, campaign, supports search, filtering, pagination, sorting, and statistics aggregation
- `backend/src/controllers/task.controller.ts` exports controller functions for all task operations with validation using Zod schemas, activity logging, and notification creation on task assignment and status changes
- `backend/src/routes/task.routes.ts` defines `/api/tasks` routes at path `/api/tasks` with full CRUD support, protected by `requireAuth` middleware, mutation routes restricted to roles `ADMIN` and `MANAGER`
- `backend/src/app.ts` registers the task routes at `/api/tasks` under the main Express application instance
- Task creation triggers notification creation for assigned user via `createNotification` helper
- Task updates and status changes trigger activity logging via `logActivity` helper
- Task service validates existence of assigned user, client, and campaign before operations
- Controller functions handle Zod validation errors with 400 status and detailed error messages
- Controller functions handle database errors with appropriate HTTP status codes (404 for not found, 500 for internal errors)
- Task status and priority fields use Prisma client enums `TaskStatus` and `TaskPriority`
- Search functionality in task service supports case-insensitive title and description matching
- Pagination uses `skip` and `take` with configurable page size and total count calculation
- Sorting supports multiple fields: title, priority, status, dueDate, createdAt, updatedAt
- Statistics endpoints aggregate task counts by status and priority using Prisma's groupBy
- Task routes support filtering by status, priority, assignedUserId, clientId, campaignId
- Task routes support searching via query parameter `search`
- Task routes support sorting via query parameters `sortBy` and `sortOrder`
- Task routes support pagination via query parameters `page` and `limit`
- Notification types include `TASK_ASSIGNED` and `TASK_STATUS_CHANGED`
- Activity actions include `CREATED`, `UPDATED`, `STATUS_CHANGED`, `DELETED`
- Controller functions properly pass through user context from authentication middleware to activity logging and notifications
- All routes require authentication via `requireAuth` middleware
- Mutation routes (POST, PUT, PATCH, DELETE) require authorization via `requireRole` middleware with roles `ADMIN` and `MANAGER`
- The task service's `getTasks` function accepts a `TaskFilters` interface with optional fields for search, status, priority, assignedUserId, clientId, campaignId, page, limit, sortBy, and sortOrder
- The task controller's `createTask` function logs activity with metadata including title, priority, and status
- The task controller's `updateTask` function logs activity with metadata including title and updated fields
- The task controller's `updateTaskStatus` function logs activity with metadata including title, oldStatus, and newStatus
- The task controller's `deleteTask` function logs activity with metadata including title
- The task controller's `createTask` function creates a notification with title "New Task Assigned" when a task is created
- The task controller's `updateTask` function creates a notification with title "Task Status Updated" when task status changes
- The task controller's `updateTask` function creates a notification with title "Task Assigned to You" when task is reassigned
- The task controller's `updateTaskStatus` function creates a notification with title "Task Status Updated" when task status changes
- The task controller's `getMyTasks` function filters tasks by assigned user ID from request context
- The task controller's `getTaskStats` function aggregates task counts by status and priority
- The task controller's `getTasks` function returns paginated results with total count and page information
- The task controller's `getTaskById` function returns individual task with included relations
- The task controller's `createTask` function validates input against `CreateTaskSchema`
- The task controller's `updateTask` function validates input against `UpdateTaskSchema`
- The task controller's `updateTaskStatus` function validates input against `UpdateTaskStatusSchema`
- The task controller's `createTask`, `updateTask`, and `updateTaskStatus` functions handle Zod validation errors with 400 status and detailed error messages
- The task controller's `createTask`, `updateTask`, `updateTaskStatus`, and `deleteTask` functions handle database errors with appropriate HTTP status codes
- The task controller's `createTask`, `updateTask`, and `updateTaskStatus` functions handle missing or invalid IDs with appropriate error messages
- The task controller's `createTask`, `updateTask`, and `updateTaskStatus` functions handle cases where
• Created `backend/src/validators/analytics.validator.ts` with Zod schema for analytics query parameters
• Implemented `backend/src/services/analytics.service.ts` with Prisma aggregate, groupBy, and count functions for dashboard stats, campaign performance, lead trends, and revenue stats
• Built `backend/src/controllers/analytics.controller.ts` with validated request handling and consistent error responses
• Developed `backend/src/routes/analytics.routes.ts` with GET endpoints at /dashboard, /campaigns, /leads, protected by auth middleware and RBAC
• Integrated analytics routes into `backend/src/app.ts` at /api/analytics
• Verified type safety with `npm run typecheck` passing
• Confirmed API functionality through comprehensive test script validating all endpoints, error cases, and permission levels
