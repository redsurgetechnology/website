---
title: "Next.js CMS Integration Guide: Step-by-Step from Schema to Production"
date: "2026-09-02T10:00:00.000Z"
excerpt: "Learn how to integrate a headless CMS with Next.js in this step-by-step guide. Cover schema setup, data fetching, ISR, webhooks, preview mode, and type safety using Sanity as an example."
cover_image: "/images/blog/uploads/nextjs-cms-integration-guide.webp"
seo_title: "Next.js CMS Integration Guide: Step-by-Step from Schema to Production"
seo_description: "A practical guide to integrating a headless CMS with Next.js. Walk through schema setup, fetching content in server components, ISR, webhooks, preview drafts, and type safety."
author_name: "Collin Stewart"
tags:
  - Next.js
  - Headless CMS
  - Integration
  - Tutorial
  - Web Development
category: "Web Development"
reading_time: 14
featured: false
no_index: false
---

So you've chosen a headless CMS for your Next.js project. Maybe you picked Sanity after reading our [best headless CMS for Next.js](/blog/best-headless-cms-for-nextjs-in-2026) guide, or perhaps you're still evaluating and want to see what the integration actually looks like. Either way, you're now faced with the real work: connecting the CMS to your frontend, fetching content, keeping it fresh, and handling previews.

The good news is that Next.js and modern headless CMS platforms are built to work together. The integration patterns are well-established. The bad news is that the details matter—getting the schema right, setting up webhooks for on-demand revalidation, and making sure your preview mode works across environments.

In this guide, I'll walk through a complete integration using **Sanity** as the example, but the patterns apply to any headless CMS. By the end, you'll have a clear roadmap from initial schema setup to production-ready content delivery. I'll cover the exact code you need, the common pitfalls, and the architectural decisions that will save you time later.

## Why integration patterns matter

Before we start coding, let's understand the pieces we're building. A Next.js CMS integration typically involves:

1. **Schema definition** – Define your content models in the CMS.
2. **Client setup** – Create a connection between Next.js and the CMS.
3. **Data fetching** – Pull content into your pages or components.
4. **Static generation and ISR** – Decide when and how often to fetch.
5. **On-demand revalidation** – Update pages when content changes.
6. **Preview mode** – Let editors see drafts before publishing.
7. **Type safety** – Ensure TypeScript types match your schema.

Each piece builds on the previous one. Getting the schema right makes the client setup easier. Getting the client setup right makes fetching content straightforward. And so on.

If you've read our [Incremental Static Regeneration guide](/blog/nextjs-isr-guide), you already understand the importance of caching and freshness. CMS integration is where that theory meets practice.

## Step 1: Define your schema in Sanity

Sanity uses JavaScript (or TypeScript) files to define schemas. These schemas live in your project and are deployed along with the Sanity Studio. Here's a simple blog post schema:

```javascript
// schemas/post.ts
export default {
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    },
    {
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    },
    {
      name: "body",
      title: "Body",
      type: "blockContent", // custom rich text type
    },
    {
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    },
    {
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    },
  ],
};
```

Key points:

- The `slug` field uses `source: 'title'` to auto-generate a URL-friendly string from the title.
- The `body` field is a custom rich text type. You can define `blockContent` separately or use Sanity's built-in portable text.
- The `image` type includes hotspot options for responsive images.

If you're using Payload, the schema would be a TypeScript config file. For Strapi, you'd define content types in the admin UI or via code. The concept is the same: define your content model so it's structured and queryable.

## Step 2: Set up the Sanity client

Create a client file that connects to your Sanity project. You'll need the project ID and dataset name.

```javascript
// lib/sanity.ts
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: process.env.NODE_ENV === "production",
});
```

Here I'm using `next-sanity`, a wrapper that provides Next.js-specific helpers. The `useCdn` flag tells Sanity to use the CDN in production for faster reads. In development, it's disabled so you get fresh data immediately.

You also need to add environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

## Step 3: Fetch content in a server component

Now you can fetch content inside a Next.js App Router page. Use the `client.fetch` method with a GROQ query.

```javascript
// app/blog/[slug]/page.tsx
import { client } from '@/lib/sanity';

async function getPost(slug: string) {
  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      excerpt,
      body,
      publishedAt,
      coverImage { asset->{ url } }
    }`,
    { slug }
  );
  return post;
}

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.excerpt}</p>
      {/* render body */}
    </article>
  );
}
```

This is a server component, so it runs on the server and sends HTML to the client. No client-side JavaScript needed. It's simple and performant.

If you want to use ISR, you can add `revalidate`:

```javascript
export const revalidate = 60; // revalidate every 60 seconds
```

Or, better yet, use on-demand revalidation via webhooks (Step 5).

## Step 4: Generate static params for SSG/ISR

For dynamic routes like `/blog/[slug]`, you need to tell Next.js which slugs to generate at build time. Use `generateStaticParams`:

```javascript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await client.fetch(`*[_type == "post"]{ slug { current } }`);
  return slugs.map((s) => ({ slug: s.slug.current }));
}
```

This fetches all post slugs and pre-generates them. If a user requests a slug that wasn't pre-generated, Next.js will fallback to on-demand generation (if you've set `fallback: 'blocking'` in Pages Router or the default in App Router with `dynamicParams = true`).

## Step 5: Set up on-demand revalidation via webhooks

When content changes in Sanity, you want to update the corresponding page immediately. Sanity can send a webhook to a custom API route that calls `revalidatePath` or `revalidateTag`.

Create an API route:

```javascript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

