# Build the NexLevr Client & Campaign Management Platform, a production-quality full-stack SaaS application with Next.js 16 frontend, Express/TypeScript backend, PostgreSQL database, JWT authentication, role-based access control, and fully functional CRUD for clients, campaigns, leads, tasks, analytics, notifications, activities, and user management.

## Structure

Files and folders this plan touches or creates:

```
backend/
  src/
    config/
      database.ts
    controllers/
      activity.controller.ts
      analytics.controller.ts
      auth.controller.ts
      campaign.controller.ts
      client.controller.ts
      lead.controller.ts
      notification.controller.ts
      task.controller.ts
      user.controller.ts
    middleware/
      auth.ts
      errorHandler.ts
      rateLimiter.ts
      rbac.ts
    routes/
      activity.routes.ts
      analytics.routes.ts
      auth.routes.ts
      campaign.routes.ts
      client.routes.ts
      lead.routes.ts
      notification.routes.ts
      task.routes.ts
      user.routes.ts
    services/
      activity.service.ts
      analytics.service.ts
      auth.service.ts
      campaign.service.ts
      client.service.ts
      lead.service.ts
      notification.service.ts
      task.service.ts
      user.service.ts
    types/
      express.d.ts
    utils/
      jwt.ts
      password.ts
      response.ts
    validators/
      auth.validator.ts
      campaign.validator.ts
      client.validator.ts
      lead.validator.ts
      task.validator.ts
      user.validator.ts
    app.ts
    server.ts
  .env.example
  Dockerfile
  package.json
  tsconfig.json
frontend/
  src/
    app/
      admin/
        users/
          page.tsx
      analytics/
        page.tsx
      campaigns/
        [id]/
          page.tsx
        page.tsx
      clients/
        [id]/
          page.tsx
        page.tsx
      dashboard/
        page.tsx
      leads/
        page.tsx
      login/
        page.tsx
      notifications/
        page.tsx
      register/
        page.tsx
      tasks/
        page.tsx
      layout.tsx
      page.tsx
    components/
      admin/
        UserForm.tsx
        UserTable.tsx
      analytics/
        AnalyticsCharts.tsx
      campaigns/
        CampaignForm.tsx
        CampaignTable.tsx
      clients/
        ClientForm.tsx
        ClientTable.tsx
      dashboard/
        CampaignChart.tsx
        LeadChart.tsx
        RecentActivity.tsx
        StatsCards.tsx
        TaskChart.tsx
      layout/
        Header.tsx
        ProtectedRoute.tsx
        Sidebar.tsx
      leads/
        LeadForm.tsx
        LeadKanban.tsx
      notifications/
        NotificationDropdown.tsx
      tasks/
        TaskForm.tsx
        TaskKanban.tsx
        TaskList.tsx
    context/
      AuthContext.tsx
    hooks/
      useActivities.ts
      useAnalytics.ts
      useAuth.ts
      useCampaigns.ts
      useClients.ts
      useLeads.ts
      useNotifications.ts
      useTasks.ts
    lib/
      api.ts
      utils.ts
    types/
      index.ts
  .env.example
  Dockerfile
  next.config.ts
  package.json
  postcss.config.mjs
  tailwind.config.ts
  tsconfig.json
prisma/
  schema.prisma
  seed.ts
.env.example
.gitignore
docker-compose.yml
package.json
README.md
```

