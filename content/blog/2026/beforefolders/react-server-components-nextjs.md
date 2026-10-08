---
title: "React Server Components in Next.js: The Complete Guide (2026)"
date: 2026-05-22T10:00:00.000-04:00
excerpt: "Learn what React Server Components are, how they work in Next.js, and why they improve performance and reduce JavaScript bundle sizes. Includes client vs server comparison, data fetching patterns, and common mistakes."
cover_image: /images/blog/uploads/react-server-components-guide.webp
seo_title: "React Server Components in Next.js: The Complete Guide (2026)"
seo_description: "A complete guide to React Server Components in Next.js. Learn rendering, hydration, data fetching, the 'use client' directive, and how RSC differs from SSR and client components."
author_name: "Collin Stewart"
tags:
  - react
  - nextjs
  - react server components
  - javascript
  - web performance
  - frontend development
category: "JavaScript"
reading_time: 14
featured: false
no_index: false
---

Modern React development has changed dramatically over the last few years. For a long time, most React applications followed the same basic rendering model:

1. The browser downloads JavaScript
2. React renders the application
3. Data gets fetched from APIs
4. Components become interactive

That approach made highly dynamic applications possible, but it also introduced a growing problem across the frontend ecosystem: too much JavaScript.

As React applications became larger and more complex, websites started shipping massive client-side bundles even when pages contained mostly static content. React Server Components were introduced to help solve that problem.

I remember the first time I felt the impact in a real project. We'd just migrated a marketing site to Next.js App Router and the difference was jarring — not in a subtle "it feels a bit faster" way, but in a "wait, this is the same site?" way. The bundle dropped from over 400KB of JavaScript to about 90KB. The Lighthouse score went from the 60s to the 90s. Users noticed. Our client noticed. And the only significant change was moving most of the components to the server.

But I also remember the confusion. The `"use client"` directive kept showing up in places it didn't need to be. We'd hit cryptic errors about hooks not working. And there was this persistent sense that the mental model was different in some way we hadn't quite internalized yet. That's what this guide is for.

Understanding how React Server Components work in Next.js is becoming an increasingly important skill for frontend developers. So let's dig into what they actually are, how they differ from everything that came before, and the practical patterns that make them worth the mental adjustment.

## What are React Server Components?

React Server Components (often abbreviated RSC) are React components that render entirely on the server instead of the browser.

Unlike traditional React components, Server Components do not send their JavaScript to the client. Instead, the server renders the component output and streams the result to the browser. This means users receive the UI without downloading unnecessary JavaScript for that portion of the application.

A simple example of a Server Component in Next.js looks like this:

```tsx
async function BlogPosts() {
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json(),
  );

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}

export default BlogPosts;
```

One thing that immediately stands out is that the component itself is asynchronous.

Traditional client-rendered React components cannot directly await data during rendering like this. Server Components can because they execute entirely on the server before anything reaches the browser. This creates a much simpler rendering model for many types of applications.

## Why React introduced Server Components

To understand why Server Components matter, it helps to understand how React applications traditionally worked.

For years, React relied heavily on client-side rendering. The server would return a mostly empty HTML document containing a root element and a JavaScript bundle.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/bundle.js"></script>
  </body>
