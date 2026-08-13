---
title: "Next.js ISR: A Complete Guide to Incremental Static Regeneration in 2026"
date: "2026-08-06T10:00:00.000Z"
excerpt: "Incremental Static Regeneration lets you update static content without a full rebuild. Learn revalidation strategies, on-demand updates, and how to avoid common ISR pitfalls in Next.js."
cover_image: "/images/blog/uploads/nextjs-isr-guide.webp"
seo_title: "Next.js ISR Guide: Master Incremental Static Regeneration"
seo_description: "Master Next.js Incremental Static Regeneration. Learn time-based revalidation, on-demand ISR, stale-while-revalidate, and debugging with examples."
author_name: "Collin Stewart"
tags:
  - Next.js
  - ISR
  - Performance
  - React
  - Web Development
category: "JavaScript"
reading_time: 13
featured: false
no_index: false
---

Static generation is the holy grail of web performance. Pages load instantly because they're pre-built HTML served from a CDN edge node. No server rendering. No database queries on every request. Just a file sitting on a disk somewhere, ready to be delivered in under fifty milliseconds.

The problem has always been staleness. A statically generated blog post is fast, but it doesn't update itself when you fix a typo or publish new content. Before Incremental Static Regeneration, you had two choices: rebuild the entire site every time something changed, or give up on static generation and render on every request. Neither was great.

ISR splits the difference. It lets you keep the performance of static generation while updating content in the background when it gets stale. You set a revalidation interval—say, once an hour—and Next.js handles the rest. A user requests a page, gets the cached static version instantly, and behind the scenes, Next.js regenerates it if the cache is stale. The next user gets the fresh version.

It sounds straightforward, but there are nuances. What happens if the regeneration fails? How do you debug stale content? When should you use on-demand revalidation instead of time-based? Let's dig into everything you need to know to use ISR effectively in production.

## The two flavors of ISR: time-based and on-demand

ISR comes in two forms, and they serve different purposes.

Time-based revalidation uses the `revalidate` option in your fetch calls or a route segment config. You specify a number of seconds, and Next.js regenerates the page in the background after that interval elapses.

