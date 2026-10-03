---
title: Created `frontend/src/lib/api.ts` with Axios instance u
slug: created-frontend-src-lib-api-ts-with-axios-instance-u
tags: 
scope: project
updated_at: 2026-10-03T17:04:04.351Z
source: live
hook: Created `frontend/src/lib/api.ts` with Axios instance using `NEXT_PUBLIC_API_URL`, request
sessions: s_1790957891618_vcg6g7
---

• Created `frontend/src/lib/api.ts` with Axios instance using `NEXT_PUBLIC_API_URL`, request interceptor attaching token from localStorage, and response interceptor clearing token and redirecting on 401
• Created `frontend/src/types/index.ts` with User, UserRole, Client, Campaign, Lead, Task, Activity, Notification interfaces and enums
• Created `frontend/src/context/AuthContext.tsx` providing `{ user, login, register, logout, loading }` with token-based auth and `/api/auth/me` fetching on mount
• Created `frontend/src/hooks/useAuth.ts` hook consuming AuthContext with provider guard
• Created `frontend/src/app/login/page.tsx` and `frontend/src/app/register/page.tsx` with Zod validation forms
• Created `frontend/src/components/layout/ProtectedRoute.tsx` that redirects unauthenticated users and checks allowedRoles
• Modified `frontend/src/app/layout.tsx` to wrap children in `<AuthProvider>` and update metadata title
• Updated `.env` to change `PORT` to 5001 and `NEXT_PUBLIC_API_URL` to `http://localhost:5001/api`
• Verified with `npm run typecheck`, `npm run lint`, and `npm run build` all passing
• Confirmed backend auth API functionality through end-to-end testing with register, login, and protected route access
- Created `frontend/src/hooks/useCampaigns.ts` with campaign CRUD operations and Zod validation
- Created `frontend/src/components/campaigns/CampaignTable.tsx` with name search, type/status filters, inline status changes, and pagination
- Created `frontend/src/components/campaigns/CampaignForm.tsx` with client dropdown, date pickers, budget input, and status select
- Created `frontend/src/app/campaigns/page.tsx` with protected route, campaign list, and modals
- Created `frontend/src/app/campaigns/[id]/page.tsx` with campaign details and related leads/tasks
- Extended `frontend/src/types/index.ts` with `Campaign` interface updates for client and count fields
- Implemented role-based access control for campaign modifications
- Added Zod validation for campaign form inputs and date ranges
- Integrated API calls to `/api/clients`, `/api/campaigns`, `/api/leads`, and `/api/tasks`
- Implemented client-side pagination and loading states
- Added error handling and user feedback for all operations
- Verified type checking and build success with zero errors
• Created `frontend/src/hooks/useLeads.ts` with Zod schemas and API calls for lead CRUD operations
• Created `frontend/src/components/leads/LeadKanban.tsx` with 6 columns (New through Lost) displaying lead cards with name, company, value, assigned user, and source
• Implemented lead movement between stages via status buttons and dropdown menus calling `PUT /api/leads/:id`
• Created `frontend/src/components/leads/LeadForm.tsx` for creating and editing leads with validation
• Created `frontend/src/app/leads/page.tsx` composing the Kanban board and form modal with protected routing
• Added role-based access control for lead manipulation (ADMIN/MANAGER only)
• Implemented search and source filtering in Kanban board
• Added loading states, error handling, and empty state displays
• Verified type checking and build success with zero errors
• `frontend/next.config.ts` already contains `output: 'standalone'` as required for Vercel deployment
• Created `frontend/.env.example` with `NEXT_PUBLIC_API_URL=http://localhost:5000/api` for local development
• Documented that production `NEXT_PUBLIC_API_URL` must be set in Vercel dashboard environment variables
• No code changes required beyond verifying existing configuration and creating example env file
• Deployed Next.js frontend to Vercel using `npx vercel --prod`
• First deployment failed due to incorrect Vercel framework preset (Vite instead of Next.js)
• Removed incorrect `frontend/vercel.json` file that specified `outputDirectory: ".next"`
• Updated Vercel project framework preset to Next.js using `vercel project update --framework nextjs --yes`
• Verified successful build and route generation for all 15 routes
• Confirmed deployment responsiveness using `vercel curl`
• Production URL: https://frontend-bp7ibfaeu-vardhan23vs-projects.vercel.app
• Committed and pushed changes to GitHub including Vercel configuration updates
• Deployment Protection (Vercel Authentication) is enabled on the project
- `NEXT_PUBLIC_API_URL` is not set in the Vercel project for the `vardhan23vs-projects/frontend` scope
- A `VITE_API_URL` secret exists in the Production environment but cannot be read due to Vercel's security restrictions
- The command `cd frontend && npx vercel env add NEXT_PUBLIC_API_URL production` is required to set the environment variable
- After setting the variable, a redeployment is necessary to bake the variable into the build
- The production backend API URL must be provided to complete the environment variable setup
