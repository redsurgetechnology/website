---
title: "Next.js CMS Visual Editor Comparison: Sanity vs Payload vs Strapi vs Contentful"
date: "2026-11-12T10:00:00.000Z"
excerpt: "Comparing visual editing in Sanity, Payload, Strapi, and Contentful for Next.js. We break down click-to-edit, live preview, pricing, and which one actually lets marketers build pages."
cover_image: "/images/blog/uploads/nextjs-cms-visual-editor-comparison.webp"
seo_title: "Next.js CMS Visual Editor Comparison: Sanity vs Payload vs Strapi vs Contentful"
seo_description: "Compare visual editing in Sanity, Payload, Strapi, and Contentful for Next.js. Covers click-to-edit, live preview, App Router integration, pricing, and a decision framework."
author_name: "Collin Stewart"
tags:
  - Next.js
  - CMS
  - Visual Editor
  - Headless CMS
  - Web Development
category: "Web Development"
reading_time: 15
featured: false
no_index: false
---

A visual editor changes who can use your CMS. Without one, every layout change is a developer ticket. With one, marketers compose pages from approved components, click into a headline to edit it, and see the result live. The difference between a CMS that has visual editing and one that doesn't is often the difference between a content team that's self-sufficient and one that's permanently blocked on engineering.

But "visual editor" means different things on different platforms. Sanity's Presentation tool is a click-to-edit overlay on your live Next.js site. Payload's visual editing is a growing ecosystem of plugins and a first-party product that's still maturing. Strapi's Live Preview is an in-context editing pane inside the admin. Contentful's visual editor is a page-builder SDK that embeds Studio inside your React app.

Those are four different architectures with four different tradeoffs. This post compares them head-to-head for Next.js teams. It covers what the visual editing experience actually feels like, how deep the App Router integration goes, what it costs, and which one fits which kind of team. If you want the broader CMS comparison, our [Next.js CMS visual editor guide](/blog/nextjs-cms-visual-editor) covers the full landscape. Our [CMS for Next.js comparison](/blog/cms-for-nextjs-comparison) covers the platforms beyond visual editing. This post is the four-way visual editor deep-dive.

## What “Visual Editor” Actually Means (And Why the Term Is Useless)

The term gets applied to everything from a preview iframe to a full drag-and-drop page builder. Before comparing platforms, it's worth separating the layers.

**Preview mode** is a rendered view of your page in a separate tab. Changes require a refresh. It's table stakes and doesn't count as visual editing.

**Live preview** updates the preview pane as the editor types. Better, but the editing UI is still separate from the preview.

**Click-to-edit** lets the editor click an element in the preview and jump to the corresponding field in the CMS. This is where visual editing starts to feel different from form-based editing.

**In-context editing** lets the editor edit directly in the preview, with the CMS UI overlaid. Drag-and-drop page building, inline text editing, and real-time component insertion happen in the same view.

The four platforms sit at different points on this spectrum. Sanity and Contentful reach in-context editing for page composition. Payload's first-party story is click-to-edit through a plugin ecosystem, with a separately marketed Visual Editor still listed as “Coming Soon” in a 2026 primary-source research document[reference:0]. Strapi's Live Preview is an in-context editing pane inside the admin, with the frontend rendered alongside the editor[reference:1].

## Sanity: The Click-to-Edit Standard

Sanity's visual editing is built around the **Presentation tool**, a Studio plugin that renders your Next.js frontend inside an iframe and overlays click-to-edit controls. Clicking a text element in the preview opens the corresponding field in the Studio. Changes reflect in real time as the editor types[reference:2].

### How the integration works

The Next.js App Router setup involves four pieces: a Sanity client configured for Content Source Map encoding, `defineLive` for real-time content fetching, Draft Mode routes to toggle between published and draft content, and the Presentation tool with document-to-URL mapping. The `<VisualEditing />` component powers the click-to-edit overlays[reference:3].

Sanity's docs are explicit that this is a first-class App Router integration. It requires Next.js 16.x with the App Router and `next-sanity` v13.1.5 or later[reference:4]. The `defineLive` function handles real-time content fetching, and Draft Mode is toggled through route handlers.

### What it feels like

