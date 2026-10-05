---
title: "Promise.all vs Promise.allSettled: Key Differences and When to Use Each (2026)"
date: "2026-07-14T10:00:00.000Z"
excerpt: "Confused about Promise.all vs Promise.allSettled? Learn the key differences with practical examples, see how they compare to Promise.race and Promise.any, and know exactly which one to use for your async JavaScript."
cover_image: "/images/blog/uploads/promise-all-vs-allsettled.webp"
seo_title: "Promise.all vs Promise.allSettled: Key Differences Explained"
seo_description: "Promise.all vs Promise.allSettled: learn key differences with examples for API calls, error handling, and concurrent async operations in JavaScript."
author_name: "Collin Stewart"
tags:
  - JavaScript
  - Promises
  - Async
  - Web Development
  - Error Handling
category: "JavaScript"
reading_time: 12
featured: false
no_index: false
---

There's a moment in every JavaScript developer's journey where `Promise.all` betrays you. You fire off five API calls, wait for them all to resolve, and then one of them rejects. Suddenly your entire operation fails. The other four calls — which worked perfectly fine — their results are gone. Poof. The promise rejects and that's the end of it.

The first time this happens, it feels like a bug in the language. It's not. `Promise.all` is working exactly as designed. The problem is that nobody told you there's a different tool for when you want partial results. A tool that waits for all promises to settle — whether they resolve or reject — and gives you everything.

That tool is `Promise.allSettled`, and it solves a problem `Promise.all` was never designed to handle.

I learned this the hard way. A few years back, I built an analytics dashboard that pulled data from about eight different microservices. User counts from one service. Revenue from another. Recent activity from a third. Server health from a fourth. I used `Promise.all` because it was the concurrency tool I knew. And it worked great — until one of those services went down for scheduled maintenance. Not a critical one, just the service that handled feature adoption metrics. Nice to have. But because I used `Promise.all`, the entire dashboard crashed. Users saw an error page instead of their data. Seven healthy services, one tiny outage, and everything fell apart.

Switching to `Promise.allSettled` fixed it in minutes. The dashboard loaded all the available data and showed a small "Feature adoption data unavailable" card where the failed service's data would have been. Users still got their core analytics. That experience taught me something that every async JavaScript developer eventually needs to learn: `Promise.all` implies every promise is critical, and `Promise.allSettled` acknowledges that some data is optional.

Let's walk through the difference, when each one makes sense, and how to stop getting burned by choosing the wrong one.

## Promise.all vs Promise.allSettled: the short answer

If you want the fastest possible answer, here it is:

| Feature                 | `Promise.all`                                   | `Promise.allSettled`                                    |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| **Resolves when**       | All promises fulfill                            | All promises settle (fulfill or reject)                 |
| **Rejects when**        | Any promise rejects                             | Never rejects                                           |
| **Returns**             | Array of values                                 | Array of `{status, value/reason}` objects               |
| **Behavior on failure** | Short-circuits, loses other results             | Waits for everything, keeps all results                 |
| **Best for**            | Interdependent operations that must all succeed | Independent operations where partial results are useful |
| **Introduced in**       | ES6 (ES2015)                                    | ES2020                                                  |

Now let's look at the details and real examples.

## What Promise.all actually does

`Promise.all` takes an array of promises and returns a single promise. If every promise in the array resolves successfully, the returned promise resolves with an array of the resolved values — in the same order as the input array. If any promise rejects, the returned promise rejects immediately with that rejection reason.

```javascript
const [user, posts, settings] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchSettings(userId),
]);
```

This is elegant when all three calls need to succeed for the operation to make sense. If the user doesn't exist, there's no point in loading their posts or settings. Fast failure is the right behavior.

The catch is that `Promise.all` fails fast. As soon as one promise rejects, it stops caring about the others. The remaining promises might still resolve in the background, but their results are lost. You can't access them from the rejected promise.

```javascript
try {
  const results = await Promise.all([
    fetchCriticalData(), // This fails
    fetchAnalytics(), // This succeeds but you never get the data
    fetchNotifications(), // Same here
  ]);
} catch (error) {
  // You only know about the first failure
  // The other results are inaccessible
}
```

For some use cases, this is exactly what you want. For others, it's a source of frustration.

## What Promise.allSettled does differently

`Promise.allSettled` waits for every promise in the array to finish, regardless of whether each one resolves or rejects. The returned promise never rejects. Instead, it resolves with an array of result objects, each with a `status` property of either `'fulfilled'` or `'rejected'`.

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