</html>
```

After the browser downloaded the JavaScript bundle, React would generate the application interface entirely on the client side.

This architecture became popular because it enabled highly interactive user experiences. Navigation felt fast, interfaces became dynamic, and developers could build sophisticated applications directly in the browser.

However, as applications grew larger, several performance problems became increasingly common:

- Large JavaScript bundles
- Long hydration times
- Slower mobile performance
- Main thread blocking
- Increased CPU usage
- Poor Lighthouse scores

Many websites started shipping hundreds of kilobytes of JavaScript simply to display mostly static content. React Server Components are part of React's broader shift toward a more server-first architecture.

## The problem with large JavaScript bundles

One of the biggest frontend performance problems today is unnecessary JavaScript.

Many websites contain mostly static content:

- Articles
- Marketing pages
- Documentation
- Product pages
- Navigation
- Images

Yet developers often hydrate entire applications anyway.

**Hydration** is the process where React attaches interactivity to server-rendered HTML. The problem is that hydration requires JavaScript. Before a page becomes interactive, the browser still needs to:

1. Download JavaScript
2. Parse JavaScript
3. Execute JavaScript
4. Hydrate React trees
5. Attach event listeners

This becomes especially problematic on mobile devices. Even relatively simple websites can feel sluggish when they ship large bundles unnecessarily.

If you want a deeper dive into why this matters, our guide on [why modern websites feel slower](/blog/why-modern-websites-feel-slower) covers the full picture. And for teams exploring alternatives to React's rendering model, our [Astro + Tailwind performance guide](/blog/astro-tailwind-performance-guide) shows what a static-first approach looks like.

## How Next.js uses Server Components

Modern versions of Next.js use React Server Components by default inside the App Router.

In older React applications, most components automatically became client-rendered. In Next.js App Router, the opposite is now true. Components are treated as Server Components unless explicitly marked otherwise.

```tsx
export default function Page() {
  return <h1>Hello world</h1>;
}
```

This component renders entirely on the server. No JavaScript for this component is shipped to the browser unless interactivity is required.

This default behavior dramatically reduces JavaScript bundle sizes across many applications. But it also represents a fundamental shift in how you think about writing React. You're no longer writing code that will run in the browser first. You're writing code that runs on the server, and occasionally opting into client-side execution when you need it.

## Client Components vs Server Components

One of the most important concepts in modern Next.js development is understanding the difference between Client Components and Server Components.

Server Components are ideal for:

- Data fetching
- Database queries
- Static rendering
- Large dependencies
- SEO-heavy content
- Sensitive server logic (API keys, secrets)

Client Components are necessary for:

- State management (useState, useReducer)
- Event listeners (onClick, onChange)
- Browser APIs (window, document, localStorage)
- Forms
- Animations
- Interactive UI

A Client Component requires the `"use client"` directive at the top of the file:

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

Without `"use client"`, hooks like `useState` and browser event handlers are unavailable because the component executes on the server.

### Quick comparison table

<div class="cs-table-wrap cs-table-wrap--stack">
<table>
<thead>
<tr>
<th>Feature</th>
<th>Server Component</th>
<th>Client Component</th>
</tr>
</thead>
<tbody>
<tr>
<td data-label="Feature">Where it runs</td>
<td data-label="Server Component">Server only</td>
<td data-label="Client Component">Server (initial HTML) + Browser</td>
</tr>
<tr>
<td data-label="Feature">JavaScript sent to browser</td>
<td data-label="Server Component">None</td>
<td data-label="Client Component">Yes, full component bundle</td>
</tr>
<tr>
<td data-label="Feature">Can be async</td>
<td data-label="Server Component">Yes</td>
<td data-label="Client Component">No</td>
</tr>
<tr>
<td data-label="Feature">Can use hooks</td>
<td data-label="Server Component">No</td>
<td data-label="Client Component">Yes</td>
</tr>
<tr>
<td data-label="Feature">Can access browser APIs</td>
<td data-label="Server Component">No</td>
<td data-label="Client Component">Yes</td>
</tr>
<tr>
<td data-label="Feature">Direct database access</td>
<td data-label="Server Component">Yes</td>
<td data-label="Client Component">No</td>
</tr>
<tr>
<td data-label="Feature">Direct secrets access</td>
<td data-label="Server Component">Yes</td>
<td data-label="Client Component">No</td>
</tr>
<tr>
<td data-label="Feature">Directive required</td>
<td data-label="Server Component">No (default in App Router)</td>
<td data-label="Client Component">Yes — <code>"use client"</code></td>
</tr>
</tbody>
</table>
</div>

This separation encourages developers to think more carefully about what truly needs to run in the browser.

## Understanding the `"use client"` directive

The `"use client"` directive is one of the most important parts of the modern Next.js architecture. It tells React:

> This component must execute in the browser.

Once a component becomes a Client Component, all of its child components also become client-rendered unless separated intentionally. This is why developers should avoid placing `"use client"` too high in the component tree.

For example, marking an entire layout as client-rendered can dramatically increase bundle sizes unnecessarily. A better approach is isolating interactivity into smaller components:

```tsx
"use client";

