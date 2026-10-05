---
title: "Next.js API Routes Guide: Build a Backend API Without a Separate Server (2026)"
date: "2026-07-23T10:00:00.000Z"
excerpt: "Learn how Next.js API routes let you build server-side logic, handle form submissions, and create a full backend API without setting up a separate server. Covers App Router, Pages Router, Next.js 15, testing, and real-world patterns."
cover_image: "/images/blog/uploads/nextjs-api-routes-guide.webp"
seo_title: "Next.js API Routes Guide: Build a Backend Without a Separate Server"
seo_description: "Master Next.js API routes with practical examples. Learn App Router vs Pages Router, dynamic routes, middleware, error handling, testing, and server components in Next.js 15."
author_name: "Collin Stewart"
tags:
  - Next.js
  - API
  - Backend
  - Web Development
  - JavaScript
category: "JavaScript"
reading_time: 14
featured: false
no_index: false
---

There's something quietly powerful about being able to write backend code without setting up a separate server. No Express boilerplate. No CORS configuration. No deploying and managing two different applications just so a contact form on your marketing page can send an email.

Next.js API routes give you exactly that. They live in the same project as your frontend, share the same deployment pipeline, and run as serverless functions that scale automatically. You create a file under `app/api` or `pages/api`, export a function, and suddenly you have a backend API endpoint that can query a database, call an external service, or process a webhook.

I remember the first time I used this on a real project. A client needed a simple newsletter signup form on their marketing site. The previous developer had set up a whole separate Express app just to handle that one form submission—separate repo, separate deployment, separate environment variables. Every time we wanted to tweak the form or add a field, we had to coordinate changes across two codebases. It was tedious. Then someone on the team suggested, "Why don't we just use a Next.js API route?" Within an hour, we deleted the Express app entirely. The form posted directly to `/api/subscribe`, the logic lived in a single file, and the client never noticed—except that deployments got simpler and the site got faster. That was the moment I realized Next.js API routes weren't just a convenience. They were a legitimate architectural choice that could save teams from unnecessary complexity.

So whether you're new to Next.js API routing or you've been using it for a while and want a deeper reference, this guide covers everything: how the file-system router works, when to use API routes vs server components, how to handle requests and errors, middleware, Edge vs Node.js runtimes, streaming, caching, testing, and the patterns that hold up in production.

## What are Next.js API routes?

Next.js API routes are server-side endpoints you define inside your Next.js project. They let your frontend and backend live in one codebase, deployed together. You write a file, export a function, and Next.js turns it into an HTTP endpoint that returns JSON.

Two things make them especially useful:

**One deployment, one codebase.** No separate backend repository, no CORS setup between frontend and backend, no duplicate TypeScript types. Your API routes and your pages share the same project.

**Serverless by default.** On Vercel and similar platforms, each API route becomes a serverless function that scales automatically. You don't manage servers, load balancers, or container orchestration.

The trade-off: Next.js API routes aren't a great fit for every backend. If you have hundreds of endpoints, heavy background processing, or need to scale backend independently of the frontend, a dedicated service might be the better call. But for the vast middle ground—form handling, webhooks, simple CRUD, backend-for-frontend patterns—Next.js API routes are more than enough.

## The file-system router you already know

If you've used Next.js at all, you already understand how the API routing works. The routing is identical to pages. A file at `app/api/users/route.ts` becomes the endpoint `/api/users`. A file at `app/api/users/[id]/route.ts` becomes `/api/users/123`. Dynamic segments, catch-all routes, optional parameters—every routing feature from pages applies to API routes.

There are two conventions, depending on whether you're using the App Router or the older Pages Router.

### App Router (Next.js 13+): the modern approach

In the App Router, API routes live under `app/api`. You export named functions for each HTTP method.

```javascript
// app/api/users/route.ts
export async function GET(request: Request) {
  const users = await db.user.findMany();
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return Response.json(user, { status: 201 });
}
```

