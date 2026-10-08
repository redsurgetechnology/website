---
title: "Next.js API Routes vs Route Handlers vs Server Actions: Which Should You Use in 2026?"
date: "2026-10-08T10:00:00.000Z"
excerpt: "Confused about API Routes, Route Handlers, and Server Actions in Next.js? Learn the differences, when to use each, and how to migrate from legacy patterns."
cover_image: "/images/blog/uploads/nextjs-api-routes-vs-route-handlers-vs-server-actions.webp"
seo_title: "Next.js API Routes vs Route Handlers vs Server Actions: Complete Guide 2026"
seo_description: "Compare Next.js API Routes, Route Handlers, and Server Actions. Learn when to use each, how they differ, migration paths, and best practices for modern Next.js applications."
author_name: "Collin Stewart"
tags:
  - Next.js
  - API
  - Server Actions
  - Web Development
  - JavaScript
category: "JavaScript"
reading_time: 14
featured: false
no_index: false
---

Next.js has three different ways to handle server-side logic, and the naming doesn't make it easy to keep them straight. API Routes are the old way—the Pages Router way. Route Handlers are the new way—the App Router equivalent. And Server Actions are something else entirely: a React-native mechanism for mutations that doesn't look like an API at all.

If you've been building with Next.js for a while, you've probably used at least one of these. If you're newer to the framework, the overlapping terminology can be paralyzing. When should you reach for a Route Handler? When is a Server Action the right choice? Do you still need API Routes in 2026?

The short answer: API Routes are legacy, Route Handlers are the modern HTTP primitive, and Server Actions are for mutations from your own UI. The longer answer involves understanding why each exists and what problems it solves. This guide walks through all three, compares them head-to-head, and gives you a decision framework for your next project.

## The Evolution: From API Routes to Route Handlers

Next.js started with Pages Router API Routes in `pages/api`. They were simple: export a default function that receives `req` and `res` objects, and Next.js handles the routing. That model is familiar to anyone who's worked with Express or Node.js HTTP servers.

```javascript
// pages/api/users.js (Pages Router - legacy)
export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ users: [] });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
```

When Next.js 13 introduced the App Router, it introduced Route Handlers as the replacement. Route Handlers live in `app/api/*/route.ts` and use the Web Platform `Request` and `Response` APIs instead of Node.js-specific objects.

```javascript
// app/api/users/route.ts (App Router - current)
export async function GET() {
  return Response.json({ users: [] });
}

export async function POST(request) {
  const body = await request.json();
  return Response.json({ created: true }, { status: 201 });
}
```

The key differences: Route Handlers use standard web APIs, export named functions per HTTP method instead of a single default export, and are only available in the App Router. API Routes still work in the Pages Router, but they're considered legacy and won't receive new features. If you're starting fresh, use Route Handlers. If you're maintaining a Pages Router project, you can keep your API Routes or migrate incrementally.

For a deeper dive into Route Handlers specifically, our [Next.js API Routes guide](/blog/next-js-api-routes) covers the fundamentals. This post is about how they compare to Server Actions and when to choose each.

## What Server Actions Are (And What They Aren't)

Server Actions are not API endpoints. They're functions that run on the server and can be called directly from React components—no fetch call, no JSON serialization, no manual endpoint creation. You mark a function with `'use server'`, and Next.js handles the plumbing.

```javascript
// app/actions.ts
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');

  // Validate and save to database
  await db.users.create({ data: { name, email } });

  // Revalidate the users page
  revalidatePath('/users');
}
```

From a client component, you import the action and pass it to a form:

```jsx
"use client";

import { createUser } from "./actions";

export function UserForm() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create User</button>
    </form>
  );
}
```

That's it. No `fetch('/api/users')`, no `headers: { 'Content-Type': 'application/json' }`, no `await response.json()`. The action runs on the server, receives the form data, does its work, and the page revalidates automatically. The boilerplate that API Routes require—serializing the request, handling the response, managing loading states—is handled for you.

Server Actions use POST under the hood, so they're not cacheable and shouldn't be used for data fetching. They're designed for mutations: creating, updating, and deleting data. The Next.js team is explicit about this. Server Actions are for writes, not reads.

## The Head-to-Head Comparison

Here's how the three approaches compare across the dimensions that matter.