export default function ThemeToggle() {
  return <button>Toggle Theme</button>;
}
```

Only the toggle requires client-side JavaScript. The surrounding layout can remain server-rendered. This approach keeps applications significantly more performant.

### The "use client" contagion problem

This is worth dwelling on because it's the single most common mistake in Next.js App Router codebases. When you add `"use client"` to a parent component, every child component inherits that status — even if those children don't need any client-side interactivity at all.

The fix is to push `"use client"` as far down the tree as possible. If a form needs state, mark only the form component — not the entire page that contains it. If a dropdown needs browser events, mark only the dropdown. Keep everything else on the server.

## Data fetching in Server Components

One of the biggest advantages of Server Components is simplified data fetching.

Older React applications commonly fetched data in the browser using `useEffect()`:

```tsx
useEffect(() => {
  fetch("/api/posts")
    .then((res) => res.json())
    .then(setPosts);
}, []);
```

While this works, it creates several issues:

- Additional network waterfalls
- Loading states (with spinners and skeletons)
- Client-side JavaScript overhead
- Slower content rendering
- SEO challenges since the content isn't in the initial HTML

Server Components simplify this dramatically:

```tsx
async function Posts() {
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json(),
  );

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

The server fetches the data before the page reaches the browser. This improves SEO, performance, initial rendering, and overall user experience. For content-heavy websites, this model is often significantly cleaner.

If you're already familiar with the [JavaScript Fetch API and async/await](/blog/how-to-use-the-javascript-fetch-api-with-async-await), you'll recognize everything happening inside the Server Component. The syntax is the same — the difference is where it executes.

### Request memoization

One thing Next.js does under the hood with Server Components: it deduplicates `fetch` calls within a single render pass. If three components all fetch the same URL, Next.js makes only one network request. This is called request memoization, and it makes Server Components significantly more efficient than manually coordinating data fetching on the client.

## How Server Components reduce hydration

One of the primary goals of Server Components is reducing unnecessary hydration.

Hydration still exists in applications using Server Components, but fewer components require client-side JavaScript. Static content like:

- Blog articles
- Navigation text
- Product descriptions
- Layout wrappers

often does not need hydration at all. Only interactive portions require client-side rendering.

This dramatically reduces:

- JavaScript bundle sizes
- CPU usage
- Main thread blocking
- Mobile performance issues

### What this looks like in practice

<div class="cs-table-wrap cs-table-wrap--stack">
<table>
<thead>
<tr>
<th>Page section</th>
<th>Traditional SPA</th>
<th>RSC in Next.js</th>
</tr>
</thead>
<tbody>
<tr>
<td data-label="Page section">Header / navigation</td>
<td data-label="Traditional SPA">Hydrated</td>
<td data-label="RSC in Next.js">Server-rendered, no hydration unless interactive</td>
</tr>
<tr>
<td data-label="Page section">Article body</td>
<td data-label="Traditional SPA">Hydrated</td>
<td data-label="RSC in Next.js">Server-rendered, zero JS</td>
</tr>
<tr>
<td data-label="Page section">Comments form</td>
<td data-label="Traditional SPA">Hydrated</td>
<td data-label="RSC in Next.js">Client Component — hydrated</td>
</tr>
<tr>
<td data-label="Page section">Related posts list</td>
<td data-label="Traditional SPA">Hydrated</td>
<td data-label="RSC in Next.js">Server-rendered, zero JS</td>
</tr>
<tr>
<td data-label="Page section">Share buttons</td>
<td data-label="Traditional SPA">Hydrated</td>
<td data-label="RSC in Next.js">Client Component — hydrated</td>
</tr>
</tbody>
</table>
</div>

