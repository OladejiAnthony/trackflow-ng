# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (runs on port 3000)
npm run build      # Production build — always run before marking a feature done
npm run lint       # ESLint check
npm run start      # Start production server
vercel --prod --yes  # Deploy to trackflow-ng.vercel.app
```

**After every feature, run `npm run build` to confirm zero TypeScript and ESLint errors before proceeding.**

## Architecture

### Route Groups
- `app/(auth)/` — Unauthenticated pages: login, register, forgot-password, reset-password, verify-email
- `app/(onboarding)/` — Onboarding flow: account-type → setup-profile → grant-permissions → setup-budget → welcome
- `app/(dashboard)/` — Protected pages: dashboard, transactions, budgets, savings, reports, ai-assistant, investments, family, business, tasks, calender, settings
- `app/(admin)/` — Admin panel
- `app/api/` — API routes (see below)

Auth is enforced by `middleware.ts` at the root, which calls `lib/supabase/middleware.ts`. The middleware skips gracefully if `NEXT_PUBLIC_SUPABASE_URL` is not set.

### API Routes
- `api/auth/callback` — Supabase OAuth handler
- `api/ai/chat` — AI assistant chat
- `api/notifications/send`, `api/notifications/subscribe` — Push notifications
- `api/cron/morning-reminder`, `api/cron/evening-summary` — Scheduled cron jobs
- `api/webhooks/flutterwave` — Flutterwave payment webhooks

### Supabase Pattern
Three separate clients — never mix them up:
- `lib/supabase/client.ts` — Browser client (`createBrowserClient`), use in `"use client"` components
- `lib/supabase/server.ts` — Server client (`createServerClient`), use in Server Components and API routes
- `lib/supabase/middleware.ts` — Middleware client, only used in `middleware.ts`

Schema SQL is in `lib/supabase/schema.sql` — run this in Supabase SQL Editor to create all tables.

### State Management
- **React Query** (`@tanstack/react-query`) — all server data fetching (transactions, budgets, goals, profile)
- **Zustand** (`store/useAppStore.ts`) — client UI state (sidebar open, active month filter, add-transaction modal). Persists `theme`, `sidebarOpen`, `activeMonth` to localStorage.

### Component Hierarchy
- `components/ui/AppButton.tsx` — **Our fintech button** (variants: brand/gold/outline/ghost/danger, supports `loading` and `fullWidth`). Use this, NOT the shadcn `Button.tsx`.
- `components/ui/Button.tsx` — shadcn's base-nova button (used internally by shadcn components only)
- `components/ui/Input.tsx` + `PasswordInput` — labeled inputs with error/hint/icon slots
- `components/ui/Alert.tsx` — 4-variant alert (error/success/warning/info)
- `components/dashboard/` — Dashboard widgets: BalanceCard, BudgetProgress, DashboardHeader, MotivationQuote, QuickActions, RecentTransactions, SpendingChart, WeeklyTasksWidget
- `components/shared/` — Shared UI: CurrencyDisplay, EmptyState, LoadingSpinner, PermissionGate
- `components/providers.tsx` — wraps React Query + Sonner toaster

### shadcn
Configured with `base-nova` style, Radix component library. Add components with:
```bash
npx shadcn@latest add <component-name>
```
Aliases: `@/components/ui`, `@/lib/utils`.

> **Warning:** `npx shadcn@latest add` can overwrite `lib/utils.ts` and `components/ui/Button.tsx`. After any shadcn add, verify `lib/utils.ts` still has `formatNaira`, `TRANSACTION_CATEGORIES`, etc., and that `AppButton.tsx` still exists.

### Styling Conventions
- **Never** use raw Tailwind colors for brand UI — use the custom tokens defined in `tailwind.config.ts`: `brand-*`, `accent-*`, `gold-*`, `surface-*`
- CSS utility classes in `globals.css`: `.glass`, `.stat-card`, `.nav-item`, `.btn-brand`, `.btn-gold`, `.input-field`, `.badge-*`, `.amount-positive/negative/neutral`, `.skeleton`
- All monetary values must use `formatNaira()` from `lib/utils.ts` — never raw `Intl.NumberFormat`
- Nigerian-specific transaction categories are in `TRANSACTION_CATEGORIES` in `lib/utils.ts`

### TypeScript Types
- `types/database.ts` — full Supabase `Database` type with all table Row/Insert/Update shapes
- `types/index.ts` — re-exports database types + app-level types (`DashboardStats`, `BudgetWithProgress`, `GoalWithProgress`, `AIInsight`, etc.)

### Pages that use `useSearchParams()`
Must be wrapped in `<Suspense>` at the page level. The inner component reads params; the page export wraps it. See `app/(auth)/login/page.tsx` + `LoginForm.tsx` as the pattern.

### Environment Variables
Required to be set in `.env.local` (dev) and Vercel (prod):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL` — must match the running origin for OAuth redirects
- `ANTHROPIC_API_KEY` — for AI assistant
- `FLUTTERWAVE_PUBLIC_KEY` / `FLUTTERWAVE_SECRET_KEY` / `FLUTTERWAVE_WEBHOOK_SECRET`
- `RESEND_API_KEY` — for email