Each exported function handles a specific HTTP method. `GET`, `POST`, `PUT`, `PATCH`, `DELETE`—Next.js matches the incoming request method to the exported function automatically. If a method isn't exported, Next.js returns a 405 Method Not Allowed. Clean, predictable, and aligned with web standards.

### Pages Router: the older convention

The Pages Router uses a single default export that receives Node.js `req` and `res` objects.

```javascript
// pages/api/users.js
export default async function handler(req, res) {
  if (req.method === "GET") {
    const users = await db.user.findMany();
    res.status(200).json(users);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
```

Both approaches work. The App Router version with `Request` and `Response` objects is more aligned with web standards and pairs naturally with React Server Components. The Pages Router version feels like Express and might be more familiar if you've spent years in the Node.js world. If you're starting a new project in 2026, use the App Router. But plenty of production applications still run on the Pages Router, and it's not going away.

### App Router vs Pages Router: quick comparison

| Feature                      | App Router                        | Pages Router          |
| ---------------------------- | --------------------------------- | --------------------- |
| Location                     | `app/api/*/route.ts`              | `pages/api/*.js`      |
| Method handling              | Named exports per method          | Single default export |
| Request/Response             | Web standard `Request`/`Response` | Node.js `req`/`res`   |
| Server components            | Yes                               | No                    |
| Middleware                   | Root `middleware.ts`              | Root `middleware.ts`  |
| Recommended for new projects | Yes                               | No                    |

## When to use API routes instead of server components

Next.js gives you two ways to run server-side code: API routes and React Server Components. The overlap creates a question that comes up constantly: when should something be an API route, and when should it be a server component?

The short answer: **server components run during rendering to fetch data for pages. API routes are endpoints that return JSON and can accept any HTTP method.**

Server components fetch data and return JSX. They're for building pages—fetching the data a page needs to display, then rendering the markup. They don't expose endpoints that clients can call directly.

API routes return JSON, not JSX. They're for form submissions, webhooks, mobile app backends, and any situation where a client needs to send data to your server outside of a page navigation.

```javascript
// Server Component — fetches data for page rendering
export default async function UsersPage() {
  const users = await db.user.findMany();
  return <UserList users={users} />;
}

// API Route — handles form submissions
export async function POST(request: Request) {
  const { name, email } = await request.json();
  await db.user.create({ data: { name, email } });
  return Response.json({ success: true }, { status: 201 });
}
```

Server components can't handle POST requests. API routes can. That's the fundamental distinction. If you've been working with [React Server Components in Next.js](/blog/react-server-components-nextjs), you know they're designed for data fetching during rendering. API routes handle everything else. Once you internalize that separation, your architecture gets a lot cleaner.

## Handling request bodies, query parameters, and headers

API routes give you full access to the incoming request. The `Request` object in the App Router provides methods for reading the body, parsing form data, and accessing headers. Query parameters come from the URL.

### Query parameters and pagination

```javascript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const sort = searchParams.get('sort') || 'createdAt';

  const users = await db.user.findMany({
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { [sort]: 'desc' },
  });

  return Response.json(users);
}
```

### Request bodies and form data

For POST requests with JSON bodies, `request.json()` parses the incoming data. For form submissions, `request.formData()` handles multipart form data, including file uploads.

```javascript
export async function POST(request: Request) {
  const contentType = request.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    const body = await request.json();
    return Response.json({ received: body });
  }

  if (contentType?.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    return Response.json({ filename: file.name, size: file.size });
  }

  return Response.json({ error: 'Unsupported content type' }, { status: 415 });
}
```

The web standard APIs are fully supported, which means your route code is portable—it would work in any runtime that supports the Fetch API. That's a bigger deal than it sounds: you can reuse logic in edge functions, service workers, or even other frameworks.

### Dynamic route segments

Dynamic route segments become parameters you access from the function arguments.

```javascript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json(user);
}
```

TypeScript infers the types if you define them, giving you autocomplete and catching typos. Small detail, but it makes development smoother.

### Calling an external API from a Next.js API route

This is a pattern that comes up constantly, especially with third-party services that require secret keys you don't want exposed to the browser.

