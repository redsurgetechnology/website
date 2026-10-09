---
title: "Promise.all vs Promise.allSettled vs Promise.race vs Promise.any: The Complete Guide"
date: "2026-10-09T10:00:00.000Z"
excerpt: "Confused by JavaScript's four promise combinators? Learn the exact differences between Promise.all, allSettled, race, and any—with practical examples for each."
cover_image: "/images/blog/uploads/promise-all-allsettled-race-any.webp"
seo_title: "Promise.all vs Promise.allSettled vs Promise.race vs Promise.any: Complete Guide"
seo_description: "Compare JavaScript's four promise combinators: Promise.all, Promise.allSettled, Promise.race, and Promise.any. Learn when to use each with practical code examples."
author_name: "Collin Stewart"
tags:
  - JavaScript
  - Promises
  - Async
  - Web Development
  - Error Handling
category: "JavaScript"
reading_time: 15
featured: false
no_index: false
---

JavaScript has four promise combinators, and they all sound similar enough that developers mix them up constantly. `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`. Four methods. Four distinct behaviors. Four different problems they solve.

I've seen production bugs caused by picking the wrong one. A dashboard that crashed because `Promise.all` rejected on a non-critical service. A timeout mechanism that used `Promise.any` and silently succeeded on the wrong response. A batch operation that used `Promise.race` and gave up too early. Each one was a small mistake with outsized consequences.

If you've read our [Promise.all vs Promise.allSettled](/blog/promise-all-vs-promise-allsettled) guide, you have the two most common combinators covered. This post is the complete picture—all four, side by side, with clear guidance on when to reach for each one. By the end, you'll know exactly which combinator belongs in your code.

## The Four Combinators at a Glance

Before diving into details, here's the one-sentence version of each.

- **`Promise.all`** — Waits for all promises to resolve. Rejects immediately if any reject.
- **`Promise.allSettled`** — Waits for all promises to settle. Never rejects. Returns status and value/reason for each.
- **`Promise.race`** — Settles as soon as the first promise settles, whether it resolves or rejects.
- **`Promise.any`** — Resolves as soon as the first promise resolves. Rejects only if all promises reject.

Four combinators, four different outcomes. Let's look at each one in depth.

## Promise.all: All Must Succeed

`Promise.all` takes an iterable of promises and returns a single promise that resolves with an array of results, in the same order as the input. If any input promise rejects, the returned promise rejects immediately with that reason.

```javascript
const [user, posts, settings] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchSettings(userId),
]);
```

The behavior is "fail fast." As soon as one promise rejects, `Promise.all` rejects. The other promises continue running in the background, but their results are discarded. You lose access to any results that succeeded.

**When to use it:** When every promise is critical for the operation to succeed. If one fails, you want the entire operation to abort.

**Classic examples:**

- Loading data that must all be present before rendering (user + permissions + settings for an auth check).
- Database transactions where partial completion would leave data inconsistent.
- Multiple API calls where each response is required to build the final result.

**Common pitfall:** Using `Promise.all` for operations where some promises are optional. If one fails, the entire operation fails—even if you could have degraded gracefully.

If you've read our [Promise.all vs Promise.allSettled](/blog/promise-all-vs-promise-allsettled) post, this is the combinator we compared against `allSettled` and found lacking for graceful degradation.

## Promise.allSettled: Wait for Everything, Get Full Results

`Promise.allSettled` takes an iterable of promises and returns a single promise that resolves with an array of result objects. Each result object has a `status` property—either `'fulfilled'` or `'rejected'`—and a `value` or `reason` property depending on the status.

```javascript
const results = await Promise.allSettled([
  fetchUser(userId),
  fetchPosts(userId),
  fetchSettings(userId),
]);

results.forEach((result) => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.log("Failure:", result.reason);
  }
});
```

The returned promise never rejects. It always resolves, even if every input promise rejected. You get a complete picture of what succeeded and what failed.

**When to use it:** When you want partial results, or when you need to report on all failures rather than just the first one.

**Classic examples:**

- Dashboard widgets that load independently—one failure shouldn't break the whole page.
- Batch operations where you want to process all successes and log all failures.
- Data aggregation from multiple sources where some might be unavailable.

**Why it's often the safer default:** In production systems, graceful degradation is usually better than total failure. If you can show the user 80% of their data while one service is down, that's a better experience than showing an error page.

## Promise.race: First to Settle Wins

`Promise.race` takes an iterable of promises and returns a single promise that settles as soon as the first input promise settles. If the first promise resolves, the result resolves with that value. If the first promise rejects, the result rejects with that reason.

```javascript
const result = await Promise.race([fetchData(), timeout(5000)]);
```

In this example, whichever promise settles first wins. If `fetchData()` resolves before 5 seconds, you get the data. If `timeout(5000)` rejects first (because the fetch is slow), you get a rejection.

The `timeout` function is a common utility:

```javascript
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });
}
```

**When to use it:** Timeout patterns, latency-critical operations where you want the fastest response, or any scenario where "first to finish" is the meaningful outcome.

