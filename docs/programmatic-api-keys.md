# Programmatic API Keys

This guide is the **machine-facing key lifecycle path**: your backend creates, reads, lists, expires, revokes, and archives API keys using Runtime and the same project secret used by SDK authorize.

For live request protection, start with the [Quickstart](quickstart.md). For human-operator key management, see the [Control Plane operator guide](control-plane-operator-guide.md). For project secret rotation, see [Project secret and rotation overlap](project-secret-rotation.md).

## When To Use This Guide

| Path | Use This When |
|------|---------------|
| **Machine-facing key lifecycle** | Your backend mints or retires keys for customers through Runtime HTTP or `CeibaRuntimeClient`. |
| **[Quickstart](quickstart.md)** | Your Express/Fastify API needs request-time protection. |
| **[Control Plane operator guide](control-plane-operator-guide.md)** | A human operator manages keys in the console. |
| **[Project secret and rotation overlap](project-secret-rotation.md)** | You need to rotate `x-ceiba-project-secret` safely. |

Control Plane and programmatic APIs write the same `api_keys` rows for a project.

## Prerequisites

- A running Ceiba Runtime base URL, for example `http://localhost:3001`.
- A project UUID.
- A project secret shown from Control Plane project create or rotation.
- `@ceibalabs/ceiba-sdk` installed if you use the SDK client instead of direct HTTP.

All routes below require:

```http
x-ceiba-project-secret: <your-project-secret>
```

Use HTTPS in production. If you rotate the secret, both current and unexpired previous values work during the 24-hour overlap. See [Project secret and rotation overlap](project-secret-rotation.md).

## Mental Model

| Layer | Role |
|-------|------|
| **Runtime** | Owns `api_keys` rows, hashes, and lifecycle mutations. |
| **SDK** | Thin HTTP client using `runtimeBaseUrl`, `projectId`, and `projectSecret`. |
| **Your backend** | Stores the project secret safely and calls Runtime when you mint or retire customer keys. |

Runtime never returns key hashes or plaintext on read/list. Plaintext is returned once from create. Store or display it immediately if your product needs to show it to an end user.

## HTTP Reference

Replace `{runtimeBaseUrl}`, `{projectId}`, and `{apiKeyId}`.

| Method | Path | Body | Success |
|--------|------|------|---------|
| `GET` | `/rt/projects/{projectId}/api-keys` | - | `{ "apiKeys": [ ... ] }` newest first |
| `GET` | `/rt/projects/{projectId}/api-keys/{apiKeyId}` | - | One key object |
| `POST` | `/rt/projects/{projectId}/api-keys` | `{ "displayName": string }` | `{ apiKeyId, displayName, keyPrefix, plaintextKey }` |
| `PATCH` | `/rt/projects/{projectId}/api-keys/{apiKeyId}` | `{ "expiresAt": <ISO string> or null }` | Updated key |
| `POST` | `/rt/projects/{projectId}/api-keys/{apiKeyId}/revoke` | - | `{ apiKeyId, status: "revoked" }` |
| `POST` | `/rt/projects/{projectId}/api-keys/{apiKeyId}/archive` | - | `{ apiKeyId, status: "archived" }` |

Path parameters must be UUIDs. JSON bodies use `Content-Type: application/json`.

### Read Shape

List/get/PATCH responses include:

- `apiKeyId`
- `displayName`
- `keyPrefix`
- `status` (`active`, `revoked`, or `archived`)
- `createdAt`
- `expiresAt`
- `revokedAt`
- `archivedAt`
- `lastUsedAt`

Timestamp fields are ISO 8601 strings when present.

### Common HTTP Errors

These are transport errors, not `AccessDecision` denials:

| Code | Typical Cause |
|------|---------------|
| `400` | Invalid UUID path segment or malformed JSON body. |
| `401` | Missing or invalid project secret. |
| `404` | Key not found for that project. |
| `409` | Conflicting state, such as expiry update on a non-active key. |
| `503` | Runtime or database unavailable. |

SDK users receive `CeibaRuntimeTransportError` with `status` and `body` for non-2xx responses.

## SDK Reference

Configure the client as in the [Quickstart](quickstart.md), then:

```ts
const client = new CeibaRuntimeClient(config);

// Read
const { apiKeys } = await client.listApiKeys();
const key = await client.getApiKey(apiKeyId);

// Create: plaintextKey is returned once
const created = await client.createApiKey("Production CI");

// Expiry: ISO string or null to clear; active keys only
const updated = await client.setApiKeyExpiry(
  apiKeyId,
  "2030-01-01T00:00:00.000Z",
);
await client.setApiKeyExpiry(apiKeyId, null);

// Revoke / archive
await client.revokeApiKey(apiKeyId);
await client.archiveApiKey(apiKeyId);
```

Useful exported types:

- `ApiKeySummary`
- `ApiKeyListResult`
- `ApiKeyCreateResult`
- `ApiKeyLifecycleResult`

For transport HTTP mapping from any Runtime call, use `httpStatusForRuntimeTransport`. See [Quickstart - Current transport behavior](quickstart.md#current-transport-behavior).

## Demo Script

`ceiba-examples/express-proof/scripts/programmatic-keys.mjs` runs:

1. list keys
2. create a revoke-path key
3. read it
4. set and clear expiry
5. revoke it
6. create a second archive-path key
7. archive it
8. list keys again

Run from `ceiba-examples/express-proof/`:

```bash
npm run demo:programmatic-keys
```

## What This Guide Does Not Cover

- Control Plane UI flows. See [Control Plane operator guide](control-plane-operator-guide.md).
- Authorize request behavior, policies, quotas, or subscriptions. See [Quickstart](quickstart.md).
- Project secret rotation overlap. See [Project secret and rotation overlap](project-secret-rotation.md).
- Local Runtime bootstrap or database migrations.

## Related

- [Docs home](index.md)
- [Quickstart](quickstart.md)
- [Control Plane operator guide](control-plane-operator-guide.md)
- [Project secret and rotation overlap](project-secret-rotation.md)