This is the key difference. `Promise.allSettled` doesn't short-circuit. It waits for everything. You get the successes and the failures, and you decide what to do with each one.

The result objects follow a consistent shape:

- Fulfilled promises: `{ status: 'fulfilled', value: ... }`
- Rejected promises: `{ status: 'rejected', reason: ... }`

TypeScript can narrow these with type guards, making the results type-safe to work with. This is a bigger deal than it sounds because it means you don't have to write defensive `if (result.value)` checks that lie to the type system.

## When Promise.all is the right choice

`Promise.all` still has its place. It's the correct tool when the promises are interdependent — when one failing genuinely means the entire operation should abort.

**Database transactions.** If you're inserting a user and their default settings in parallel, and either insert fails, you want to roll back both. `Promise.all` combined with a transaction mechanism gives you that atomicity.

**Form validation with multiple checks.** If you're validating an email against an API, checking a username for uniqueness, and verifying a password strength score, and any of those fail, the form submission should fail. Partial results don't matter because the user can't submit anyway.

**Fetching a single logical record spread across services.** If your `fetchUser` hits three services to assemble one complete user object, and any of them fails, you don't have a user. Better to fail cleanly than present a partial record.

The pattern to look for is interdependence. If the promises are all needed for the next step of your logic, `Promise.all` communicates that requirement clearly. Future developers reading your code will understand these operations are a unit.

## When Promise.allSettled makes more sense

`Promise.allSettled` shines when you're fetching independent pieces of data. Dashboard widgets. Search results from multiple indexes. Data from third-party APIs that might be unreliable. Any scenario where partial results are better than no results.

It's also the right tool when you want to report detailed error information. Instead of catching the first failure and losing context about what else went wrong, you can collect all the failures and present them coherently.

```javascript
const results = await Promise.allSettled([
  fetchUserProfile(userId),
  fetchUserPosts(userId),
  fetchUserFollowers(userId),
]);

const errors = results
  .filter((r) => r.status === "rejected")
  .map((r, i) => ({
    source: ["profile", "posts", "followers"][i],
    error: r.reason,
  }));

if (errors.length > 0) {
  console.error("Some data failed to load:", errors);
}
```

This gives you a complete picture of what went wrong. You can log it, report it to your monitoring service, and show the user a helpful message about which features are temporarily unavailable.

If you've read our post on [JavaScript fetch API with async await](/blog/how-to-use-the-javascript-fetch-api-with-async-await), you know network requests are inherently unreliable. `Promise.allSettled` embraces that reality instead of pretending every request will succeed.

## Promise.all vs Promise.allSettled: real-world examples side by side

Theoretical differences are one thing. Seeing them in action is another. Here's the same scenario implemented both ways.

**Scenario:** You're building a dashboard that needs to load user data, recent orders, and recommended products. The recommendations come from a third-party service that sometimes times out.

### Version 1: Promise.all (fails if anything fails)

```javascript
async function loadDashboard(userId) {
  try {
    const [user, orders, recommendations] = await Promise.all([
      fetchUser(userId),
      fetchOrders(userId),
      fetchRecommendations(userId), // Sometimes times out
    ]);

    return { user, orders, recommendations };
  } catch (error) {
    // If ANY call fails, the whole dashboard fails
    throw new Error("Failed to load dashboard");
  }
}
```

When `fetchRecommendations` times out, users see nothing. Even though their user data and orders loaded fine.

### Version 2: Promise.allSettled (degrades gracefully)

```javascript
async function loadDashboard(userId) {
  const results = await Promise.allSettled([
    fetchUser(userId),
    fetchOrders(userId),
    fetchRecommendations(userId),
  ]);

  const [userResult, ordersResult, recommendationsResult] = results;

  // Critical data — if these failed, we have a real problem
  if (userResult.status === "rejected" || ordersResult.status === "rejected") {
    throw new Error("Failed to load critical dashboard data");
  }

  return {
    user: userResult.value,
    orders: ordersResult.value,
    // Recommendations are optional — degrade gracefully
    recommendations:
      recommendationsResult.status === "fulfilled"
        ? recommendationsResult.value
        : [],
    recommendationsAvailable: recommendationsResult.status === "fulfilled",
  };
}
```

When `fetchRecommendations` times out, users still get their dashboard — just without recommendations. The UI can show a small note that recommendations are temporarily unavailable. That's a dramatically better experience than a blank error page.

This pattern shows up constantly in real applications. The critical data loads first and fails loudly if something is wrong. The enrichment data loads in parallel and fills in as it arrives.