- `README.md` - Project documentation with overview, architecture, setup, and API docs
- `docker-compose.yml` - Local PostgreSQL and optional app container orchestration
- `.env.example` - Root template for environment variables
- `.gitignore` - Ignore node_modules, .env, build artifacts
- `package.json` - Root workspace manifest with frontend and backend workspaces
- `prisma/schema.prisma` - Prisma schema defining User, Client, Campaign, Lead, Task, Activity, Notification models with relations and indexes
- `prisma/seed.ts` - Development seed script with 3 users, 5 clients, 8 campaigns, 20 leads, 15 tasks, activities, and notifications
- `backend/package.json` - Backend dependencies: express, cors, helmet, rate-limit, bcryptjs, jsonwebtoken, zod, prisma, typescript, ts-node, nodemon, dotenv
- `backend/tsconfig.json` - Strict TypeScript configuration for Node/Express
- `backend/.env.example` - Backend environment template: DATABASE_URL, JWT_SECRET, PORT, FRONTEND_URL
- `backend/src/server.ts` - Express server entry point booting the app
- `backend/src/app.ts` - Express app configuration with middleware and route mounting
- `backend/src/config/database.ts` - PrismaClient singleton export
- `backend/src/types/express.d.ts` - TypeScript declaration extending Express.Request with user property
- `backend/src/utils/response.ts` - Standardized success and error JSON response helpers
- `backend/src/utils/jwt.ts` - JWT sign and verify utilities
- `backend/src/utils/password.ts` - Bcrypt password hashing and comparison utilities
- `backend/src/middleware/auth.ts` - JWT verification middleware attaching req.user
- `backend/src/middleware/rbac.ts` - Role-based access control middleware factory
- `backend/src/middleware/errorHandler.ts` - Global Express error handler with safe response formatting
- `backend/src/middleware/rateLimiter.ts` - Express rate limiting configuration
- `backend/src/validators/auth.validator.ts` - Zod schemas for register and login
- `backend/src/validators/client.validator.ts` - Zod schemas for client create and update
- `backend/src/validators/campaign.validator.ts` - Zod schemas for campaign create, update, and status transitions
- `backend/src/validators/lead.validator.ts` - Zod schemas for lead create, update, and status changes
- `backend/src/validators/task.validator.ts` - Zod schemas for task create, update, and assignment
- `backend/src/validators/user.validator.ts` - Zod schemas for user create, update, and role changes
- `backend/src/services/auth.service.ts` - Authentication business logic: register, login, getCurrentUser
- `backend/src/services/client.service.ts` - Client CRUD, search, and filter logic
- `backend/src/services/campaign.service.ts` - Campaign CRUD, status management, and client relation loading
- `backend/src/services/lead.service.ts` - Lead CRUD, pipeline stage transitions, and activity logging
- `backend/src/services/task.service.ts` - Task CRUD, assignment logic, and notification creation
- `backend/src/services/analytics.service.ts` - Dashboard and analytics aggregation queries from database records
- `backend/src/services/activity.service.ts` - Activity creation and retrieval for timeline events
- `backend/src/services/notification.service.ts` - Notification creation, mark-as-read, and mark-all-as-read logic
- `backend/src/services/user.service.ts` - User management CRUD, role updates, and disable/enable for admin panel
- `backend/src/controllers/auth.controller.ts` - HTTP handlers for auth endpoints
- `backend/src/controllers/client.controller.ts` - HTTP handlers for client endpoints
- `backend/src/controllers/campaign.controller.ts` - HTTP handlers for campaign endpoints
- `backend/src/controllers/lead.controller.ts` - HTTP handlers for lead endpoints
- `backend/src/controllers/task.controller.ts` - HTTP handlers for task endpoints
- `backend/src/controllers/analytics.controller.ts` - HTTP handlers for analytics endpoints
- `backend/src/controllers/activity.controller.ts` - HTTP handlers for activity endpoints
- `backend/src/controllers/notification.controller.ts` - HTTP handlers for notification endpoints
- `backend/src/controllers/user.controller.ts` - HTTP handlers for admin user management endpoints
- `backend/src/routes/auth.routes.ts` - Auth routes: POST /register, POST /login, POST /logout, GET /me
- `backend/src/routes/client.routes.ts` - Client routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- `backend/src/routes/campaign.routes.ts` - Campaign routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- `backend/src/routes/lead.routes.ts` - Lead routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- `backend/src/routes/task.routes.ts` - Task routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- `backend/src/routes/analytics.routes.ts` - Analytics routes: GET /dashboard, GET /campaigns, GET /leads
- `backend/src/routes/activity.routes.ts` - Activity routes: GET /
- `backend/src/routes/notification.routes.ts` - Notification routes: GET /, PUT /:id/read, PUT /read-all
- `backend/src/routes/user.routes.ts` - Admin user routes: GET /, POST /, PUT /:id, DELETE /:id
- `backend/Dockerfile` - Multi-stage Docker build for backend
- `frontend/package.json` - Frontend dependencies: next, react, react-dom, typescript, tailwindcss, axios, recharts, lucide-react, zod, shadcn/ui dependencies
- `frontend/tsconfig.json` - Next.js TypeScript configuration
- `frontend/next.config.ts` - Next.js configuration with standalone output and rewrites if needed
- `frontend/tailwind.config.ts` - Tailwind CSS configuration with shadcn theme
- `frontend/postcss.config.mjs` - PostCSS configuration for Tailwind
- `frontend/.env.example` - Frontend environment template: NEXT_PUBLIC_API_URL
- `frontend/src/lib/utils.ts` - cn helper and general utilities
- `frontend/src/lib/api.ts` - Axios instance with JWT interceptor and base URL configuration
- `frontend/src/types/index.ts` - Shared TypeScript interfaces for User, Client, Campaign, Lead, Task, Activity, Notification, and enums
- `frontend/src/context/AuthContext.tsx` - React context providing auth state, login, register, logout, and current user loading
- `frontend/src/hooks/useAuth.ts` - Hook consuming AuthContext
- `frontend/src/hooks/useClients.ts` - Hook for client CRUD and list fetching
- `frontend/src/hooks/useCampaigns.ts` - Hook for campaign CRUD and list fetching
- `frontend/src/hooks/useLeads.ts` - Hook for lead CRUD and Kanban operations
- `frontend/src/hooks/useTasks.ts` - Hook for task CRUD, Kanban, and list operations
- `frontend/src/hooks/useAnalytics.ts` - Hook for analytics data fetching with filters
- `frontend/src/hooks/useActivities.ts` - Hook for activity timeline fetching
- `frontend/src/hooks/useNotifications.ts` - Hook for notification list and read operations
- `frontend/src/components/layout/Sidebar.tsx` - Responsive sidebar navigation with role-based links
- `frontend/src/components/layout/Header.tsx` - Top navigation bar with user menu and notification dropdown
- `frontend/src/components/layout/ProtectedRoute.tsx` - Route guard redirecting unauthenticated users and enforcing role access
- `frontend/src/components/dashboard/StatsCards.tsx` - Dashboard stat cards using real analytics data
- `frontend/src/components/dashboard/RecentActivity.tsx` - Recent activity timeline on dashboard
- `frontend/src/components/dashboard/CampaignChart.tsx` - Recharts campaign performance chart
- `frontend/src/components/dashboard/LeadChart.tsx` - Recharts lead acquisition chart
- `frontend/src/components/dashboard/TaskChart.tsx` - Recharts task completion chart
- `frontend/src/components/clients/ClientForm.tsx` - Modal form for creating and editing clients
- `frontend/src/components/clients/ClientTable.tsx` - Client list table with search, filter, and actions
- `frontend/src/components/campaigns/CampaignForm.tsx` - Modal form for creating and editing campaigns
- `frontend/src/components/campaigns/CampaignTable.tsx` - Campaign list table with search, filter, status changes, and actions
- `frontend/src/components/leads/LeadKanban.tsx` - Kanban board for lead pipeline stages
- `frontend/src/components/leads/LeadForm.tsx` - Modal form for creating and editing leads
- `frontend/src/components/tasks/TaskKanban.tsx` - Kanban board for task statuses
- `frontend/src/components/tasks/TaskList.tsx` - Task list view with priority and due-date indicators
- `frontend/src/components/tasks/TaskForm.tsx` - Modal form for creating and editing tasks
- `frontend/src/components/analytics/AnalyticsCharts.tsx` - Analytics page charts with date/client/campaign filters
- `frontend/src/components/admin/UserTable.tsx` - Admin user management table with roles and status
- `frontend/src/components/admin/UserForm.tsx` - Admin form for creating and editing users
- `frontend/src/components/notifications/NotificationDropdown.tsx` - Notification dropdown with unread count, mark-as-read, and mark-all-as-read
- `frontend/src/app/layout.tsx` - Root layout with providers, Sidebar, Header, and Toaster
- `frontend/src/app/page.tsx` - Root redirect to /dashboard
- `frontend/src/app/login/page.tsx` - Login page with form and validation
- `frontend/src/app/register/page.tsx` - Registration page with form and validation
- `frontend/src/app/dashboard/page.tsx` - Dashboard page composing stats, charts, and recent activity
- `frontend/src/app/clients/page.tsx` - Clients list page
- `frontend/src/app/clients/[id]/page.tsx` - Client detail and campaign history page
- `frontend/src/app/campaigns/page.tsx` - Campaigns list page
- `frontend/src/app/campaigns/[id]/page.tsx` - Campaign detail page
- `frontend/src/app/leads/page.tsx` - Leads pipeline page with Kanban
- `frontend/src/app/tasks/page.tsx` - Tasks page with Kanban and list toggle
- `frontend/src/app/analytics/page.tsx` - Analytics page with filters and charts
- `frontend/src/app/admin/users/page.tsx` - Admin user management page
- `frontend/src/app/notifications/page.tsx` - Full notification history page
- `frontend/Dockerfile` - Multi-stage Docker build for Next.js frontend