Editors open the Presentation tool, see their site rendered in an iframe, and click directly on content to edit it. The Studio panel updates to show the corresponding field. For page-builder content, edits rebuild the affected route on the server, which can mean header, footer, navigation, and sibling sections re-render on a single edit[reference:5]. Sanity's docs acknowledge this and provide guidance on keeping Presentation fast on large pages.

### Pricing

Sanity's free tier is generous—three users, 10GB of assets, and 100K API calls per month. The Growth plan starts at $15 per seat per month[reference:6]. For a team of five editors, that's $75/month. The wall is team size, not usage, which is predictable.

### When to choose it

Sanity is the strongest visual editing option for Next.js teams that want click-to-edit on a live preview without building a page-builder SDK. It's the most mature implementation of the Presentation-tool pattern, and the App Router integration is documented and maintained. If your content team wants to see the page and edit in place, Sanity delivers that today.

## Payload: The TypeScript-Native Option With a Growing Visual Editor Ecosystem

Payload's first-party visual editing story is more nuanced than Sanity's. Payload has **Live Preview**, which renders your frontend alongside the admin panel and supports a `useLivePreview` hook for client-side React[reference:7]. For server-side Live Preview with the App Router, Payload recommends server-side setup rather than the client hook[reference:8].

The first-party **Visual Editor** is a separately marketed, enterprise-facing product that was still listed as “Coming Soon” in a late-2026 research document[reference:9]. That means Payload's click-to-edit visual authoring is not a shipped first-party feature as of this writing. The ecosystem has filled the gap with plugins.

### The plugin ecosystem

`payload-visual-editor` is a Payload 3.x plugin with a zero-dependency frontend SDK for React and Next.js. It lets editors edit fields and reorder blocks directly on the site in Live Preview, with edits landing in the regular Payload document form and reaching the page through the stock Live Preview pipeline[reference:10]. It supports per-entity block operations (add, duplicate, remove, move), locale switching, breakpoint preview, and field-level permission enforcement[reference:11].

Other plugins—`@focus-reactive/payload-plugin-visual-editing`, `payload-inplace`, and `payload-onpage`—offer variations on inline editing and click-to-edit. `payload-onpage` is explicit about its scope: on-page editing and draft previews for Payload CMS on Next.js App Router and TanStack Start, with click-to-edit text and sections and signed share links[reference:12].

### What it feels like

With the plugin installed, editors get an “Edit live” overlay on their site. Clicking a field opens the corresponding Payload field in the sidebar, and edits save through the normal Payload pipeline. It's click-to-edit, not full in-context page building. For teams that want to compose pages visually from blocks, Payload's first-party Visual Editor is the product to wait for.

### Pricing

Payload is open source (MIT) and self-hosted. Payload Cloud Standard starts at $35/month[reference:13]. There's no per-record pricing and no seat-based tax on the self-hosted edition. The cost is hosting plus the engineering time to run it.

### When to choose it

Payload is the right choice for TypeScript-first Next.js teams that want the CMS to live inside their app and are comfortable assembling their visual editing layer from plugins. If you need a shipped, first-party drag-and-drop visual editor today, Payload is not there yet. If you need click-to-edit with full control over the stack, the plugin ecosystem is strong.

## Strapi: Live Preview Inside the Admin

Strapi's visual editing is **Live Preview**, launched in May 2025 and updated through 2026. It renders your site alongside the Content Manager inside the Strapi admin. Editors edit on the left and see the site update on the right[reference:14].

### How the integration works

Live Preview is frontend-agnostic. Strapi's docs describe it as working with Next.js, Nuxt, Astro, SvelteKit, or any custom setup that consumes Strapi's Content API[reference:15]. The preview environment is yours to configure; Strapi doesn't impose a specific Next.js integration pattern.

The editing experience is in-context but not click-to-edit by default. The editor and preview are side-by-side, and saving updates the preview. Strapi's roadmap mentions field-level editing from the preview as a future direction, but the shipped feature is the side-by-side pane[reference:16].

For teams that want a page-builder-style visual editor, the community has built plugins. `@zachariaz/strapi-plugin-experience-builder` adds a Puck-based visual page editor to the Strapi admin, configured to point at a Next.js frontend URL[reference:17]. `@peppersquare/strapi-content-editor` offers real-time editing without modifying existing UI code, with an `?edit=true` URL parameter and a floating “Edit” button[reference:18].

