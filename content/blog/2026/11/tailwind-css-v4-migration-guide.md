---
title: "Tailwind CSS v4: What Changed from v3 and How to Migrate"
date: "2026-11-25T10:00:00.000Z"
excerpt: "Tailwind v4 dropped the config file, moved to CSS-first theming, and rebuilt the engine in Rust. Here's every breaking change from v3, what the upgrade tool handles, and what you'll fix by hand."
cover_image: "/images/blog/uploads/tailwind-css-v4-migration-guide.webp"
seo_title: "Tailwind CSS v4: What Changed from v3 & Migration Guide (2026)"
seo_description: "Tailwind v4 vs v3 compared. Covers the CSS-first config, @theme directive, Vite plugin, renamed utilities, removed opacity classes, browser requirements, and migration steps."
author_name: "Collin Stewart"
tags:
  - Tailwind
  - CSS
  - Web Development
  - Migration
  - Frontend
category: "CSS"
reading_time: 14
featured: false
no_index: false
---

Tailwind CSS v4 isn't an incremental release. It's a rewrite of how the framework works — the configuration model changed, the build engine changed, the plugin architecture changed, and a handful of utility names changed with it.

That's why the upgrade is both easier and harder than v3 users expect. The official upgrade tool automates the vast majority of the mechanical work. What it can't automate is the handful of places where v4 makes a different default decision than v3 did, and those are the ones that produce the "why does this look wrong now?" bug reports.

This guide covers what actually changed between v3 and v4, what the upgrade tool handles for you, what you'll fix by hand, and how to migrate without a white-screen incident. If you're still deciding whether Tailwind is the right styling approach at all, our [CSS Modules vs Tailwind comparison](/blog/css-modules-vs-tailwind) covers that decision. If you're unclear on what Tailwind actually is as a category of tool, our [is Tailwind a build tool?](/blog/is-tailwind-css-a-build-tool) post clears that up.

## Quick answer: what changed in Tailwind v4?

| Area                                  | v3                                    | v4                                      |
| ------------------------------------- | ------------------------------------- | --------------------------------------- |
| **Configuration**                     | `tailwind.config.js`                  | CSS `@theme {}` directive               |
| **Import**                            | `@tailwind base/components/utilities` | `@import "tailwindcss"`                 |
| **Engine**                            | JavaScript (PostCSS)                  | Rust (Oxide)                            |
| **Build speed**                       | Baseline                              | Up to 10× faster                        |
| **Vite integration**                  | Via PostCSS                           | Dedicated `@tailwindcss/vite` plugin    |
| **PostCSS package**                   | `tailwindcss`                         | `@tailwindcss/postcss`                  |
| **CLI package**                       | `tailwindcss`                         | `@tailwindcss/cli`                      |
| **`postcss-import` / `autoprefixer`** | Required                              | Removed (handled automatically)         |
| **Arbitrary CSS variables**           | `bg-[--color]`                        | `bg-(--color)`                          |
| **Opacity utilities**                 | `bg-opacity-50`                       | `bg-black/50`                           |
| **Browser support**                   | Safari 15+, Chrome 88+                | Safari 16.4+, Chrome 111+, Firefox 128+ |
| **Container queries**                 | Plugin                                | Built in                                |
| **3D transforms**                     | Plugin                                | Built in                                |

The headline: **v4 is CSS-first.** No config file, no JavaScript plugin system for basic theming, no `content` array to maintain. You write CSS, and Tailwind reads it.

## Why the config file disappeared

In v3, `tailwind.config.js` was the source of truth. Colors, spacing scales, fonts, breakpoints, plugins — all defined in JavaScript. Tailwind read that file at build time and generated the utilities you referenced.

In v4, that configuration lives in CSS:

```css
/* v4 — app.css */
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.72 0.19 149);
  --color-surface: oklch(0.98 0 0);
  --font-display: "Satoshi", sans-serif;
  --spacing-gutter: 1.5rem;
  --breakpoint-3xl: 120rem;
}
```

Every `@theme` variable becomes a utility and a CSS custom property. `--color-brand` gives you `bg-brand`, `text-brand`, `border-brand`, and so on. `--font-display` gives you `font-display`. The theme is the CSS, and the CSS is the theme.

**Why this is better:** the theme variables are real CSS custom properties at runtime. You can read them in JavaScript, override them per-component, or change them with a media query — none of which worked cleanly with v3's config. It also means the theme can ship with your stylesheet instead of being compiled away.