### PWA
`next-pwa` is configured in `next.config.mjs`. PWA is **disabled in development** and enabled only in production builds. Service worker outputs to `public/sw.js`. Do not manually edit `public/sw.js` or `public/workbox-*.js`.

### Deployment
- Platform: Vercel
- Production URL: `https://trackflow-ng.vercel.app`
- Supabase project ref: `jmmlweexuvvokcptzrgy`
- OAuth callback (Supabase): `https://jmmlweexuvvokcptzrgy.supabase.co/auth/v1/callback`
- App auth callback: `/api/auth/callback`

## Features Completed ✅
1. ✅ **Foundation** — Next.js 14, all deps, design tokens, Supabase schema, middleware, types, PWA config, landing page
2. ✅ **Authentication** — Login (email + Google OAuth), Register (password strength), Forgot/Reset password, server actions, auth callback, verify-email
3. ✅ **shadcn init** — base-nova style, fixed conflicts with custom components
4. ✅ **Deployment** — Vercel (trackflow-ng.vercel.app), all env vars set, GitHub repo pushed
5. ✅ **Onboarding** — account-type → setup-profile → grant-permissions → setup-budget → welcome
6. ✅ **Dashboard** — BalanceCard, BudgetProgress, DashboardHeader, MotivationQuote, QuickActions, RecentTransactions, SpendingChart, WeeklyTasksWidget
7. ✅ **Transactions** — Full CRUD (`/transactions`, `/transactions/[id]`)
8. ✅ **Budgets** — Budget management page
9. ✅ **Savings/Goals** — Savings goals page
10. ✅ **Reports** — Analytics/reporting page
11. ✅ **AI Assistant** — `/ai-assistant` + `api/ai/chat` (Anthropic Claude)
12. ✅ **Investments** — Investments page
13. ✅ **Family** — Family tracking page
14. ✅ **Business** — Business module page
15. ✅ **Tasks** — Tasks management page
16. ✅ **Calendar** — Calendar page (`/calender`)
17. ✅ **Settings** — Profile, Notifications, Subscription, Tools (currency calculator, fuel calculator, ovulation calc, world clock)
18. ✅ **Notifications** — `api/notifications/send` + `api/notifications/subscribe`
19. ✅ **Cron Jobs** — Morning reminder + evening summary (`api/cron/`)
20. ✅ **Flutterwave Webhooks** — `api/webhooks/flutterwave`
21. ✅ **Admin Panel** — `app/(admin)/`

## Lib Directory Structure
- `lib/ai/` — AI integration helpers
- `lib/auth/` — Auth utilities
- `lib/budgets/` — Budget logic
- `lib/flutterwave/` — Payment integration
- `lib/goals/` — Goals logic
- `lib/notifications/` — Push notification helpers
- `lib/supabase/` — Supabase clients + schema
- `lib/transactions/` — Transaction logic
- `lib/utils/` — Utility modules
- `lib/utils.ts` — Core utilities: `formatNaira()`, `TRANSACTION_CATEGORIES`, etc.
