# Ceiba Docs

Deployable source for [docs.useceiba.com](https://docs.useceiba.com).

Ceiba helps teams productize an existing Node API with API keys, policies, plans, quotas, usage tracking, and subscription-gated access without adopting a full gateway.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS v4
- one constrained Radix/shadcn-style Sheet primitive
- Lucide icons
- local Markdown content rendered at build time
- Ceiba-owned colors, logo, and locally bundled typography

## Local Development

```bash
npm install
npm run dev
```

The dev server uses `PORT` when set and otherwise starts on `3000`.

Required checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Public Routes

| Route | Source |
|-------|--------|
| `/` | [`docs/index.md`](docs/index.md) |
| `/quickstart` | [`docs/quickstart.md`](docs/quickstart.md) |
| `/control-plane-operator-guide` | [`docs/control-plane-operator-guide.md`](docs/control-plane-operator-guide.md) |
| `/programmatic-api-keys` | [`docs/programmatic-api-keys.md`](docs/programmatic-api-keys.md) |
| `/project-secret-rotation` | [`docs/project-secret-rotation.md`](docs/project-secret-rotation.md) |

The local registry in `src/lib/docs-navigation.ts` owns route order, navigation grouping, descriptions, and previous/next links. Markdown remains the article source.

## Documentation Scope

The site documents shipped MVP behavior:

- Runtime-backed access enforcement
- thin Node SDK integration
- Express and Fastify adapters
- Clerk-authenticated, owner-scoped Control Plane workflows
- one-time project secrets and API keys
- fixed 24-hour project-secret rotation overlap
- programmatic API-key lifecycle
- Free, Starter, and Pro catalog tiers
- eligible initial paid subscription Checkout
- subscription synchronization and Ceiba confirmation email
- usage and quota visibility

It intentionally excludes gateway mode, x402, MCP docs server, OAuth/JWT provider expansion, organizations/RBAC, enterprise SSO, customer portal, usage-based billing, advanced analytics, and multi-language SDK claims.

## Verified Public Repositories

- [Node SDK](https://github.com/CeibaLabs/ceiba-sdk)
- [Examples](https://github.com/CeibaLabs/ceiba-examples)
- [Express proof](https://github.com/CeibaLabs/ceiba-examples/tree/dev/express-proof)
- [Fastify proof](https://github.com/CeibaLabs/ceiba-examples/tree/dev/fastify-proof)
- [Programmatic key lifecycle script](https://github.com/CeibaLabs/ceiba-examples/blob/dev/express-proof/scripts/programmatic-keys.mjs)

## License

MIT
