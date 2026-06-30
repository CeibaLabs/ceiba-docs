# Project Secret Rotation

A project secret authenticates your backend or Node SDK to Runtime. It is server-side service auth, not the downstream API key presented by a caller.

This guide explains one-time handling, the fixed 24-hour overlap, and what happens if you rotate again before that overlap ends.

## Where The Secret Is Used

Your backend configures:

```bash
CEIBA_RUNTIME_URL=<your-runtime-url>
CEIBA_PROJECT_ID=<your-project-id>
CEIBA_PROJECT_SECRET=<your-project-secret>
```

The SDK sends the project secret to Runtime as:

```http
x-ceiba-project-secret: <your-project-secret>
```

The header authenticates:

- `POST /rt/authorize`
- project-scoped programmatic API-key lifecycle routes

Runtime authenticates the project before evaluating a downstream API key, access policy, subscription, quota, or rate limit.

## One-Time Plaintext

The Control Plane shows project-secret plaintext:

- once after project creation
- once after each rotation

Ceiba stores hashes, not retrievable plaintext. If the current secret is lost, rotate it; it cannot be displayed again.

Keep the secret in server-side environment configuration or a secret manager. Do not expose it in browser code, mobile code, logs, source control, or downstream client configuration.

## Current And Previous Secrets

Runtime can accept two project-secret hashes during a rotation:

| Slot | Behavior |
|------|----------|
| **Current** | Accepted while it matches the project's active current secret. |
| **Previous** | Accepted only until the fixed overlap expiry. |

If neither matches, project authentication fails. An inactive project also cannot authenticate successfully.

For programmatic key routes, invalid project auth returns `401`. For SDK authorization calls, the SDK treats it as a transport failure rather than a downstream `AccessDecision` denial.

## The 24-Hour Overlap

When an operator rotates from the Projects page:

1. The old current secret moves into the single previous-secret slot.
2. Its overlap expires 24 hours after rotation.
3. A new secret becomes current.
4. The new plaintext appears once in the rotation result.

During those 24 hours, Runtime accepts the new current secret and the unexpired previous secret. This gives you time to update API servers, background jobs, CI systems, and secret stores without an immediate cutover.

After the overlap expires, only the current secret works.

> The overlap duration is fixed in the MVP. It cannot be extended or configured.

## A Second Rotation During Overlap

The MVP stores one previous-secret slot, not a history of prior secrets.

If you rotate again while an overlap is active:

- the current secret moves into the previous slot
- the existing previous slot is replaced
- callers still using the older previous secret stop authenticating immediately
- a new 24-hour overlap begins for the newly replaced pair

The Control Plane warns when an overlap is already active. A second rotation is still available for urgent credential replacement, but it should be coordinated.

## Rotation Checklist

1. Inventory every server, job, and CI process using `CEIBA_PROJECT_SECRET`.
2. Rotate the secret from the Projects page.
3. Copy the new plaintext immediately.
4. Update every caller during the 24-hour overlap.
5. Confirm all callers use the new value before rotating again.
6. Remove the old value from configuration after the rollout.

Ceiba does not push the new secret into your infrastructure. The operator initiates rotation, and the integrator owns rollout to each caller.

## Responsibilities

| Role | Responsibility |
|------|----------------|
| **Operator** | Rotate the secret, copy the one-time plaintext, and coordinate timing. |
| **Integrator** | Store the value safely and update every backend caller. |
| **Runtime** | Accept the current and unexpired previous hashes and never return plaintext. |

## Continue

- [Quickstart](/quickstart) for Express and Fastify route protection.
- [Programmatic API Keys](/programmatic-api-keys) for machine-facing key lifecycle.
- [Control Plane Operator Guide](/control-plane-operator-guide) for project operations.
