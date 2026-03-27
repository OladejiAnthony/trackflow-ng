# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (auto-selects port if 3000 is busy)
npm run build      # Production build — always run before marking a feature done
npm run lint       # ESLint check
npm run start      # Start production server
vercel --prod --yes  # Deploy to trackflow-ng.vercel.app
```

**After every feature, run `npm run build` to confirm zero TypeScript and ESLint errors before proceeding.**

## Architecture

### Route Groups
- `app/(auth)/` — Unauthenticated pages: login, register, forgot-password, reset-password
- `app/(dashboard)/` — Protected pages: dashboard, transactions, budgets, goals, reports, settings
- `app/api/` — API routes: `auth/callback` (Supabase OAuth handler), plus future REST endpoints

Auth is enforced by `middleware.ts` at the root, which calls `lib/supabase/middleware.ts`. The middleware skips gracefully if `NEXT_PUBLIC_SUPABASE_URL` is not set.

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
- `components/providers.tsx` — wraps React Query + Sonner toaster

### shadcn
Configured with `base-nova` style, Radix component library. Add components with:
```bash
npx shadcn@latest add <component-name>
```
Aliases: `@/components/ui`, `@/lib/utils`.

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

### PWA
`next-pwa` is configured in `next.config.mjs`. PWA is **disabled in development** and enabled only in production builds. Service worker outputs to `public/sw.js`. Do not manually edit `public/sw.js` or `public/workbox-*.js`.

### Deployment
- Platform: Vercel
- Production URL: `https://trackflow-ng.vercel.app`
- Supabase project ref: `jmmlweexuvvokcptzrgy`
- OAuth callback (Supabase): `https://jmmlweexuvvokcptzrgy.supabase.co/auth/v1/callback`
- App auth callback: `/api/auth/callback`
