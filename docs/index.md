# Ceiba Documentation

Ceiba helps teams productize an existing Node API with API keys, policies, plans, quotas, usage tracking, and subscription-gated access without adopting a full gateway.

These guides cover the shipped Ceiba MVP runtime and SDK versions, allowing you to connect an Express or Fastify API, configure access in the Control Plane, and manage credentials safely from either the console or programmatically from your backend.

## Choose Your Path

| Goal | Start here |
|------|------------|
| Protect an Express or Fastify route | [Quickstart](/quickstart) |
| Set up and operate a project | [Control Plane Operator Guide](/control-plane-operator-guide) |
| Create and retire keys from your backend | [Programmatic API Keys](/programmatic-api-keys) |
| Rotate a project secret safely | [Project Secret Rotation](/project-secret-rotation) |

## How Ceiba Fits Together

| Surface | Responsibility |
|---------|----------------|
| **Control Plane** | Signed-in console for owner-scoped projects, API keys, access policies, subscriptions, and usage. |
| **Runtime** | Makes request-time access decisions, enforces project and credential state, applies policies and limits, and records usage. |
| **Node SDK** | Thin Express and Fastify integration that calls Runtime and attaches normalized access context after an allow decision. |
| **Core Domain** | Shared internal contract package. It is not a running service. |

Runtime owns enforcement. The SDK adapts your Node framework to Runtime; it does not reproduce policy, key, subscription, quota, or rate-limit rules inside your application.

## Shipped MVP Workflows

### Request Protection

Configure three server-side values, install `@ceibalabs/ceiba-sdk`, and add the shipped Express middleware or Fastify pre-handler to a route. Runtime returns the access decision and the SDK maps it to stable HTTP behavior.

### Operator Setup

Sign in and create an owned project, copy its one-time project secret, create downstream API keys, define access policies, review the current plan, and inspect monthly usage and recent activity.

### Credentials

Project secrets and downstream API keys are separate:

- A **project secret** authenticates your backend or SDK to Runtime.
- An **API key** authenticates a downstream caller to your API.
- Project-secret plaintext is shown once during project creation or rotation.
- API-key plaintext is shown once during key creation.
- Ceiba stores hashes, not retrievable plaintext credentials.

Project-secret rotation includes one previous-secret slot with a fixed 24-hour overlap. A second rotation replaces that slot.

### Plans And Billing

Free, Starter, and Pro exist as the MVP plan catalog. The Control Plane shows each plan's current request limits without publishing prices here.

Eligible projects can start an initial paid subscription through Stripe Checkout. A project with an existing Stripe subscription cannot start another Checkout from the plan dialog, and paid-plan upgrade or downgrade behavior is not currently shipped.

Stripe webhook delivery is the primary subscription synchronization path, with an authenticated Checkout-return fallback. After successful Checkout synchronization, Ceiba sends its own subscription confirmation email.

## Runnable Examples

- [Express proof](https://github.com/CeibaLabs/ceiba-examples/tree/dev/express-proof) uses `ceibaExpressMiddleware`.
- [Fastify proof](https://github.com/CeibaLabs/ceiba-examples/tree/dev/fastify-proof) uses `ceibaFastifyPreHandler`.
- [Programmatic key lifecycle script](https://github.com/CeibaLabs/ceiba-examples/blob/dev/express-proof/scripts/programmatic-keys.mjs) covers create, read, list, expiry set/clear, revoke, and archive.

The public [Node SDK repository](https://github.com/CeibaLabs/ceiba-sdk-node) contains the package source.

## MVP Boundaries

The current product does not include gateway mode, x402, an MCP docs server, OAuth/JWT access providers, teams or organizations, RBAC, enterprise SSO, a customer portal, usage-based billing, advanced analytics, or multi-language SDKs.

Continue with the [Quickstart](/quickstart) to protect your first route.
