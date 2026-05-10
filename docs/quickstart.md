# Quickstart: Protect a Node Route with Ceiba

This guide describes the **current real integration shape** for Ceiba:

- **Runtime enforces**
- **SDK adapts**
- **your existing Node API keeps its own route handlers**

Ceiba is currently best understood as a **Runtime + SDK path** for an existing Express or Fastify API. Public Control Plane flows are still evolving, so this quickstart stays focused on the working request path and does not promise dashboard setup that does not exist yet.

## What this guide covers

This guide shows the integration shape for:

1. configuring the SDK with a Runtime base URL, project ID, and project secret
2. protecting an Express route with `@ceibalabs/ceiba-sdk`
3. understanding the current denial and transport behavior

## What this guide does not cover

The following are intentionally **not** part of this public quickstart yet:

- local Postgres or Redis bring-up
- direct Runtime repo bootstrap
- raw SQL seed data
- Prisma or table-level setup steps
- Control Plane CRUD flows for projects, keys, or policies

Those local infrastructure and bootstrap details are currently internal/developer setup while the productized Control Plane path is still evolving.

## What you need

You should already have:

- an existing Node API
- Express or Fastify
- access to a running Ceiba Runtime environment
- a valid Ceiba project ID
- a valid Ceiba project secret
- an API key that belongs to a project and policy already configured for that Runtime

## Install the SDK

```bash
npm install @ceibalabs/ceiba-sdk
```

If you are using Express, also install Express in your app.

## Configure the Runtime client

```ts
import { CeibaRuntimeClient, parseCeibaSdkConfig } from "@ceibalabs/ceiba-sdk";

const config = parseCeibaSdkConfig({
  runtimeBaseUrl: process.env.CEIBA_RUNTIME_URL!,
  projectId: process.env.CEIBA_PROJECT_ID!,
  projectSecret: process.env.CEIBA_PROJECT_SECRET!,
});

const client = new CeibaRuntimeClient(config);
```

The SDK sends:

- the request details in the authorize body
- the project secret as Runtime transport auth

Runtime remains the source of truth for:

- project auth
- API key validation
- policy matching
- subscription gating
- rate limits
- quota checks
- usage recording

## Protect an Express route

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

After an allow decision, the SDK attaches normalized request context to the request.

## Fastify usage

For Fastify, use the exported route-level pre-handler:

- `ceibaFastifyPreHandler`

The intended shape is the same:

- SDK extracts request credentials
- SDK calls Runtime
- Runtime returns allow or deny
- SDK attaches normalized access context only on allow

## Current denial behavior

The SDK maps the current Runtime denial set to stable HTTP behavior without re-implementing Runtime rules.

| `denialReason` | HTTP | `error` |
|---|---:|---|
| `missing_api_key`, `invalid_api_key`, `revoked_api_key`, `archived_api_key`, `expired_api_key` | 401 | `ceiba_unauthorized` |
| `policy_no_match`, `inactive_subscription` | 403 | `ceiba_forbidden` |
| `quota_exceeded` | 429 | `ceiba_quota_exceeded` |
| `rate_limited` | 429 | `ceiba_rate_limited` |

## Current transport behavior

Some failures are **not** customer access denials. For example:

- invalid project secret
- malformed authorize input
- Runtime infrastructure failures

In those cases, the SDK returns a transport-style error rather than a customer-facing denial. Direct `CeibaRuntimeClient` users can also use:

- `httpStatusForDenial`
- `ceibaErrorCodeForDenial`
- `httpStatusForRuntimeTransport`

These exports are intended to keep host-app behavior consistent without moving enforcement into the SDK.

## What is still evolving

Today, the public quickstart stops at the real Runtime + SDK request path.

Still evolving:

- productized Control Plane flows
- public examples that mirror the quickstart
- fuller docs-site navigation and onboarding layers

That is intentional. The goal is to document the path that is already real, not to promise operator workflows that are still internal.
