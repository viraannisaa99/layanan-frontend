# HR Frontend – Implementation Notes

## 1. Tech Stack & Layout
- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui.
- Global wrappers: AuthProvider (NextAuth), React Query Provider, Next Top Loader, Sonner Toaster.
- Layout driven by shadcn `sidebar-07`; navigation uses Next `<Link>` (parents toggle, children navigate).

## 2. Auth Flow
- NextAuth + Keycloak (see `src/lib/auth.ts`).
- JWT refresh handled entirely server-side; `/api/auth/session` no longer exposes tokens.
- `useRequireAuth` simply enforces authenticated state and redirects to `/login` when missing; errors trigger re-login.
- Frontend never consumes raw tokens; all API calls proxy through `/api/backend/*` where the server injects the bearer token via `getToken`.

## 3. API Client Contract
- All HTTP calls use `ApiResponse<T>` envelope handled by `apiRequest`/`apiFetch`.
- Client fetches point to `/api/backend/...` which forwards to the Go service and adds `Authorization` headers server-side.
- Query keys include pagination/search params (token state no longer needed in key).

## 4. UI Standards
- **Cards**: Use `AppCard` (`rounded-sm`, border, `p-4`, no shadow) for all panels and list containers.
- **Buttons**: Default to small height, compact padding, no shadow, icons ≤14px; focus ring uses `ring-ring/40`.
- **Dialogs**: Shadcn `<Dialog>` for add/edit forms, with `text-xs` labels and tight spacing.
- **Toasts & Loader**: Sonner toaster themed with background/foreground/border; NextJS top loader for route transitions.
- **Tables (Reusable Shell)**:
  - `DataTable` wraps TanStack Table with shadcn table primitives, pinned column styling, bulk-selection-aware action bar, and the shared pagination footer.
  - `useDataTable` centralises pagination, sorting, and filter state (synced to the URL with `nuqs`) so every listing page gets multi-sort and advanced filter behaviour for free.
  - `TableHeader` owns the page-level title/description/primary action. All table-specific controls (search, quick filters, sort/filter builders, view options) live inside the toolbar components described below.
  - `DataTableAdvancedToolbar` combines quick inputs with `DataTableSortList`, the command-palette style `DataTableFilterMenu`, and the Notion-like `DataTableFilterList`.
  - Table markup uses `border-collapse`, `rounded-sm` container, text size 12-13px, row checkboxes in a fixed 42px column, status toggles via `<Switch>`, dropdown menus for row actions, and a floating `DataTableActionBar` that surfaces bulk actions whenever rows are selected.
  - Quick filters appear as segmented buttons (equal height, square corners) adjacent to the search input; tool buttons stay on a single row and collapse gracefully on small screens.
- **Spacing**: Compact padding everywhere—inputs (`h-8`), sections `p-4`, gap utilities ≤4.

## 5. Data Table Usage
- Always pair `TableHeader` with the shared `DataTable` + `DataTableAdvancedToolbar` combo when building CRUD list pages (departments is the reference implementation).
- `useDataTable` owns TanStack state plus the URL parameters (`page`, `perPage`, `sort`, `filters`, `joinOperator`). Consume those params when calling the backend so sort/filter changes refetch data automatically, and future pages can deep-link directly into a configured table.
- Expose per-page quick filters (button group) and plain keyword search near the start of the toolbar; follow them with the sort builder, advanced filter builder, and command palette trigger.
- Provide a `DataTableActionBar` with contextual bulk actions (export, delete, status toggles, etc.) whenever row selection is enabled.
- Keep list surfaces inside bordered containers and show skeletons while data loads; mutations continue to use toasts for feedback.
- **CRUD Page Blueprint**: Treat `src/app/departments/departments-page-client.tsx` (plus its `_components` helpers) as the canonical blueprint for CRUD screens. New data-management pages should mirror its structure: URL-synced `useDataTable` setup, extracted dialog/filter components, reusable bulk-action bars, shared toast helper usage, and the same spacing/typography rules.
- **Other Master Data Pages**: `/program-studi`, `/posisi`, `/kelas-pegawai`, `/aktivitas`, `/jumlah-cuti`, dan `/ikatan-kerja` reuse the new `createMasterDataPage` helper (`src/features/master-data/master-data-page.tsx`) for consistent CRUD scaffolding (search, status filters, export, dialogs). Forms live under each route's `_components` folder to keep payload validation close to the UI.

## 6. Security & Dev Workflow
- `.env` requires `NEXT_PUBLIC_API_BASE_URL` to point to the Go backend; the proxy uses it server-side so tokens never leave the browser.
- `npm run dev` (port forced to 3001).
- `npm run lint` for ESLint/Next rules.
- Update this spec whenever new shared UI elements or flows are introduced so other CRUD modules reuse the same patterns.