## Steps

1. **Initialize root workspace and Docker environment**
   Create root package.json with workspaces ["frontend","backend"] and shared dev scripts. Create docker-compose.yml defining a PostgreSQL 15 service with healthcheck, persistent volume, and environment variables from .env. Create root .env.example with DATABASE_URL, JWT_SECRET, PORT, FRONTEND_URL. Create root .gitignore ignoring node_modules, .env, dist, .next, and OS files.

2. **Initialize backend Express + TypeScript project**
   Create backend/package.json with dependencies: express, cors, helmet, express-rate-limit, bcryptjs, jsonwebtoken, zod, dotenv, prisma, @prisma/client, and devDependencies: typescript, ts-node, nodemon, @types/express, @types/cors, @types/bcryptjs, @types/jsonwebtoken, @types/node. Create backend/tsconfig.json with strict: true, outDir: dist, rootDir: src. Create backend/src/server.ts importing createApp from ./app and starting the server on process.env.PORT. Create backend/src/app.ts exporting function createApp() that instantiates Express, applies helmet(), cors(), express.json(), and mounts a health check at GET /. Create backend/src/config/database.ts exporting a PrismaClient singleton instance.
   Interfaces: createApp(): express.Application, prisma: PrismaClient

3. **Initialize frontend Next.js 16 + Tailwind + shadcn/ui project**
   Scaffold frontend/ as a Next.js 16 project with TypeScript, Tailwind CSS, and shadcn/ui initialization. Configure frontend/tsconfig.json with strict settings. Create frontend/tailwind.config.ts with shadcn content paths and CSS variables. Create frontend/postcss.config.mjs. Create frontend/next.config.ts. Install additional dependencies: axios, recharts, lucide-react, zod. Create frontend/src/lib/utils.ts exporting cn() using clsx and tailwind-merge.
   Interfaces: cn(...inputs: ClassValue[]): string