**Classic examples:**

- Timeout wrappers around slow operations.
- Loading data from the fastest of several redundant sources.
- Racing a computation against a deadline.

**Common pitfall:** `Promise.race` doesn't cancel the losing promises. If `fetchData()` is still running when the timeout fires, it continues in the background, consuming resources and potentially firing side effects. This is a leak, not a bug—but it matters in applications with many timed operations.

**A subtle mistake I've seen:** Using `Promise.race` for "first successful response" when you actually want `Promise.any`. `race` settles on the first _settlement_—which could be a rejection. If the fastest promise rejects, `race` rejects, even if another promise would have resolved successfully a moment later.

## Promise.any: First to Succeed Wins

`Promise.any` takes an iterable of promises and returns a single promise that resolves as soon as the first input promise resolves. It ignores rejections unless every promise rejects. If all promises reject, it rejects with an `AggregateError` containing all the rejection reasons.

```javascript
const data = await Promise.any([
  fetchFromPrimaryServer(),
  fetchFromSecondaryServer(),
  fetchFromCache(),
]);
```

Whichever source responds successfully first wins. If all three fail, you get an `AggregateError` with all three reasons.

**When to use it:** When you have redundant sources or fallbacks, and you want the first successful response, ignoring failures along the way.

**Classic examples:**

- Fetching from multiple mirrors or CDNs.
- Trying multiple authentication providers.
- Loading from cache-or-network where either response is acceptable.

**Why it's newer:** `Promise.any` is the youngest combinator, added in ES2021. If you're supporting older runtimes, check compatibility. In Node.js, it's available since Node 15.

If you've been working with the [JavaScript fetch API and async await](/blog/how-to-use-the-javascript-fetch-api-with-async-await), `Promise.any` is particularly useful for redundant network requests.

## The Critical Differences Side by Side

Here's how they compare on the dimensions that matter.

| Combinator             | Resolves When                     | Rejects When               | Return Value                        |
| ---------------------- | --------------------------------- | -------------------------- | ----------------------------------- |
| **Promise.all**        | All resolve                       | Any rejects                | Array of values                     |
| **Promise.allSettled** | All settle                        | Never                      | Array of `{ status, value/reason }` |
| **Promise.race**       | First settles (resolve or reject) | First settles as rejection | Single value or reason              |
| **Promise.any**        | First resolves                    | All reject                 | Single value (or `AggregateError`)  |

The three-way distinction is worth emphasizing:

- **`all`** rejects on the _first_ rejection, loses other results.
- **`allSettled`** never rejects, gives complete results.
- **`race`** settles on the _first_ settlement, rejections included.
- **`any`** resolves on the _first_ success, ignores rejections unless all fail.

When you're choosing, ask: _What's the failure mode I want?_

- Fail fast → `all`
- Never fail, degrade gracefully → `allSettled`
- First to finish, whichever way → `race`
- First to succeed, tolerate failures → `any`

## Practical Code Examples

Let's see all four in a single scenario: loading a user dashboard from multiple microservices.

### With Promise.all (fail-fast)

```javascript
async function loadDashboard(userId) {
  try {
    const [profile, posts, notifications] = await Promise.all([
      fetchProfile(userId),
      fetchPosts(userId),
      fetchNotifications(userId),
    ]);
    return { profile, posts, notifications };
  } catch (error) {
    console.error("Dashboard load failed:", error);
    return null; // Total failure
  }
}
```

**Problem:** If notifications service is down, the entire dashboard fails. User sees an error page.

### With Promise.allSettled (graceful)

```javascript
async function loadDashboard(userId) {
  const results = await Promise.allSettled([
    fetchProfile(userId),
    fetchPosts(userId),
    fetchNotifications(userId),
  ]);

  return {
    profile: results[0].status === "fulfilled" ? results[0].value : null,
    posts: results[1].status === "fulfilled" ? results[1].value : [],
    notifications: results[2].status === "fulfilled" ? results[2].value : [],
    hasErrors: results.some((r) => r.status === "rejected"),
  };
}
```

**Better:** User sees whatever data loaded. Failed sections can show a fallback message. This is the resilient pattern.

### With Promise.race (timeout)

```javascript
async function loadWithTimeout(userId) {
  try {
    const profile = await Promise.race([fetchProfile(userId), timeout(3000)]);
    return profile;
  } catch (error) {
    // Either fetch failed or timeout fired
    return getCachedProfile(userId);
  }
}
```

**Purpose:** Enforce a strict latency bound. Fall back to a cache if the network is too slow.

### With Promise.any (redundant sources)

```javascript
async function loadProfile(userId) {
  try {
    const profile = await Promise.any([
      fetchProfileFromPrimary(userId),
      fetchProfileFromReplica(userId),
      fetchProfileFromCache(userId),
    ]);
    return profile;
  } catch (aggregateError) {
    // All sources failed
    console.error("All profile sources failed:", aggregateError.errors);
    throw aggregateError;
  }
}
```

**Purpose:** Maximize availability. If any source responds, use it.

