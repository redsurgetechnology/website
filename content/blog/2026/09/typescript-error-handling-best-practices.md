---
title: "TypeScript Error Handling Best Practices: Beyond try/catch"
date: "2026-09-10T10:00:00.000Z"
excerpt: "Stop writing catch (error: any). Learn TypeScript error handling best practices: narrowing unknown errors, custom error classes, the Result pattern, and tools that enforce safety."
cover_image: "/images/blog/uploads/typescript-error-handling-best-practices.webp"
seo_title: "TypeScript Error Handling Best Practices: Production-Ready Patterns"
seo_description: "Master TypeScript error handling best practices. Learn to narrow unknown catch variables, build custom error classes, use the Result pattern, and enforce error safety with ESLint."
author_name: "Collin Stewart"
tags:
  - TypeScript
  - Error Handling
  - Best Practices
  - JavaScript
  - Web Development
category: "JavaScript"
reading_time: 13
featured: false
no_index: false
---

I still remember the first time TypeScript 4.0 turned my catch blocks into a minefield. Every `catch (error)` suddenly had a red squiggly under `error.message`. My muscle memory from years of JavaScript was useless. I reached for `catch (error: any)` like everyone else, and for a while, that worked fine. Then a production bug cost me a full day because an API threw a plain object instead of an `Error`, and my `error.message` logging silently captured `undefined`. The logs were empty. The bug was invisible.

That experience pushed me to actually learn the best practices instead of slapping `any` on every catch clause. In this post, I'll share what I've settled on after refactoring dozens of TypeScript codebases: how to narrow errors safely, when to build custom error classes, how the Result pattern changes everything, and the tools that keep you honest.

## The Foundation: Never Use `any` in Catch Blocks

If you take nothing else from this post, take this: never annotate a catch variable as `any`. It defeats the entire purpose of using TypeScript. In JavaScript, you can throw literally anything—strings, numbers, objects, `null`, even `undefined`. TypeScript's `unknown` type exists to remind you of that reality. `any` tells the compiler to stop checking. You might as well be writing JavaScript.

Since TypeScript 4.4, the `useUnknownInCatchVariables` compiler option (enabled by default under `strict`) types catch variables as `unknown`[reference:0]. That means you have to narrow the error before accessing any properties. The baseline pattern is `instanceof Error`:

```typescript
try {
  await saveUser(data);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message); // Safe
  } else {
    console.error("Unexpected error:", String(error));
  }
}
```

This is the minimum. But it gets repetitive fast. Extract it into a utility:

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}
```

For a deeper dive into the mechanics of `unknown` in catch blocks, our [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide) guide covers the fundamentals.

## Custom Error Classes: Structure Your Failures

The `instanceof Error` check is fine for generic errors, but it doesn't help you distinguish between a network failure and a validation failure. That's where custom error classes come in. Extending `Error` lets you attach structured data—status codes, field names, operation types—and use `instanceof` to discriminate between failure modes in catch blocks[reference:1].

Here's a pattern I use frequently:

```typescript
class NetworkError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
    public isRetryable: boolean = false,
  ) {
    super(message);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public rule: string,
  ) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
```

Two notes on the constructor setup: always set `this.name` to match the class name for readable stack traces, and call `Object.setPrototypeOf` when targeting ES5. Without it, `instanceof` checks fail in older environments[reference:2].

Now your catch blocks can respond differently based on the error type:

```typescript
try {
  await updateProfile(data);
} catch (error) {
  if (error instanceof ValidationError) {
    showFieldError(error.field, error.message);
  } else if (error instanceof NetworkError) {
    if (error.isRetryable) scheduleRetry();
  } else {
    reportUnexpected(error);
  }
}
```

This is a massive improvement over parsing error messages or checking `error.message.includes('not found')`. The type of the error tells you what happened.

## The Result Pattern: Errors as Values

Custom error classes are excellent, but they still rely on exceptions for control flow. The Result pattern takes a different approach: instead of throwing, functions return a value that represents either success or failure. It's inspired by Rust's `Result<T, E>` type and has become increasingly popular in the TypeScript community[reference:3].

A basic Result type looks like this:

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: "Division by zero" };
  }
  return { success: true, data: a / b };
}
```

The caller is forced to handle both cases:

