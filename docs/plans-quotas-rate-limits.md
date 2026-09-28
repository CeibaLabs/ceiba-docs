# Plans, Quotas And Rate Limits

How to put a ceiling on API consumption, tie that ceiling to what a customer pays for, and have it hold when traffic arrives all at once — without adopting a gateway.

## Two Different Limits

"Rate limit" and "quota" get used interchangeably, and they solve different problems.

A **rate limit** protects your infrastructure. It is about instantaneous pressure: how many requests per minute this caller may make, regardless of what they have bought. Exceeding it is usually a bug on the caller's side — a retry loop, a missing backoff — and the right response is to slow them down, not to bill them.

A **quota** protects your economics. It is about cumulative consumption over a billing period: how many requests this plan includes. Exceeding it is a commercial event, not a technical one, and the right response is to stop serving or to ask them to upgrade.

You need both, and they fail differently. A caller can sit comfortably inside their monthly quota and still take your service down in ninety seconds. A caller can trickle requests slowly and consume a year of quota.

Ceiba enforces both per project: a **per-minute rate limit** and a **monthly request quota**, each derived from the project's current plan.

## Why This Is Awkward To Build

The obvious implementation is a counter:

```ts
const used = await redis.get(key);
if (used >= limit) return deny();
await redis.incr(key);
```

This is wrong, and it is wrong in the specific situation the limit exists for. Between the read and the increment, another request can do the same read. Under light traffic nothing happens. Under the burst that made you want a rate limit, several requests all see `used < limit` and all proceed. The limit leaks exactly when it matters.

The fix is to make the check and the decrement a single atomic operation, so the counter itself decides. That is not difficult once you know it, but it is easy to not know it, and the bug is invisible in testing because it only appears under concurrency.

The monthly quota has the same shape with a longer window and a worse failure: over-admitting a rate limit costs you some load, over-admitting a quota costs you revenue, silently, for a month.

Ceiba does both checks atomically as part of the authorization decision, and returns what is left:

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

Surfacing the remainder on every allow is worth doing. It lets an integrator build a progress indicator or a pre-emptive warning without polling a separate endpoint, and it turns "you hit your quota" from a surprise into something they saw coming.

## Tying Limits To What Was Paid For

Limits are only useful if they follow the plan. The connection between "subscription lapsed" and "requests now fail" is the part that is usually hand-wired, and it is the part that fails quietly — access continues after payment stops, and nobody notices because nothing is broken.

In Ceiba a project's plan is the source of its limits. When plan state changes, enforcement changes with it, because the same decision that checks the key also checks the subscription. There is no second system to keep in sync.

Two denials come out of this, and they are deliberately different:

- `quota_exceeded` — the plan is fine, the allowance for this period is spent. Returned as **429**.
- `inactive_subscription` — there is no live plan to draw an allowance from. Returned as **403**.

An integrator seeing 429 knows to wait or upgrade. An integrator seeing 403 knows to check their billing. Collapsing both into "Forbidden" sends them to the wrong place.

## Cancellation Is Not Immediate

A scheduled cancellation ends the subscription at the close of the current billing period. Access and quota continue unchanged until that date.

This is worth saying explicitly because the intuitive assumption is the opposite. Cutting service at the moment somebody clicks cancel means charging for a period you did not serve, which produces refund requests and chargebacks. Serving out the period they already paid for avoids both, and there is no separate refund step.

The practical consequence for your own code: do not treat "cancellation requested" as "access revoked". The access decision already knows the difference.

## Choosing Limits

Some guidance that is independent of Ceiba.

**Set the rate limit from your infrastructure, not from the plan price.** It exists to stop one caller degrading service for everyone, and that threshold does not change because somebody upgraded. It is reasonable for a higher tier to get a higher ceiling, but the number should still come from what your service can absorb.

**Set the quota from unit economics.** If a request costs you something real — a model invocation, a third-party lookup — the quota is where that cost is bounded. A plan whose quota is not derived from cost is a plan that loses money at high usage, and high usage is the outcome you were hoping for.

**Leave headroom on the free tier, but not much.** A free quota's job is to let somebody evaluate the thing, not to run a small production workload indefinitely. Too tight and nobody gets to the point of valuing it; too loose and nobody converts.

**Make the limits visible before they bite.** The remainder is in every decision — surface it.

## What This Does Not Cover

- **Per-endpoint pricing.** Limits today are per project, not per route, so an expensive endpoint and a cheap one draw on the same allowance. Per-endpoint pricing is in progress; see the [roadmap](https://www.useceiba.com/roadmap).
- **Usage-based billing.** Usage is recorded and enforced, but billing is by plan, not by consumption.
- **Per-key limits.** The limit applies to the project. Two keys on one project share an allowance.
- **Burst or token-bucket shaping.** The rate limit is a fixed per-minute ceiling, not a smoothed bucket.

## Next Steps

| Goal | Guide |
|---|---|
| Understand the whole access decision | [API Access Control In Express](/api-access-control-express) |
| Configure plans, subscriptions, and read usage | [Control Plane Operator Guide](/control-plane-operator-guide) |
| Protect a route | [Quickstart](/quickstart) |