Modern frontend frameworks are increasingly moving toward this architecture. You can see the same trend across Astro, partial hydration systems, islands architecture, and static-first rendering tools. The overall direction of frontend development is becoming increasingly performance-focused.

## React Server Components without Next.js

A question that comes up constantly — and one that shows up in search data — is whether you can use React Server Components without Next.js. The short answer: **yes, but it's not trivial.**

The React team has published the underlying RSC specification, and frameworks like Waku and RedwoodJS have implemented their own versions of it. The bundler side (webpack, Turbopack, Vite) has to understand how to split server and client code, stream the RSC payload, and reconcile it on the client. That's substantial engineering work.

For most teams in 2026, Next.js is still the pragmatic choice if you want React Server Components in production. But it's worth knowing that the technology isn't tied to Next.js — it's a React feature that Next.js happens to be the most mature implementation of.

## SEO and performance benefits

Reducing JavaScript has major SEO implications. Google increasingly prioritizes metrics related to user experience and page performance, including Core Web Vitals.

Large JavaScript bundles can negatively impact:

- Largest Contentful Paint (LCP)
- Interaction to Next Paint (INP)
- Time to Interactive (TTI)

By reducing hydration and moving rendering work to the server, Server Components help improve many of these metrics. This is especially important for:

- Marketing websites
- Blogs
- Documentation
- SEO-focused pages
- Mobile-heavy traffic

If you're interested in performance optimization, these articles pair well with this topic:

- [Improving website page speed for SEO](/blog/improve-website-page-speed-seo-nj)
- [Mobile-first web design guide](/blog/mobile-first-web-design-guide-2026)
- [Web design best practices for small businesses](/blog/web-design-best-practices-small-business-2026)

## Common mistakes developers make

One of the most common mistakes developers make is overusing Client Components. Adding `"use client"` too high in the component tree causes large portions of the application to become client-rendered unnecessarily.

### Mistake 1: Marking layouts as client

A layout with `"use client"` at the top forces every child component to become a Client Component. This often defeats the entire purpose of Server Components. Keep layouts server-rendered and isolate interactivity into smaller pieces.

### Mistake 2: Trying to access browser APIs in Server Components

```tsx
window.innerWidth;
```

This fails because Server Components execute on the server, not inside the browser. Same goes for `localStorage`, `document`, `navigator`, and anything else browser-specific. If you need those APIs, that code belongs in a Client Component.

### Mistake 3: Forgetting that hooks don't work on the server

`useState`, `useEffect`, `useContext` — none of them work inside Server Components. If you're reaching for one of those, you almost certainly need a Client Component.

### Mistake 4: Passing functions from Server to Client Components

Functions can't be serialized across the server-client boundary. If you try to pass an `onClick` handler from a Server Component to a Client Component as a prop, you'll get an error. Define the handler inside the Client Component or use Server Actions for server-side logic triggered from the client.

### Mistake 5: Assuming Server Components run on every request

Server Components are static by default. If you want them to re-run on every request (to fetch fresh data), you need to opt into dynamic rendering with `export const dynamic = 'force-dynamic'` or by using `cookies()` or `headers()`. Otherwise, the component renders once at build time and serves the same output to everyone.

Understanding where code executes is one of the most important parts of working with modern React frameworks. If you've ever wrestled with subtle bugs in [TypeScript error handling](/blog/typescript-error-handling-in-try-catch-blocks-guide), you know that knowing which environment you're running in is half the battle.

## React Server Components vs SSR: what's the difference?

This is one of the most confused topics in the React ecosystem, so it deserves its own section.

**Server-Side Rendering (SSR)** generates HTML on the server for each request, then sends the full JavaScript bundle to the browser so React can hydrate the page and make it interactive.

**React Server Components (RSC)** render on the server and **never send their component code to the browser at all.** There's no hydration for Server Components. The UI is sent as a serialized payload that React can render without running the component logic client-side.

The two techniques work together. In Next.js App Router:

- Server Components are rendered to an RSC payload
- That payload produces HTML for the initial page load
- Client Components within the tree are hydrated normally
- Server Components never get hydrated at all