## Combining both patterns

Real applications often need a mix of both approaches. Some data is critical. Some is optional. You can compose `Promise.all` and `Promise.allSettled` to handle both cases.

```javascript
async function loadPage(userId, accountId) {
  // Critical data — must all succeed
  const [user, account] = await Promise.all([
    fetchUser(userId),
    fetchAccount(accountId),
  ]);

  // Optional data — partial results are fine
  const optionalResults = await Promise.allSettled([
    fetchRecommendations(userId),
    fetchActivityFeed(userId),
    fetchSocialConnections(userId),
  ]);

  const recommendations =
    optionalResults[0].status === "fulfilled" ? optionalResults[0].value : [];
  const activityFeed =
    optionalResults[1].status === "fulfilled" ? optionalResults[1].value : [];
  const socialConnections =
    optionalResults[2].status === "fulfilled" ? optionalResults[2].value : [];

  return { user, account, recommendations, activityFeed, socialConnections };
}
```

The critical path uses `Promise.all` because the page can't render without the user and account. The nice-to-have data uses `Promise.allSettled` so a failing recommendation service doesn't prevent the page from loading. Users see a working page quickly, with optional content populating as it becomes available.

## Promise.race and Promise.any: the other combinators

While we're on the topic, `Promise.race` and `Promise.any` deserve a mention because they solve related but different problems. If you've ever landed on a `promise.all vs promise.race` search, this section is for you.

### Promise.race

`Promise.race` resolves or rejects as soon as the first promise in the array settles. It doesn't care about the others. This is useful for timeouts — race your API call against a promise that rejects after five seconds.

```javascript
function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms),
  );
}

const result = await Promise.race([fetchData(), timeout(5000)]);
```

Whichever finishes first wins — either the data arrives, or the timeout rejects.

### Promise.any

`Promise.any` resolves as soon as the first promise fulfills. It ignores rejections unless all promises reject. This is useful when you have redundant data sources and want the fastest response.

```javascript
const data = await Promise.any([
  fetchFromPrimaryServer(),
  fetchFromSecondaryServer(),
  fetchFromCache(),
]);
```

The first server to respond wins. If all three fail, `Promise.any` rejects with an `AggregateError` containing all the rejection reasons.

### Quick comparison of all four

| Combinator           | Resolves when                     | Rejects when           | Best for                                   |
| -------------------- | --------------------------------- | ---------------------- | ------------------------------------------ |
| `Promise.all`        | All fulfill                       | Any rejects            | Interdependent operations                  |
| `Promise.allSettled` | All settle                        | Never                  | Independent operations, partial results OK |
| `Promise.race`       | First settles (fulfill or reject) | First settles (reject) | Timeouts, fastest response                 |
| `Promise.any`        | First fulfills                    | All reject             | Redundant sources, ignore failures         |

## A note on performance

A common misconception is that `Promise.allSettled` is slower than `Promise.all` because it waits for everything. In practice, both run the promises concurrently. The total wall-clock time is determined by the slowest promise, not by which combinator you use.

The difference is in what happens when a promise rejects. `Promise.all` short-circuits and returns early. `Promise.allSettled` continues waiting for the remaining promises. If you're dealing with promises that take a long time to reject — perhaps a timeout-based rejection — `Promise.allSettled` will take longer because it waits for the full timeout rather than aborting.

But for typical API calls that resolve or reject quickly, the performance difference is negligible. Choose based on the behavior you need, not on micro-optimizations.

## TypeScript considerations

TypeScript makes the distinction between these two methods clearer. `Promise.all` returns `Promise<[A, B, C]>` — a tuple of the resolved types. `Promise.allSettled` returns `Promise<PromiseSettledResult<A | B | C>[]>` — an array of result objects.

The built-in `PromiseSettledResult<T>` type is a discriminated union:

```typescript
type PromiseSettledResult<T> =
  { status: "fulfilled"; value: T } | { status: "rejected"; reason: any };
```

The type narrowing with `result.status === 'fulfilled'` works the same way we covered in our post on [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide). TypeScript understands that checking the status narrows the type, giving you access to `value` on fulfilled results and `reason` on rejected ones.

This is a huge advantage over reaching for `try/catch` inside a loop or wrapping each promise individually. The type system enforces that you handle both the success and failure cases.

## Common mistakes with Promise combinators

After reviewing a lot of async JavaScript, these are the mistakes I see most often.

