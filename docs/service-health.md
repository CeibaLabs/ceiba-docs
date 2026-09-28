# Service Health

Ceiba exposes three public, unauthenticated endpoints for checking whether the platform is running and which build is deployed. They are the same endpoints our own deploy pipeline gates on, so what you see is what we act on.

None of them require an API key or a project secret. They return no customer data.

## Status Page

[useceiba.com/status](https://useceiba.com/status) checks every service live on page load and reports the result, including which dependency is failing when one is.

It is deliberately not cached. It also has no incident history — it reports the present moment only.

## Endpoints

| Service | Liveness | Readiness | Version |
|---------|----------|-----------|---------|
| Runtime | `GET https://api.useceiba.com/health` | `GET https://api.useceiba.com/ready` | `GET https://api.useceiba.com/version` |
| Control Plane | — | `GET https://app.useceiba.com/api/ready` | `GET https://app.useceiba.com/api/version` |

### Liveness vs Readiness

These answer different questions, and the difference matters if you are building a monitor.

**`/health`** returns `{"ok":true}` unconditionally whenever the process is accepting connections. It is the container's own liveness probe. It does not touch the database, so it stays `200` even when every authorization request is failing.

**`/ready`** actually queries each dependency:

```http
GET /ready
```

```json
{ "ok": true, "checks": { "database": "ok", "redis": "ok" } }
```

When a dependency is unavailable the endpoint returns **`503`** and names it:

```json
{ "ok": false, "checks": { "database": "ok", "redis": "unavailable" } }
```

> **Monitor `/ready`, not `/health`.** On 2026-08-19 Runtime served every authorization call as `503` with an unreachable database while `/health` reported `200` throughout. A liveness probe cannot tell the difference between "running" and "working".

The Control Plane's `/api/ready` reports `database` only; it does not use Redis.

### Version

```http
GET /version
```

```json
{ "sha": "920d7bdc99c60eb2a108243f0762704bb8b7e2f8", "schema": "20260921172045_add_sent_notifications" }
```

`sha` is the exact commit running. `schema` is the newest database migration that build expects — Runtime only.

`/version` never touches the database, deliberately. If it did, a database outage would also look like a failed deployment, and the two need telling apart.

The Control Plane returns `sha` only, since it does not own database migrations.

## Using These In Your Own Monitoring

Check `/ready` and assert on the body, not just the status code:

```bash
curl -fsS https://api.useceiba.com/ready | grep -q '"ok":true'
```

A status-code-only check passes on any `2xx`, including one from a proxy or holding page that is not Ceiba at all.

Reasonable defaults: poll every 30–60 seconds, alert after two consecutive failures rather than one, and treat a timeout as a failure rather than unknown.

## Support

If something is wrong and the status page does not reflect it, email [contact@useceiba.com](mailto:contact@useceiba.com).
