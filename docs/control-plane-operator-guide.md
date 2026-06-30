# Control Plane Operator Guide

Use the Ceiba Control Plane to configure projects, downstream API keys, access policies, subscriptions, and usage. Runtime reads and enforces that configuration when your Node API asks for an access decision.

[Open the Control Plane](https://app.useceiba.com) or continue below for the shipped workflows.

## Sign In And Create An Account

Clerk owns Control Plane authentication.

The shipped auth experience includes:

- email and password sign-up
- email and password sign-in
- forgot-password and reset-password flows
- Google sign-in when enabled
- GitHub sign-in when enabled
- authenticated dashboard sessions
- logout

Control Plane routes require a signed-in Clerk session. This operator identity is separate from both the project secret used by your backend and the API keys used by downstream callers.

## Project Ownership And Selection

Each project is associated with the Clerk subject that creates it.

- The Projects page lists only projects owned by the signed-in user.
- Project-scoped pages validate ownership before reading or changing data.
- Existing unowned projects are not automatically claimed or shown.
- The sidebar project selector updates the current page's URL-backed `projectId`.
- A project ID from another user does not expose that project's keys, policies, subscription, or usage.

The MVP does not include teams, organizations, memberships, roles, invites, or RBAC.

## Overview And Initial Setup

After selecting a project, Overview provides the shortest integration path:

1. Confirm the selected project and copy its project ID.
2. Keep the one-time project secret on your API server.
3. Configure `CEIBA_RUNTIME_URL`, `CEIBA_PROJECT_ID`, and `CEIBA_PROJECT_SECRET`.
4. Install the Node SDK and continue to the [Quickstart](/quickstart).

If no project exists, Overview directs you to create one first.

## Projects

Route: `/projects`

Operators can:

- create a project
- copy the project secret once from the creation result
- edit the project name and description
- disable or enable the project
- rotate the project secret
- open the project's keys, policies, subscription, and usage

Project slugs remain fixed after creation.

A disabled project is not authorized by Runtime. Re-enable it before expecting protected requests or machine-facing key operations to succeed.

> Project-secret plaintext appears only during project creation or rotation. Ceiba stores its hash and cannot retrieve the existing plaintext later.

Rotation keeps the previous secret valid for a fixed 24-hour overlap. See [Project Secret Rotation](/project-secret-rotation) before rotating a credential used by more than one service or job.

## API Keys

Route: `/keys`

API keys authenticate downstream consumers calling your API. They are not project secrets.

Operators can:

- create an API key
- copy the plaintext key once after creation
- view its prefix, status, creation time, expiry, lifecycle timestamps, and last-used time when available
- set or clear expiry on an active key
- revoke an active key
- archive an active key

Ceiba stores the key hash, not retrievable plaintext. Revoked, archived, and expired keys are denied by Runtime. The Control Plane does not reactivate revoked or archived keys.

For backend-driven lifecycle management, see [Programmatic API Keys](/programmatic-api-keys).

## Access Policies

Route: `/policies`

Access policies describe which method and path patterns Runtime should match.

Operators can:

- create a policy
- choose one HTTP method or `*`
- set a path pattern
- set an integer priority
- add an optional description
- activate or deactivate the policy
- edit its method, path, priority, active state, and description
- delete a policy

Runtime evaluates active policies in ascending priority order, so the lowest priority number matches first. Policy names stay fixed after creation.

## Subscriptions

Route: `/subscriptions`

The page shows the selected project's:

- current plan
- subscription status
- monthly request quota
- per-minute rate limit
- current billing period when available
- renewal or period-end state when available

Use **View plans** to compare the active Free, Starter, and Pro catalog tiers. The docs do not publish prices, and the plan dialog uses the current catalog values configured for the environment.

### Initial Paid Subscription

An eligible project without an existing Stripe subscription can choose **Subscribe** for a paid plan with Checkout enabled. Stripe hosts the payment flow.

After a successful Checkout:

1. Stripe webhook delivery is the primary synchronization path.
2. The authenticated Checkout return can reconcile from the Checkout Session if webhook delivery has not completed yet.
3. The Control Plane shows the synchronized plan and subscription state.
4. Ceiba sends its own subscription confirmation email after successful Checkout synchronization.

Stripe still controls its own payment and invoice behavior.

### Current Limitation

A project with an existing Stripe subscription cannot start another Checkout from the plan dialog. Paid-plan upgrade and downgrade behavior is not currently shipped, so the UI does not present a misleading change-plan action.

The customer-facing UI does not expose local plan mutation or manual Stripe reconciliation controls.

## Usage

Route: `/usage`

Usage is read-only in the Control Plane. The page presents:

- current-month request total
- allowed and denied request counts
- remaining monthly quota when the plan has a quota
- last-updated information
- monthly usage history
- recent request activity

The MVP does not include advanced analytics, charting, exports, or usage-based billing.

## Credential Checklist

| Credential | Used by | Where plaintext appears |
|------------|---------|-------------------------|
| Clerk session | Human operator using the Control Plane | Managed by Clerk |
| Project secret | Your backend or Node SDK calling Runtime | Once during project create or rotation |
| API key | Downstream consumer calling your API | Once during key creation |

Keep project secrets and API keys in appropriate secret storage. Do not place either credential in source control.

## Continue

- [Quickstart](/quickstart) for Express and Fastify request protection.
- [Project Secret Rotation](/project-secret-rotation) before changing a deployed secret.
- [Programmatic API Keys](/programmatic-api-keys) for machine-facing key lifecycle.
