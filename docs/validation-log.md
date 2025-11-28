# Game Rental Validation Log

## 01. Environment bootstrap
- Confirmed tenant base URL (`https://cappuccino.devel.dzign-e.app`) and committed the canonical credentials inside `src/lib/cappuccino/tenant-config.ts`.
- `resolveCappuccinoConfig()` now merges optional env overrides with that committed source of truth, so the app runs cleanly out of the box while still allowing local overrides.
- Provisioned a shared Cappuccino client in `src/lib/cappuccino/client.ts` (browser token storage with the `game-rental` prefix) for every future feature to consume.
- Updated `README.md` with the explicit setup steps and available scripts for future reference.

## 02. Feature plan (Next.js App Router)

### Core stories
- **Authentication**: DB Users login page, remember session via `BrowserTokenStorage`, guard the rest of the app behind an authenticated layout.
- **Profile & identity**: capture staff avatar + legal name on first login using `mediastorage` (photo upload) and `dbusers.updateProfile`.
- **Games catalog**: CRUD UI backed by the `collections` module (`games` collection) with cover art, pricing, available stock, and platform tags.
- **Clients**: lightweight client picker powered by the `clients` module to avoid duplicating tenant data.
- **Rentals workflow**: create, list, and close rentals in the `rentals` collection, referencing games + clients, tracking status, dates, and payment summary.
- **Dashboard**: aggregate total games, active rentals, overdue rentals, and revenue insights via collection queries to validate reads + filters.
- **Activity log**: append operational events (new rental, return, upload) into a `rental_events` collection to demonstrate historical tracking + ordering.

### Collections & documents
- `games`: `{ id, title, platform, daily_price, stock, cover_url, tags[], description, created_at }`.
- `rentals`: `{ id, game_id, client_id, start_date, end_date, status, daily_price, total_days, total_amount, returned_at, notes }`.
- `rental_events`: `{ id, rental_id, type ('created' | 'returned' | 'overdue'), message, created_at }`.

### Screens / routes
- `/login`: standalone public route that initializes Cappuccino client + handles auth mutations.
- `/setup/profile`: first-login wizard to upload avatar (via `mediastorage.upload`) and persist metadata.
- `/dashboard`: authenticated layout root with KPIs + recent activity (Server Components fetching `collections` snapshots via route handlers or server actions).
- `/games`: list + drawer/modal for create/update, inline cover upload, search/filter controls.
- `/rentals`: table with tabs (active, overdue, completed), quick action to mark as returned, CTA to create rental.
- `/rentals/new`: multi-step flow (choose client -> choose game -> confirm dates/pricing) persisted via `collections.createDocument`.

### Technical approach
- Centralize Cappuccino access via `AppProviders` (client component) that wraps the tree with `CappuccinoProvider`, sourcing the browser client from `src/lib/cappuccino/client.ts`.
- Use server actions to call `createCappuccinoServerClient` for privileged operations (e.g., dashboards) while client components handle interactive flows (login form, wizards).
- Model each data-heavy page as a Server Component that fetches data via helper functions under `src/server/cappuccino/*`, paired with client-side forms that mutate collections and revalidate caches.
- Track every significant step in this log to keep the validation narrative auditable.
