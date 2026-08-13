---
title: "TypeScript Error Handling in Try Catch Blocks: A Practical Guide"
date: "2026-06-29T10:00:00.000Z"
excerpt: "Struggling with TypeScript error handling in try catch blocks? Learn how to properly type errors, avoid common pitfalls, and write safer async code."
cover_image: "/images/blog/uploads/typescript-error-handling-guide.webp"
seo_title: "TypeScript Error Handling in Try Catch Blocks: A Practical Guide"
seo_description: "Master TypeScript error handling in try catch blocks with practical techniques for typing errors, using type guards, and handling async operations safely."
author_name: "Collin Stewart"
tags:
  - TypeScript
  - JavaScript
  - Error Handling
  - Web Development
  - Async
category: "JavaScript"
reading_time: 9
featured: false
no_index: false
---

There's a moment in every TypeScript developer's journey where you stare at a catch block and think, "Wait, what type is this error again?"

You wrap some async code in a try catch, everything looks clean, and then the editor starts complaining. TypeScript tells you the error is `unknown`. Not `Error`. Not `AxiosError`. Not whatever specific thing you expected. Just... unknown. And honestly? It's frustrating the first time you run into it.

The thing is, TypeScript's error handling behavior catches a lot of people off guard. Not because it's poorly designed, but because JavaScript itself has never enforced what gets thrown. You can throw a string. A number. An object literal. Heck, you can throw `undefined` if you really want to. JavaScript doesn't care. So TypeScript, being the cautious friend it is, defaults to the safest possible assumption.

## Why TypeScript treats catch errors as unknown

Let's back up for a second and look at why this happens. Before TypeScript 4.0, catch clause variables were always typed as `any`. You could access `error.message` directly and TypeScript wouldn't say a word. The problem, of course, was that if someone threw something other than an Error object, your code would crash at runtime with no compile-time warning.

That changed with TypeScript 4.0, when the team introduced the `useUnknownInCatchVariables` compiler option. It defaults to `true` in strict mode, which means every error in a catch block gets the `unknown` type unless you explicitly annotate it otherwise.

```typescript
try {
  await fetchUserData(userId);
} catch (error) {
  // error is 'unknown' here
  console.log(error.message); // TypeScript error!
}
```

That squiggly red line isn't TypeScript being pedantic. It's genuinely protecting you from runtime explosions. If someone somewhere throws a string, accessing `.message` on it returns `undefined`. Your error logging suddenly becomes useless. Your user-facing messages break. Debugging becomes a nightmare.

## The quick annotation approach (and when it's enough)

The most straightforward fix looks something like this:

```typescript
try {
  await processPayment(amount);
} catch (error: any) {
  console.error(error.message);
}
```

TypeScript allows type annotations on catch variables, even though JavaScript doesn't support them natively. The annotation gets stripped during compilation, so it's purely a TypeScript construct.

But here's the thing. Using `any` sort of defeats the purpose of having TypeScript in the first place. It's like buying a fancy security system and then leaving the front door unlocked. Sometimes it's fine. Most of the time, actually, the error really will be an `Error` instance. But you're giving up the safety net.

I'd argue that annotating with `Error` directly is marginally better:

```typescript
try {
  await saveDocument(doc);
} catch (error: Error) {
  console.error(error.message);
  showToast(error.message);
}
```

This works until it doesn't. If something throws a non-Error value, TypeScript won't warn you at compile time, but your assumption at runtime falls apart. The `.message` property might be `undefined`, and if you're passing that to a toast notification component, users see blank error messages. Not a great experience.

## Type narrowing with instanceof

A more robust approach involves actually checking what you caught before using it:

```typescript
try {
  await uploadFile(file);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    showErrorNotification(error.message);
  } else {
    console.error("Something unexpected was thrown:", error);
    showErrorNotification("An unexpected error occurred");
  }
}
```

This pattern handles both cases gracefully. If it's an Error, you get access to `message`, `stack`, `cause`, all the standard properties. If it's something else, you handle that too. Users never see a blank error notification.

You know what? This approach has an elegance to it. It acknowledges the messy reality of JavaScript without giving up on type safety. It's defensive without being paranoid.

The downside is verbosity. Every catch block grows by several lines. For utility functions or smaller projects, that might not matter. But across a large codebase with dozens of try catch blocks, the repetition adds up.

## Custom type guards for cleaner narrowing

One way to reduce the boilerplate is extracting the type check into a reusable utility:

```typescript
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

try {
  await syncCalendar(events);
} catch (error) {
  if (isError(error)) {
    logger.error(error.message, { stack: error.stack });
  } else {
    logger.error("Non-Error thrown during sync", { error });
  }
}
```

The type predicate `value is Error` tells TypeScript that inside the `if` block, the variable is guaranteed to be an Error. This compiles away cleanly and adds zero runtime overhead beyond the instanceof check itself.

Some teams prefer an assertion-based approach instead:

