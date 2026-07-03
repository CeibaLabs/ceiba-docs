# ceiba-docs — implementation notes

## 2026-07-03 — Programmatic lifecycle request clarification

- Updated the revoke/archive HTTP table to show the explicit `{}` JSON payload sent by the corrected Node SDK.
- Clarified that direct HTTP callers using `Content-Type: application/json` must send that empty object; SDK users do not manage it themselves.
- No new lifecycle capability or Runtime behavior is documented.

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

## 2026-06-30 — Deployable release docs (`feat/docs-release-navigation-content`)

- **Application scaffold:** converted the Markdown-only repo into a statically rendered Next.js App Router application with React, TypeScript, Tailwind CSS v4, Lucide icons, one constrained Radix/shadcn-style Sheet primitive, local Ceiba fonts, and the existing Markdown files as article sources.
- **Routes:** added `/`, `/quickstart`, `/control-plane-operator-guide`, `/programmatic-api-keys`, and `/project-secret-rotation` through a small local content registry and static generation. Added a real not-found page, canonical metadata, favicon metadata, robots, and sitemap.
- **Navigation:** added a restrained header, grouped desktop sidebar, active-page state, accessible mobile navigation with focus trapping/Escape/focus return through Radix Dialog, and previous/next article links.
- **Article rendering:** added GFM tables, heading ids and anchor controls, styled links/lists/blockquotes/inline code, keyboard-focusable code/table overflow containers, and responsive typography without a page-level overflow path.
- **Content reconciliation:** updated Clerk and owner-scoped Control Plane behavior, URL-backed project selection, Overview onboarding, one-time credential handling, current project/key/policy/usage workflows, Free/Starter/Pro catalog truth, initial-subscription-only Checkout, duplicate-Checkout prevention, paid-plan change limitation, webhook/return synchronization, and Ceiba confirmation email.
- **SDK/examples truth:** preserved Runtime-owned enforcement, thin SDK behavior, exact Express/Fastify adapter names, required `CEIBA_*` configuration, denial/transport mappings, fixed project-secret overlap, and the landed programmatic key lifecycle only.
- **Verified links:** local Git origins and repository paths were checked, and public GitHub URLs for the SDK, examples repo, Express proof, Fastify proof, and programmatic key script returned `200`.
- **Dependency hygiene:** pinned patched Next.js `15.5.19`, added a narrow PostCSS override for the nested Next.js dependency, and confirmed `npm audit --omit=dev` reports zero vulnerabilities.
- **Local route smoke:** all five docs routes, `robots.txt`, and `sitemap.xml` return `200`; an unknown docs route returns `404`. Rendered HTML includes active-page state, the mobile navigation trigger, anchored headings, internal links, and focusable table/code overflow containers.
- **Browser limitation:** the in-app browser connection failed before opening a tab because required sandbox metadata was unavailable. Desktop/mobile visual navigation, Sheet focus behavior, and console inspection remain operator-pending.
- **Deployment note:** `app.useceiba.com` and `docs.useceiba.com` did not resolve from public DNS during verification. The approved canonical URLs remain in the site; deployment/DNS work is intentionally outside this repo slice.
- **Out of scope:** no Runtime, SDK, Control Plane, examples, landing-site, schema, deployment/IaC, DNS, search, versioning, CMS, analytics, auth, API playground, generated reference, or post-MVP product work was included.

## 2026-06-30 — Public copy and rendering closeout

- Preserved the Founder-authored home and Operator Guide edits, including the concise provider-neutral sign-in credential boundary.
- Removed authentication-provider naming from release-facing README and article content; historical implementation notes remain unchanged.
- Restored visible ordered, unordered, and nested list markers through shared `.docs-prose` styles.
- Added restrained shared separators before major article sections without changing heading anchors or Markdown structure.
- Added server-rendered fenced-code highlighting with `rehype-pretty-code` and `shiki` using a restrained dark theme, language metadata, plaintext fallback, unchanged inline-code styling, and the existing focusable horizontal containment.
- Clean-install verification passed with `npm ci`, typecheck, lint, production build, and a production dependency audit reporting zero vulnerabilities.
- Local HTTP and rendered-HTML checks passed for all five public routes, list output, section styles, highlighted language/token output, focusable code blocks, contained tables, provider-neutral copy, internal links, and unknown-route `404` behavior.
- The in-app browser could not initialize because required sandbox metadata was unavailable. Desktop/mobile visual navigation, Sheet focus behavior, and browser console/hydration inspection remain operator-pending.
