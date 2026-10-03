---
title: `frontend/src/app/admin/users/page.tsx` is wrapped in `
slug: frontend-src-app-admin-users-page-tsx-is-wrapped-in
tags: 
scope: project
updated_at: 2026-10-03T03:59:35.615Z
source: live
hook: `frontend/src/app/admin/users/page.tsx` is wrapped in `ProtectedRoute` with `allowedRoles=
sessions: s_1790957891618_vcg6g7
---

- `frontend/src/app/admin/users/page.tsx` is wrapped in `ProtectedRoute` with `allowedRoles={['ADMIN']}`
- `frontend/src/components/admin/UserTable.tsx` displays users with columns: name, email, role, status, createdAt, actions (edit, disable)
- `frontend/src/components/admin/UserForm.tsx` is a modal for creating and editing users with role selection and password setting
- `frontend/src/components/admin/UserForm.tsx` uses shadcn AlertDialog for confirming destructive actions like disable/delete
- `frontend/src/components/layout/Sidebar.tsx` conditionally renders the Admin > Users link only when current user role is ADMIN
- `UserTable` component interface: `UserTable({ users, onEdit, onDisable }: UserTableProps): JSX.Element`
- `UserForm` component interface: `UserForm({ user, onSubmit, onClose }: UserFormProps): JSX.Element`
- `frontend/src/app/admin/users/page.tsx` imports and uses `ProtectedRoute` from `@/components/layout/ProtectedRoute`
- `frontend/src/app/admin/users/page.tsx` imports `UserRole` from `@/types`
- `frontend/src/components/admin/UserTable.tsx` imports `Badge` from `@/components/ui/badge`
- `frontend/src/components/admin/UserTable.tsx` imports `Button` from `@/components/ui/button`
- `frontend/src/components/admin/UserForm.tsx` imports `Select` components from `@/components/ui/select`
- `frontend/src/components/admin/UserForm.tsx` imports `Input` from `@/components/ui/input`
- `frontend/src/components/admin/UserForm.tsx` imports `Label` from `@/components/ui/label`
- `frontend/src/components/admin/UserForm.tsx` imports `AlertDialog` components from `@/components/ui/alert-dialog`
- `frontend/src/components/layout/Sidebar.tsx` imports `UserRole` from `@/types`
- `frontend/src/components/layout/Sidebar.tsx` imports `useAuth` hook from `@/hooks/useAuth`
- `frontend/src/components/layout/Sidebar.tsx` uses conditional rendering based on user role for Admin menu item
- `frontend/src/app/admin/users/page.tsx` uses `useUsers` hook from `@/hooks/useUsers`
- `frontend/src/app/admin/users/page.tsx` uses `useAuth` hook from `@/hooks/useAuth`
- `frontend/src/components/admin/UserTable.tsx` uses `Badge` component for status display
- `frontend/src/components/admin/UserTable.tsx` uses `Button` component for action buttons
- `frontend/src/components/admin/UserForm.tsx` uses `Select` component for role selection
- `frontend/src/components/admin/UserForm.tsx` uses `Input` component for text fields
- `frontend/src/components/admin/UserForm.tsx` uses `Label` component for form labels
- `frontend/src/components/admin/UserForm.tsx` uses `AlertDialog` components for confirmation dialogs
- `frontend/src/app/admin/users/page.tsx` handles loading states with skeleton UI
- `frontend/src/app/admin/users/page.tsx` handles error states with retry functionality
- `frontend/src/app/admin/users/page.tsx` implements create/edit flows with modals
- `frontend/src/app/admin/users/page.tsx` implements delete confirmation using AlertDialog
- `frontend/src/components/admin/UserTable.tsx` implements search, role filter, and pagination
- `frontend/src/components/admin/UserForm.tsx` implements form validation and submission
- `frontend/src/components/layout/Sidebar.tsx` uses `useAuth` to get current user role
- `frontend/src/app/admin/users/page.tsx` uses `ProtectedRoute` to restrict access to ADMIN role only
- `frontend/src/app/admin/users/page.tsx` includes proper TypeScript typing for user data
- `frontend/src/components/admin/UserTable.tsx` includes proper TypeScript typing for user data
- `frontend/src/components/admin/UserForm.tsx` includes proper TypeScript typing for user data
- `frontend/src/components/layout/Sidebar.tsx` conditionally renders Admin menu item only for ADMIN role
- `frontend/src/components/admin/UserTable.tsx` displays user status using Badge component
- `frontend/src/components/admin/UserTable.tsx` handles edit and disable actions through callbacks
- `frontend/src/components/admin/UserForm.tsx` handles form submission with proper validation
- `frontend/src/components/admin/UserForm.tsx` provides password field only for editing users
- `frontend/src/components/admin/UserForm.tsx` uses AlertDialog for destructive actions
- `frontend/src/app/admin/users/page.tsx` uses `useUsers` hook for data fetching and manipulation
- `frontend/src/app/admin/users/page.tsx` uses `useAuth` hook for role checking
- `frontend/src/components/layout/Sidebar.tsx` uses `UserRole.ADMIN` constant for comparison
- `frontend/src/app/admin/users/page.tsx` uses `UserRole.ADMIN` constant