4. **Design Prisma schema and run initial migration**
   Create prisma/schema.prisma with datasource db (postgresql) and generator client. Define models: User (id uuid pk, email unique, passwordHash, name, role enum ADMIN/MANAGER/TEAM_MEMBER), Client (id uuid pk, name, company, email, phone, industry, website, status enum ACTIVE/INACTIVE/PROSPECT, notes), Campaign (id uuid pk, name, clientId fk, description, type enum, startDate DateTime, endDate DateTime, budget Decimal, status enum, targetAudience, goals), Lead (id uuid pk, name, email, phone, company, source, campaignId fk nullable, status enum, value Decimal, assignedUserId fk nullable, notes), Task (id uuid pk, title, description, assignedUserId fk, clientId fk nullable, campaignId fk nullable, priority enum, dueDate DateTime, status enum), Activity (id uuid pk, userId fk nullable, action, entityType, entityId, metadata Json, createdAt), Notification (id uuid pk, userId fk, title, message, read Boolean, type, relatedId, createdAt). Add indexes on foreign keys and frequently queried fields. Add safe cascading deletes. Run npx prisma migrate dev --name init.

5. **Create and run database seed script**
   Create prisma/seed.ts using PrismaClient. Create 3 users with bcrypt-hashed password 'password123': Admin (admin@nexlevr.com), Manager (manager@nexlevr.com), Team Member (member@nexlevr.com). Create 5 clients across different industries and statuses. Create 8 campaigns linked to clients with varied types and statuses. Create 20 leads distributed across pipeline statuses and linked to campaigns/assigned users. Create 15 tasks with varied priorities, statuses, and assignments. Create related Activity and Notification records. Add prisma seed script to backend package.json. Run npx prisma db seed.
   Interfaces: main(): Promise<void>

6. **Verify database connectivity and seeded data**
   Run a small Node verification script via npx ts-node that imports the Prisma client, counts records in each table (User, Client, Campaign, Lead, Task, Activity, Notification), and logs the counts. Confirm all counts are non-zero and the script exits cleanly.

7. **Implement backend authentication API**
   Create backend/src/utils/password.ts with hashPassword(password: string): Promise<string> and comparePassword(password: string, hash: string): Promise<boolean>. Create backend/src/utils/jwt.ts with generateToken(payload: object): string and verifyToken(token: string): JwtPayload. Create backend/src/validators/auth.validator.ts with Zod schemas RegisterSchema and LoginSchema. Create backend/src/services/auth.service.ts with register(data), login(data), and getCurrentUser(userId). Create backend/src/controllers/auth.controller.ts handling HTTP requests and returning standardized responses. Create backend/src/routes/auth.routes.ts mounting POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me. Wire auth.routes into backend/src/app.ts at /api/auth.
   Interfaces: hashPassword(password: string): Promise<string>, comparePassword(password: string, hash: string): Promise<boolean>, generateToken(payload: object): string, verifyToken(token: string): object, register(data: RegisterInput): Promise<User>, login(data: LoginInput): Promise<{token: string; user: User}>, getCurrentUser(userId: string): Promise<User>

