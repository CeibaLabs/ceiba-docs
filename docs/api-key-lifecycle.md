# API Key Lifecycle

How API keys should be stored, handed over, retired, and replaced — and what Ceiba does at each step.

This is the design-level guide. For the endpoints that do it, see [Programmatic API Keys](/programmatic-api-keys).

## Two Credentials, Different Jobs

Confusing these is the most common integration mistake, so it is worth separating first.

| Credential | Who holds it | What it proves |
|---|---|---|
| **Project secret** | Your backend | That your server is allowed to ask Runtime for decisions |
| **API key** | Your caller | That this particular customer is who they claim to be |

The project secret never leaves your infrastructure. The API key is handed to somebody outside it. They are rotated differently, leak differently, and should never be stored in the same place. See [Project Secret Rotation](/project-secret-rotation) for the server-side one; this guide is about the caller-facing one.

## Storage: Hash, Never Store

A key is a password that happens to be machine-generated. It gets the same treatment.

Ceiba stores the hash. The plaintext is shown once, at creation, and cannot be retrieved afterwards — there is no "show key" button, because there is nothing to show. If a customer loses their key, the answer is to issue a new one and revoke the old, not to look the old one up.

If you are building this yourself, the part that catches people is that hashing breaks lookup. You cannot query a table by a value you did not store. The standard resolution is a two-part key: a non-secret prefix that is stored in the clear and indexed, and a secret remainder that is hashed. You find the row by prefix, then compare the remainder in constant time.

Constant-time matters. A comparison that returns early on the first differing byte leaks how much of a guess was correct, which turns an infeasible search into a feasible one.

## Handover: The Only Moment It Exists In The Clear

Plaintext exists exactly once, in the response to the create call or on screen in the Control Plane. Everything about how it is handled in that moment is a decision.

Things that quietly persist it:

- application logs, if the create response is logged
- error trackers, which often capture request and response bodies
- shell history, if it was created with `curl`
- chat, email, or a ticket, if it was sent to the customer that way
- **a commit** — the most common of these, and the one with the longest tail, because a rewritten history does not un-publish what was already fetched

Assume a key that has touched any of those is compromised and rotate it. A secret-scanning check on your repositories is worth setting up before you need it rather than after.

## Retirement: Three States, Not One

Keys do not simply exist or not. Ceiba distinguishes three ways a key can stop working, and the distinction is useful:

| State | Meaning | Denial reason |
|---|---|---|
| **Revoked** | Deliberately killed, usually because it leaked or a customer left | `revoked_api_key` |
| **Archived** | Retired in an orderly way, kept for the record | `archived_api_key` |
| **Expired** | Passed the expiry it was issued with | `expired_api_key` |

All three deny. They return different reasons because they mean different things to whoever is reading the logs: a revocation is an incident, an expiry is a calendar event, an archive is housekeeping.

Revoked and archived keys are terminal. The Control Plane does not reactivate them, deliberately — reactivating a credential you once decided to kill is almost never what you meant, and issuing a fresh key costs nothing.

## Revocation Speed Is A Design Choice

This is the part worth thinking about before you need it.

If you validate keys against a database on every request, revocation is instant and your database takes every request. If you cache, revocation takes effect after the cache expires. There is no third option; you are choosing a number.

The reason it matters: the scenario where you revoke urgently is a leaked key being actively used. A five-minute cache means five more minutes of use by whoever has it. Whatever window you pick, pick it knowingly, and know it when you are writing the incident runbook rather than during the incident.

With Ceiba the decision is made in Runtime rather than in your process, which means you are not the one holding a stale copy. Your application does not cache the key; it asks per request.

## Rotation Without Downtime

Replacing a credential that is in active use has an ordering problem: if you revoke before the caller has deployed the new key, you have caused an outage; if you never revoke, you have not rotated.

The pattern that works is an overlap — both credentials valid for a window, so the swap can happen at the caller's pace.

For **project secrets**, Ceiba does this for you: rotation moves the old secret into a previous slot that stays valid for a fixed 24 hours while the new one becomes current. Deploy the new value inside that window and no request fails.

For **API keys**, do it explicitly: issue the new key, give the customer time to switch, confirm traffic has moved, then revoke the old one. The usage record tells you when the old key stopped being used, which is the signal to revoke rather than a guess.

Do not skip the confirmation step. Revoking on a schedule rather than on evidence is how planned rotations become unplanned outages.

## Issuing Keys From Your Own Product

If customers self-serve, key creation belongs in your application rather than in an operator UI. Runtime exposes project-scoped lifecycle routes for exactly this, authenticated with your project secret — create, read, list, expire, revoke, archive.

Two things to get right in that flow:

1. **Return the plaintext to the customer once, and do not store it.** The temptation to keep a copy so support can look it up is strong and should be resisted; it reintroduces the plaintext database you avoided.
2. **Set an expiry where you can.** A key that expires is a key that stops mattering if it leaks after that date. Long-lived credentials are the ones that turn up in old repositories.

See [Programmatic API Keys](/programmatic-api-keys) for the calls.

## When A Key Leaks

Order matters here.

1. **Revoke first.** Before investigating, before writing anything up. The denial takes effect on the next request.
2. **Issue a replacement** and get it to the customer.
3. **Read the usage record** for that key — what was called, when, and from where. This is the part you cannot reconstruct later, and it is what tells you whether the key was actually used by somebody else.
4. **Find how it escaped**, and close that path. A key that leaked through logs will leak again through logs.
5. **Then** write it up.

## Next Steps

| Goal | Guide |
|---|---|
| Create and retire keys programmatically | [Programmatic API Keys](/programmatic-api-keys) |
| Rotate the server-side project secret | [Project Secret Rotation](/project-secret-rotation) |
| Understand the whole access decision | [API Access Control In Express](/api-access-control-express) |