```javascript
// App Router: time-based revalidation on a fetch call
async function getPost(slug) {
  const res = await fetch(`https://cms.example.com/posts/${slug}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  });
  return res.json();
}
```

Or, for an entire page or layout:

```javascript
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // Entire page revalidates every hour
```

On-demand revalidation gives you programmatic control. Instead of waiting for a timer, you trigger regeneration explicitly—usually from an API route that receives a webhook from your CMS or database.

```javascript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request) {
  const { slug, tag } = await request.json();

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }

  if (tag) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: true });
}
```

Time-based revalidation is simpler to set up. On-demand revalidation is more precise—you only regenerate when something actually changes. For a blog with ten posts that rarely update, time-based works fine. For an e-commerce site where inventory changes constantly, on-demand is better.

If you've been comparing [ISR with SSR in Next.js](/blog/nextjs-isr-vs-ssr), you'll know that ISR is a performance optimization for content that doesn't need to be fresh on every request. The revalidation strategy you pick determines how fresh the content actually is.

## What happens during regeneration: the stale-while-revalidate dance

The magic of ISR is that users never wait for a regeneration. The request that triggers the revalidation still gets the cached (stale) version of the page. Next.js kicks off the regeneration in the background, and once it's complete, the cache is updated for the next request.

This is called stale-while-revalidate, and it's the same pattern that service workers use for offline caching. The content might be slightly stale for one user, but no one ever stares at a loading spinner while the page builds.

```javascript
// Request flow for time-based ISR:
// 1. User requests /blog/my-post
// 2. Cache is 65 minutes old (revalidate interval is 60 minutes)
// 3. Next.js returns the cached (stale) page immediately
// 4. Next.js triggers background regeneration
// 5. Cache is updated with fresh page
// 6. Next user gets the fresh page instantly
```

The tradeoff is that the user who triggers the revalidation sees stale content. For most content, this is fine—a blog post that's 61 minutes old instead of 60 is indistinguishable. For highly time-sensitive content like stock prices or breaking news, ISR is the wrong tool entirely.

## The on-demand workflow: CMS webhooks in practice

The most common on-demand ISR setup involves a headless CMS. When an editor publishes or updates content, the CMS fires a webhook to your Next.js application. The webhook handler calls `revalidatePath` or `revalidateTag`, and the affected pages regenerate.

```javascript
// app/api/webhook/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify the webhook is from your CMS
  const signature = request.headers.get('x-webhook-signature');
  if (!verifySignature(signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const body = await request.json();
  const { model, slug } = body;

  // Revalidate the specific page
  if (model === 'post' && slug) {
    revalidatePath(`/blog/${slug}`);
    // Also revalidate the blog index
    revalidatePath('/blog');
  }

  // Or use tags for more targeted revalidation
  if (model === 'product') {
    revalidateTag('products');
  }

  return Response.json({ revalidated: true });
}
```

If you're using one of the [best CMS options for Next.js](/blog/best-cms-for-nextjs-in-2026), like Sanity or Strapi, they have built-in support for webhooks. The setup is usually just a URL and a secret token.

Tags give you finer-grained control than paths. You can tag multiple pages with the same tag and revalidate them all at once. A product detail page, a product listing page, and a related products widget might all share the `products` tag. When a product price changes, you revalidate the tag and all three pages update.

```javascript
// Tagging a fetch call
const res = await fetch("https://api.example.com/products", {
  next: { tags: ["products"] },
});

// Later, in a webhook handler:
revalidateTag("products"); // All pages with this tag regenerate
```

## Error handling during regeneration

What happens if the regeneration fails? The database is down, the CMS API returns a 500, or an external service times out. Next.js handles this gracefully: it keeps serving the stale page.

The previous successful build stays in the cache. Users continue to see the old content, which is better than an error page. Next.js retries the regeneration on the next request. If the failure persists, the stale content stays live indefinitely.

You can monitor regeneration failures by adding error logging to your data fetching functions.

```javascript
async function getPost(slug) {
  try {
    const res = await fetch(`https://cms.example.com/posts/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch post: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error(`ISR regeneration failed for /blog/${slug}:`, error);
    // Next.js will serve the stale page — no need to throw
    return null;
  }
}
```

If you return `null` or `undefined`, Next.js will serve the stale cached version. If you haven't configured error monitoring yet, our guide on [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide) covers patterns that apply here too.

## Caching behavior on Vercel vs. self-hosted

ISR's behavior depends on where you deploy. On Vercel, the cache is shared across all serverless function instances. When one instance regenerates a page, all instances see the update. The cache persists between deployments.

In self-hosted setups, you need to configure the cache location. By default, Next.js writes the cache to the filesystem. With Docker or Kubernetes, you'll need a persistent volume so the cache survives container restarts. You can also use a custom cache handler that writes to Redis or S3.

```javascript
// next.config.ts — custom cache handler for self-hosted ISR
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheHandler: require.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 0, // Disable in-memory caching for large sites
};

export default nextConfig;
```

If you've set up [Redis caching patterns](/blog/redis-cache-design-patterns) in your backend, the same principles apply to ISR cache handlers. The cache is just a key-value store where the key is the page path and the value is the rendered HTML.

## Debugging stale content

The most common ISR complaint is "my page isn't updating." There are a few reasons this happens.

First, check the revalidation interval. If you set `revalidate: 3600`, the page won't regenerate for an hour after the last successful build, even if you trigger `revalidatePath`. Time-based revalidation won't regenerate until the interval elapses; on-demand revalidation overrides the timer.

Second, check that your fetch calls are actually being cached. If you use `no-store` or `cache: 'no-cache'`, ISR won't work because there's nothing to revalidate.

```javascript
// This fetch won't be cached — ISR won't work
const res = await fetch("https://api.example.com/data", {
  cache: "no-store",
});

// This fetch will be cached and revalidated
const res = await fetch("https://api.example.com/data", {
  next: { revalidate: 3600 },
});
```

Third, check the order of operations. `revalidatePath` is asynchronous. The page might still be generating when you check it. Wait a few seconds after triggering a revalidation before verifying.

## ISR with dynamic routes and generateStaticParams

For dynamic routes like `/blog/[slug]`, you need to tell Next.js which paths to generate statically. Use `generateStaticParams` to return the list of slugs.

```javascript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((r) =>
    r.json(),
  );

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export const revalidate = 3600;

export default async function BlogPost({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`, {
    next: { revalidate: 3600 },
  }).then((r) => r.json());

  return <article>{/* render post */}</article>;
}
```

If a request comes in for a path not in `generateStaticParams`, Next.js will generate it on-demand and cache it for subsequent requests. This is the "incremental" part of Incremental Static Regeneration—you don't need to pre-build every possible page. New content gets generated when it's first requested.

## A story about ISR saving a site from itself

I worked on a documentation site that had grown to about 5,000 pages. It was built with a static site generator, and every build took 12 minutes. The content team published updates several times a day, and every publish triggered a full rebuild. Developers spent more time waiting for builds than actually writing code.

We migrated to Next.js with ISR. The initial build generated the top 500 most-visited pages statically. The remaining 4,500 pages were generated on their first request and cached. Updates from the CMS triggered on-demand revalidation for just the changed pages and their indexes.

The migration cut the build time from 12 minutes to under 2 minutes. Content updates went live in seconds instead of minutes. The content team could publish without coordinating with developers about build queues. The site's performance stayed excellent because most pages were served from the CDN cache.

The key insight: ISR let us treat the site as mostly static while still supporting frequent updates. We didn't have to choose between performance and freshness.

## ISR and the Pages Router

If you're still on the Pages Router, ISR works through `getStaticProps` with the `revalidate` key.

```javascript
// pages/blog/[slug].tsx
export async function getStaticProps({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(
    (r) => r.json(),
  );

  return {
    props: { post },
    revalidate: 3600, // Revalidate every hour
  };
}

export async function getStaticPaths() {
  const posts = await fetch("https://api.example.com/posts").then((r) =>
    r.json(),
  );

  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: "blocking", // Generate new pages on first request
  };
}
```

On-demand revalidation in the Pages Router uses `res.revalidate()` inside an API route instead of the `revalidatePath` function. The concept is the same; the API is slightly different.

```javascript
// pages/api/revalidate.ts
export default async function handler(req, res) {
  const { slug } = req.body;

  await res.revalidate(`/blog/${slug}`);

  return res.json({ revalidated: true });
}
```

## When ISR is the wrong tool

ISR assumes content is the same for all users. It caches a single HTML page and serves it to everyone. If your page has user-specific content—a personalized dashboard, a shopping cart, an account settings page—ISR won't work because you can't serve the same cached page to different users.

Pages that change on every request—real-time data, live scores, stock tickers—also shouldn't use ISR. The revalidation interval guarantees staleness, and for these use cases, even a few seconds of staleness matters.

For these scenarios, SSR or client-side fetching is the right approach. Our comparison of [Next.js ISR vs SSR](/blog/nextjs-isr-vs-ssr) covers when each strategy makes sense.

## Wrapping up

ISR is one of Next.js's most powerful features because it closes the gap between static and dynamic. You get the performance of a CDN-cached static page with the flexibility to update content on your own schedule.

Start with time-based revalidation for simplicity. Move to on-demand revalidation when you need more precise control. Tag your fetch calls so you can revalidate groups of related pages. And remember: a user will always get the stale page while regeneration happens, so don't use ISR for content that demands per-second accuracy.

If you're building a Next.js site with content that changes occasionally but not constantly, ISR is probably the right answer. It's the closest thing to having your cake and eating it too.

---

_Want to implement ISR in your Next.js application but not sure about the right revalidation strategy? Red Surge Technology helps teams architect content pipelines that are fast, fresh, and maintainable. [Get in touch](/contact) to discuss your project._