8. **Implement backend auth, RBAC, and error middleware**
   Create backend/src/middleware/auth.ts exporting requireAuth(req: Request, res: Response, next: NextFunction): void. It reads the Authorization header, verifies the JWT using verifyToken, and attaches the decoded user to req.user. Create backend/src/middleware/rbac.ts exporting requireRole(...roles: UserRole[]) returning middleware that checks req.user.role against allowed roles and returns 403 if unauthorized. Create backend/src/middleware/errorHandler.ts catching errors and returning JSON {success: false, message: string} with appropriate status codes, hiding stack traces when NODE_ENV=production. Create backend/src/utils/response.ts with success(res, data, message?) and error(res, message, statusCode?). Create backend/src/types/express.d.ts extending Express.Request to include user: {id: string; email: string; role: UserRole}.
   Interfaces: requireAuth(req: Request, res: Response, next: NextFunction): void, requireRole(...roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void, success(res: Response, data: any, message?: string): void, error(res: Response, message: string, statusCode?: number): void

9. **Implement frontend authentication system**
   Create frontend/src/lib/api.ts with an Axios instance using baseURL from NEXT_PUBLIC_API_URL. Add a request interceptor that reads 'token' from localStorage and attaches it to the Authorization header. Add a response interceptor that clears the token and redirects to /login on 401. Create frontend/src/types/index.ts with User, UserRole, Client, Campaign, Lead, Task, Activity, Notification interfaces and enums. Create frontend/src/context/AuthContext.tsx providing { user, login, register, logout, loading }. On mount, fetch GET /api/auth/me using the token and set the user. Create frontend/src/hooks/useAuth.ts. Create frontend/src/app/login/page.tsx and frontend/src/app/register/page.tsx with forms validated via Zod. Create frontend/src/components/layout/ProtectedRoute.tsx that redirects unauthenticated users to /login and checks allowedRoles against the user role.
   Interfaces: AuthContextType { user: User | null; login: (email: string, password: string) => Promise<void>; register: (data: RegisterData) => Promise<void>; logout: () => void; loading: boolean }, useAuth(): AuthContextType, ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }): JSX.Element

10. **Verify authentication phase end-to-end**
   Start the backend server. Use a Node.js script or curl commands to test POST /api/auth/register with validation errors, POST /api/auth/login with seeded credentials, GET /api/auth/me with a valid token, and GET /api/auth/me without a token expecting 401. Confirm the frontend login page renders without build errors and that successful login stores the token and redirects to /dashboard.

11. **Implement backend client management API**
   Create backend/src/validators/client.validator.ts with Zod schemas for CreateClientSchema and UpdateClientSchema covering name, company, email, phone, industry, website, status, notes. Create backend/src/services/client.service.ts with getClients(filters), getClientById(id), createClient(data), updateClient(id, data), deleteClient(id), and search/filter logic. Create backend/src/controllers/client.controller.ts. Create backend/src/routes/client.routes.ts with GET /api/clients, GET /api/clients/:id, POST /api/clients, PUT /api/clients/:id, DELETE /api/clients/:id. Protect all routes with requireAuth. Apply requireRole('ADMIN','MANAGER') for POST/PUT/DELETE; GET routes accessible to all authenticated users but filter results for TEAM_MEMBER to assigned clients if applicable. Wire into backend/src/app.ts. Log activities on create/update/delete.
   Interfaces: getClients(filters: ClientFilters): Promise<Client[]>, getClientById(id: string): Promise<Client | null>, createClient(data: CreateClientInput): Promise<Client>, updateClient(id: string, data: UpdateClientInput): Promise<Client>, deleteClient(id: string): Promise<void>

12. **Implement frontend client management**
   Create frontend/src/hooks/useClients.ts with functions fetchClients, createClient, updateClient, deleteClient using the Axios API client. Create frontend/src/components/clients/ClientTable.tsx displaying columns: name, company, email, status, actions (edit/delete). Add search by name and filter by status. Create frontend/src/components/clients/ClientForm.tsx as a modal/drawer for create and edit with Zod validation. Create frontend/src/app/clients/page.tsx composing the table and form. Create frontend/src/app/clients/[id]/page.tsx fetching client details and displaying profile info plus a campaign history list fetched from /api/campaigns filtered by clientId. Add skeleton loaders and empty states.
   Interfaces: useClients(): { clients: Client[]; loading: boolean; createClient: (data: CreateClientInput) => Promise<void>; updateClient: (id: string, data: UpdateClientInput) => Promise<void>; deleteClient: (id: string) => Promise<void> }, ClientTable({ clients, onEdit, onDelete }: ClientTableProps): JSX.Element, ClientForm({ client, onSubmit, onClose }: ClientFormProps): JSX.Element

13. **Implement backend campaign management API**
   Create backend/src/validators/campaign.validator.ts with schemas for create/update including name, clientId, description, type, startDate, endDate, budget, status, targetAudience, goals. Create backend/src/services/campaign.service.ts with CRUD and status transition validation. Create backend/src/controllers/campaign.controller.ts. Create backend/src/routes/campaign.routes.ts at /api/campaigns with full CRUD. Protect with requireAuth. Restrict POST/PUT/DELETE to ADMIN and MANAGER. TEAM_MEMBER can view campaigns related to their assigned clients/tasks. On mutation, create Activity records. Wire into backend/src/app.ts.
   Interfaces: getCampaigns(filters: CampaignFilters): Promise<Campaign[]>, getCampaignById(id: string): Promise<Campaign | null>, createCampaign(data: CreateCampaignInput): Promise<Campaign>, updateCampaign(id: string, data: UpdateCampaignInput): Promise<Campaign>, deleteCampaign(id: string): Promise<void>