So SSR reduces _time to first paint_. RSC reduces _total JavaScript needed_. Both matter, but they solve different problems.

## Frequently asked questions

### What are React Server Components in simple terms?

React Server Components are React components that run only on the server. They can fetch data, access databases, and use server-side secrets, but they don't send any JavaScript to the browser. When the user loads the page, they see the rendered output without downloading component code for those parts of the UI.

### What's the difference between Server Components and Client Components in Next.js?

Server Components run on the server, can be async, can access backend resources directly, and ship zero JavaScript. Client Components run in the browser, can use hooks and event handlers, and require the `"use client"` directive. In the Next.js App Router, Server Components are the default — you opt into Client Components when you need interactivity.

### Can I use React Server Components without Next.js?

Yes, but it requires significant tooling. Waku and RedwoodJS have independent implementations. The RSC specification is public. But for production use in 2026, Next.js is still the most mature and widely-used implementation by a wide margin.

### Does `"use client"` make the whole page client-rendered?

Only the component it's declared in and everything below it. It doesn't affect sibling components or ancestors. This is why placing `"use client"` at the top of a page or layout is dangerous — it cascades down to everything else. Place it at the leaf level whenever possible.

### Are Server Components faster than SSR?

They're faster in a different way. SSR reduces time to first paint because the server sends fully rendered HTML. Server Components reduce the total JavaScript that needs to be downloaded, parsed, and executed on the client. In practice, both techniques work together — SSR for the initial HTML, RSC for the reduced bundle size.

### Can Server Components use hooks?

No. `useState`, `useEffect`, `useContext`, and every other hook are browser-only. If you need state or lifecycle behavior, use a Client Component. Server Components can only use async/await for data fetching and rendering.

### How do Server Components handle data fetching?

You `await` the data directly inside the component. Next.js handles request memoization automatically, so if multiple components fetch the same URL within a single render pass, only one network request is made. There's no `useEffect` and no loading state boilerplate — the component just waits for the data before rendering.

### Can I pass props from Server to Client Components?

Yes, but the props must be serializable. Plain objects, arrays, strings, numbers, booleans, and null are fine. Functions, class instances, and Date objects with methods are not. If you need to pass a callback, define it inside the Client Component or use Server Actions.

### What are Server Actions, and how do they relate to Server Components?

Server Actions let a Client Component call a function that executes on the server — usually for form submissions or mutations. They're defined with the `"use server"` directive and are the intended way to handle writes from the client without setting up an API route. Server Actions and Server Components are complementary: Server Components handle reads, Server Actions handle writes.

### Does using Server Components hurt SEO?

No — it helps SEO. Because the content is rendered on the server and included in the initial HTML, search engine crawlers see the full page content without needing to execute JavaScript. This eliminates an entire class of indexing problems that plague client-rendered React apps.

## Final thoughts

React Server Components represent one of the biggest architectural changes in modern React development.

For years, frontend frameworks assumed most rendering should happen in the browser. Now the ecosystem is moving toward a more balanced server-first approach. The goal is not eliminating client-side rendering entirely. The goal is reducing unnecessary JavaScript.

Server Components help accomplish that by:

- Keeping heavy logic on the server
- Simplifying data fetching
- Reducing hydration costs
- Lowering bundle sizes
- Improving performance
- Enhancing SEO

As frameworks like Next.js continue evolving, understanding Server Components will become increasingly important for frontend developers building modern web applications. The future of frontend development is becoming more performance-focused, more server-aware, and more intentional about what truly belongs in the browser.

If you want to see how this connects to the rest of the stack, our [Next.js API Routes guide](/blog/next-js-api-routes) covers the backend side of the same architecture, and our [CSS Grid guide](/blog/css-grid-layout-responsive-web-design) will help you build the layouts these components render into.

---

_Working on a Next.js App Router migration or trying to figure out the right Server/Client boundary for your team? Red Surge Technology helps teams architect React applications that ship less JavaScript and load faster. [Get in touch](/contact) to talk through your setup._