**Why this trips people up:** if your v3 config had custom plugin logic, complex `safelist` arrays, or config that depended on `process.env`, there's no direct equivalent. You're either writing CSS or writing a proper v4 plugin.

The upgrade tool migrates most of a v3 config into `@theme` automatically. The rest you'll handle by hand.

## The build engine changed

v4 replaces the JavaScript-based PostCSS pipeline with **Oxide**, a Rust engine. The headline number is up to **10× faster full builds** and **5× faster incremental builds** in large projects.

The practical difference shows up in two places. First, dev server startup and rebuilds feel faster in a way you notice after a day. Second, incremental changes to a single file no longer re-trigger a full rebuild of the stylesheet.

That second point is the real win for large codebases. In v3, a change to one file could re-scan every content path. In v4, the engine tracks what changed.

## The plugin architecture changed

This is the section that breaks most real projects, so it's worth being specific.

**PostCSS users:** the PostCSS plugin moved out of `tailwindcss` and into `@tailwindcss/postcss`. The old setup doesn't work.

```javascript
// v3 — postcss.config.js
export default {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

```javascript
// v4 — postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

Note what's gone: `postcss-import` and `autoprefixer`. v4 handles both internally. Keeping them installed causes duplicated CSS output and longer builds — not an error, just wasted work.

**Vite users:** v4 ships a dedicated `@tailwindcss/vite` plugin that's meaningfully faster than the PostCSS route.

```javascript
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

**The critical mistake:** running both the Vite plugin and the PostCSS plugin. They disagree about which utilities to generate, and you get duplicated CSS plus longer builds. Pick one. If you're on Vite, use the Vite plugin. If you're on Next.js or a PostCSS-based setup, use `@tailwindcss/postcss`.

**CLI users:** the binary moved to `@tailwindcss/cli`.

```bash
# v3
npx tailwindcss -i input.css -o output.css

# v4
npx @tailwindcss/cli -i input.css -o output.css
```

## The renamed utilities (and why they bite)

v4 shifted the scale for shadows and border radii down by one step, and renamed a few utilities. The upgrade tool handles these automatically, but it's worth knowing the list because code you copy from a v3 tutorial won't work.

| v3                   | v4                     |
| -------------------- | ---------------------- |
| `shadow-sm`          | `shadow-xs`            |
| `shadow`             | `shadow-sm`            |
| `rounded-sm`         | `rounded-xs`           |
| `rounded`            | `rounded-sm`           |
| `outline-none`       | `outline-hidden`       |
| `ring` (3px default) | `ring` (1px default)   |
| `flex-shrink-*`      | `shrink-*`             |
| `flex-grow-*`        | `grow-*`               |
| `overflow-ellipsis`  | `text-ellipsis`        |
| `decoration-slice`   | `box-decoration-slice` |
| `decoration-clone`   | `box-decoration-clone` |

The `ring` change is the one that silently changes visuals. In v3, `ring` added a **3px** ring. In v4, `ring` adds a **1px** ring, and `ring-3` gives you the old behavior. If your focus styles look thinner after migration, that's why.

## The removed utilities

These are gone outright. The upgrade tool rewrites them, but if you have dynamic class construction or CSS-in-JS, you'll need to fix them manually.

**`bg-opacity-*`, `text-opacity-*`, `border-opacity-*`** — replaced by the slash syntax that already existed:

```html
<!-- v3 -->
<div class="bg-black bg-opacity-50">
  <!-- v4 -->
  <div class="bg-black/50"></div>
</div>
```

**`@tailwind` directives** — replaced by a single import:

```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 */
@import "tailwindcss";
```

**Arbitrary value syntax for CSS variables** — parentheses instead of brackets:

```html
<!-- v3 -->
<div class="bg-[--brand-color]">
  <!-- v4 -->
  <div class="bg-(--brand-color)"></div>
