---
title: "What is the Next.js Server? RSC Architecture Explained"
date: "2026-11-04T10:00:00.000Z"
excerpt: "Next.js 16 ships a server you never configure and a rendering model most developers misunderstand. Here's what the Next.js server actually is, how RSC differs from SSR, and where the client boundary really sits."
cover_image: "/images/blog/uploads/nextjs-server-rsc-architecture.webp"
seo_title: "What is the Next.js Server? RSC Architecture Explained"
seo_description: "A clear explanation of the Next.js server and React Server Components architecture. Learn how the RSC Payload works, where the client boundary sits, and how RSC differs from SSR."
author_name: "Collin Stewart"
tags:
  - Next.js
  - React
  - Server Components
  - RSC
  - Web Development
category: "JavaScript"
reading_time: 13
featured: false
no_index: false
---

Here's a question that sounds simple and isn't: when you run `next dev`, what exactly is the server doing?

Most developers have a vague mental model. "It renders my pages." "It handles API routes." "It's Node, I think." That model gets you through a tutorial. It falls apart the first time you hit a hydration mismatch, or wonder why your `console.log` appears in the terminal _and_ the browser, or try to import a component and get an error about client and server modules.

The confusion isn't your fault. Next.js has carried three rendering models across two routers in under a decade, and the vocabulary overlaps in ways that actively mislead. "Server-rendered" describes how HTML was produced. "Server Component" describes where the code runs. Those are different things, and conflating them is the root of most RSC confusion.

This post explains what the Next.js server actually is, how the React Server Components architecture works under the hood, and where the boundary between server and client really sits. If you want the deeper rendering-strategy comparison, our [React Server Components in Next.js](/blog/react-server-components-nextjs) guide covers the broader landscape. If you're choosing between data-fetching patterns, our [Next.js API Routes vs Route Handlers vs Server Actions](/blog/nextjs-api-routes-vs-route-handlers-vs-server-actions) comparison covers the mutation side. This post is the architecture explainer.

## The Short Answer: Next.js Is a Compiler and a Runtime

The "Next.js server" isn't a single thing. It's two things working together.

**First, it's a compiler.** Next.js takes your `app/` directory, your components, your CSS, and your server-only code, and it produces two separate module graphs. One graph contains code that runs on the server. The other contains code that runs in the browser. A module used by both is compiled twice, separately, for each environment[reference:0].

That split is the architectural heart of the whole system. When you write a component, you're not writing something that "runs in Next.js." You're writing something that Next.js will assign to one graph or the other, and then compile accordingly.

**Second, it's a runtime.** At request time (or build time), the server executes the server graph. It renders your Server Components, produces a serialized description of the UI called the **RSC Payload**, and then uses that payload plus your Client Components to generate HTML[reference:1]. Depending on the route, that HTML is generated at build time, after the build via ISR, or on every request via SSR[reference:2].

So the Next.js server is a compiler that splits your code and a runtime that renders one half and serializes the result for the other half. Everything else follows from that.

## What a Server Component Actually Is

The default in the App Router is that every component is a Server Component. Not "server-rendered"—server _executed_. The code runs on the server, and it never ships to the browser.

That last part is the important one. A Server Component contributes zero JavaScript to the client bundle for its own implementation. It can import database clients, read environment variables, access the filesystem, and await promises directly. None of that code reaches the user.

Here's the shape of it:

```tsx
// app/posts/[id]/page.tsx — Server Component by default
import { db } from "@/lib/db";
import LikeButton from "./like-button";

export default async function PostPage({ params }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <LikeButton likes={post.likes} />
    </article>
  );
}
```

That `await db.post.findUnique` runs on the server. The `db` import never reaches the browser. The page component itself is not hydrated, because there's nothing to hydrate—it has no state, no effects, no event handlers.

What _does_ reach the browser is the `<LikeButton>`, and the props passed to it. Which brings us to the boundary.

## The RSC Payload: What Actually Crosses the Wire

