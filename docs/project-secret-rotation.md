# Project Secret And Rotation Overlap

This guide explains how Ceiba project secrets work in the shipped MVP: what `x-ceiba-project-secret` is for, how Runtime validates current and previous secrets, and what operators and integrators should expect during rotation.

For route protection, start with the [Quickstart](quickstart.md). For machine-facing key APIs that also use the project secret, see [Programmatic API keys](programmatic-api-keys.md). For operator UI steps, see the [Control Plane operator guide](control-plane-operator-guide.md).

---

## What The Project Secret Is

Each Ceiba project has a project secret. Control Plane shows the plaintext once when the project is created and once after each rotation. Runtime stores only a SHA-256 hash of the UTF-8 secret, not the plaintext.

The project secret is transport auth between your backend/SDK and Runtime. It is not an end-customer API key.

Runtime calls that require the project secret include:

- `POST /rt/authorize`
- `/rt/projects/{projectId}/api-keys` machine-facing key lifecycle routes

Send it as:

```http
x-ceiba-project-secret: <your-project-secret>
```

End-customer API keys are separate. Runtime validates the project first, then evaluates the presented end-customer API key and policy/subscription state.

---

## How Runtime Validates The Secret

Runtime compares the presented secret against:

| Slot | Behavior |
|------|----------|
| `project_secret_hash` | Current secret hash. Accepted when it matches. |
| `previous_project_secret_hash` | Previous secret hash. Accepted only while `previous_project_secret_expires_at` is still in the future. |

If neither slot matches, or if the project is not active, project auth fails.

For machine-facing key routes, this is a `401`. For SDK authorize calls, this is surfaced as a transport-style failure rather than an end-customer `AccessDecision` denial.

---

## Rotation Window

Operators rotate project secrets in Control Plane from the project actions menu.

On rotation:

1. The current hash moves into the previous-secret slot.
2. `previous_project_secret_expires_at` is set to now plus 24 hours.
3. A new plaintext secret is generated and shown once.
4. The new secret hash becomes the current `project_secret_hash`.

During the 24-hour overlap, Runtime accepts either the new current secret or the unexpired previous secret. This lets integrators roll the new value through servers, jobs, CI, and secret stores without an instant cutover.

After the overlap expires, only the current secret works.

---

## Second Rotation During Overlap

The MVP stores one previous-secret slot, not a secret history chain.

If an operator rotates again while the previous overlap is still active:

- the old current secret becomes the new previous secret
- the previous slot is replaced
- any caller still using the older previous secret stops working immediately

Control Plane warns when overlap is active. A second rotation is still allowed for urgent cases, but it should be coordinated.

---

## Integrator Checklist

1. Identify every caller that uses `CEIBA_PROJECT_SECRET`, SDK `projectSecret`, or direct `x-ceiba-project-secret` headers.
2. Rotate from Control Plane and copy the new plaintext immediately.
3. Deploy the new secret to every caller during the 24-hour overlap.
4. Avoid a second rotation until all callers are confirmed on the new value.
5. After overlap, remove the old value from config and secret stores.

Ceiba does not push secret updates to customer hosts. Rotation is operator-initiated; rollout is the integrator's responsibility.

---

## Responsibilities

| Role | Responsibility |
|------|----------------|
| **Operator** | Create projects, rotate secrets, copy one-time plaintext, and coordinate rollout. |
| **Integrator** | Store the secret safely and pass it on Runtime/SDK calls. |
| **Runtime** | Enforce current plus unexpired previous secret hash and never return plaintext. |

## MVP Limits

- Fixed 24-hour overlap.
- One previous-secret slot.
- No configurable overlap duration.
- No automatic propagation to SDK hosts.
- No Runtime HTTP endpoint for rotation in the MVP.
- No rotation audit history UI.

## Related

- [Quickstart](quickstart.md)
- [Programmatic API keys](programmatic-api-keys.md)
- [Control Plane operator guide](control-plane-operator-guide.md)