**Mistake 1: Using Promise.all when partial results are fine.** This is the big one. If you're fetching independent data sources and one failing shouldn't break everything, use `Promise.allSettled`. Your users will thank you.

**Mistake 2: Using Promise.allSettled when you need atomic behavior.** The reverse is also true. If you're doing a database transaction, you need `Promise.all` because partial success is a bug, not a feature.

**Mistake 3: Forgetting to check status on allSettled results.** When you use `Promise.allSettled`, you MUST check `result.status` before accessing `result.value`. TypeScript will force you to, but in plain JavaScript, forgetting this leads to silent `undefined` bugs.

**Mistake 4: Assuming Promise.all preserves order.** It does — the returned array matches the input array's order. But if you're iterating with `forEach` on the input array, don't assume the corresponding result is at the same index. Actually, this one is fine — `Promise.all` does preserve order. The confusion comes from the fact that promises _resolve_ in arbitrary order, but the _results array_ is always in input order. Worth remembering.

**Mistake 5: Using Promise.race for timeouts without cleanup.** If you race a fetch against a timeout, and the fetch eventually resolves after the race has moved on, you might still have a pending fetch that continues running. This isn't usually a problem, but it can waste resources. If cleanup matters, use `AbortController` alongside the timeout.

## Frequently asked questions

### What's the difference between Promise.all and Promise.allSettled?

`Promise.all` resolves only if every promise in the array resolves. If any promise rejects, the entire thing rejects immediately with that failure reason, and the other results are lost. `Promise.allSettled` waits for every promise to either resolve or reject, and always resolves with an array of result objects that describe what happened to each promise. It never rejects.

### When should I use Promise.allSettled instead of Promise.all?

Use `Promise.allSettled` when the promises are independent — like loading multiple dashboard widgets, fetching data from multiple unreliable third-party services, or any scenario where partial results are better than no results. Use `Promise.all` when the promises are interdependent and the whole operation should fail if any one of them fails, like a database transaction.

### Does Promise.allSettled ever reject?

No. `Promise.allSettled` always resolves. Even if every promise in the array rejects, the outer promise resolves with an array of result objects, each with `status: 'rejected'` and a `reason`. This is one of its key advantages — you handle errors in the results, not with try/catch.

### What order does Promise.all return results in?

`Promise.all` returns results in the same order as the input array, regardless of which promise resolves first. If you pass `[p1, p2, p3]`, the resolved array is `[r1, r2, r3]`, even if `p3` resolved before `p1`.

### Is Promise.allSettled slower than Promise.all?

Not in any meaningful way. Both run the promises concurrently. The wall-clock time is determined by the slowest promise. The only difference is that `Promise.all` short-circuits when a promise rejects, while `Promise.allSettled` waits for the rest. In practice, this only matters if promises are slow to reject — which is rare for typical API calls.

### Can I use Promise.allSettled in older browsers?

`Promise.allSettled` was added in ES2020 and has universal browser support as of 2026. It works in all modern browsers and all supported versions of Node.js. If you need to support very old browsers (IE11), you'll need a polyfill, but that's an edge case in 2026.

### What's the difference between Promise.all and Promise.race?

`Promise.all` waits for all promises to resolve (or one to reject). `Promise.race` waits for the first promise to settle, whether it resolves or rejects. Use `Promise.race` for timeouts and "fastest wins" scenarios. Use `Promise.all` when you need every result.

### What's the difference between Promise.all and Promise.any?

`Promise.all` resolves when all promises resolve. `Promise.any` resolves when the first promise resolves, ignoring rejections. Use `Promise.any` when you have redundant sources and just need one to succeed. Use `Promise.all` when you need every source.

## Wrapping up

`Promise.all` and `Promise.allSettled` solve different problems, and using the wrong one creates bugs that are easy to miss in development but painful in production. `Promise.all` is for when every promise is critical — fast failure is the right behavior. `Promise.allSettled` is for when partial results are useful — graceful degradation is the right behavior.

The dashboard story I shared at the top is a pattern I've seen repeated across multiple codebases. Developers reach for `Promise.all` because it's the promise combinator they know. Then a non-critical service goes down and takes the entire application with it. A one-line change to `Promise.allSettled` would have prevented the outage.

Next time you're writing concurrent promises, ask yourself: **if one of these fails, should everything fail?** If the answer is no, you probably want `Promise.allSettled`.

---

_Building JavaScript applications that handle errors gracefully? Red Surge Technology helps teams write resilient async code that works in the real world. [Get in touch](/contact) to discuss your project._