```javascript
// app/api/weather/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`,
    { next: { revalidate: 600 } }
  );

  if (!response.ok) {
    return Response.json(
      { error: 'Failed to fetch weather' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return Response.json({ city, temp: data.main.temp });
}
```

The API key stays server-side. The client hits your endpoint, your endpoint hits the external service. No key exposure, no CORS issues, and you can add caching with a single option.

## Error handling that doesn't crash your endpoint

API routes need error handling. An unhandled rejection crashes the function—Next.js catches it and returns a 500 status, but you lose control over the response. Adding structured error handling gives you consistent responses and better debugging.

```javascript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await db.user.create({ data: body });
    return Response.json(user, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return Response.json(
        { error: 'A user with that email already exists' },
        { status: 409 }
      );
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

For a cleaner approach across many routes, extract the error handling into a reusable wrapper.

```javascript
function withErrorHandler(handler: Function) {
  return async (request: Request, context: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export const GET = withErrorHandler(async (request: Request) => {
  const users = await db.user.findMany();
  return Response.json(users);
});
```

If you've read our deep dive on [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide), you know the `unknown` type in catch clauses forces you to handle the possibility that errors aren't always `Error` instances. Same principle here. Your API routes can throw anything—validation errors, database errors, network errors—and a generic handler gives you a safety net.

## Middleware that runs before your route handler

API routes support middleware—code that runs before your handler and can modify the request, add headers, or short-circuit with a response. In the App Router, you can use the root `middleware.ts` file, which runs for both pages and API routes. For API-specific middleware like authentication or rate limiting, wrapper functions on individual handlers give you more control.

```javascript
function withAuth(handler: Function) {
  return async (request: Request, context: any) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const authenticatedRequest = Object.assign(request, { user });
    return handler(authenticatedRequest, context);
  };
}

export const GET = withAuth(async (request: Request) => {
  const user = request.user;
  const data = await db.post.findMany({ where: { authorId: user.id } });
  return Response.json(data);
});
```

This composable approach lets you build a toolkit of reusable middleware. Authentication, rate limiting, request validation, logging—each is a function that wraps a handler. You combine them as needed per route. The result is consistent, testable, and easy to reason about.

## Edge vs Node.js runtimes

Next.js API routes can run in two different runtimes: the default Node.js runtime or the Edge runtime. The choice affects available APIs, deployment, and where your code runs geographically.

**Node.js runtime** is the default. Full Node.js API available—filesystem, native modules, any npm package. Cold starts typically a few hundred milliseconds. This is the right choice for most API routes, especially ones that use database libraries like Prisma.

**Edge runtime** runs on Vercel's Edge Network, close to users. It uses a subset of the Web API—no filesystem, no native modules. Cold starts are nearly instant. Ideal for lightweight middleware, A/B testing, geolocation redirects, and API routes that need minimal latency.

```javascript
export const runtime = 'edge';

export async function GET(request: Request) {
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const localizedGreeting = country === 'FR' ? 'Bonjour' : 'Hello';
  return Response.json({ greeting: localizedGreeting });
}
```

The `runtime` export tells Next.js where to run the route. If you don't specify, it defaults to Node.js. Edge routes have limits—no Prisma, no `fs`, no long-running connections—but for simple logic that benefits from global distribution, they're a powerful option.

## Testing Next.js API routes

This is the piece most tutorials skip, and it's the one that saves you the most debugging time. `next-test-api-route-handler` (NTAH) is the go-to library for testing App Router and Pages Router handlers directly, without spinning up a server or making real HTTP calls.

```javascript
import { testApiHandler } from "next-test-api-route-handler";
import * as appHandler from "@/app/api/users/route";

it("returns a list of users", async () => {
  await testApiHandler({
    appHandler,
    test: async ({ fetch }) => {
      const response = await fetch({ method: "GET" });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    },
  });
});
```

The handler runs in-process. No server startup, no network flakiness, no test database juggling. You get the full request lifecycle—headers, body parsing, dynamic route params—with plain Jest or Vitest.

Write tests for the three things that break most often: request validation (does the endpoint reject bad input?), authentication (does it return 401 without a token?), and error paths (does a database failure return a clean 500?). Those three cover the majority of real-world bugs.

## Streaming responses for real-time data

API routes can stream responses using the Web Streams API. Instead of waiting for all data to be available and sending one large JSON response, you send data as it arrives.

This pattern works well for AI responses, real-time dashboards, and any situation where the response is generated over time.

```javascript
export async function POST(request: Request) {
  const { prompt } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const words = prompt.split(' ');
      for (const word of words) {
        controller.enqueue(encoder.encode(JSON.stringify({ word }) + '\n'));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

The client uses `fetch` and reads the response body as a stream, processing each chunk as it arrives. This is the same pattern that powers ChatGPT-style interfaces. The user sees the response build in real time rather than waiting for the entire thing to complete.

## Caching API responses

API routes that perform expensive computations or query external services benefit from caching. Next.js provides built-in cache headers, but for fine-grained control, integrate a caching layer like Redis.

```javascript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const cacheKey = `search:${query}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return Response.json(cached);
  }

  const results = await performExpensiveSearch(query);
  await redis.set(cacheKey, results, { ex: 3600 });

  return Response.json(results);
}
```

If you've read our guide on [Redis cache design patterns](/blog/redis-cache-design-patterns), you'll recognize this as the cache-aside pattern. The API route checks the cache first, falls back to the expensive operation, and stores the result for subsequent requests. For public endpoints serving the same data to many users, this can dramatically reduce response times and external API costs.

## Concurrency in API routes

API routes often need to fetch from multiple sources. A dashboard endpoint might query a database, call an analytics service, and fetch feature flags—all in a single request. Sequential calls add latency. `Promise.all` and `Promise.allSettled` run them concurrently.

```javascript
export async function GET(request: Request) {
  const [userCount, revenue, recentActivity] = await Promise.all([
    db.user.count(),
    fetchRevenueData(),
    db.activity.findMany({ take: 10 }),
  ]);

  return Response.json({ userCount, revenue, recentActivity });
}
```

If one call fails, should the whole request fail? Depends on the data. If analytics is down, you might still want user counts and activity. `Promise.allSettled` handles that gracefully, as we covered in our comparison of [Promise.all vs Promise.allSettled](/blog/promise-all-vs-promise-allsettled).

```javascript
const results = await Promise.allSettled([
  db.user.count(),
  fetchRevenueData(),
  db.activity.findMany({ take: 10 }),
]);

const userCount = results[0].status === "fulfilled" ? results[0].value : null;
const revenue = results[1].status === "fulfilled" ? results[1].value : null;
const recentActivity =
  results[2].status === "fulfilled" ? results[2].value : [];
```

The endpoint degrades gracefully. Partial data beats a full error. This is the kind of resilience production applications need.

## Next.js 15 changes to watch for

If you're upgrading from Next.js 14, a few things about API routes shifted in 15:

- **`cookies()`, `headers()`, and `draftMode()` are now async.** You need to `await` them, which breaks any code that assumed synchronous access. The change aligns them with the rest of the request-handling API and prevents subtle bugs from partial request context.
- **Caching defaults changed.** GET route handlers are no longer cached by default. If you want caching behavior, opt in explicitly with `export const dynamic = 'force-static'` or per-fetch cache options.
- **The `runtime` configuration is more stable.** Edge runtime support for API routes has matured, and the App Router now handles the boundary between Node.js and Edge more cleanly.

If you're still on Next.js 14 and things are working, there's no rush. But when you do upgrade, those are the three things most likely to require small fixes.

## Common mistakes with Next.js API routes

After reviewing a lot of Next.js codebases, the same issues come up again and again:

**Forgetting to return a Response object.** In the App Router, every handler must return a `Response`. If you forget, the route returns a 500 with a cryptic error. Always return `Response.json(...)` or a `new Response(...)`.

**Mixing Pages Router and App Router conventions.** You can't put a Pages Router-style handler inside `app/api`. The two conventions aren't interchangeable, and mixing them silently breaks things.

**Assuming the request body is always JSON.** Real-world clients send `application/x-www-form-urlencoded`, `multipart/form-data`, and sometimes nothing at all. Check the content type or use a validation library like Zod.

**Skipping tests.** API routes are the easiest part of a Next.js app to test, and the most expensive to debug in production. Write a handful of tests for the critical endpoints and save yourself hours later.

## Frequently asked questions about Next.js API routes

### What are Next.js API routes?

Next.js API routes are server-side endpoints defined inside your Next.js project. You create a file under `app/api` (App Router) or `pages/api` (Pages Router), export a function per HTTP method, and Next.js turns that file into an HTTP endpoint that returns JSON. They let you build a backend API in the same codebase and deployment as your frontend.

### What's the difference between App Router and Pages Router API routes?

App Router API routes live in `app/api/*/route.ts` and export named functions per HTTP method (`GET`, `POST`, etc.) that receive Web-standard `Request` and `Response` objects. Pages Router API routes live in `pages/api/*.js` and use a single default export that receives Node.js `req` and `res` objects. The App Router is recommended for new projects.

### When should I use an API route instead of a server component?

Use server components for fetching data that a page needs to render. Use API routes for form submissions, webhooks, mobile app backends, third-party integrations, and any situation where a client needs to send data to your server outside of a page navigation. Server components can't handle POST requests; API routes can.

### How do I test Next.js API routes?

Use `next-test-api-route-handler` (NTAH). It runs your route handlers in-process with the full request lifecycle, so you get realistic tests without spinning up a server. Pair it with Jest or Vitest and write tests for request validation, authentication, and error paths.

### Can I use Next.js API routes with an external API?

Yes, and it's one of the most common patterns. Your API route acts as a proxy—the client hits your endpoint, your endpoint calls the external service with a server-side API key, and returns the result. This keeps secrets out of the browser and avoids CORS issues.

### What's the difference between Node.js and Edge runtimes in Next.js API routes?

The Node.js runtime (the default) has full Node.js APIs available, including the filesystem and native modules, with cold starts of a few hundred milliseconds. The Edge runtime runs on a global network close to users, uses a subset of the Web API, and has nearly instant cold starts—but no filesystem or native modules. Choose Edge for latency-sensitive logic; stick with Node.js for anything needing npm packages like Prisma.

### How do I add authentication to Next.js API routes?

Wrap your handler in an authentication middleware function that reads the `authorization` header, verifies the token, and either returns a 401 or passes the authenticated request to the handler. You can also use NextAuth.js or Auth.js, which integrate with the App Router and expose a session helper you can call inside API routes.

### Can I stream responses from a Next.js API route?

Yes. Return a `ReadableStream` wrapped in a `Response`, and set the `Content-Type` to `text/event-stream`. The client reads the body with `fetch` and processes chunks as they arrive. This is the standard pattern for AI responses and real-time dashboards.

## Wrapping up

Next.js API routes collapse the frontend and backend into a single codebase. One project. One deployment. One set of TypeScript types shared between client and server. The productivity gains are real, especially for small to medium teams without the bandwidth to maintain separate backend infrastructure.

They're not a replacement for a dedicated backend in every scenario. If your API has hundreds of endpoints, complex business logic, or needs to scale independently of the frontend, a separate service might make more sense. But for the vast middle ground—form handling, webhooks, simple CRUD, backend-for-frontend patterns—API routes are more than enough.

The key patterns to remember: use server components for data fetching during page rendering, use API routes for mutating data and external clients. Handle errors consistently. Cache expensive responses. Test the critical paths. And don't overcomplicate things—sometimes a simple route handler that returns JSON is all you need.

They're one of the quiet superpowers of the framework, and once you start using them, you'll wonder why you ever did it any other way.

---

_Building a Next.js application and need help designing your API layer? Red Surge Technology works with teams to architect backend patterns that scale with your frontend. [Get in touch](/contact) to discuss your project._