## Combining the Combinators

Real applications often use multiple combinators together. Here's a pattern I've used in production: critical data loads with `all`, optional data loads with `allSettled`, and the whole thing is wrapped in a timeout.

```javascript
async function loadPage(userId) {
  // Critical data must all succeed
  const critical = Promise.all([fetchUser(userId), fetchPermissions(userId)]);

  // Optional data can partially fail
  const optional = Promise.allSettled([
    fetchRecommendations(userId),
    fetchRecentActivity(userId),
    fetchNotifications(userId),
  ]);

  // Enforce a total timeout
  const [criticalData, optionalResults] = await Promise.race([
    Promise.all([critical, optional]),
    timeout(5000),
  ]);

  const [user, permissions] = criticalData;
  const recommendations =
    optionalResults[0].status === "fulfilled" ? optionalResults[0].value : [];

  return { user, permissions, recommendations };
}
```

This pattern is worth understanding because it shows how the combinators compose. Each one plays to its strength: `all` for critical paths, `allSettled` for degradable paths, `race` for timeouts.

If you've worked through our [JavaScript closures explained](/blog/javascript-closures-explained) guide, you have the mental model for how promises and closures interact—each combinator closes over its input array and manages the settlement logic internally.

## TypeScript Considerations

All four combinators are fully typed in TypeScript. The types are worth understanding because they affect how you handle results.

```typescript
// Promise.all: resolves to a tuple of the resolved types
const [user, posts]: [User, Post[]] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
]);

// Promise.allSettled: array of discriminated union
const results: PromiseSettledResult<User | Post[]>[] = await Promise.allSettled(
  [fetchUser(id), fetchPosts(id)],
);

// Type narrowing on settled results
for (const result of results) {
  if (result.status === "fulfilled") {
    // result.value is accessible
  } else {
    // result.reason is accessible
  }
}
```

For error handling patterns that pair with these combinators, our [TypeScript error handling best practices](/blog/typescript-error-handling-best-practices) guide covers the narrowing techniques.

## Common Mistakes to Avoid

**Using `Promise.all` when you mean `Promise.allSettled`.** This is the most common mistake. If partial failure is acceptable, use `allSettled`.

**Using `Promise.race` when you mean `Promise.any`.** If the fastest promise can reject and you want the first _successful_ result, you need `any`, not `race`.

**Forgetting that `Promise.all` rejects fast but doesn't cancel.** The other promises keep running. If they have side effects (like logging to a database), those still happen.

**Assuming `Promise.allSettled` preserves order.** It does preserve input order, but the results array is in the same order as the input. Don't rely on the order of settling—that's not what `allSettled` guarantees.

**Using `Promise.any` on older runtimes.** It's ES2021. If you're targeting older Node.js versions or browsers, you may need a polyfill.

**Not handling the `AggregateError` from `Promise.any`.** When all promises reject, you get an `AggregateError`, not a regular `Error`. The individual reasons are in `error.errors`.

**Using `Promise.race` for timeout without cleanup.** The losing promise keeps running. For long-running operations, consider implementing actual cancellation (via `AbortController`) instead of just racing against a timeout.

## A Real Story: The Dashboard That Taught Me allSettled

A few years ago, I built an analytics dashboard with a `Promise.all` call that fetched data from eight microservices. It worked flawlessly in development—all eight services were healthy.

In production, one of the services (the least important one, of course—feature adoption metrics) went down for maintenance. `Promise.all` rejected on that service's promise. The entire dashboard rendered an error page. Seven healthy services, one non-critical outage, complete user-facing failure.

The fix was a one-line change from `Promise.all` to `Promise.allSettled`, plus handling for the failed result. The dashboard now loads with whatever data is available and shows a small "feature adoption data unavailable" notice where the failed section would be. User experience went from "the site is broken" to "one widget is temporarily unavailable."

That experience is why I always ask "should everything fail if one thing fails?" before reaching for `Promise.all`. The answer is often no.

## Wrapping Up

The four promise combinators each solve a distinct problem. `Promise.all` is for critical parallel operations that must all succeed. `Promise.allSettled` is for resilient operations that should degrade gracefully. `Promise.race` is for timeouts and latency-critical operations. `Promise.any` is for redundant sources where the first success wins.

The choice comes down to your failure mode. Do you want fast failure, graceful degradation, immediate settlement, or first success? Each combinator answers that question differently.

For the original deep dive on the two most common combinators, see our [Promise.all vs Promise.allSettled](/blog/promise-all-vs-promise-allsettled) guide. For async patterns in a real-world context, see our [JavaScript fetch API with async await](/blog/how-to-use-the-javascript-fetch-api-with-async-await) post. And if you're still building your mental model of how JavaScript handles closures and async, our [JavaScript closures explained](/blog/javascript-closures-explained) guide is a good foundation.

Now go write some promises that don't crash your dashboard.

---

_Need help building resilient async patterns or debugging promise-related production issues? Red Surge Technology specializes in JavaScript application architecture. [Get in touch](/contact) to discuss your project._
