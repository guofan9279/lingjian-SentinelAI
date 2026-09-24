# Tasks Dashboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the audit task page into a dark SaaS dashboard while preserving all business logic and data structures.

**Architecture:** Keep data loading, filtering, and merge logic in `app/tasks/page.tsx`. Replace only the presentation tree with KPI cards, task cards, metric bars, and a detail drawer. Reuse existing badge components and helper functions.

**Tech Stack:** Next.js App Router, React client components, Tailwind CSS, Node smoke tests.

---

### Task 1: Smoke Test Guard

**Files:**
- Modify: `tests/smoke.test.mjs`

- [ ] Add assertions that `app/tasks/page.tsx` contains `tasks-dashboard-shell`, KPI copy, `selectedTask`, and a drawer marker.
- [ ] Add assertions that `components/app-shell.tsx` contains icon metadata and the active navigation glow class.
- [ ] Run `npm run test` and verify the new test fails before implementation.

### Task 2: Task Page Presentation

**Files:**
- Modify: `app/tasks/page.tsx`

- [ ] Preserve all state, `useEffect`, API calls, filters, `filteredTasks`, `emptyState`, and `mergeAuditTasks`.
- [ ] Add `selectedTask` state for the detail drawer.
- [ ] Add KPI calculations derived from existing visible tasks.
- [ ] Replace dense table markup with KPI cards, filter panel, card-based task list, metric bars, risk emphasis, and drawer.

### Task 3: Navigation And Global Polish

**Files:**
- Modify: `components/app-shell.tsx`
- Modify: `app/globals.css`

- [ ] Add nav item icon metadata without changing routes.
- [ ] Update nav item classes for glassmorphism, hover, and active gradient glow.
- [ ] Add dashboard background, soft-card, hover-lift, and drawer utility classes.

### Task 4: Verification

**Files:**
- Run commands only.

- [ ] Run `npm run test`.
- [ ] Run `npm run typecheck`.
- [ ] Request `http://localhost:3000/tasks` and confirm HTTP 200.