### What it feels like

Live Preview feels like editing in one pane and watching the site in another. It's a genuine improvement over form-only editing, and the frontend-agnostic design means it works with whatever Next.js setup you already have. It's not click-to-edit, and it's not drag-and-drop page building. It's side-by-side preview with save-to-refresh.

### Pricing

Strapi is open source (MIT) and self-hosted for free. Strapi Cloud starts at $29/month, and the Growth plan is $15 per user per month for the Live Preview experience[reference:19][reference:20].

### When to choose it

Strapi is the right choice for teams that want self-hosting and full data ownership, and are satisfied with side-by-side preview rather than click-to-edit. If you're already on Strapi and your content team wants visual feedback, Live Preview delivers that. If you need a true visual page builder, you'll need a community plugin or a different platform.

## Contentful: The Page-Builder SDK

Contentful's visual editing is the most architecturally distinct of the four. Contentful Studio includes a visual page-builder, and the **Experiences SDK** (`@contentful/experiences-sdk-react`) lets developers embed that page-builder into any React or Next.js application[reference:21].

### How the integration works

The SDK handles two modes: delivery rendering, which fetches and renders experience entries from the Content Delivery API, and visual editing, which uses two-way `postMessage` communication with the Studio editor running in the browser[reference:22]. Studio always embeds the customer app in an iframe, and the SDK manages the postMessage contract between them[reference:23].

This is a page-builder integration, not a click-to-edit overlay on your existing pages. You adopt Contentful's component model and page structure, and Studio renders your app inside its editor. The SDK requires `'use client'` for visual editing components and has SSR guards[reference:24].

Contentful also offers Live Preview through its Content Preview API for teams that want in-context editing on existing pages rather than the full Studio page-builder. The setup is documented but, as of mid-2026, there was no official App Router SDK—teams wire it themselves[reference:25].

### What it feels like

With the Experiences SDK, editors work inside Contentful Studio and see the composed page rendered by your React app. They can drag components, edit fields, and see the result in the Studio canvas. It's the closest thing to a traditional page builder (think Webflow or Squarespace) among the four platforms.

### Pricing

Contentful's free tier is limited (5 users, 25K records). Paid plans start at $300/month for the Starter tier, and Team is $789/month[reference:26]. Enterprise pricing is custom. This is the most expensive option by a wide margin, and the price is justified by enterprise workflow, localization, and the page-builder SDK—not by visual editing alone.

### When to choose it

Contentful is the right choice for enterprise teams that want a proven page-builder experience and have the budget for it. The Experiences SDK is a real product with a documented architecture, not a plugin. If your organization already uses Contentful and needs visual page composition, the SDK is the path. If you're a startup or mid-market team, the pricing is usually the deciding factor.

## Head-to-Head Comparison

Here's how the four platforms compare on the dimensions that matter for visual editing.

| Dimension                       | Sanity                               | Payload                                       | Strapi                            | Contentful                           |
| ------------------------------- | ------------------------------------ | --------------------------------------------- | --------------------------------- | ------------------------------------ |
| **Visual editing type**         | Click-to-edit overlay (Presentation) | Live Preview + plugin click-to-edit           | Side-by-side Live Preview         | Studio page-builder SDK              |
| **First-party shipped?**        | Yes                                  | Live Preview yes; Visual Editor “Coming Soon” | Yes (Live Preview)                | Yes (Experiences SDK)                |
| **Next.js App Router**          | First-class (`next-sanity` v13+)     | Native (Payload 3 runs in Next.js)            | Frontend-agnostic                 | SDK with `'use client'` requirements |
| **Click-to-edit**               | Yes                                  | Via plugins                                   | No (side-by-side)                 | Yes (in Studio canvas)               |
| **Drag-and-drop page building** | No (composable blocks)               | No (blocks, not visual DnD)                   | Via community plugin              | Yes (Studio page-builder)            |
| **Pricing entry**               | $15/seat/mo                          | $35/mo (Cloud) or self-hosted                 | $29/mo (Cloud) or self-hosted     | $300/mo                              |
| **Self-hosting**                | Studio only                          | Yes                                           | Yes                               | No                                   |
| **Best for**                    | Content teams wanting click-to-edit  | TypeScript-first teams wanting control        | Self-hosted teams wanting preview | Enterprises wanting a page builder   |