14. **Implement frontend campaign management**
   Create frontend/src/hooks/useCampaigns.ts. Create frontend/src/components/campaigns/CampaignTable.tsx with columns: name, client, type, status, budget, dates, actions. Add search by name and filters by type and status. Create frontend/src/components/campaigns/CampaignForm.tsx with client select dropdown fetched from /api/clients, date pickers, budget input, and status select. Create frontend/src/app/campaigns/page.tsx. Create frontend/src/app/campaigns/[id]/page.tsx showing campaign details and related leads/tasks. Allow status changes via a dropdown that calls PUT /api/campaigns/:id.
   Interfaces: useCampaigns(): CampaignHookResult, CampaignTable({ campaigns, onEdit, onDelete, onStatusChange }: CampaignTableProps): JSX.Element, CampaignForm({ campaign, onSubmit, onClose }: CampaignFormProps): JSX.Element

15. **Implement backend lead management API**
   Create backend/src/validators/lead.validator.ts with schemas for create/update and status enum validation. Create backend/src/services/lead.service.ts with CRUD and pipeline logic. Create backend/src/controllers/lead.controller.ts. Create backend/src/routes/lead.routes.ts at /api/leads with GET /, GET /:id, POST /, PUT /:id, DELETE /:id. Protect with requireAuth. On create, update status, or assignment, call ActivityService.createActivity and NotificationService.createNotification for the assigned user. Wire into backend/src/app.ts.
   Interfaces: getLeads(filters: LeadFilters): Promise<Lead[]>, getLeadById(id: string): Promise<Lead | null>, createLead(data: CreateLeadInput): Promise<Lead>, updateLead(id: string, data: UpdateLeadInput): Promise<Lead>, deleteLead(id: string): Promise<void>

16. **Implement frontend lead Kanban board**
   Create frontend/src/hooks/useLeads.ts. Create frontend/src/components/leads/LeadKanban.tsx with columns for each LeadStatus: New, Contacted, Qualified, Proposal, Converted, Lost. Each column displays lead cards with name, company, value, and assigned user. Implement moving a lead between stages by clicking a status move button or drag-and-drop if using a library, otherwise a select dropdown on the card to change status which calls PUT /api/leads/:id. Create frontend/src/components/leads/LeadForm.tsx for create/edit. Create frontend/src/app/leads/page.tsx composing the Kanban board and form modal.
   Interfaces: useLeads(): LeadHookResult, LeadKanban({ leads, onMove }: LeadKanbanProps): JSX.Element, LeadForm({ lead, onSubmit, onClose }: LeadFormProps): JSX.Element

17. **Implement backend task management API**
   Create backend/src/validators/task.validator.ts with schemas for create/update including title, description, assignedUserId, clientId, campaignId, priority, dueDate, status. Create backend/src/services/task.service.ts with CRUD. Create backend/src/controllers/task.controller.ts. Create backend/src/routes/task.routes.ts at /api/tasks with full CRUD. Protect with requireAuth. On task assignment, create a notification for the assigned user. Log activities on create/update. Wire into backend/src/app.ts.
   Interfaces: getTasks(filters: TaskFilters): Promise<Task[]>, getTaskById(id: string): Promise<Task | null>, createTask(data: CreateTaskInput): Promise<Task>, updateTask(id: string, data: UpdateTaskInput): Promise<Task>, deleteTask(id: string): Promise<void>

18. **Implement frontend task management**
   Create frontend/src/hooks/useTasks.ts. Create frontend/src/app/tasks/page.tsx with a toggle between Kanban and List views. Create frontend/src/components/tasks/TaskKanban.tsx with columns: Todo, In Progress, Review, Completed. Create frontend/src/components/tasks/TaskList.tsx with sortable columns, priority badges, and due-date indicators (red for overdue, yellow for due soon). Create frontend/src/components/tasks/TaskForm.tsx with user assignment dropdown, client/campaign linking, priority select, and due-date picker. Implement status moves via API updates.
   Interfaces: useTasks(): TaskHookResult, TaskKanban({ tasks, onMove }: TaskKanbanProps): JSX.Element, TaskList({ tasks, onEdit, onDelete }: TaskListProps): JSX.Element, TaskForm({ task, onSubmit, onClose }: TaskFormProps): JSX.Element