```typescript
function assertError(value: unknown): asserts value is Error {
  if (!(value instanceof Error)) {
    throw new Error("Expected an Error instance");
  }
}

try {
  await processQueue(items);
} catch (error) {
  assertError(error);
  // error is now typed as Error
  analytics.track("queue_error", { message: error.message });
}
```

The assertion function changes the type within the current scope, similar to how `instanceof` narrowing works. If the assertion fails, it throws a new Error, which you'd presumably catch further up the chain or let crash in a controlled way.

## The real world doesn't always throw Error instances

Here's where things get nuanced. In practice, not every library or API throws proper Error objects. Axios, for example, throws `AxiosError` instances that extend Error. That's fine because `instanceof Error` still matches. But other libraries might throw plain objects with custom properties.

Then there are browser APIs. The Fetch API doesn't throw on non-2xx status codes at all. You have to check `response.ok` manually. But if there's a network failure, it throws a `TypeError`. Still an Error subclass, so narrowing works.

What about promise rejections? If you `await` a promise that rejects with a string, that string propagates as the thrown value:

```typescript
async function fetchLegacyData() {
  return Promise.reject("Database connection failed");
}

try {
  await fetchLegacyData();
} catch (error) {
  // error is literally the string 'Database connection failed'
  console.log(typeof error); // 'string'
}
```

Older codebases and third-party libraries sometimes do this. It's not great practice, but it's reality. Your error handling needs to account for it.

## A pattern I've settled on after years of dealing with this

After bouncing between different approaches on different projects, I've landed on something that feels right. It's not revolutionary, but it's served me well:

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

try {
  await criticalOperation();
} catch (error) {
  const message = getErrorMessage(error);
  logger.error(message, { originalError: error });
  userFeedback.show(message);
}
```

This extracts the message logic into a single function that handles the common cases. For structured logging, I still pass the original error so I can inspect it later. For user-facing messages, I use the cleaned-up string. It keeps catch blocks short while remaining safe.

## Async error handling and unhandled rejections

You can't really talk about try catch in TypeScript without touching on async patterns. If you forget to await a promise, errors slip through silently. Or worse, they crash your Node.js process with an unhandled rejection.

```typescript
// Dangerous — the promise rejection is lost
function handleClick() {
  fetchUserData(userId); // missing 'await'
}

// Safe — the error is caught
async function handleClick() {
  try {
    await fetchUserData(userId);
  } catch (error) {
    handleUserError(error);
  }
}
```

Linters like typescript-eslint have rules that catch floating promises, which helps. But it's worth building the mental habit. Whenever you write a function call that returns a promise, ask yourself: did I handle the rejection path?

Event handlers in React components are a common trap. They can be async, but React doesn't await them. If an error occurs inside an async event handler, it won't crash the component. It'll silently fail, and you'll wonder why the UI isn't updating.

```typescript
// This looks fine but swallows errors
<button onClick={async () => {
  await saveChanges(data);
  navigate('/success');
}}>
  Save
</button>

// Better
<button onClick={() => {
  saveChanges(data)
    .then(() => navigate('/success'))
    .catch(handleSaveError);
}}>
  Save
</button>
```

The second version makes the error handling explicit. There's no ambiguity about what happens when things go wrong.

## A story about an error that wasn't what I expected

A few months back, I was debugging a production issue that had our team stumped. Users were reporting that a file upload feature worked intermittently. The upload would appear to succeed, but sometimes the file wouldn't actually process.

We checked the logs and found error entries, but they were all empty. No message. No stack trace. Just a timestamp and the user ID. Bizarre.

It turned out that a library we used for file validation was throwing objects that looked like `{ code: 'VALIDATION_ERROR' }`. No message property at all. Our error handling assumed every error had a `.message`, so our logs were capturing nothing useful. The user saw a generic "Something went wrong" message that gave us zero clues.

Once we realized what was happening, the fix was trivial. We updated our error logging to serialize the full error object when no message was available. Suddenly we could see the validation codes and trace the problem to a specific file type check.

That experience cemented something for me. Error handling isn't just about preventing crashes. It's about preserving information. When something goes wrong in production, the error object might be the only clue you have. Treating every error as `unknown` until proven otherwise gives you the chance to capture whatever that clue contains.

## Wrapping up

TypeScript's decision to type catch variables as `unknown` is one of those things that feels annoying until it saves you. It nudges you toward handling edge cases that JavaScript has always allowed but that cause real problems in production.

The right approach depends on your context. For a quick script or a personal project, annotating with `Error` or even `any` might be fine. For a production application with paying users, narrowing with `instanceof` or a utility function is worth the few extra lines.

If you've been working through performance topics like [How to Prevent Unnecessary Re-renders in React Applications](/blog/prevent-unnecessary-rerenders-react), error handling might feel like a detour. But reliable applications are fast _and_ stable. Crashes are the ultimate performance problem. A page that doesn't load at all is a lot slower than one that renders an extra time or two.

TypeScript gives you the tools to write error handling that's actually robust. Not just wrapping everything in try catch and hoping for the best, but thinking carefully about what might go wrong and making sure you capture enough information to fix it when it does.
