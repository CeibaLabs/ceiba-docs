# Ceiba Docs Home

Ceiba is a focused MVP for productizing an existing Node API with Runtime-backed access decisions, a thin Node SDK, and an operator Control Plane.

This docs home is the intended entry point for **docs.useceiba.com**. It is optimized for the three paths people need first: protect requests, operate the project, and manage machine-facing credentials safely.

---

## Choose Your Path

| Path | Start Here | You Will Learn |
|------|------------|----------------|
| **Request protection** | [Quickstart](quickstart.md) | Configure the SDK, protect Express/Fastify routes, and understand Runtime allow/deny behavior. |
| **Operator setup** | [Control Plane operator guide](control-plane-operator-guide.md) | Sign in with Clerk, create projects, rotate secrets, manage keys/policies, select plans, and read usage. |
| **Machine-facing lifecycle** | [Programmatic API keys](programmatic-api-keys.md) | Create, list, read, expire, revoke, and archive API keys from your backend using Runtime + SDK. |
| **Secret rotation** | [Project secret and rotation overlap](project-secret-rotation.md) | Use `x-ceiba-project-secret`, rotate safely, and plan around the 24-hour overlap window. |

---

## Shipped MVP Surface

### Runtime Enforcement

Runtime owns the hot path. It validates the project secret, checks end-customer API keys, applies active policies, evaluates subscription/limit state, returns allow or deny decisions, and records usage.

### SDK-First Integration

The Node SDK keeps host apps thin. Express uses `ceibaExpressMiddleware`; Fastify uses `ceibaFastifyPreHandler`. Both call Runtime instead of re-implementing enforcement rules in the application.

### Control Plane Workflows

The Control Plane is an operator console protected by Clerk. Operators create owned projects, copy one-time project secrets, rotate secrets, manage API keys and policies, select plans, start Checkout when Stripe is configured, sync subscriptions from Stripe, and read usage.

### Billing Backbone

The MVP has subscription-linked access state, Stripe Checkout session creation when configured, webhook intake, and operator reconciliation. The docs do not publish Free/Starter/Pro values or plan claims that depend on a future billing plan-catalog seed/backfill.

### Examples

`ceiba-examples` includes:

- `express-proof/`
- `fastify-proof/`
- `express-proof/scripts/programmatic-keys.mjs`

These examples demonstrate the shipped SDK integration shape. This repo links to them but does not edit them.

---

## What Ceiba Is Not In The MVP

Ceiba is not a full API gateway, customer portal, team/org admin platform, enterprise SSO product, x402 surface, or MCP docs server. Those topics are intentionally outside the current docs.

## Recommended Reading Order

1. [Quickstart](quickstart.md)
2. [Control Plane operator guide](control-plane-operator-guide.md)
3. [Project secret and rotation overlap](project-secret-rotation.md)
4. [Programmatic API keys](programmatic-api-keys.md)