const secret = process.env.SANITY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get(SIGNATURE_HEADER_NAME);

  if (!secret || !isValidSignature(body, signature, secret)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const { slug } = body;
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  revalidatePath('/blog'); // revalidate blog index too

  return Response.json({ revalidated: true });
}
```

In Sanity, you configure a webhook to hit this endpoint whenever a post is created, updated, or deleted. You can also use `revalidateTag` if you tag your fetch calls.

If you're using Strapi, the webhook setup is similar—just point it to your Next.js route and validate the payload.

## Step 6: Implement preview mode

Preview mode lets editors see drafts before they're published. Next.js has built-in support for draft mode.

First, create an API route that enables draft mode and redirects to the preview page:

```javascript
// app/api/draft/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  draftMode().enable();
  redirect(`/blog/${slug}`);
}
```

Then, in your page component, check if draft mode is enabled and fetch draft content:

```javascript
import { draftMode } from "next/headers";

export default async function PostPage({ params }) {
  const { isEnabled } = draftMode();
  const post = await getPost(params.slug, isEnabled);

  // ...
}
```

And in `getPost`, you'd use `useCdn: false` when draft mode is enabled to get unpublished content.

## Step 7: Ensure TypeScript types match your schema

Without type safety, you risk runtime errors when the schema changes. Sanity provides a `sanity-codegen` tool to generate TypeScript types from your schema. Alternatively, you can define types manually.

For Payload, types are automatic because schemas are TypeScript. For Strapi and Contentful, you can use codegen or define interfaces manually.

```typescript
// types/post.ts
export interface Post {
  title: string;
  slug: { current: string };
  excerpt: string;
  body: any; // portable text
  publishedAt: string;
  coverImage?: { asset: { url: string } };
}
```

Then use this type in your `getPost` function.

## Step 8: Handle images and optimization

Sanity provides image URLs via the CDN. You can use `next/image` with these URLs for optimization. Sanity also has a `sanity-image` package or you can construct URLs with query parameters.

For example:

```javascript
import Image from "next/image";

function CoverImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={400}
      style={{ objectFit: "cover" }}
    />
  );
}
```

Use `next/image` for automatic resizing and lazy loading. This works well with Sanity's CDN.

## Common pitfalls to avoid

1. **Not setting `useCdn: false` in development** – You'll see stale content while editing.
2. **Forgetting to handle missing content** – A deleted post slug will cause runtime errors. Always check for null and display a 404.
3. **Ignoring webhook security** – Always validate the webhook signature to prevent malicious revalidation attacks.
4. **Not using tags for related content** – When a post changes, you often need to update the blog index and related posts. Tags make this easy.
5. **Overfetching data** – GROQ lets you select only the fields you need. Don't fetch the entire document if you only need title and excerpt.

## A real integration story: connecting a Next.js marketing site to Sanity

I recently built a marketing site with Next.js and Sanity. The content team needed to publish blog posts and landing pages without developer help. We set up a schema with a `page` type and a `post` type, both using portable text for body content.

The integration took about half a day. The key pieces were:

- Sanity Studio deployed as part of the Next.js app.
- `generateStaticParams` for all posts and pages.
- `revalidate: 60` as a fallback, plus on-demand revalidation via webhook.
- Preview mode so editors could see changes instantly.

The content team loved it. They could write posts, preview them, and publish—all without involving developers. The site remained fast because most pages were static and cached.

The lesson: invest time in setting up the webhook and preview mode early. It pays off in editor productivity and content freshness.

## Wrapping up

Integrating a headless CMS with Next.js is a multi-step process, but each step is well-defined. The key is to think through the content flow: how content is created, when it's fetched, how it's cached, and how it's updated.

If you follow the steps in this guide—schema setup, client config, server-side fetching, ISR, webhooks, preview, and type safety—you'll end up with a robust content pipeline that serves both developers and content editors.

And remember, the CMS you choose is just one piece of the puzzle. How you integrate it determines whether your site is fast, fresh, and maintainable. For more on choosing the right CMS, check out our [headless CMS comparison](/blog/best-headless-cms-for-nextjs-in-2026). For deeper dives into ISR, our [complete ISR guide](/blog/nextjs-isr-guide) has you covered.

Now go build something content-rich and lightning fast.

---

_Need help integrating a CMS with your Next.js project? Red Surge Technology builds seamless content pipelines that keep both developers and editors happy. [Get in touch](/contact) to discuss your needs._