When the server renders a Server Component tree, it doesn't produce HTML first. It produces the **RSC Payload**, a compact serialized description of the rendered UI. The payload describes the tree, the props passed to Client Components, and references to where those Client Components live in the client bundle[reference:3].

Think of it as a set of instructions rather than a finished page. "Here's the structure. Here's the text content. Here's a Client Component at this position, with these serialized props. Here's where to find its code."

Only after the payload exists does Next.js use it—plus the Client Components—to prerender HTML[reference:4]. That HTML is what the browser receives first. Then React hydrates the Client Components using the payload and the client bundle.

This is why the payload is such a critical piece of the architecture, and why vulnerabilities in React's Flight protocol—the serializer that produces and deserializes the payload—had such wide impact across the ecosystem. The payload is the trust boundary between server and client. If it can be forged, the boundary is compromised.

## Server vs. Client: The Boundary Is About Modules, Not Files

The mental model most developers start with is "some files are server files, some are client files." That's close enough to be useful and wrong enough to cause bugs.

The boundary is defined by the `'use client'` directive, and it marks a **module graph entry point**, not a per-file flag[reference:5]. When you put `'use client'` at the top of a file, you're telling the compiler: this module and everything it imports belong to the client graph. Every component imported into that file becomes a Client Component too[reference:6].

That has a practical consequence that surprises people. `'use client'` doesn't mean "this specific component is interactive." It means "this is where the client graph starts, and it propagates downward." A file with `'use client'` that imports a dozen utility components makes all twelve of them client code, even if only one of them uses `useState`.

The other direction is more constrained. Client Components cannot import Server Components directly. The import would pull server code into the client graph, which defeats the entire model. The workaround is composition: a Server Component renders a Client Component, and passes a Server Component as `children` or another prop. The Client Component renders the slot without ever importing the server module[reference:7].

If you've worked with the [compound components pattern](/blog/react-compound-components-pattern), this will feel familiar. The parent owns the structure; the child renders a slot it doesn't need to understand.

## RSC Is Not SSR (And the Difference Matters)

This is the distinction that causes the most confusion, so let's be precise.

**SSR** is a statement about _when HTML is generated_. With SSR, the server generates HTML on each request, sends it to the browser, and the browser hydrates the full component tree. Every component's code ships to the client, because every component needs to hydrate.

**RSC** is a statement about _where component code runs and whether it ships_. Server Components run only on the server and never ship. Client Components run on the server to produce HTML, and again in the browser to hydrate[reference:8].

Both can be true at once. In the App Router, a page can be statically generated (SSG), incrementally regenerated (ISR), or server-rendered per request (SSR)—and in all three cases, it's using the RSC architecture. The rendering strategy describes how the HTML was produced. The component model describes what code exists where[reference:9].

Here's the practical version:

|                                 | Traditional SSR                     | RSC architecture                  |
| ------------------------------- | ----------------------------------- | --------------------------------- |
| **Server code in bundle?**      | Yes—full component tree hydrates    | No—Server Components never ship   |
| **Client JS for a static page** | Full React tree                     | Only the Client Component islands |
| **Data access**                 | Via props from `getServerSideProps` | Direct, inside the component      |
| **HTML generation**             | Per request                         | Build, ISR, or per request        |

The client bundle reduction is the headline benefit, but the architectural benefit is bigger: Server Components can talk to your data layer directly, without an intermediate API or a props pipeline. Our [Next.js ISR vs SSR](/blog/nextjs-isr-vs-ssr) comparison covers how those rendering strategies interact with this model.

## A Client Component Runs on the Server Too

Here's the detail that breaks people's brains, and it's worth sitting with: **Client Components render on the server as well.**

On a direct visit, a Client Component is rendered on the server to produce HTML, then rendered again in the browser during hydration[reference:10]. That's why a `console.log` at the top of a `'use client'` component prints twice—once in your terminal, once in the browser console. It's not a bug. It's the architecture doing exactly what it says.

The label "Client Component" means "this component _also_ runs in the browser." It does not mean "this component runs _only_ in the browser." That distinction matters for anything with side effects, because code that runs in both environments needs to be safe in both.

