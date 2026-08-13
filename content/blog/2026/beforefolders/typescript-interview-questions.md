---
title: "TypeScript Interview Questions: What Actually Gets Asked in 2026"
date: "2026-07-08T10:00:00.000Z"
excerpt: "Preparing for a TypeScript interview? Learn the questions that actually come up, from utility types to generics, with practical examples you can study."
cover_image: "/images/blog/uploads/typescript-interview-questions-2026.webp"
seo_title: "TypeScript Interview Questions: What Actually Gets Asked in 2026"
seo_description: "Prepare for your TypeScript interview with real questions on utility types, generics, type narrowing, and more. Includes practical examples and explanations."
author_name: "Collin Stewart"
tags:
  - TypeScript
  - JavaScript
  - Interview Prep
  - Web Development
  - Career
category: "JavaScript"
reading_time: 13
featured: false
no_index: false
---

TypeScript interviews have changed. A few years ago, knowing the difference between `interface` and `type` was enough to impress most interviewers. Now that's basically the warm-up question. The bar has shifted.

Part of this is because TypeScript adoption has exploded. It's not a niche tool anymore. It's the default for serious JavaScript projects. Companies expect developers to be productive with it on day one, not learning it on the job. The interview questions have gotten deeper accordingly.

I've been on both sides of the table enough times now to notice patterns. Certain questions come up over and over. Not because interviewers lack creativity, but because they test for genuine understanding rather than memorized syntax. Here's what you're likely to encounter and how to think about each topic.

## The basics still matter, but the framing has changed

Nobody asks "What is TypeScript?" anymore. The basic questions have evolved into practical scenarios that test whether you actually use the language or just let the compiler do its thing.

A common opener is something like: "Walk me through how you'd type an API response you've never seen before." This tests multiple skills at once. Do you reach for `any` immediately? Do you use `unknown` and narrow it? Do you talk about runtime validation versus compile-time types?

The strongest answers acknowledge that TypeScript types disappear at runtime. You can't trust that an API response matches your types. There's always a gap between what TypeScript believes and what actually arrives over the network. If you've read our deep dive on [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide), you already know this tension well.

A solid response might sound like: "I'd start by defining the shape I expect using an interface, but I wouldn't trust it blindly. For critical API responses, I'd use a validation library like Zod to verify the data at runtime and infer the types from the schema. That way the types are grounded in actual validation logic rather than assumptions."

That answer demonstrates you understand the limits of the type system. Interviewers light up when they hear that.

## Utility types come up constantly

If there's one topic that separates TypeScript novices from experienced developers, it's utility types. `Partial`, `Pick`, `Omit`, `Record`, `ReturnType`. These aren't advanced features. They're daily tools.

A typical question: "Given this interface for a user profile, how would you create a type for the update payload where all fields are optional except the user ID?"

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
}

// The interviewer expects something like:
type UpdateUserPayload = Partial<Omit<UserProfile, "id">> & { id: string };
```

This combines `Omit` to remove the `id` field, `Partial` to make everything else optional, and an intersection to add `id` back as required. It's practical. It's composable. It shows you understand how utility types work together.

Another frequent one: "What's the difference between `Record` and a mapped type?" The answer is that `Record` is a shorthand for a mapped type with a specific key constraint. `Record<string, number>` is equivalent to `{ [key: string]: number }`. But `Record` reads cleaner and communicates intent more clearly.

Interviewers also love asking about `Extract` and `Exclude`. Given a union type like `type Status = 'active' | 'inactive' | 'pending' | 'deleted'`, how would you create a type that only includes statuses where the user is still visible? `Extract<Status, 'active' | 'inactive' | 'pending'>` does the job. Or using `Exclude` to remove 'deleted' instead.

## Generics beyond the basics

Basic generics are a given. `function identity<T>(value: T): T` is the hello world of generics and nobody's impressed by it anymore. The questions now involve constraints, defaults, and patterns.

A question that comes up: "Write a generic function that takes an array of items and a key, and returns an object grouped by that key." This tests whether you can constrain a generic to ensure the key actually exists on the type.

```typescript
function groupBy<T extends Record<string, any>, K extends keyof T>(
  items: T[],
  key: K,
): Record<string, T[]> {
  return items.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
}
```

The constraints are what matter here. `T extends Record<string, any>` ensures the items are objects. `K extends keyof T` ensures the key you're grouping by actually exists on those objects. Without those constraints, the function would accept arrays of primitives and crash at runtime.

Another pattern that signals experience: generic defaults. If you write `function fetchData<T = unknown>(url: string): Promise<T>`, you're telling TypeScript that when the caller doesn't specify a type, it should default to `unknown` rather than `any`. That's a deliberate safety choice that prevents accidental unchecked access to response data.

## Type narrowing and discriminated unions

Interviewers want to see that you can narrow types safely. The days of slapping `as` assertions everywhere are over. Type narrowing with `typeof`, `instanceof`, and `in` operators shows you understand control flow analysis.

Discriminated unions are the gold standard here. A question might present a shape like:

```typescript
type ApiResponse =
  | { status: "success"; data: User[] }
  | { status: "error"; message: string }
  | { status: "loading" };
