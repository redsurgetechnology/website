---
title: "Cache-Control HTTP Header: A Practical Guide to Browser and CDN Caching"
date: "2026-08-17T10:00:00.000Z"
excerpt: "Learn how to use the Cache-Control HTTP header to speed up your website, reduce server load, and avoid stale content. Covers max-age, no-cache, no-store, stale-while-revalidate, and more."
cover_image: "/images/blog/uploads/cache-control-http-header.webp"
seo_title: "Cache-Control HTTP Header: Master Browser and CDN Caching"
seo_description: "A practical guide to the Cache-Control HTTP header. Understand max-age, s-maxage, no-cache, no-store, must-revalidate, and stale-while-revalidate with real-world examples."
author_name: "Collin Stewart"
tags:
  - HTTP
  - Caching
  - Performance
  - Web Development
  - CDN
category: "Web Development"
reading_time: 12
featured: false
no_index: false
---

Caching is one of the highest-leverage performance tools you have, and the `Cache-Control` HTTP header is the primary way you control it. Get it right, and your site loads instantly for repeat visitors while your server handles a fraction of the traffic. Get it wrong, and users see stale content, or your server gets hammered for resources that should have been cached.

The header looks deceptively simple—just a comma-separated list of directives like `max-age=3600`, `public`, `no-cache`. But each directive has a specific meaning, and they combine in ways that aren't always intuitive. Misunderstanding even one can lead to bugs that are hard to reproduce because they only appear after a cache expires.

Let's walk through how `Cache-Control` actually works, what each directive does, and how to use them together for different types of content. If you've ever stared at a response header and wondered why your page isn't updating, this guide is for you.

## What Cache-Control actually controls

The `Cache-Control` header tells intermediaries—browsers, CDNs, proxy servers—how long they can store a response and under what conditions they can reuse it. It doesn't just apply to static files like images and CSS. It applies to any HTTP response: HTML pages, API responses, even redirects.

Without caching, every request goes all the way back to the origin server, which generates the response from scratch. With caching, a browser can serve the response directly from its local cache, a CDN can serve it from an edge node close to the user, and the origin server can take a nap.

The header appears in the server's response, but the browser and CDN interpret it. The directives tell them what to do. Some directives apply only to shared caches (CDNs, proxies), some only to private caches (browsers), and some to both.

If you've been working with [Redis cache design patterns](/blog/redis-cache-design-patterns), you already understand the value of caching. `Cache-Control` is the browser- and CDN-level counterpart to server-side caching.

## The core directive: max-age

`max-age` specifies the maximum amount of time a response is considered fresh, in seconds. After that time, the response is stale and must be revalidated.

```
Cache-Control: max-age=3600
```

This tells the browser "you can use this response from your local cache for one hour without asking me again." After an hour, the browser will either revalidate with the server (using a conditional request) or fetch a fresh copy.

For static assets that change rarely, you can set a long `max-age`. For example, a hashed JavaScript file like `app.3f5a2b.js` can be cached for a year because the hash changes whenever the content changes. The browser will never request the old file again; it'll request the new filename.

```
Cache-Control: public, max-age=31536000, immutable
```

The `immutable` directive tells the browser "this resource will never change, so don't even revalidate if the user refreshes the page." It's a strong statement, and it only makes sense for hashed assets.

## The s-maxage directive: shared cache override

`s-maxage` is like `max-age`, but it only applies to shared caches (CDNs, proxies). It overrides `max-age` for those caches.

```
Cache-Control: max-age=60, s-maxage=3600
```

