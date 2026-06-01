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

## Next

- Wire content into the public docs site when the site generator and navigation exist; keep markdown source as the contract until then.
