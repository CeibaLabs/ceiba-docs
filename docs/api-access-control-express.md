# API Access Control In Express

How to decide who may call which routes of an existing Express API, how much they may call them, and what happens when they exceed that — without putting the API behind a gateway.

This guide covers the problem generally first, then shows what Ceiba does about it. If you only want the integration steps, the [Quickstart](/quickstart) is shorter.

## The Problem

An internal API becomes a product the moment someone outside your team calls it. At that point four questions appear at once:

1. **Who is calling?** Requests arrive with a credential instead of a session.
2. **What may they reach?** Not every caller should reach every route.
3. **How much may they consume?** Without a ceiling, one caller's retry loop is everyone's outage.
4. **When does access stop?** Keys get revoked, trials end, subscriptions lapse.

These are four different questions, and they tend to get answered in four different places — a middleware here, a database lookup there, a Redis counter somewhere else, and a billing webhook that nobody remembers touches access.

## The Usual First Version

Almost every API starts here:

```ts
app.use(async (req, res, next) => {
  const key = req.header("x-api-key");
  if (!key) return res.status(401).json({ error: "unauthorized" });

  const record = await db.apiKey.findUnique({ where: { key } });
  if (!record) return res.status(401).json({ error: "unauthorized" });

  req.customerId = record.customerId;
  next();
});
```

This works, and for a single internal consumer it is the right amount of code. It is worth being precise about where it stops working, because the answer is not "at scale" — it is "at the second requirement."

### It stores keys in plaintext

`findUnique({ where: { key } })` requires the key as-written to be in the database. A database dump is then a list of working credentials. Hashing fixes this, but hashing breaks the lookup: you can no longer query by the key, so you need an unhashed lookup component — usually a prefix stored alongside the hash — and a constant-time comparison afterwards.

### It has no concept of a route

`app.use` applies everywhere. The moment one caller should reach `GET /v1/reports` but not `POST /v1/reports`, this middleware cannot express it, and the logic moves into each handler. That is the point at which access rules stop being reviewable, because they are no longer in one place.

### It has no ceiling

Nothing here limits consumption. Adding a limit means a counter, and a counter means deciding what happens when two requests increment it at the same moment. A read-then-write counter will over-admit under concurrency, which is exactly when the limit matters.

### Revocation is only as fast as your cache

Once the key lookup is cached — and it will be, because a database round trip per request is expensive — revocation becomes eventually consistent. A revoked key keeps working for the cache TTL. For a compromised credential, that window is the whole problem.

### Subscription state is a separate system

Billing lives somewhere else and changes on a webhook. Connecting "subscription lapsed" to "requests now fail" is a piece of integration work that is easy to get subtly wrong, and the failure mode is silent: access continues after payment stops.

None of these are hard problems individually. They are just five separate ones, and they arrive in sequence rather than all at once, which is why the first version always looks sufficient.

## What Ceiba Does Instead

Ceiba moves the decision out of your handler without moving your traffic. A thin SDK sits in your Express app and asks a separate Runtime service one question per request: *should this request be allowed?*

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
  "/v1/reports",
  ceibaExpressMiddleware(client, config.projectId),
  (req, res) => {
    res.json({ ok: true, ceibaAccess: req.ceibaAccess });
  },
);
```

Your route, your framework, your hosting. The request never leaves your infrastructure to be inspected; only the access question does.

Runtime answers all four of the original questions in one decision:

- the key is verified against a stored hash
- the method and path are matched against the project's access policies
- rate limit and monthly quota are checked and decremented atomically
- subscription state is consulted, so a lapsed plan denies immediately

On an allow, `req.ceibaAccess` carries the normalized context — which key, which policy, which plan — so your handler can use it without doing its own lookup.

## Route-Level Rules

Policies are defined per method and path pattern rather than in code, which means changing who can reach what does not require a deploy.

A pattern ending in `*` matches that prefix and anything below it:

| Pattern | `GET /v1/reports` | `GET /v1/reports/42` | `GET /v1/billing` |
|---|:-:|:-:|:-:|
| `/v1/reports` | match | no match | no match |
| `/v1/reports*` | match | match | no match |
| `*` | match | match | match |

Trailing slashes are normalized on both sides, so `/v1/reports/` and `/v1/reports` behave identically. This matters more than it sounds: Express does not normalize `req.path`, so a client that appends a slash sends a genuinely different string, and a naive comparison denies a request that should have been allowed.

A request that matches no policy is denied with `policy_no_match`. That is a deliberate default — an unmatched route is a route nobody decided about.

## Limits That Hold Under Concurrency

Rate limits and quotas are checked and decremented in the same operation, so two simultaneous requests at the boundary cannot both be admitted. This is the part that is genuinely awkward to write yourself: the obvious implementation reads the counter, compares, then writes, and that sequence admits more than the limit precisely when traffic is heaviest.

The decision returns what remains:

```json
{
  "allowed": true,
  "limits": {
    "rateLimitPerMinute": 60,
    "monthlyQuota": 10000,
    "remainingThisMinute": 59,
    "remainingThisMonth": 8412
  }
}
```

## Denials Are A Fixed Set

Every denial has one of nine reasons, and the adapters map them to stable HTTP responses:

| Runtime denial | HTTP | Response `error` |
|---|---:|---|
| `missing_api_key`, `invalid_api_key`, `revoked_api_key`, `archived_api_key`, `expired_api_key` | 401 | `ceiba_unauthorized` |
| `policy_no_match`, `inactive_subscription` | 403 | `ceiba_forbidden` |
| `quota_exceeded` | 429 | `ceiba_quota_exceeded` |
| `rate_limited` | 429 | `ceiba_rate_limited` |

A closed set matters for the caller as much as for you. "Forbidden" tells an integrator nothing; `policy_no_match` versus `inactive_subscription` tells them whether to check their configuration or their invoice.

## What Happens If Runtime Is Unreachable

This is the question to ask of anything that sits in your request path, so it is worth answering plainly.

Runtime failures are treated as transport errors rather than access denials, and they are mapped separately:

| Runtime response | Your API returns |
|---|---:|
| 401 or 403 (project auth failed) | 503 |
| 400 (malformed input) | 502 |
| 500 and above | preserved |
| any other non-success | 502 |

A project-authentication failure becomes a 503 rather than a 401 on purpose: the *caller's* credential was never the problem, and telling them it was would send them debugging the wrong thing.

Ceiba **fails closed**. If Runtime cannot be reached, protected routes deny rather than admit. That is the right default for an access layer, but it means Runtime is in your critical path, and you should weigh that deliberately rather than discover it.

## When Not To Use This

Worth stating, because the honest answer is not "always":

- **One internal consumer and no plans to add more.** The middleware at the top of this page is genuinely enough. Do not add a network hop to solve a problem you do not have.
- **You already run a gateway** that does keys, policies and quotas. Ceiba is for teams who do not want to adopt one; if you have already paid that cost, use it.
- **Per-user authorization inside your domain model** — who owns this record, who may edit that field. That is application logic and belongs in your application. Ceiba answers whether a caller may reach a route, not what they may do with your data once inside.
- **You cannot tolerate a dependency in the request path.** Fail-closed means an outage in Runtime is an outage for protected routes.

## Next Steps

| Goal | Guide |
|---|---|
| Get a route protected | [Quickstart](/quickstart) |
| Create projects, keys, and policies | [Control Plane Operator Guide](/control-plane-operator-guide) |
| Issue and retire keys from your own backend | [Programmatic API Keys](/programmatic-api-keys) |
| Check what is running right now | [Service Health](/service-health) |
