# Ceiba Docs

Source content for **docs.useceiba.com**.

Ceiba helps teams add API keys, policies, quotas, usage tracking, and subscription-gated access to an existing Node API without adopting a full gateway.

The docs describe shipped MVP behavior only: Runtime enforcement, the Node SDK integration path, Control Plane operator workflows, project secret rotation, machine-facing key lifecycle, billing checkout/webhook/reconciliation backbone, and the shipped Express/Fastify examples.

---

## Start Here

| I want to... | Read |
|--------------|------|
| See the docs-site entry point | [Docs home](docs/index.md) |
| Protect an Express or Fastify route | [Quickstart](docs/quickstart.md) |
| Create, list, expire, revoke, or archive keys from my backend | [Programmatic API keys](docs/programmatic-api-keys.md) |
| Operate projects, keys, policies, subscriptions, and usage in the console | [Control Plane operator guide](docs/control-plane-operator-guide.md) |
| Understand project secrets and rotation overlap | [Project secret and rotation overlap](docs/project-secret-rotation.md) |

---

## Documentation Map

### Getting Started

- **[Docs home](docs/index.md)** - release-ready information architecture for the public docs site.
- **[Quickstart](docs/quickstart.md)** - SDK config, Express/Fastify protection, Runtime authorize denials, and transport behavior.

### Machine-Facing Workflows

- **[Programmatic API keys](docs/programmatic-api-keys.md)** - Runtime key lifecycle routes and `CeibaRuntimeClient` methods that use `x-ceiba-project-secret`.
- **[Project secret and rotation overlap](docs/project-secret-rotation.md)** - current vs previous secret behavior, the fixed 24-hour overlap, and what happens on a second rotation.

### Operator Workflows

- **[Control Plane operator guide](docs/control-plane-operator-guide.md)** - Clerk-authenticated operator setup for projects, secrets, API keys, policies, subscriptions, usage, and billing reconciliation.

### Runnable Proofs

Proof apps live in `ceiba-examples`, not this repo:

- `express-proof/` - Express route protected with `ceibaExpressMiddleware`.
- `fastify-proof/` - Fastify route protected with `ceibaFastifyPreHandler`.
- `express-proof/scripts/programmatic-keys.mjs` - SDK key lifecycle demo.

---

## Architecture In One Pass

| Layer | Responsibility |
|-------|----------------|
| **Runtime** | Enforces request-time access, validates project secrets and API keys, applies policies, checks subscriptions/limits, records usage, and owns migrations. |
| **SDK** | Thin Node adapter for Express/Fastify plus Runtime client methods. It does not own enforcement logic. |
| **Control Plane** | Clerk-authenticated operator console for configuring projects, keys, policies, subscriptions, and usage views. |
| **Core Domain** | Shared package, not a service. |

---

## Scope Guardrails

The public docs intentionally avoid unshipped or unapproved surfaces:

- no gateway mode
- no x402
- no MCP docs server
- no OAuth/JWT provider expansion
- no enterprise SSO/SAML/OIDC claims
- no teams, orgs, roles, RBAC, invites, or customer portal claims
- no pricing or plan values that depend on unapproved billing seed/backfill work

## Related Repos

| Repo | Role |
|------|------|
| `ceiba-runtime` | Enforcement service and schema migration authority |
| `ceiba-sdk-node` | `@ceibalabs/ceiba-sdk` |
| `ceiba-control-plane` | Operator console |
| `ceiba-examples` | Express/Fastify proofs and programmatic key demo |

## License

This repository contains documentation content for Ceiba. License choice may vary depending on whether docs content should be reusable or proprietary.