</div>
```

Brackets still work for arbitrary values that aren't CSS variables (`w-[337px]` is fine). The parens are specifically for variable references.

## The defaults that changed silently

These aren't listed as breaking changes in the changelog, but they change the output of existing class names.

**Border color defaults to `currentColor`.** In v3, `border` without a color used `gray-200`. In v4, it uses the element's text color. If you have bare `border` utilities without explicit colors, your borders will look darker than before. Fix by adding an explicit color, or by setting a base layer default:

```css
@layer base {
  *,
  ::after,
  ::before {
    border-color: var(--color-gray-200);
  }
}
```

**Gradient direction is left-to-right.** In v3, `bg-gradient-to-r` started from the right. In v4, the equivalent `bg-linear-to-r` runs left-to-right. If gradients look reversed after migration, this is why.

**Placeholder color changed.** v4 uses a different default opacity for placeholder text. If placeholders look lighter or darker, override with a base-layer style.

## What the upgrade tool actually does

Run this in a new branch:

```bash
npx @tailwindcss/upgrade
```

It requires **Node 20 or higher**. It will:

- Update dependencies to v4-compatible versions
- Migrate `tailwind.config.js` into `@theme` in your CSS
- Rewrite renamed utilities across your template files
- Replace `@tailwind` directives with `@import "tailwindcss"`
- Convert `bg-opacity-*` patterns to slash syntax
- Update the PostCSS config to use `@tailwindcss/postcss`
- Detect the framework and adjust the plugin setup

It won't:

- Handle configuration logic that depended on runtime values
- Rewrite dynamically constructed class names
- Fix custom plugins that used the v3 plugin API
- Adjust visual defaults like border color or ring width
- Catch every edge case in monorepos

## The migration checklist

Here's the sequence I use, which keeps the app running throughout.

**1. Branch and baseline.** Create a migration branch. Take screenshots of five or six representative pages before you start. You'll need them to compare after.

**2. Run the upgrade tool.** Commit the automated changes as a single commit so you can review them separately from your manual fixes.

**3. Fix the plugin setup.** Confirm you're using exactly one of the Vite plugin or the PostCSS plugin. Remove `postcss-import` and `autoprefixer` from your dependencies if nothing else needs them.

**4. Check the browser requirement.** v4 targets **Safari 16.4+, Chrome 111+, Firefox 128+**. If your analytics show meaningful traffic from older browsers, stay on v3.4 until that changes. This is a hard requirement, not a soft recommendation — v4 depends on `@property` and `color-mix()`.

**5. Search for removed utilities.** Grep for `bg-opacity-`, `text-opacity-`, `flex-shrink`, `overflow-ellipsis`, and `@tailwind`. The tool handles most, but dynamic strings won't be caught.

**6. Fix border colors.** Add the base-layer default if you relied on v3's gray-200 border.

**7. Check ring widths.** Anywhere you used `ring` for focus styles, decide whether you want the new 1px default or `ring-3`.

**8. Compare screenshots.** Go through your baseline pages and look for visual diffs. Borders, gradients, shadows, and focus rings are the four usual suspects.

**9. Migrate custom plugins last.** Custom v3 plugins using `addUtilities`, `addComponents`, or `addVariant` need rewriting against the v4 plugin API. Keep them out of the initial migration commit.

## A real story: the migration that looked fine until QA

A team I worked with migrated a marketing site plus a dashboard to v4 over a Friday. The upgrade tool handled everything mechanical, the dev server started, the pages rendered, and they shipped it.

Monday morning, QA filed three bugs.

The dashboard's focus rings were invisible. They had been `ring-2 ring-blue-500`, which still works in v4 — but the components using bare `ring` had shrunk from 3px to 1px, and on the dark surface it disappeared. The fix was changing those to `ring-2` and adding a contrasting offset.

Every card border was darker than designed. The design used bare `border` with the v3 gray-200 default. v4 made them `currentColor`, which on a dark-theme card meant near-black borders. The fix was one base-layer rule setting `border-color` to the design's neutral.

The hero gradient ran the wrong direction. It had been `bg-gradient-to-r`, the tool rewrote it to `bg-linear-to-r`, and the direction flipped because v4 fixed the left-to-right semantics. The fix was changing the direction token, not disabling the migration.

None of these were the upgrade tool's fault. All three were places where v4's defaults differ from v3's, and the tool can't know which default your design intended. The lesson: the mechanical migration is the easy part. The visual regression pass is where the actual work lives.

## Should you migrate now?

**Migrate if:** you're on a modern browser support baseline, you use Vite or Next.js, and you want the build speed and the CSS-first theming.

**Wait if:** you need to support Safari below 16.4 or Chrome below 111, you depend on custom v3 plugins that you haven't budgeted time to rewrite, or you're mid-sprint on a release.

**Don't migrate just for the version number.** v3.4 is maintained and will keep working. The reasons to move are the build speed, the CSS-first config, and the new built-in features (container queries, 3D transforms, `@starting-style` support) — not the version itself.

## What v4 unlocks that v3 couldn't do

Three features are worth knowing about because they change what you can build without a plugin.

**Container queries are built in.** You can style based on the parent container's width instead of the viewport:

```html
<div class="@container">
  <div class="@md:flex @lg:grid-cols-3">
    <!-- responds to the container, not the viewport -->
  </div>
