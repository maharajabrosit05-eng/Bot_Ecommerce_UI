# GrowthAdmin — Angular 20 Admin Dashboard

A real Angular CLI project (Angular ^20.3) with:
- **Login page** (`src/app/auth/login`) — reactive form, show/hide password, submits through `AuthService`
- **Auth guard** (`src/app/auth/guards/auth.guard.ts`) — blocks `/dashboard` until logged in, redirects to `/login`
- **AuthService** (`src/app/auth/services/auth.service.ts`) — demo login (any valid email + 6+ char password), session kept in `sessionStorage`, exposes `currentUser` + `isLoggedIn` as signals
- **Sidebar** (`src/app/shared/sidebar`) — no top navbar; sidebar-only navigation with nested child/submenu items, off-canvas drawer on mobile/tablet
- **Dashboard** (`src/app/dashboard`) — stat cards, ApexCharts (line/bar/donut/radial), campaign lists, audience insights, recent activity table
- **Profile dropdown** — click the avatar in the dashboard header to see Profile / Account Settings / **Logout**. Logout clears the session and routes back to `/login`.

## Run it

```bash
npm install
npm start
```
Then open http://localhost:4200 — you'll land on `/login`. Log in with any email + a
6+ character password to reach `/dashboard`.

## Flow
`/` → redirects to `/login` → successful login → `/dashboard` (guarded) → click avatar
→ **Logout** → back to `/login`, guard blocks direct `/dashboard` access again.

## Wiring to a real backend
Replace the body of `AuthService.login()` with an HTTP call to your auth API
(JWT + refresh token), and store the token instead of the demo user object.
Everything else (guard, routing, dropdown, logout) stays the same.

## Notes
- Charts: `ng-apexcharts` / `apexcharts` (already in `package.json`)
- Icons: Remixicon via CDN (`src/index.html`)
- Sidebar menu items and their children are defined in `src/app/shared/sidebar/sidebar.ts` (`menu` array)
- Dashboard mock data lives in `src/app/dashboard/dashboard.ts` — swap for real API calls
