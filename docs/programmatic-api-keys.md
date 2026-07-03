# Programmatic API Keys

Use the shipped Runtime routes or `CeibaRuntimeClient` when your backend needs to create and manage downstream API keys without a human operator using the Control Plane for every change.

This guide covers only the landed lifecycle: create, list, read, expiry set or clear, revoke, and archive.

## When To Use This Path

Use programmatic key lifecycle when your own backend needs to issue or retire credentials as part of a customer, workspace, or integration workflow.

For live request protection, start with the [Quickstart](/quickstart). For human-operated key management, use the [Control Plane Operator Guide](/control-plane-operator-guide).

## Prerequisites

You need:

- a Runtime base URL
- an owner-scoped project ID
- the project secret shown once during project creation or rotation
- `@ceibalabs/ceiba-sdk` if you use the SDK client

Every machine-facing key request uses:

```http
x-ceiba-project-secret: <your-project-secret>
```

Use HTTPS in production and keep the project secret on your backend. During a rotation, Runtime accepts the current secret and the single unexpired previous secret for 24 hours. See [Project Secret Rotation](/project-secret-rotation).

## Credential Behavior

- Create returns the full API-key plaintext once.
- Read and list never return plaintext or key hashes.
- Ceiba stores the key hash and a display-safe prefix.
- Expiry can be set or cleared only while the key is active.
- Revoked and archived keys remain unusable.
- Lifecycle calls are scoped to the configured project.

Store or deliver newly created plaintext immediately. It cannot be retrieved later.

## HTTP Routes

Replace `{runtimeBaseUrl}`, `{projectId}`, and `{apiKeyId}`.

| Method | Path | Body | Result |
|--------|------|------|--------|
| `GET` | `/rt/projects/{projectId}/api-keys` | None | Keys for the project, newest first |
| `GET` | `/rt/projects/{projectId}/api-keys/{apiKeyId}` | None | One key without secret material |
| `POST` | `/rt/projects/{projectId}/api-keys` | `{ "displayName": string }` | ID, display name, prefix, and one-time plaintext |
| `PATCH` | `/rt/projects/{projectId}/api-keys/{apiKeyId}` | `{ "expiresAt": <ISO string> or null }` | Updated active key |
| `POST` | `/rt/projects/{projectId}/api-keys/{apiKeyId}/revoke` | `{}` | Revoked lifecycle result |
| `POST` | `/rt/projects/{projectId}/api-keys/{apiKeyId}/archive` | `{}` | Archived lifecycle result |

Path parameters are UUIDs. Requests with a JSON body use `Content-Type: application/json`.
For revoke and archive, send the explicit empty object shown above when using that content type. `CeibaRuntimeClient` supplies it automatically.

### Read Shape

List, read, and expiry responses include:

- `apiKeyId`
- `displayName`
- `keyPrefix`
- `status`
- `createdAt`
- `expiresAt`
- `revokedAt`
- `archivedAt`
- `lastUsedAt`

Timestamp fields are ISO 8601 strings when present.

### Transport Errors

| Status | Typical cause |
|-------:|---------------|
| `400` | Invalid UUID, malformed JSON, or invalid expiry value |
| `401` | Missing or invalid project secret |
| `404` | Key not found for the project |
| `409` | Lifecycle conflict, such as changing expiry on a non-active key |
| `503` | Runtime or its database is unavailable |

SDK users receive `CeibaRuntimeTransportError` with the Runtime `status` and response `body`.

## SDK Client

Configure `CeibaRuntimeClient` with the same three server-side values used by the [Quickstart](/quickstart):

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

Then use the landed lifecycle methods:

```ts
const { apiKeys } = await client.listApiKeys();
const key = await client.getApiKey(apiKeyId);

const created = await client.createApiKey("Production CI");
console.log(created.plaintextKey); // returned once

await client.setApiKeyExpiry(
  created.apiKeyId,
  "2030-01-01T00:00:00.000Z",
);
await client.setApiKeyExpiry(created.apiKeyId, null);

await client.revokeApiKey(created.apiKeyId);
await client.archiveApiKey(anotherActiveApiKeyId);
```

Useful exported types:

- `ApiKeySummary`
- `ApiKeyListResult`
- `ApiKeyCreateResult`
- `ApiKeyLifecycleResult`

These methods are a thin client for Runtime. They do not move key lifecycle or authorization rules into the SDK.

## Runnable Lifecycle Example

The shipped [programmatic key lifecycle script](https://github.com/CeibaLabs/ceiba-examples/blob/dev/express-proof/scripts/programmatic-keys.mjs) performs:

1. list keys
2. create and read a disposable key
3. set and clear its expiry
4. revoke it
5. create and read a second disposable key
6. archive it
7. list keys again

Run it from the Express proof:

```bash
cd express-proof
npm install
npm run demo:programmatic-keys
```

The script creates real rows for the configured project. Use a test project unless you intentionally want those lifecycle records.

## Continue

- [Quickstart](/quickstart) for request-time protection.
- [Control Plane Operator Guide](/control-plane-operator-guide) for operator-managed keys.
- [Project Secret Rotation](/project-secret-rotation) for rotation rollout.