</div>
```

**3D transforms are built in.** `rotate-x-*`, `rotate-y-*`, `translate-z-*`, and `perspective-*` no longer require a plugin.

**`@starting-style` is supported.** You can write enter animations without JavaScript:

```css
.toast {
  opacity: 1;
  transition: opacity 200ms;

  @starting-style {
    opacity: 0;
  }
}
```

If you're building component libraries, these three reduce your dependency count meaningfully. If you've been following our [Astro + Tailwind performance guide](/blog/astro-tailwind-performance-guide), the container query support in particular changes how you structure responsive components.

## Wrapping up

Tailwind v4 is a rewrite, not a reskin. The config file is gone, the engine is Rust, the plugin packages moved, and a set of utilities got renamed. The upgrade tool handles most of the mechanical work, but the visual defaults — border color, ring width, gradient direction — are where migrations actually get interesting.

Run the tool, fix the plugin setup, check your browser baseline, then spend real time on the screenshot comparison. That last step is the one that catches the bugs QA will otherwise find on Monday.

For the broader styling decision, see our [CSS Modules vs Tailwind comparison](/blog/css-modules-vs-tailwind). For what Tailwind actually is as a category of tool, see [is Tailwind a build tool?](/blog/is-tailwind-css-a-build-tool). And if you're running Tailwind inside Astro, our [Astro + Tailwind performance guide](/blog/astro-tailwind-performance-guide) covers the framework-specific setup.

## Frequently asked questions

### What's the biggest change in Tailwind CSS v4?

The configuration model. v4 removes `tailwind.config.js` and replaces it with CSS-first theming using the `@theme` directive. Colors, fonts, spacing, and breakpoints are now CSS custom properties defined in your stylesheet, which become utilities automatically.

### Is Tailwind v4 a breaking change?

Yes. The upgrade guide lists a comprehensive set of breaking changes: removed `@tailwind` directives, renamed utilities (`shadow-sm` → `shadow-xs`, `rounded-sm` → `rounded-xs`), removed opacity utilities (`bg-opacity-*` → `bg-black/50`), a new arbitrary value syntax for CSS variables, and a raised browser baseline. The official upgrade tool automates most of them.

### How long does the Tailwind v4 migration take?

For a typical project, the mechanical migration takes an afternoon with the upgrade tool. The visual regression pass — comparing screenshots and fixing border colors, ring widths, and gradient directions — takes another day or two depending on how many pages you have. Custom plugins add more time.

### Do I need `tailwind.config.js` in v4?

No. v4 uses CSS-first configuration via the `@theme` directive. You can still use a JavaScript config with the `@config` directive for backwards compatibility, but the recommended path is to migrate theme values into `@theme` in your CSS.

### Why does `ring` look thinner in v4?

Because it is. In v3, the `ring` utility added a 3px ring by default. In v4, `ring` adds a 1px ring, and `ring-3` gives you the old behavior. If your focus styles look thinner after migrating, this is the reason.

### Why did my border colors change in v4?

v4 changed the default border color from `gray-200` to `currentColor`. If you used bare `border` utilities without an explicit color, your borders now inherit the text color. Add explicit border colors or set a base-layer default with `border-color: var(--color-gray-200)`.

### Can I use Tailwind v4 with Next.js?

Yes. Next.js supports v4 through `@tailwindcss/postcss`. Add it to your `postcss.config.mjs` and remove `tailwindcss`, `postcss-import`, and `autoprefixer` from the plugins array. For Vite-based setups, use the dedicated `@tailwindcss/vite` plugin instead — but never both at once.

### What browsers does Tailwind v4 support?

Safari 16.4+, Chrome 111+, and Firefox 128+. v4 depends on modern CSS features like `@property` and `color-mix()`, so it won't work in older browsers. If you need to support older Safari or Chrome versions, stay on v3.4 until your requirements change.

### Does the upgrade tool handle everything?

It handles the mechanical changes: dependency updates, config migration to `@theme`, renamed utilities, directive replacement, and PostCSS config updates. It does not handle runtime-dependent config logic, dynamically constructed class names, custom plugins using the v3 API, or visual default changes like border color and ring width. Budget time for the manual pass.

---

_Migrating a large codebase to Tailwind v4 and want a second pair of eyes on the visual regression pass, or stuck on custom plugin rewrites? Red Surge Technology builds and modernizes frontend systems. [Get in touch](/contact) to discuss your migration._
