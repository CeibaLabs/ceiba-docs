# Programmatic API keys (Runtime + SDK)

This guide documents the **machine-facing** API key lifecycle that your **backend** can drive with the **project ID** and **project secret** — the same credentials the SDK uses to call Runtime `authorize`. It does **not** describe Control Plane UI flows.

For protecting routes with `authorize`, start with the [Quickstart](quickstart.md).

## Prerequisites

- A running **Ceiba Runtime** base URL (for example `https://runtime.example.com` or `http://localhost:3001`).
- A **project UUID** and **project secret** for that Runtime (typically issued when the project is provisioned).
- `@ceibalabs/ceiba-sdk` installed in the app that will call these APIs.

All routes below require the header:

```http
x-ceiba-project-secret: <your-project-secret>
```

Use **HTTPS** in production so the secret is not sent in clear text.

## Mental model

| Layer | Role |
|--------|------|
| **Runtime** | Owns `api_keys` rows, hashes, and lifecycle mutations. |
| **SDK** | Thin HTTP client: same config as `authorize` (`runtimeBaseUrl`, `projectId`, `projectSecret`). |
| **Your backend** | Stores the project secret safely; calls Runtime when you mint or retire keys for your own customers. |

Runtime never returns **key hashes** or **plaintext** on read/list. **Plaintext** is returned **once** from **create** — persist it securely if you show it to an end user.

## HTTP reference (Runtime)

Replace `{runtimeBaseUrl}`, `{projectId}`, and `{apiKeyId}` as needed.

| Method | Path | Body | Success |
|--------|------|------|--------|
| `GET` | `/rt/projects/{projectId}/api-keys` | — | `{ "apiKeys": [ ... ] }` — newest first |
| `GET` | `/rt/projects/{projectId}/api-keys/{apiKeyId}` | — | One key object (same shape as each list item) |
| `POST` | `/rt/projects/{projectId}/api-keys` | `{ "displayName": string }` | `{ apiKeyId, displayName, keyPrefix, plaintextKey }` |
| `PATCH` | `/rt/projects/{projectId}/api-keys/{apiKeyId}` | `{ "expiresAt": <ISO string> or null }` | Updated key (read shape). `null` clears expiry. |
| `POST` | `/rt/projects/{projectId}/api-keys/{apiKeyId}/revoke` | — | `{ apiKeyId, status: "revoked" }` |
| `POST` | `/rt/projects/{projectId}/api-keys/{apiKeyId}/archive` | — | `{ apiKeyId, status: "archived" }` |

Path parameters must be UUIDs. JSON bodies use `Content-Type: application/json`.

### Read shape (list item / get / PATCH response)

Each key is represented with (ISO 8601 strings for timestamps):

- `apiKeyId`, `displayName`, `keyPrefix`, `status` (`active` \| `revoked` \| `archived`)
- `createdAt`, `expiresAt`, `revokedAt`, `archivedAt`, `lastUsedAt` (nullable where applicable)

### Common HTTP errors (transport, not `AccessDecision`)

| Code | Typical cause |
|------|----------------|
| `400` | Invalid UUID path segment or malformed JSON body |
| `401` | Missing or invalid project secret |
| `404` | Key not found for that project |
| `409` | Conflicting state (for example revoke on an archived key, archive on a revoked key, or **PATCH expiry** when status is not `active`) |
| `503` | Runtime or database unavailable |

Direct `fetch` callers should read the response body for `error` / `message`. SDK users get **`CeibaRuntimeTransportError`** with **`status`** and **`body`** for non-2xx responses.

## SDK reference (`CeibaRuntimeClient`)

Configure the client as in the [Quickstart](quickstart.md), then:

```ts
const client = new CeibaRuntimeClient(config);

// Read
const { apiKeys } = await client.listApiKeys();
const key = await client.getApiKey(apiKeyId);

// Create (plaintextKey shown once)
const created = await client.createApiKey("Production CI");

// Expiry (ISO string or null to clear); active keys only
const updated = await client.setApiKeyExpiry(apiKeyId, "2030-01-01T00:00:00.000Z");
await client.setApiKeyExpiry(apiKeyId, null);

// Revoke / archive
await client.revokeApiKey(apiKeyId);
await client.archiveApiKey(apiKeyId);
```

Exported types useful at the boundary: **`ApiKeySummary`**, **`ApiKeyListResult`**, **`ApiKeyCreateResult`**, **`ApiKeyLifecycleResult`**.

For mapping **transport** HTTP codes from any Runtime call to a host response, the SDK still exposes **`httpStatusForRuntimeTransport`** (see [Quickstart — Current transport behavior](quickstart.md#current-transport-behavior)).

## What this guide does not cover

- Control Plane dashboards or human-operator flows
- **Authorize** request bodies, policies, quotas, or subscription details (see [Quickstart](quickstart.md))
- Postgres migrations, seed data, or running Runtime locally (internal bootstrap)

## Related

- [Quickstart: Protect a Node Route with Ceiba](quickstart.md)
