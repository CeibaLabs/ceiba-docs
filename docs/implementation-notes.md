# ceiba-docs — implementation notes

## 2026-05-09 — Quickstart (docs-only)

- Added `docs/quickstart.md` as a public-facing quickstart for the real **Runtime + `@ceibalabs/ceiba-sdk`** integration shape.
- Tightened the doc boundary so internal bootstrap material does **not** live in the public quickstart:
  - no Postgres/Redis bring-up
  - no raw SQL seed data
  - no Prisma/table-level operator steps
- Kept the public content focused on:
  - SDK configuration
  - Express/Fastify integration shape
  - denial and transport behavior that matches the landed SDK mapping
- Explicitly notes that local infrastructure/bootstrap details are still internal while Control Plane flows evolve.
- Branch: `docs/docs-quickstart`.

## 2026-05-14 — Programmatic key workflows (docs-only)

- Added **`docs/programmatic-api-keys.md`**: machine-facing Runtime routes + **`CeibaRuntimeClient`** methods; auth header; read vs create semantics; common HTTP errors; explicit exclusions (no Control Plane bootstrap, no authorize deep dive).
- Linked from **`README.md`** and cross-linked from **`docs/quickstart.md`** (end of “What is still evolving”).
- Branch: **`docs/programmatic-key-workflows`**; **Repo:** feature **`dc7628f`** (merge to **`dev`** pending review).

## Launch validation (2026-05-19, read-only)

- **`dev`** at **`5aa80c5`**: `docs/programmatic-api-keys.md` and quickstart claims match landed Runtime + SDK behavior; no launch-blocking findings.

## 2026-06-08 — Docs-site UI / information architecture (`feat/docs-site-ui`)

- Added **`docs/index.md`** as the docs-site home source: choose-your-path table, shipped MVP surface summary, examples pointers, and explicit scope guardrails.
- Added **`docs/project-secret-rotation.md`** for **`x-ceiba-project-secret`**, current vs previous secret behavior, fixed **24-hour** overlap, second-rotation single-slot behavior, and operator/integrator responsibilities.
- Added **`docs/control-plane-operator-guide.md`** for shipped MVP workflows only: Clerk auth, owner-scoped projects, project context, project create/secret rotation, API key lifecycle, policies, subscriptions, Stripe Checkout/webhook/reconcile backbone, and read-only usage.
- Reworked **`README.md`** into a docs-site entry map for **`docs.useceiba.com`**.
- Tightened **`docs/quickstart.md`** and **`docs/programmatic-api-keys.md`** with clearer request-protection vs operator vs machine-facing paths, current Control Plane cross-links, Fastify/Express examples references, and project-secret rotation links.
- Used parked **`feat/docs-mvp-expansion`** at **`3848428`** as reference input only; content was adapted to current Clerk auth and owner-scoped project behavior rather than merged wholesale.
- Out of scope: docs app generator, examples refresh, product code, schema/migrations, Stripe configuration, billing seed/backfill, gateway/x402/MCP/OAuth/JWT provider expansion, orgs/roles/RBAC, or public pricing/plan claims.

## Next

- Review/merge the docs-site UI branch, then return to an explicit approval gate before examples refresh, billing plan-catalog seed/backfill, or live-stack smoke.