The two rows that drive most decisions are **visual editing type** and **pricing**. Sanity is the only platform that ships click-to-edit as a first-class feature at mid-market pricing. Contentful is the only one with a true drag-and-drop page builder, and it's priced accordingly. Payload and Strapi are both strong platforms whose visual editing is either plugin-based or side-by-side rather than click-to-edit.

## Decision Framework

Here's how I'd choose based on what you actually need.

**Choose Sanity if:**

- Your content team wants click-to-edit on a live preview of their actual Next.js site.
- You want a first-class App Router integration with Draft Mode, `defineLive`, and `revalidateTag`.
- You want mid-market pricing ($15/seat/month) with a generous free tier.
- You're comfortable with GROQ or willing to learn it.

**Choose Payload if:**

- Your team is TypeScript-first and wants the CMS to live inside the Next.js app.
- You're willing to assemble visual editing from plugins today and wait for the first-party Visual Editor.
- You want full-stack control and self-hosting.
- You value type safety from schema to component over shipped visual editing.

**Choose Strapi if:**

- You need self-hosting and full data ownership.
- Side-by-side Live Preview is sufficient for your editors.
- You want a frontend-agnostic preview that works with any Next.js setup.
- You're open to community plugins for a more page-builder-like experience.

**Choose Contentful if:**

- You're an enterprise with the budget for a $300+/month platform.
- You want a true drag-and-drop page builder embedded in your React app.
- You need mature workflow, localization, and compliance features.
- The page-builder SDK is a core part of your content strategy, not a nice-to-have.

If you're a small to mid-market Next.js team and visual editing is a priority, **Sanity** is the default recommendation. It's the only platform in this comparison that ships click-to-edit as a first-party feature at a price most teams can justify. If you're TypeScript-first and patient, **Payload** is the strongest long-term bet. If you're enterprise and need a page builder, **Contentful** is the proven option. If you're self-hosting, **Strapi** is the pragmatic choice.

## A Real Story: The Page Builder That Nobody Used

A client I worked with chose Contentful specifically for its visual page builder. The marketing team had been asking for the ability to build landing pages without developer involvement, and the Experiences SDK seemed like the answer.

The implementation took longer than expected. The SDK required adopting Contentful's component model, and the team had to rebuild their existing page components to fit the Studio canvas. Six weeks in, the page builder worked—but the marketing team didn't use it. They found the Studio canvas constrained compared to their design tool, and they preferred sending Figma files to developers over building pages themselves.

The platform wasn't wrong. The page builder worked as advertised. The mismatch was between the feature and the team's actual workflow. They wanted visual preview, not visual composition. Sanity's Presentation tool—click-to-edit on the real site—would have fit their workflow better at a fraction of the cost.

The lesson: visual editing isn't one feature. Click-to-edit and drag-and-drop page building solve different problems. Pick the one that matches how your content team actually works, not the one with the longest feature list.

## Wrapping Up

Visual editing in Next.js CMS platforms is a spectrum, not a binary. Sanity ships click-to-edit on a live preview at mid-market pricing. Payload has Live Preview and a plugin ecosystem for click-to-edit, with a first-party Visual Editor still on the roadmap. Strapi offers side-by-side Live Preview inside the admin. Contentful offers a full page-builder SDK at enterprise pricing.

The right choice depends on what your content team actually needs. If they want to see the page and edit in place, Sanity is the strongest shipped option. If they want to build pages from scratch without developers, Contentful's page builder is the only one that delivers that today. If you're TypeScript-first and willing to wait, Payload is the most natural fit for a Next.js codebase.

For the broader CMS comparison, see our [CMS for Next.js comparison](/blog/cms-for-nextjs-comparison). For the full visual editor landscape including platforms beyond these four, see our [Next.js CMS visual editor guide](/blog/nextjs-cms-visual-editor). And for the integration details, our [Next.js CMS integration guide](/blog/nextjs-cms-integration-guide) covers schema setup, webhooks, and preview mode.

Now go ask your content team what “visual editing” actually means to them before you pick a platform.

---

_Need help choosing a CMS or implementing visual editing for your Next.js project? Red Surge Technology specializes in content architecture and Next.js development. [Get in touch](/contact) to discuss your project._