| Dimension                   | API Routes (Pages Router) | Route Handlers (App Router)    | Server Actions               |
| --------------------------- | ------------------------- | ------------------------------ | ---------------------------- |
| **Location**                | `pages/api/*.ts`          | `app/api/*/route.ts`           | Anywhere with `'use server'` |
| **API Style**               | Node.js `req`/`res`       | Web `Request`/`Response`       | Function call                |
| **HTTP Methods**            | Single default export     | Named exports per method       | POST only                    |
| **External Access**         | Yes (public URL)          | Yes (public URL)               | No (internal only)           |
| **Caching**                 | Manual                    | GET can be cached              | Not cacheable                |
| **Type Safety**             | Manual                    | Manual                         | End-to-end with TS           |
| **Progressive Enhancement** | No                        | No                             | Yes (works without JS)       |
| **Best For**                | Legacy Pages Router apps  | REST APIs, webhooks, streaming | Form submissions, mutations  |

The most important row is **External Access**. API Routes and Route Handlers expose a URL that any client can call—a mobile app, a third-party service, a webhook sender. Server Actions do not. They're internal to your Next.js application, invoked from your own components.

That single difference drives most of the decision-making.

## When to Use Route Handlers

Route Handlers are the right choice when you need a stable HTTP endpoint. That means:

**Webhooks.** When a payment provider (Stripe), CMS (Sanity), or third-party service needs to send events to your application, it needs a URL to POST to. Server Actions can't provide that. Route Handlers can.

```javascript
// app/api/webhooks/stripe/route.ts
export async function POST(request) {
  const signature = request.headers.get("stripe-signature");
  const event = await verifyStripeWebhook(request, signature);

  if (event.type === "payment_intent.succeeded") {
    await fulfillOrder(event.data);
  }

  return Response.json({ received: true });
}
```

**Public APIs.** If your application exposes data for external consumption—a mobile app backend, a partner integration, a public developer API—Route Handlers are the HTTP interface.

**Cacheable reads.** Route Handlers support GET requests with proper cache headers. Server Actions always use POST and are never cached. For endpoints that serve data to many users, Route Handlers are more efficient.

**Streaming responses.** Server-Sent Events (SSE), AI streaming, and long-lived connections require Route Handlers. Server Actions don't support streaming.

**Custom HTTP methods and headers.** If you need PUT, PATCH, DELETE, or custom headers and status codes, Route Handlers give you full control over the HTTP contract.

If you've been working through our [Next.js CMS integration guide](/blog/nextjs-cms-integration-guide), you've seen how Route Handlers receive webhooks from headless CMS platforms and trigger on-demand ISR. That's the canonical Route Handler use case.

## When to Use Server Actions

Server Actions are the right choice when the caller is your own UI and the job is a mutation. That means:

**Form submissions.** A contact form, a checkout form, a settings form—anything where the user submits data and expects the page to update. Server Actions eliminate the boilerplate of creating an endpoint, calling fetch, handling the response, and managing loading state.

**Button-triggered mutations.** Like, follow, delete, archive—any action triggered by a button click that changes server-side state. Server Actions handle these cleanly.

**Optimistic updates.** React's `useOptimistic` hook works seamlessly with Server Actions. You can update the UI immediately, run the action, and reconcile if something goes wrong.

**Progressive enhancement.** Server Actions work without JavaScript. If your form uses `<form action={serverAction}>`, it submits via a standard HTTP POST and the action runs, even if JavaScript fails to load. This is a genuine advantage over API Routes, which require client-side JavaScript.

```jsx
// app/components/LikeButton.tsx
"use client";

import { toggleLike } from "@/app/actions";
import { useOptimistic } from "react";

export function LikeButton({ postId, initialLikes, isLiked }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state, newLike) => state + newLike,
  );

  async function handleLike() {
    addOptimisticLike(isLiked ? -1 : 1);
    await toggleLike(postId);
  }

  return (
    <button onClick={handleLike}>
      {isLiked ? "❤️" : "🤍"} {optimisticLikes}
    </button>
  );
}
```

The optimistic update shows immediately, the action runs on the server, and if it fails, React rolls back the optimistic state. This is significantly simpler than implementing the same behavior with Route Handlers.

If you've been working with [React controlled vs uncontrolled components](/blog/react-controlled-vs-uncontrolled), you know the tradeoffs of form state management. Server Actions simplify many of those patterns by moving the mutation logic to the server and reducing the client-side state you need to manage.

## The Decision Framework

When you're staring at a new feature and trying to decide between Route Handlers and Server Actions, ask these questions:

**1. Does anything outside my Next.js app need to call this?** If yes, use a Route Handler. Server Actions aren't accessible externally.

**2. Is this a read or a write?** Reads should use Server Components (for page data) or Route Handlers (for API endpoints). Writes from your own UI should use Server Actions.

