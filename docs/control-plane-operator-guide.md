# Control Plane Operator Guide

This guide documents what the shipped Ceiba Control Plane supports today for human operators.

The Control Plane configures state in Postgres. Runtime enforces that state on live requests. For integration code, see the [Quickstart](quickstart.md). For backend-driven key lifecycle, see [Programmatic API keys](programmatic-api-keys.md). For secret semantics, see [Project secret and rotation overlap](project-secret-rotation.md).

---

## What Control Plane Is

| Control Plane is | Control Plane is not |
|------------------|----------------------|
| Clerk-authenticated operator console | Runtime hot-path enforcement |
| Project, key, policy, subscription, and usage UI | Full customer portal |
| Project ownership scoped to the creating Clerk subject | Teams, orgs, roles, invites, or RBAC |
| Shared Postgres with Runtime | Schema migration authority |

Runtime remains the migration authority. The Control Plane Prisma schema is a mirror for client generation only.

---

## Auth And Route Protection

Control Plane uses Clerk for the MVP auth layer.

Shipped auth surfaces:

- `/login` - Clerk sign-in
- `/sign-up` - Clerk sign-up
- Clerk-owned forgot password and reset password flow
- Google social sign-in when configured in Clerk
- GitHub social sign-in when configured in Clerk
- authenticated dashboard session
- user/profile identity through Clerk user data
- logout through Clerk session handling

Protected console routes:

- `/`
- `/projects`
- `/keys`
- `/policies`
- `/subscriptions`
- `/usage`

The old `CEIBA_OPERATOR_PASSWORD` gate is retired as the primary auth mechanism.

---

## Ownership Scope

Projects are owned by the Clerk subject that creates them.

Current behavior:

- `/projects` lists only projects owned by the signed-in Clerk user.
- `/keys`, `/policies`, `/subscriptions`, and `/usage` only read or mutate owned projects.
- Manual `?projectId=...` deep links are validated server-side against the current Clerk subject.
- Existing unowned projects are hidden by default and are not automatically claimed.

There are no teams, orgs, roles, memberships, or RBAC in this MVP.

---

## Projects

Route: `/projects`

Operators can:

- create a project
- copy the one-time project secret from the success UI
- edit project name and description
- disable or enable a project
- rotate the project secret
- open project-scoped keys, policies, subscriptions, and usage views

Project create stores the current Clerk user subject as the project owner.

Project secret plaintext is shown once. Use it as `x-ceiba-project-secret` when calling Runtime, or as SDK `projectSecret`. Rotation uses a fixed 24-hour overlap. See [Project secret and rotation overlap](project-secret-rotation.md).

The project slug is not editable from the shipped Control Plane UI.

---

## API Keys

Route: `/keys`

The sidebar project selector or `?projectId=...` selects the owned project.

Operators can:

- create an API key
- copy the plaintext key once after create
- view prefix, status, created time, expiry, revoke/archive times, and last-used time when available
- set expiry on active keys
- clear expiry on active keys
- revoke active keys
- archive active keys

Plaintext key material is shown once on create. Runtime stores hashes and uses the prefix for operator visibility.

Revoked and archived keys are not reactivated from the shipped UI. Expired keys are denied by Runtime with `expired_api_key`.

Backend-driven key lifecycle uses the same Runtime rows. See [Programmatic API keys](programmatic-api-keys.md).

---

## Access Policies

Route: `/policies`

Runtime evaluates active policies in priority order. The Control Plane configures those policy rows.

Operators can:

- create policies
- set path pattern
- set method pattern (`*` or one HTTP verb)
- set priority
- set active/inactive state
- edit path, method, priority, active state, and description
- deactivate a policy
- delete a policy

Policy names are not editable in the shipped UI.

---

## Subscriptions And Billing Backbone

Route: `/subscriptions`

The shipped UI shows available active billing plans from the database and the current project subscription state. It does not publish public plan/pricing claims.

There are three separate billing mechanisms:

| Mechanism | What It Does | When Subscription State Updates |
|-----------|--------------|---------------------------------|
| **Select plan** | Upserts the local `project_subscriptions` row for the selected `billing_plans` row. | Immediately on submit. |
| **Stripe Checkout** | Creates a Stripe hosted Checkout Session in subscription mode when Stripe env is configured and the plan has a `stripe_price_id`. | On webhook sync, not merely on browser return. |
| **Sync from Stripe** | Operator-triggered retrieve and apply for an existing Stripe subscription id. | On submit when a Stripe subscription id exists. |

Webhook endpoint:

- `POST /api/webhooks/stripe`

Handled MVP events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Required env for Checkout:

- `STRIPE_SECRET_KEY`
- `CEIBA_PUBLIC_APP_URL`

Required env for webhook verification:

- `STRIPE_WEBHOOK_SECRET`

For local Stripe testing, use Stripe CLI forwarding to the Control Plane webhook route and put real secrets in `.env.local` or deployment env, not `.env.example`.

Not shipped in this MVP: reconciliation cron, polling jobs, billing email, customer billing portal, or public pricing catalog claims.

---

## Usage

Route: `/usage`

Usage is read-only in Control Plane. Runtime records usage during authorize.

The page shows:

- current UTC month totals when a rollup exists
- allowed and denied request counts
- quota remaining when a plan quota is present
- recent monthly rollups
- recent usage events

There is no charting library, analytics expansion, or Control Plane usage write path in this MVP.

---

## Choose The Right Workflow

| Goal | Start Here |
|------|------------|
| Protect Express/Fastify routes | [Quickstart](quickstart.md) |
| Mint or retire keys from your backend | [Programmatic API keys](programmatic-api-keys.md) |
| Rotate project secrets | [Project secret and rotation overlap](project-secret-rotation.md) |
| Run proof apps | `ceiba-examples/express-proof` or `ceiba-examples/fastify-proof` |

## MVP Limits

Do not expect the following as shipped:

- teams, orgs, roles, invites, or RBAC
- enterprise SSO, SAML, or OIDC enterprise connections
- custom password reset tokens or app-owned session store
- customer self-service portal
- pricing/plan claims that depend on future seed/backfill work
- gateway mode, x402, MCP docs server, OAuth/JWT provider expansion
- Runtime or SDK behavior changes from the Control Plane UI

## Related

- [Docs home](index.md)
- [Quickstart](quickstart.md)
- [Programmatic API keys](programmatic-api-keys.md)
- [Project secret and rotation overlap](project-secret-rotation.md)
