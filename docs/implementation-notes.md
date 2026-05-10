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

## Next

- Wire content into the public docs site when the site generator and navigation exist; keep markdown source as the contract until then.
