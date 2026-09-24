# Tasks Dashboard UI Design

**Goal:** Upgrade the audit task list into a modern dark SaaS dashboard without changing API calls, task fields, filters, fallback data, or report navigation.

**Scope:** The UI work is limited to `app/tasks/page.tsx`, shared shell navigation styling in `components/app-shell.tsx`, global CSS accents in `app/globals.css`, and smoke-test coverage in `tests/smoke.test.mjs`.

**Design:** The task page will use a non-black dark gradient background, KPI cards, card-based task rows, progress bars for authenticity/AIGC/risk, colored risk badges, hover lift, and a detail drawer driven by existing task state. The left navigation will keep the same routes but add icons, glass styling, hover states, and an active gradient glow.

**Data:** All displayed values come from existing `AuditTask` fields and existing label helper functions. No interface shape, API contract, or filtering behavior changes.

**Verification:** Add smoke assertions for dashboard markers, KPI labels, selected-task drawer state, and icon navigation; then run `npm run test`, `npm run typecheck`, and a local browser request for `/tasks`.
