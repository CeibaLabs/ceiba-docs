# Quickstart: Protect A Node Route With Ceiba

This guide is the **request protection path**: configure the SDK, call Runtime `authorize` on each protected route, and let Runtime return allow/deny decisions.

It matches the shipped `@ceibalabs/ceiba-sdk` and Runtime behavior for Express and Fastify.

## When To Use This Guide

| Path | Use This When |
|------|---------------|
| **Request protection** | You have an Express or Fastify API and need Ceiba to gate live HTTP requests. |
| **[Control Plane operator guide](control-plane-operator-guide.md)** | A human operator needs to create projects, rotate secrets, manage keys/policies, select plans, or read usage. |
| **[Programmatic API keys](programmatic-api-keys.md)** | Your backend needs to mint or retire API keys through Runtime + SDK. |
| **[Project secret and rotation overlap](project-secret-rotation.md)** | You need to rotate or roll out `x-ceiba-project-secret`. |

Runnable proofs live in `ceiba-examples`:

- `express-proof/`
- `fastify-proof/`

## What This Guide Covers

1. Configuring the SDK with Runtime base URL, project ID, and project secret.
2. Protecting an Express route with `ceibaExpressMiddleware`.
3. Protecting a Fastify route with `ceibaFastifyPreHandler`.
4. Understanding current denial and transport behavior.

## What This Guide Does Not Cover

- Control Plane operator workflows. See [Control Plane operator guide](control-plane-operator-guide.md).
- Machine-facing key create/list/revoke APIs. See [Programmatic API keys](programmatic-api-keys.md).
- Project secret rotation semantics. See [Project secret and rotation overlap](project-secret-rotation.md).
- Local Runtime bootstrap, Postgres, Redis, migrations, or seed data.
- Public pricing/plan catalog values.

## What You Need

- an existing Node API using Express or Fastify
- a running Ceiba Runtime base URL
- a project UUID
- a project secret from Control Plane project create or rotation
- an API key that belongs to the project
- an active access policy matching the route you protect

The SDK sends the project secret as `x-ceiba-project-secret` on authorize calls. Runtime uses it to authenticate the project before checking the end-customer API key.

## Install The SDK

```bash
npm install @ceibalabs/ceiba-sdk
```

## Configure The Runtime Client

```ts
import { CeibaRuntimeClient, parseCeibaSdkConfig } from "@ceibalabs/ceiba-sdk";

const config = parseCeibaSdkConfig({
  runtimeBaseUrl: process.env.CEIBA_RUNTIME_URL!,
  projectId: process.env.CEIBA_PROJECT_ID!,
  projectSecret: process.env.CEIBA_PROJECT_SECRET!,
});

const client = new CeibaRuntimeClient(config);
```

Runtime remains the source of truth for:

- project secret auth
- API key validation
- policy matching
- subscription gating
- rate limits and quotas
- usage recording

The SDK adapts your framework to Runtime. It does not re-implement enforcement rules.

## Protect An Express Route

```ts
import express from "express";
import {
  CeibaRuntimeClient,
  ceibaExpressMiddleware,
  parseCeibaSdkConfig,
} from "@ceibalabs/ceiba-sdk";

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

After an allow decision, the SDK attaches normalized access context to `req.ceibaAccess`.

## Protect A Fastify Route

Use the exported route-level pre-handler:

```ts
import Fastify from "fastify";
import {
  CeibaRuntimeClient,
  ceibaFastifyPreHandler,
  parseCeibaSdkConfig,
} from "@ceibalabs/ceiba-sdk";

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

After an allow decision, the SDK attaches normalized access context to `request.ceibaAccess`.

## Current Denial Behavior

The SDK maps Runtime denials to stable HTTP behavior:

| `denialReason` | HTTP | `error` |
|----------------|-----:|---------|
| `missing_api_key`, `invalid_api_key`, `revoked_api_key`, `archived_api_key`, `expired_api_key` | 401 | `ceiba_unauthorized` |
| `policy_no_match`, `inactive_subscription` | 403 | `ceiba_forbidden` |
| `quota_exceeded` | 429 | `ceiba_quota_exceeded` |
| `rate_limited` | 429 | `ceiba_rate_limited` |

## Current Transport Behavior

Some failures are not end-customer access denials:

- missing or invalid project secret
- malformed authorize input
- Runtime infrastructure failures

The SDK surfaces these as transport-style failures. Direct `CeibaRuntimeClient` users can use:

- `httpStatusForDenial`
- `ceibaErrorCodeForDenial`
- `httpStatusForRuntimeTransport`

These helpers keep host-app responses consistent without moving enforcement into the SDK.

## Next Steps

| Topic | Doc |
|-------|-----|
| Operator project/key/policy/billing setup | [Control Plane operator guide](control-plane-operator-guide.md) |
| Secret rotation and 24-hour overlap | [Project secret and rotation overlap](project-secret-rotation.md) |
| Backend-driven key lifecycle | [Programmatic API keys](programmatic-api-keys.md) |
| Docs-site overview | [Docs home](index.md) |