19. **Implement backend analytics aggregation API**
   Create backend/src/services/analytics.service.ts with pure database aggregation functions: getDashboardStats() returning totalClients, activeCampaigns, leadsGenerated, tasksPending, conversionRate; getCampaignPerformance(filters) returning budget vs leads per campaign; getLeadTrends(filters) returning monthly lead counts and conversion rates; getRevenueStats(filters) returning total lead value. Use Prisma aggregate, groupBy, and count. Create backend/src/controllers/analytics.controller.ts. Create backend/src/routes/analytics.routes.ts at /api/analytics with GET /dashboard, GET /campaigns, GET /leads. Accept query params: dateFrom, dateTo, clientId, campaignId. Wire into backend/src/app.ts.
   Interfaces: getDashboardStats(filters: AnalyticsFilters): Promise<DashboardStats>, getCampaignPerformance(filters: AnalyticsFilters): Promise<CampaignPerformance[]>, getLeadTrends(filters: AnalyticsFilters): Promise<LeadTrend[]>, getRevenueStats(filters: AnalyticsFilters): Promise<RevenueStats>

20. **Implement frontend dashboard with real data**
   Create frontend/src/hooks/useAnalytics.ts fetching from /api/analytics/dashboard. Create frontend/src/app/dashboard/page.tsx. Create frontend/src/components/dashboard/StatsCards.tsx displaying the six key metrics. Create frontend/src/components/dashboard/CampaignChart.tsx using Recharts BarChart with campaign performance data. Create frontend/src/components/dashboard/LeadChart.tsx using Recharts AreaChart for lead acquisition trends. Create frontend/src/components/dashboard/TaskChart.tsx using Recharts PieChart or BarChart for task completion distribution. Create frontend/src/components/dashboard/RecentActivity.tsx fetching from /api/activities and showing the latest 10 events. Add skeleton states while loading.
   Interfaces: useAnalytics(filters?: AnalyticsFilters): AnalyticsHookResult, StatsCards({ stats }: StatsCardsProps): JSX.Element, CampaignChart({ data }: ChartProps): JSX.Element, LeadChart({ data }: ChartProps): JSX.Element, TaskChart({ data }: ChartProps): JSX.Element, RecentActivity({ activities }: RecentActivityProps): JSX.Element

21. **Implement frontend analytics page with filters**
   Create frontend/src/app/analytics/page.tsx. Create frontend/src/components/analytics/AnalyticsCharts.tsx with date range inputs, client select, and campaign select filters. On filter change, refetch /api/analytics/leads and /api/analytics/campaigns. Display interactive Recharts charts: conversion funnel, monthly lead trends, revenue generated, client growth over time. Ensure all data comes from API responses, not hardcoded.
   Interfaces: AnalyticsCharts({ filters }: AnalyticsChartsProps): JSX.Element

22. **Implement backend activity and notification services**
   Create backend/src/services/activity.service.ts with createActivity(data: {userId?, action, entityType, entityId, metadata?}) and getActivities(query). Create backend/src/controllers/activity.controller.ts. Create backend/src/routes/activity.routes.ts at /api/activities with GET /. Create backend/src/services/notification.service.ts with createNotification(data: {userId, title, message, type, relatedId?}), getNotifications(userId), markAsRead(id), markAllAsRead(userId). Create backend/src/controllers/notification.controller.ts. Create backend/src/routes/notification.routes.ts at /api/notifications with GET /, PUT /:id/read, PUT /read-all. Wire both into backend/src/app.ts. Integrate createActivity calls into Client, Campaign, Lead, and Task services. Integrate createNotification into Task assignment and Lead assignment flows.
   Interfaces: createActivity(data: CreateActivityInput): Promise<Activity>, getActivities(query: ActivityQuery): Promise<Activity[]>, createNotification(data: CreateNotificationInput): Promise<Notification>, markAsRead(id: string): Promise<Notification>, markAllAsRead(userId: string): Promise<void>

23. **Implement frontend activity timeline and notifications**
   Create frontend/src/hooks/useActivities.ts and frontend/src/hooks/useNotifications.ts. Update frontend/src/components/dashboard/RecentActivity.tsx to render a vertical timeline of activities. Create frontend/src/components/notifications/NotificationDropdown.tsx mounted in the Header. It fetches unread notifications, displays a bell icon with badge count, shows a dropdown list with mark-as-read per item and mark-all-as-read button. Create frontend/src/app/notifications/page.tsx showing the full paginated notification history. Update the Header to include the dropdown.
   Interfaces: useActivities(): ActivityHookResult, useNotifications(): NotificationHookResult, NotificationDropdown(): JSX.Element

