---
title: "Promise.all vs Promise.allSettled: What's the Difference and When to Use Each"
date: "2026-07-14T10:00:00.000Z"
excerpt: "Confused about Promise.all vs Promise.allSettled? Learn the key differences, see practical examples, and know exactly which one to use for your async JavaScript."
cover_image: "/images/blog/uploads/promise-all-vs-allsettled.webp"
seo_title: "Promise.all vs Promise.allSettled: Key Differences Explained"
seo_description: "Learn the difference between Promise.all and Promise.allSettled with practical examples for API calls, error handling, and concurrent async operations in JavaScript."
author_name: "Collin Stewart"
tags:
  - JavaScript
  - Promises
  - Async
  - Web Development
  - Error Handling
category: "JavaScript"
reading_time: 10
featured: false
no_index: false
---

There's a moment in every JavaScript developer's journey where `Promise.all` betrays you. You fire off five API calls, wait for them all to resolve, and then one of them rejects. Suddenly your entire operation fails. The other four calls — which worked perfectly fine — their results are gone. Poof. The promise rejects and that's the end of it.

The first time this happens, it feels like a bug in the language. It's not. `Promise.all` is working exactly as designed. The problem is that nobody told you there's a different tool for when you want partial results. A tool that waits for all promises to settle — whether they resolve or reject — and gives you everything.

That tool is `Promise.allSettled`, and it solves a problem that `Promise.all` was never designed to handle. Let me walk through the difference, when each one makes sense, and how to stop getting burned by choosing the wrong one.

## What Promise.all actually does

`Promise.all` takes an array of promises and returns a single promise. If every promise in the array resolves successfully, the returned promise resolves with an array of the resolved values. If any promise rejects, the returned promise rejects immediately with that rejection reason.

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

The result objects follow a consistent shape. Fulfilled promises have `{ status: 'fulfilled', value: ... }`. Rejected promises have `{ status: 'rejected', reason: ... }`. TypeScript can narrow these with type guards, making the results type-safe to work with.

## The dashboard that taught me this lesson

A while back, I built an analytics dashboard that loaded data from about eight different microservices. User counts from one service. Revenue data from another. Recent activity from a third. Server health from a fourth. You get the idea.

I used `Promise.all` because it was the concurrency tool I knew. And most of the time, it worked great. All eight services were healthy, all eight calls resolved, and the dashboard loaded quickly.

Then one of the microservices went down for maintenance. Not a critical one — just the one that handled feature adoption metrics. Nice to have, not essential. But because I used `Promise.all`, the entire dashboard crashed. Users saw an error screen instead of their data. Seven perfectly healthy services, and one tiny outage took down everything.

Switching to `Promise.allSettled` fixed it. The dashboard loaded all the available data and displayed a small "Feature adoption data unavailable" card where the failed service's data would have been. Users still got their core analytics. The degraded experience was far better than a blank error page.

That experience clarified something for me. `Promise.all` implies that every promise is critical. `Promise.allSettled` acknowledges that some data is optional and the application should degrade gracefully rather than fail completely.

## When Promise.all is the right choice

`Promise.all` still has its place. It's the correct tool when the promises are interdependent — when one failing genuinely means the entire operation should abort.

Database transactions are the classic example. If you're inserting a user and their default settings in parallel, and either insert fails, you want to roll back both. `Promise.all` combined with a transaction mechanism gives you that atomicity.

Form validation that requires multiple checks is another good fit. If you're validating an email address against an API, checking a username for uniqueness, and verifying a password strength score, and any of those fail, the form submission should fail. The partial results don't matter because the user can't submit anyway.

The pattern to look for is interdependence. If the promises are all needed for the next step of your logic, `Promise.all` communicates that requirement clearly. Future developers reading your code will understand that these operations are a unit.

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

If you've read our post on [JavaScript fetch API with async await](/blog/how-to-use-the-javascript-fetch-api-with-async-await), you know that network requests are inherently unreliable. `Promise.allSettled` embraces that reality instead of pretending every request will succeed.

## Combining both patterns

Real applications often need a mix of both approaches. Some data is critical. Some is optional. You can compose `Promise.all` and `Promise.allSettled` to handle both cases.

```javascript
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

// Process optional results gracefully
const recommendations =
  optionalResults[0].status === "fulfilled" ? optionalResults[0].value : [];
const activityFeed =
  optionalResults[1].status === "fulfilled" ? optionalResults[1].value : [];
```

The critical path uses `Promise.all` because the page can't render without the user and account. The nice-to-have data uses `Promise.allSettled` so a failing recommendation service doesn't prevent the page from loading.

This pattern shows up a lot in real codebases. The critical data loads first and fast-fails if something is wrong. The enrichment data loads in parallel and fills in as it arrives. Users see a working page quickly, with optional content populating as it becomes available.

## Promise.race and Promise.any: the other siblings

While we're on the topic, `Promise.race` and `Promise.any` deserve a mention because they solve related but different problems.

`Promise.race` resolves or rejects as soon as the first promise in the array settles. It doesn't care about the others. This is useful for timeouts — race your API call against a promise that rejects after five seconds.

```javascript
const result = await Promise.race([fetchData(), timeout(5000)]);
```

`Promise.any` resolves as soon as the first promise fulfills. It ignores rejections unless all promises reject. This is useful when you have redundant data sources and want the fastest response.

```javascript
const data = await Promise.any([
  fetchFromPrimaryServer(),
  fetchFromSecondaryServer(),
  fetchFromCache(),
]);
```

Both are more specialized than `Promise.all` and `Promise.allSettled`, but knowing they exist rounds out your understanding of promise combinators.

## A note on performance

A common misconception is that `Promise.allSettled` is slower than `Promise.all` because it waits for everything. In practice, both run the promises concurrently. The total wall-clock time is determined by the slowest promise, not by which combinator you use.

The difference is in what happens when a promise rejects. `Promise.all` short-circuits and returns early. `Promise.allSettled` continues waiting for the remaining promises. If you're dealing with promises that take a long time to reject — perhaps a timeout-based rejection — `Promise.allSettled` will take longer because it waits for the full timeout rather than aborting.

But for typical API calls that resolve or reject quickly, the performance difference is negligible. Choose based on the behavior you need, not on micro-optimizations.

## TypeScript considerations

TypeScript makes the distinction between these two methods clearer. `Promise.all` returns `Promise<[A, B, C]>` — a tuple of the resolved types. `Promise.allSettled` returns `Promise<PromiseSettledResult<A | B | C>[]>` — an array of result objects.

```typescript
type SettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any };
```

The type narrowing with `result.status === 'fulfilled'` works the same way we covered in our post on [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide). TypeScript understands that checking the status narrows the type, giving you access to `value` on fulfilled results and `reason` on rejected ones.

## Wrapping up

`Promise.all` and `Promise.allSettled` solve different problems, and using the wrong one creates bugs that are easy to miss in development but painful in production. `Promise.all` is for when every promise is critical — fast failure is the right behavior. `Promise.allSettled` is for when partial results are useful — graceful degradation is the right behavior.

The dashboard story I shared earlier is a pattern I've seen repeated across multiple codebases. Developers reach for `Promise.all` because it's the promise combinator they know. Then a non-critical service goes down and takes the entire application with it. A one-line change to `Promise.allSettled` would have prevented the outage.

Next time you're writing concurrent promises, ask yourself: if one of these fails, should everything fail? If the answer is no, you probably want `Promise.allSettled`.

---

_Building JavaScript applications that handle errors gracefully? Red Surge Technology helps teams write resilient async code that works in the real world. [Get in touch](/contact) to discuss your project._