On a client-side navigation, the behavior changes. The server sends the RSC Payload, and the Client Component renders in the browser without a server-rendered HTML step[reference:11]. So the same component has two different execution paths depending on how the user arrived at the page.

This is why the "Server Component vs. Client Component" framing is misleading as a mental model. A better framing: every component renders on the server, and some of them also render on the client.

## Why the Architecture Is Shaped This Way

Two forces drove this design.

**The JavaScript bundle problem.** Before RSC, every React component shipped to the browser, even components that only rendered static content. A marketing page with a rich component library could ship hundreds of kilobytes of JavaScript to display text and images. RSC makes the default "server-only," so static content costs nothing on the client. The React team's framing is that Server Components let you reduce the JavaScript sent to the browser and improve First Contentful Paint[reference:12].

**The data-fetching problem.** Before RSC, server data had to arrive via `getStaticProps`, `getServerSideProps`, or an API round trip. That meant serializing data at a boundary and passing it through props, or writing an endpoint just so a component could call it. RSC lets a component await its own data directly, which collapses an entire layer of plumbing.

The cost is conceptual complexity. You now have two module graphs, a serialization boundary, a set of rules about what can be imported where, and a component model where the same file can execute in two different environments. That's a real tax, and it's why the "when do I add `'use client'`" question never fully goes away.

## A Story About a Boundary That Moved

A while back, I worked on a dashboard where a developer had put `'use client'` at the top of a shared `components/` file to fix a `useState` error. That one line pulled the entire component library into the client graph—tables, cards, layout primitives, even a markdown renderer. The client bundle grew by roughly 180KB gzipped, and the marketing pages that imported one small component from that file started shipping all of it.

The fix was to move `'use client'` down to the two leaf components that actually needed interactivity and let everything else stay server-side. The bundle dropped back down, and the pages got noticeably faster on mobile.

The lesson: `'use client'` isn't a fix for an error. It's an architectural decision about where the client graph begins, and it propagates to everything downstream.

## Common Misconceptions Worth Clearing Up

**"Server Components are just SSR components."** No. SSR components ship and hydrate. Server Components never ship. They're different axes.

**"`'use client'` makes a component client-only."** No. It makes the module a client graph entry point, and the component still renders on the server for the initial HTML.

**"I can import a Server Component inside a Client Component."** No. Pass it as `children` or a prop instead. The client component renders the slot without importing the server module.

**"The RSC Payload is HTML."** No. It's a serialized description used to produce HTML and to hydrate Client Components. The HTML is a separate output.

**"Server Components can't be interactive."** Correct, but that's not a limitation—it's the point. Interactivity belongs in Client Components, composed inside the server tree.

## Wrapping Up

The Next.js server is a compiler that splits your code into two module graphs and a runtime that renders the server graph into an RSC Payload, then uses that payload to produce HTML and hydrate the client islands.

Server Components run only on the server and ship no JavaScript. Client Components run on the server for the initial render and again in the browser for hydration. The `'use client'` directive marks where the client graph begins, and everything imported beneath it joins that graph.

Once that model clicks, most of the framework's stranger behaviors stop being strange. The double `console.log` makes sense. The import errors make sense. The bundle-size wins make sense. And the question "should this be a Server Component or a Client Component?" stops being a coin flip.

For the deeper comparison of rendering strategies, see our [React Server Components in Next.js](/blog/react-server-components-nextjs) guide. For the mutation side—Route Handlers versus Server Actions—see our [API Routes vs Route Handlers vs Server Actions](/blog/nextjs-api-routes-vs-route-handlers-vs-server-actions) breakdown. And for how ISR and SSR fit into this model, our [ISR vs SSR](/blog/nextjs-isr-vs-ssr) comparison covers the caching implications.

Now go look at your `'use client'` directives and ask what they're really pulling in.

---

_Need help architecting a Next.js application around Server Components, or auditing a client bundle that's grown out of control? Red Surge Technology builds performant Next.js applications with clean server/client boundaries. [Get in touch](/contact) to discuss your project._
