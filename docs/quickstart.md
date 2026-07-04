# Quickstart

Protect an existing Express or Fastify route with the Ceiba Node SDK. The SDK extracts the downstream API key, calls Runtime, and either attaches normalized access context or returns a stable denial response.

## Before You Start

You need:

- an existing Node API using Express or Fastify
- a Ceiba Runtime URL
- an owner-scoped project created in the [Control Plane](https://app.useceiba.com)
- the project ID shown on the Control Plane Overview
- the project secret shown once during project creation or rotation
- an active downstream API key
- an active access policy matching the route and method you will protect

The three SDK settings stay on your API server:

```bash
CEIBA_RUNTIME_URL=<your-runtime-url>
CEIBA_PROJECT_ID=<your-project-id>
CEIBA_PROJECT_SECRET=<your-project-secret>
```

Never expose `CEIBA_PROJECT_SECRET` in browser or mobile code. It authenticates your backend to Runtime and is separate from the downstream API key presented by callers.

For project setup, see the [Control Plane Operator Guide](/control-plane-operator-guide). For rotation, see [Project Secret Rotation](/project-secret-rotation).

## Install The SDK

```bash
npm install @ceibalabs/ceiba-sdk
```

The package source is available in the [Ceiba Node SDK repository](https://github.com/CeibaLabs/ceiba-sdk).

## Configure The Runtime Client

```ts
import {
  CeibaRuntimeClient,
  parseCeibaSdkConfig,
} from "@ceibalabs/ceiba-sdk";

const config = parseCeibaSdkConfig({
  runtimeBaseUrl: process.env.CEIBA_RUNTIME_URL!,
  projectId: process.env.CEIBA_PROJECT_ID!,
  projectSecret: process.env.CEIBA_PROJECT_SECRET!,
});

const client = new CeibaRuntimeClient(config);
```

Runtime remains the source of truth for project auth, API-key validation, policy matching, subscription gating, quotas, rate limits, and usage recording.

## Protect An Express Route

Use `ceibaExpressMiddleware` on the route you want Runtime to evaluate:

```ts
import express from "express";
import {
  CeibaRuntimeClient,
  parseCeibaSdkConfig,
} from "@ceibalabs/ceiba-sdk";
import { ceibaExpressMiddleware } from "@ceibalabs/ceiba-sdk/express";

const config = parseCeibaSdkConfig({
  runtimeBaseUrl: process.env.CEIBA_RUNTIME_URL!,
  projectId: process.env.CEIBA_PROJECT_ID!,
  projectSecret: process.env.CEIBA_PROJECT_SECRET!,
});

const client = new CeibaRuntimeClient(config);
const app = express();

app.get(
  "/v1/hello",
  ceibaExpressMiddleware(client, config.projectId),
  (req, res) => {
    res.json({ ok: true, ceibaAccess: req.ceibaAccess });
  },
);
```

After an allow decision, normalized context is available as `req.ceibaAccess`.

See the runnable [Express proof](https://github.com/CeibaLabs/ceiba-examples/tree/dev/express-proof).

## Protect A Fastify Route

Use `ceibaFastifyPreHandler` as a route-level pre-handler:

```ts
import Fastify from "fastify";
import {
  CeibaRuntimeClient,
  parseCeibaSdkConfig,
} from "@ceibalabs/ceiba-sdk";
import { ceibaFastifyPreHandler } from "@ceibalabs/ceiba-sdk/fastify";

const config = parseCeibaSdkConfig({
  runtimeBaseUrl: process.env.CEIBA_RUNTIME_URL!,
  projectId: process.env.CEIBA_PROJECT_ID!,
  projectSecret: process.env.CEIBA_PROJECT_SECRET!,
});

const client = new CeibaRuntimeClient(config);
const app = Fastify();

app.get(
  "/v1/hello",
  {
    preHandler: ceibaFastifyPreHandler({
      client,
      projectId: config.projectId,
    }),
  },
  async (request) => {
    return { ok: true, ceibaAccess: request.ceibaAccess };
  },
);
```

After an allow decision, normalized context is available as `request.ceibaAccess`.

See the runnable [Fastify proof](https://github.com/CeibaLabs/ceiba-examples/tree/dev/fastify-proof).

## Call The Protected Route

The Express and Fastify adapters accept either a bearer token or `x-api-key`:

```bash
curl -i \
  -H "Authorization: Bearer <downstream-api-key>" \
  http://localhost:3000/v1/hello
```

```bash
curl -i \
  -H "x-api-key: <downstream-api-key>" \
  http://localhost:3000/v1/hello
```

## Denial Mapping

Runtime returns a normalized `denialReason`. The shipped adapters map it as follows:

| Runtime denial | HTTP status | Response `error` |
|----------------|------------:|------------------|
| `missing_api_key`, `invalid_api_key`, `revoked_api_key`, `archived_api_key`, `expired_api_key` | `401` | `ceiba_unauthorized` |
| `policy_no_match`, `inactive_subscription` | `403` | `ceiba_forbidden` |
| `quota_exceeded` | `429` | `ceiba_quota_exceeded` |
| `rate_limited` | `429` | `ceiba_rate_limited` |

## Transport Mapping

Project-secret failures, malformed Runtime input, and service failures are transport errors rather than downstream access denials.

| Runtime transport status | Host API status |
|--------------------------|----------------:|
| `401` or `403` | `503` |
| `400` | `502` |
| `500` and above | Preserved |
| Any other non-success status | `502` |

Direct client users can use:

- `httpStatusForDenial`
- `ceibaErrorCodeForDenial`
- `httpStatusForRuntimeTransport`
- `CeibaRuntimeTransportError`

These helpers provide response mapping only. Enforcement remains in Runtime.

## Next Steps

| Goal | Guide |
|------|-------|
| Create projects, keys, policies, and subscriptions | [Control Plane Operator Guide](/control-plane-operator-guide) |
| Rotate the server-side project secret | [Project Secret Rotation](/project-secret-rotation) |
| Create and retire API keys from your backend | [Programmatic API Keys](/programmatic-api-keys) |