This tells browsers to cache for 60 seconds, but CDNs can cache for an hour. Why would you want that? You might want short caching for end users (so they get fresh content quickly) but longer caching at the CDN level (so the origin server doesn't get hit as often). The CDN can serve stale-ish content to many users while the browser cache is shorter.

In practice, you'll often see `s-maxage` used for HTML pages that are personalized or semi-dynamic, where you want the CDN to cache aggressively but still let users get reasonably fresh content.

## no-cache: store but always revalidate

The name `no-cache` is misleading. It doesn't mean "don't cache this." It means "you can store this, but you must revalidate with the server before using it." The browser or CDN will always make a conditional request (using `ETag` or `Last-Modified`) to check if the cached version is still valid.

```
Cache-Control: no-cache
```

This is useful for content that changes occasionally but where you still want to benefit from validation. The browser sends a request, the server compares validators, and if nothing changed, the server returns `304 Not Modified` without the full body. The browser uses its cached copy. The request still happens, but the response is tiny.

`no-cache` is often confused with `no-store`, but they're very different. `no-cache` allows storing and reusing after validation. `no-store` forbids storing altogether.

## no-store: don't store anything

`no-store` tells caches not to store the response at all. Every request goes to the origin server, and the full response is sent each time.

```
Cache-Control: no-store
```

This is the right choice for sensitive data—bank account details, personal messages, anything that should never be written to disk on a client or intermediary. It's the strongest "privacy" directive. If you're dealing with authenticated responses or financial information, `no-store` prevents accidental leaks through shared caches.

But use it sparingly. `no-store` disables all caching, which means every page load hits your server. For most content, `no-cache` with proper validators is a better balance of freshness and performance.

## must-revalidate: enforce freshness

`must-revalidate` tells caches that once the response becomes stale (after `max-age` expires), they must not serve it without revalidating with the origin server. This prevents a cache from serving stale content when the origin is temporarily unavailable.

```
Cache-Control: max-age=3600, must-revalidate
```

Normally, a cache might serve a stale response if the origin server is down or unreachable (to avoid an error). `must-revalidate` overrides that behavior: the cache must revalidate, and if the revalidation fails, it must return a 504 error rather than serve stale content.

This is important for financial data or any content where serving stale data is worse than failing.

## stale-while-revalidate: the best of both worlds

`stale-while-revalidate` is a relatively recent addition that allows a cache to serve a stale response while it asynchronously revalidates in the background. This gives you the performance of aggressive caching with the freshness of frequent revalidation.

```
Cache-Control: max-age=60, stale-while-revalidate=3600
```

This says: for 60 seconds, the response is fresh. For the next hour, if the cache is stale, serve the stale copy immediately and kick off a revalidation in the background. The next request gets the fresh copy. Users never wait for a revalidation.

This directive is supported in most modern browsers and CDNs. It's ideal for content that should be reasonably fresh but where a few seconds of staleness is acceptable—news feeds, social media timelines, product listings.

If you've been working with [Next.js ISR](/blog/nextjs-isr-guide), you've already seen this pattern. ISR's stale-while-revalidate behavior is inspired by this HTTP directive.

## public vs private

`public` means the response can be cached by any cache—browser, CDN, proxy. This is appropriate for content that's the same for all users, like a product image or a public stylesheet.

`private` means the response is specific to a single user and should only be cached by the browser, not by shared caches. This is important for personalized content—a user's profile page, their shopping cart, their dashboard.

```
Cache-Control: private, max-age=3600
```

If you omit both `public` and `private`, the default behavior is usually equivalent to `public` for shared caches (depending on the `Authorization` header), but it's better to be explicit. Mark user-specific responses as `private` to prevent a CDN from serving one user's data to another.

## A real-world story: debugging stale content

I once spent a morning trying to figure out why a client's news site wasn't showing updated articles. The content management system published new posts, but the homepage still displayed yesterday's headlines. The server logs showed normal traffic, and the database had the new content.

The problem was in the `Cache-Control` header. The homepage had been configured with `max-age=86400` (one day) without `must-revalidate` or `stale-while-revalidate`. Browsers and the CDN were caching the page for a full day, and nobody had set up proper invalidation when new content was published.

The fix was to change the homepage to use `max-age=60, stale-while-revalidate=3600` and add a cache purge trigger to the CMS. Now the page is cached for a minute, then revalidates in the background, and new content appears within a minute or two.

The lesson: `max-age` is a promise. If you break that promise by updating content without invalidating the cache, users see stale data. Always pair long `max-age` with an invalidation strategy, or use shorter `max-age` with background revalidation.

## How to set Cache-Control headers

The exact method depends on your server and framework. Here are a few common examples.

In Express:

```javascript
app.get("/static/image.png", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.sendFile("image.png");
});
```

In Next.js, you can set headers in `next.config.js` for static assets, or use the `headers()` function in API routes:

```javascript
// app/api/data/route.ts
export async function GET() {
  return new Response(JSON.stringify({ data: "..." }), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
```

For CDNs like Cloudflare or Vercel, you can often set headers at the edge without touching your origin server. This is useful for applying consistent caching rules across all routes.

## Testing your Cache-Control headers

The browser DevTools Network tab is your friend. Look at the response headers for any request and check the `Cache-Control` value. You can also use `curl`:

```bash
curl -I https://example.com/image.png
```

This shows the response headers without the body. Look for `Cache-Control`, `ETag`, and `Last-Modified`. If you're debugging stale content, check whether the browser is making conditional requests (look for `304 Not Modified` in the status column).

## Wrapping up

The `Cache-Control` header is deceptively powerful. Its directives—`max-age`, `s-maxage`, `no-cache`, `no-store`, `must-revalidate`, `stale-while-revalidate`, `public`, `private`, `immutable`—give you fine-grained control over how browsers and CDNs handle your content. The key is understanding what each directive does and combining them appropriately for different types of resources.

For static assets that change rarely, use long `max-age` and `immutable`. For API responses that need some freshness, use short `max-age` and `stale-while-revalidate`. For sensitive data, use `no-store` or `private`. And for content that updates unpredictably, pair `no-cache` with validators (`ETag`/`Last-Modified`) to get efficient revalidation.

Get caching right, and your website becomes faster and cheaper to run. Get it wrong, and you spend your days debugging why users see yesterday's content.

---

_Need help tuning your website's caching strategy for performance and freshness? Red Surge Technology optimizes web applications for real-world speed. [Get in touch](/contact) to discuss your project._
