# LeadFlow — Client Lead Management (Mini CRM)

A production-ready lead management system built on the Lovable stack.

> **Note:** The original brief asked for a MERN (MongoDB + Express + React) build. This project ships the same feature set on the Lovable runtime (**TanStack Start + React + Tailwind v4 + Lovable Cloud / Postgres**) so it runs and deploys directly inside Lovable. Auth, CRUD, RLS, filters, pagination, CSV export, dark mode, and toasts are all included.

## Features

- 🔐 Email/password authentication with protected routes
- 📊 Dashboard with stat cards + Recharts (bar + pie) analytics
- 👥 Full lead CRUD (Name, Email, Phone, Company, Source, Status, Notes, Follow-up Date)
- 🔎 Search by name/email, filter by status & source, sort by date
- 📄 Pagination (10 per page)
- 🌗 Dark / light mode toggle (persisted)
- 📤 CSV export of current view
- 🗑️ Confirmation dialog before delete
- 🔔 Toast notifications (sonner)
- 📱 Responsive sidebar + topbar shell
- 🛡️ Row-Level Security — users can only see their own leads

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, TanStack Start, TanStack Router, TanStack Query, Vite 7 |
| Styling | Tailwind CSS v4, shadcn/ui, lucide-react icons |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Backend | Lovable Cloud (managed Postgres + Auth, Supabase under the hood) |
| Auth | Supabase Auth (JWT) |

## Project Structure

```
src/
├── components/           UI building blocks (AppShell, LeadFormDialog, StatusBadge, ui/*)
├── context/              AuthProvider, ThemeProvider
├── integrations/supabase Auto-generated Lovable Cloud client + types
├── routes/               File-based routes
│   ├── __root.tsx        Root shell (providers, Toaster)
│   ├── index.tsx         Redirects based on auth
│   ├── auth.tsx          Sign in / sign up
│   ├── _app.tsx          Protected layout (sidebar + topbar)
│   ├── _app.dashboard.tsx
│   ├── _app.leads.tsx
│   └── _app.leads.$id.tsx
├── services/leads.ts     Data access (list / get / create / update / delete / stats)
└── styles.css            Tailwind v4 design tokens (light + dark)
```

## Running locally

```bash
bun install
bun run dev
```

The Lovable Cloud env vars are auto-injected via `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

## Database

A single `public.leads` table is provisioned by migration:

| Column | Type |
| --- | --- |
| id | uuid (pk) |
| user_id | uuid → auth.users |
| name | text |
| email | text |
| phone | text |
| company | text |
| source | text |
| status | enum `new` / `contacted` / `converted` |
| notes | text |
| follow_up_date | date |
| created_at / updated_at | timestamptz |

RLS policy: `auth.uid() = user_id` for all operations. `updated_at` is bumped by a trigger.

## Deployment

Click **Publish** in the Lovable editor. Backend (DB, auth) deploys automatically; frontend deploys on publish. Custom domain can be attached from **Project Settings → Domains** after the first publish.

## Screenshots

_Add screenshots of `/auth`, `/dashboard`, `/leads`, and `/leads/$id` here._