```

And ask: "Write a function that renders a UI state based on this type, making sure you handle all cases." The key is narrowing on the discriminant property.

```typescript
function renderResponse(response: ApiResponse) {
  switch (response.status) {
    case 'success':
      return <UserList users={response.data} />;
    case 'error':
      return <ErrorBanner message={response.message} />;
    case 'loading':
      return <Spinner />;
    default:
      // This should be unreachable if the union is exhaustive
      const _exhaustiveCheck: never = response;
      return _exhaustiveCheck;
  }
}
```

The `never` assignment in the default case is a clever trick. If someone adds a new variant to `ApiResponse` later, TypeScript will flag this line as an error because the new variant can't be assigned to `never`. It's a compile-time guard against unhandled cases. Interviewers who see you use this pattern know you've been around TypeScript for a while.

## Conditional types and the infer keyword

This is where interviews start separating the daily users from the power users. Conditional types look like ternary operators at the type level, and they unlock a lot of advanced patterns.

A question I've seen multiple times: "Write a type that extracts the element type from an array type." The answer uses `infer`:

```typescript
type ArrayElement<T> = T extends (infer U)[] ? U : never;
```

`infer` declares a type variable that TypeScript will deduce from context. When `T` matches the pattern of an array containing something, `U` captures that something and returns it. If `T` isn't an array type, it returns `never`.

A follow-up might ask you to write a type that extracts the resolved value from a Promise. Same pattern, different target:

```typescript
type Awaited<T> = T extends Promise<infer U> ? U : T;
```

TypeScript actually ships `Awaited` as a built-in utility type now, so mentioning that shows you keep up with language updates. But knowing how to write it yourself demonstrates deeper understanding.

## The template literal type curveball

Template literal types arrived in TypeScript 4.1 and they've slowly worked their way into interview questions. They let you construct string types using template syntax at the type level.

A practical example: "Create a type that takes an object and produces CSS custom property names." If you pass `{ color: string; fontSize: number }`, you'd get `'--color' | '--fontSize'`.

```typescript
type CSSVariables<T> = {
  [K in keyof T & string]: `--${K}`;
}[keyof T & string];
```

This is admittedly niche. But it tests whether you understand mapped types, template literals, and indexed access types all at once. It's a dense question that covers a lot of ground.

Interviewers don't expect you to nail template literal types from memory. They're looking to see if you can reason through the problem and understand what the syntax is doing. Talking through your thought process matters as much as the final answer.

## Real-world scenario questions

The trend I'm seeing more of is scenario-based questions that mirror actual development work. Instead of "explain generics," you get "here's a component that's not type-safe, fix it."

A React example: "This component accepts a `data` prop that could be either an array of users or an array of posts. How would you type it so that the render function is type-safe in both cases?"

```typescript
interface User {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
}

// Before: loose typing
function DataList({ data, renderItem }: { data: any[]; renderItem: (item: any) => JSX.Element }) {
  return <ul>{data.map(renderItem)}</ul>;
}

// After: discriminated or generic
function DataList<T>({ data, renderItem }: { data: T[]; renderItem: (item: T) => JSX.Element }) {
  return <ul>{data.map(renderItem)}</ul>;
}
```

The generic solution is elegant and lets TypeScript infer the item type from usage. If you pass `User[]`, the render function's parameter is automatically typed as `User`. No assertions needed.

Another scenario: "We have a configuration object with dozens of optional fields. How would you create a type-safe merge function that applies defaults?" This tests your understanding of `Partial`, intersection types, and how to handle nested objects.

## What interviewers are actually evaluating

Having conducted my share of TypeScript interviews, I can tell you what most interviewers are looking for beneath the surface.

They want to see that you use TypeScript proactively, not reactively. That means adding types before the compiler complains, not fixing errors after the fact. It means thinking about edge cases like `null` and `undefined` before they become bugs. It means choosing between `interface` and `type` based on the use case rather than defaulting to one.

They also want to see that you understand TypeScript's limitations. The type system is powerful but not perfect. Knowing when to trust it and when to add runtime validation shows maturity. As we covered in our post on [JavaScript fetch API with async await](/blog/how-to-use-the-javascript-fetch-api-with-async-await), the boundary between your application and external data is where types become assumptions rather than guarantees.

Finally, interviewers want to see that you can explain TypeScript concepts clearly. If you can teach a complex type to someone who doesn't understand it yet, you probably understand it well yourself. That communication skill matters in code reviews, documentation, and mentoring.

## Preparing effectively

Reading interview questions is fine. Writing code is better. The TypeScript playground is your best study tool. Type out the examples. Break them. Fix them. Change the constraints and see what happens.

I'd also recommend reading through the TypeScript release notes for versions 4.0 through 5.x. Each version introduces features that have since become common in production code. Understanding what was added when helps you recognize patterns that older tutorials might miss.

For algorithm practice, platforms like [free LeetCode alternatives](/blog/free-leetcode-alternatives) often support TypeScript now. Solving problems in TypeScript rather than plain JavaScript forces you to think about types while working through logic. It's dual-purpose practice.

And one unconventional tip. Read other people's type definitions. DefinitelyTyped packages on GitHub, utility type libraries like `type-fest`, even the TypeScript source code itself. You'll pick up patterns and tricks that tutorial authors haven't written about yet.

## Wrapping up

TypeScript interviews have matured past syntax checks and into genuine problem-solving with types. The questions reflect real-world challenges. Type safety at API boundaries, reusable generic patterns, exhaustive type narrowing, and practical utility type composition.

The good news is that these are all learnable skills. They're not trick questions. They test for experience that comes from building things with TypeScript, not memorizing documentation. If you've been writing TypeScript in production for a while, you probably know more than you think.

And if you're early in your TypeScript journey, focus on the patterns rather than the syntax. Understand why you'd use a discriminated union instead of optional properties. Understand when a generic makes your code more reusable versus more complex. The syntax you can always look up. The judgment comes from practice.

---

_Preparing for a technical interview and want to sharpen your TypeScript skills? Red Surge Technology works with developers to level up their craft through real-world project experience. [Get in touch](/contact) to learn more._