**3. Do I need HTTP caching?** If you want the response cached by CDNs or browsers, use a Route Handler with GET. Server Actions are never cached.

**4. Am I streaming data?** SSE, AI responses, and long-lived connections require Route Handlers.

**5. Is this a simple form submission?** Server Actions cut the boilerplate. Use them unless one of the questions above pushes you toward Route Handlers.

**6. Am I on the Pages Router?** You're using API Routes. Consider migrating to the App Router and Route Handlers incrementally. Our [React Server Components guide](/blog/react-server-components-nextjs) covers the App Router architecture in more depth.

## A Real Story: Rewriting an API-First Form with Server Actions

A few months ago, I worked on a Next.js application that had been built with the Pages Router. Every form submission followed the same pattern: a client-side fetch to an API Route, a handler that validated and saved the data, and a client-side state update to show the result. The boilerplate was substantial—each form had a custom hook for loading and error states, and each API Route had manual request parsing and response construction.

We migrated to the App Router and replaced the API Routes with Server Actions. The change was dramatic. A form that had been 120 lines across two files became 40 lines in one file. The loading state was handled by React's `useFormStatus`. The error handling was handled by the action's return value. The optimistic update was handled by `useOptimistic`.

The part that surprised me most: progressive enhancement worked out of the box. With the old API Route approach, if JavaScript failed to load, the form did nothing. With Server Actions, the form submitted and the action ran. That's a genuine accessibility and reliability improvement that we got for free.

We didn't eliminate Route Handlers entirely. The webhook endpoint from our payment provider stayed as a Route Handler. The public API for our mobile app stayed as Route Handlers. But the internal mutations—the forms, the buttons, the actions that only our own UI triggered—moved to Server Actions. The codebase got smaller, and the developer experience got better.

The lesson: Route Handlers and Server Actions aren't competing. They serve different purposes. Use each for what it's good at.

## Common Pitfalls to Avoid

**Using Server Actions for data fetching.** Server Actions are for mutations. For reads, use Server Components or Route Handlers. Server Actions always use POST and aren't cached, so they're inefficient for data that doesn't change often.

**Exposing Server Actions as public APIs.** Server Actions have internal endpoints, but they're not designed for external consumption. Don't try to call them from a mobile app or a third-party service. Use Route Handlers for that.

**Forgetting `revalidatePath` or `revalidateTag` after mutations.** Server Actions don't automatically refresh cached data. If your mutation changes data that's displayed on a cached page, you need to revalidate it explicitly.

```javascript
"use server";

import { revalidatePath } from "next/cache";

export async function updateUser(formData) {
  await db.users.update(/* ... */);
  revalidatePath("/profile"); // Refresh the cached profile page
}
```

**Mixing Server Action calls with client-side fetch.** If you're already using a Server Action for a mutation, don't also write a client-side fetch to an API Route that does the same thing. Pick one pattern per operation.

**Not validating input in Server Actions.** Server Actions receive `FormData` from the client. Never trust it. Validate everything on the server using a schema library like Zod.

If you're working with error handling in these patterns, our [TypeScript error handling best practices](/blog/typescript-error-handling-best-practices) guide covers the patterns that keep mutations safe.

## Wrapping Up

Next.js gives you three ways to handle server-side logic, and they're not interchangeable. API Routes are legacy—they work, but they're Pages Router only. Route Handlers are the modern HTTP primitive for REST APIs, webhooks, streaming, and any endpoint that external clients need to call. Server Actions are for mutations from your own UI—form submissions, button clicks, and optimistic updates that don't need a public URL.

The decision comes down to one question: does anything outside my Next.js application need to call this? If yes, Route Handler. If no, and it's a mutation, Server Action. If no, and it's a read, Server Component (or Route Handler for API-shaped data).

Most real applications use all three. Webhooks hit Route Handlers. Forms submit via Server Actions. Page data fetches in Server Components. That's the intended architecture. Use each tool for what it's designed to do.

For deeper dives, see our [Next.js API Routes guide](/blog/next-js-api-routes) for Route Handler fundamentals, our [React Server Components guide](/blog/react-server-components-nextjs) for the App Router architecture, and our [Next.js CMS integration guide](/blog/nextjs-cms-integration-guide) for a real-world example of Route Handlers receiving webhooks.

Now go build something that doesn't make you write fetch calls for form submissions.

---

_Need help migrating your Next.js application from API Routes to Route Handlers and Server Actions? Red Surge Technology specializes in modern Next.js architecture. [Get in touch](/contact) to discuss your migration._