```typescript
const result = divide(10, 0);

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

No exceptions. No `try/catch`. The error is part of the function signature, and TypeScript ensures you handle it. Libraries like `neverthrow` provide a more feature-rich implementation with methods like `map`, `andThen`, and `match`, plus async support via `ResultAsync`[reference:4].

The Result pattern isn't right for every codebase. It adds ceremony, and it can be awkward to mix with libraries that throw. But for domain logic where errors are expected outcomes rather than exceptional circumstances, it's a game-changer. I use it for form validation, API clients, and any function where "failure" is a normal part of the workflow.

## Wrapping and Re-throwing with Context

Sometimes you need to catch an error, add context, and re-throw. The key is to preserve the original error using the `cause` property, which is supported in modern JavaScript engines and TypeScript.

```typescript
try {
  await fetchUser(userId);
} catch (error) {
  throw new Error(`Failed to fetch user ${userId}`, { cause: error });
}
```

The `cause` property keeps the original stack trace and error details, so you don't lose debugging information. When you log the error later, you can traverse the `cause` chain.

```typescript
function logError(error: Error) {
  console.error(error.message);
  if (error.cause instanceof Error) {
    console.error("Caused by:", error.cause.message);
  }
}
```

This pattern is especially useful in service layers where you want to add domain-specific context without swallowing the original error.

## Error Handling in React: Boundaries and Async

React adds its own layer of complexity. In functional components, errors in render are caught by error boundaries, but errors in event handlers and async operations are not. You need to handle those manually.

For async operations, the same narrowing patterns apply. But React has a subtle gotcha: if you throw inside a `useEffect` cleanup function or an event handler, React won't catch it unless you've set up an error boundary at a higher level. Always wrap async calls in `try/catch` and handle the error in state:

```typescript
const [error, setError] = useState<string | null>(null);

async function handleSubmit() {
  try {
    await submitForm(data);
  } catch (err) {
    setError(getErrorMessage(err));
  }
}
```

If you're working with React Server Components or Next.js API routes, the same principles apply. Our guide on [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide) has more React-specific examples.

## Error Boundaries and Fallbacks

For component-level errors, error boundaries are still the right tool. In TypeScript, you can type the error boundary's state and props:

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

The key is to log the error with enough context to debug it later, and to provide a fallback UI that doesn't leave users stranded.

## Enforcing Best Practices with ESLint

Best practices are only as good as your ability to enforce them. ESLint plugins can catch common mistakes automatically. There are dedicated plugins for error handling, like `eslint-plugin-exception-handling`, which lints unhandled functions that might throw[reference:5]. There's also `eslint-plugin-neverthrow` for projects using the Result pattern, which ensures you don't accidentally ignore errors[reference:6].

At minimum, enable the `@typescript-eslint/use-unknown-in-catch-callback-variable` rule, which enforces `unknown` in catch callback variables[reference:7]. It prevents the `catch (e: any)` habit from creeping back in.

## A Real-World Story: When `any` in Catch Cost a Day of Debugging

I once worked on a payment integration where every API call was wrapped in `catch (error: any)`. The code worked in development. But in production, a third-party service started returning errors as plain objects—`{ code: 'INVALID_CARD', message: '...' }`—instead of `Error` instances. Our logging was calling `error.stack`, which was `undefined`. The error messages were empty. It took a full day to realize the problem because the logs gave us nothing.

The fix was simple: switch to `unknown` and narrow properly. But the lesson was expensive. Since then, I've treated `any` in catch blocks as a code smell that warrants immediate refactoring.

## Putting It All Together

Here's the checklist I use for TypeScript error handling in production:

- **Never use `any` in catch blocks.** Use `unknown` and narrow.
- **Create custom error classes for domain-specific failures.** Attach structured data.
- **Consider the Result pattern for domain logic.** Errors as values force explicit handling.
- **Preserve the original error when re-throwing.** Use the `cause` property.
- **Log with context.** Include user IDs, operation names, and correlation IDs.
- **Use ESLint to enforce safety.** Plugins catch the mistakes you forget.
- **Test error paths.** Don't just test the happy path.

For a foundational understanding of how `unknown` works in catch blocks, read our [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide) guide. And if you're preparing for interviews, our [TypeScript interview questions](/blog/typescript-interview-questions) post covers error handling patterns that frequently come up.

## Final Thoughts

TypeScript's error handling story has matured significantly. The `unknown` type, custom error classes, and the Result pattern give you the tools to write error handling that's both safe and expressive. The key is to stop treating errors as an afterthought. They're part of your application's logic, and they deserve the same care as the happy path.

The next time you write a `try/catch`, resist the urge to reach for `any`. Narrow the error. Add context. Log it properly. Your future self—debugging a production issue at 2 AM—will thank you.

---

_Need help making your TypeScript codebase more resilient? Red Surge Technology helps teams adopt type-safe error handling patterns that prevent production surprises. [Get in touch](/contact) to discuss your project._