24. **Implement backend admin user management API**
   Create backend/src/validators/user.validator.ts with schemas for create/update user including name, email, password, role. Create backend/src/services/user.service.ts with getUsers(), getUserById(id), createUser(data), updateUser(id, data), disableUser(id). Ensure password is hashed before storing. Ensure passwordHash is never included in returned objects by using Prisma select omit. Create backend/src/controllers/user.controller.ts. Create backend/src/routes/user.routes.ts at /api/users with GET /, POST /, PUT /:id, DELETE /:id. Protect with requireAuth and requireRole('ADMIN') only. Wire into backend/src/app.ts.
   Interfaces: getUsers(): Promise<User[]>, createUser(data: CreateUserInput): Promise<User>, updateUser(id: string, data: UpdateUserInput): Promise<User>, disableUser(id: string): Promise<User>

25. **Implement frontend admin panel**
   Create frontend/src/app/admin/users/page.tsx wrapped in ProtectedRoute with allowedRoles=['ADMIN']. Create frontend/src/components/admin/UserTable.tsx displaying users with columns: name, email, role, status, createdAt, actions (edit, disable). Create frontend/src/components/admin/UserForm.tsx modal for creating and editing users including role selection and password setting. Use shadcn AlertDialog for confirming destructive actions like disable/delete. Update frontend/src/components/layout/Sidebar.tsx to conditionally render the Admin > Users link only when the current user role is ADMIN.
   Interfaces: UserTable({ users, onEdit, onDisable }: UserTableProps): JSX.Element, UserForm({ user, onSubmit, onClose }: UserFormProps): JSX.Element

26. **Harden security and validation across the backend**
   In backend/src/app.ts, apply helmet() for security headers, configure CORS with origin set to FRONTEND_URL, and apply express-rate-limit to all /api routes (stricter on /api/auth). Ensure every route handler uses Zod validation before service calls. Verify JWT_SECRET is loaded from env and the app refuses to start if missing. Ensure Prisma queries use parameterized inputs (native to Prisma). Ensure errorHandler returns generic messages in production. Audit all controller responses to confirm passwordHash is never included.

27. **Polish UI with loading states, empty states, and responsive design**
   Add shadcn Skeleton components to all list pages (clients, campaigns, leads, tasks, admin users) and detail pages while data is fetching. Add empty state messages and icons when lists have no items. Integrate sonner or shadcn Toaster in frontend/src/app/layout.tsx and trigger toasts on successful mutations and errors. Make the Sidebar responsive: hide on mobile behind a hamburger menu using shadcn Sheet. Ensure all tables are horizontally scrollable on small screens. Verify consistent spacing and typography across all pages.

28. **Prepare deployment artifacts and finalize documentation**
   Create backend/Dockerfile using node:20-alpine with multi-stage build (install, build, production). Create frontend/Dockerfile using node:20-alpine with multi-stage build and output standalone. Update docker-compose.yml to include backend and frontend services with proper env and depends_on. Update README.md with all required sections: overview, features, tech stack, architecture diagrams (Mermaid), database schema, API docs, environment variables, local setup, database setup, running frontend/backend, deployment, and future improvements. Run npm run build in both frontend and backend directories and confirm zero TypeScript errors.

## Acceptance checks

- Backend TypeScript compiles with strict mode and no errors (`cd backend && npx tsc --noEmit`)
- Frontend TypeScript compiles and Next.js build succeeds (`cd frontend && npx tsc --noEmit && npm run build`)
- Prisma schema file exists and defines all required models (`node -e "process.exit(require('fs').existsSync('prisma/schema.prisma')?0:1)"`)
- Database seed script runs successfully and populates all tables (`cd backend && npx prisma db seed`)
- Auth routes exist with register, login, and me endpoints (`node -e "const fs=require('fs');const t=fs.readFileSync('backend/src/routes/auth.routes.ts','utf8');process.exit(t.includes('/register')&&t.includes('/login')&&t.includes('/me')?0:1)"`)
- RBAC middleware exists for role-based access control (`node -e "process.exit(require('fs').existsSync('backend/src/middleware/rbac.ts')?0:1)"`)
- Frontend dashboard page exists and imports analytics hooks (`node -e "const fs=require('fs');const p='frontend/src/app/dashboard/page.tsx';process.exit(fs.existsSync(p)&&fs.readFileSync(p,'utf8').includes('useAnalytics')?0:1)"`)
- Analytics backend service exists and aggregates from database (`node -e "process.exit(require('fs').existsSync('backend/src/services/analytics.service.ts')?0:1)"`)
- Notification dropdown component exists in frontend (`node -e "process.exit(require('fs').existsSync('frontend/src/components/notifications/NotificationDropdown.tsx')?0:1)"`)
- Admin users page exists and is protected by role check (`node -e "const fs=require('fs');const p='frontend/src/app/admin/users/page.tsx';process.exit(fs.existsSync(p)&&fs.readFileSync(p,'utf8').includes('ProtectedRoute')?0:1)"`)

---

Written by OxCode for you to read. Editing this file does not change the run: use the comment box on the plan card to ask for changes.
