---
title: "Why You Still See -moz- and -webkit- in 2026 (And When to Remove Them)"
date: "2026-10-21T10:00:00.000Z"
excerpt: "Vendor prefixes should be dead by now. Yet they're still in your CSS, your dependencies, and even your AI autocomplete. Here's what's actually still needed in 2026—and what's just dead weight."
cover_image: "/images/blog/uploads/why-vendor-prefixes-still-exist-2026.webp"
seo_title: "Why You Still See -moz- and -webkit- in 2026 (And When to Remove Them)"
seo_description: "A 2026 guide to CSS vendor prefixes. Learn why -moz- is mostly dead, why -webkit- still matters for Safari, and how to audit and remove the prefixes you no longer need."
author_name: "Collin Stewart"
tags:
  - CSS
  - Vendor Prefixes
  - Web Development
  - Performance
  - Frontend
category: "CSS"
reading_time: 12
featured: false
no_index: false
---

You open a stylesheet you inherited from a previous developer. Somewhere around line 400, you find this:

```css
.box {
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
}
```

It's 2026. `border-radius` has been unprefixed in every browser since 2011. Yet here it is, like a fossil from a geological era when Firefox and Chrome needed separate instructions to round a corner.

The temptation is to delete every prefixed line on sight. That's mostly the right instinct—but not entirely. Some prefixes are genuinely dead. Others are still load-bearing, and removing them will break Safari for real users. The trick is knowing which is which, and that answer has changed dramatically over the past few years.

This guide is about the prefixes you're actually seeing in 2026: why they're there, which ones still matter, and how to clean up the dead ones without breaking the live ones. If you want the foundational explanation of what vendor prefixes are and how they work, our [CSS vendor prefixes guide](/blog/2025/july/css-vendor-prefixes-guide) covers the basics. This post is the 2026 reality check.

## What Vendor Prefixes Were For (The Short Version)

In the early 2010s, browsers shipped experimental CSS features under vendor-specific prefixes. `-webkit-` for Safari and Chrome, `-moz-` for Firefox, `-ms-` for Internet Explorer, `-o-` for Opera. The idea was that developers could try unstable features before they were standardized, and the prefix signaled "this might change."

Developers used them on production sites anyway. That was the beginning of the problem. Once a property shipped behind a prefix, it stayed in codebases long after the unprefixed version became standard. Nobody wanted to risk removing it. So the prefixes accumulated.

Around 2016, browsers stopped using prefixes for new CSS properties. Since then, they've been slowly removing prefix requirements for old ones. The process has been gradual, property by property, and it's still not finished. That's why you still see prefixes in 2026.

## The Browser Landscape Has Changed Everything

The reason prefixes are mostly dead is not that browsers suddenly agreed on everything. It's that the browser market consolidated.

As of early 2026, Chrome holds roughly 69% of global traffic. Add Edge, Samsung Internet, and Opera—all Chromium-based—and you're near 78%. Safari sits around 16%. Firefox is down to about 2.3%. The diversity of rendering engines that made prefixes necessary in the first place has largely disappeared.

That matters for each prefix family:

- **`-o-` is dead.** Opera switched to Blink in 2013. The Presto engine is gone. Nothing needs `-o-` anymore.
- **`-ms-` is dead.** Internet Explorer was retired in 2022. Edge is Chromium-based now. `-ms-` prefixes serve no one.
- **`-moz-` is barely relevant.** Firefox has dropped prefix requirements for almost everything. At 2.3% market share, even the remaining exceptions are marginal.
- **`-webkit-` is the only one that still matters**—and really, that means Safari.

This is the single most useful fact for cleanup: if a prefix isn't `-webkit-`, it's probably safe to remove. But "probably" isn't "always." There are exceptions, and one of them is still `-moz-`.

## Why -moz- Is Basically Dead (With One Exception)

For most properties, `-moz-` is long gone. Firefox supports unprefixed `border-radius`, `box-shadow`, `transition`, `transform`, `flexbox`, and nearly everything else that used to require it.

There's one well-known exception: `tab-size` still needs a `-moz-` prefix in Firefox. That's about it for mainstream CSS. If you're auditing a codebase and you see `-moz-` on anything other than `tab-size`, it's almost certainly dead code.

The `-moz-` prefixes you're most likely to encounter are:

- `-moz-border-radius` (dead since 2011)
- `-moz-box-shadow` (dead since 2011)
- `-moz-transition` (dead since 2013)
- `-moz-transform` (dead since 2014)
- `-moz-appearance` (mostly dead, but some resets still include it harmlessly)

The `-moz-appearance` case is interesting. Some CSS resets and normalize files still include it alongside `-webkit-appearance` and `appearance`. It does nothing in modern Firefox, but it's harmless. Removing it won't break anything, but it also won't fix anything. It's cosmetic cleanup, not a bug fix.

## Why -webkit- Is Still Everywhere

`-webkit-` is the prefix that refuses to die, for one simple reason: Safari still uses it. And Safari is the browser on every iPhone and iPad, which means you can't ignore it.

There are two categories of `-webkit-` prefixes in 2026.

### Transitional prefixes: standard exists, Safari hasn't dropped it yet

These properties have an unprefixed standard version, but Safari still requires the prefix for older versions or for full support. Examples include:

- `appearance` (Safari still wants `-webkit-appearance` in many cases)
- `backdrop-filter` (unprefixed since Safari 18, but older versions need the prefix)
- `user-select` (unprefixing is part of Interop 2026, but not finished everywhere)
- `box-decoration-break` (still needs `-webkit-` in Safari)

These are the prefixes that Autoprefixer will add for you if your browserslist includes Safari versions that need them. They're not permanent, but they're not removable yet either.

### Forever prefixes: no standard equivalent exists

Some `-webkit-` properties aren't transitional. They're the only version that exists, and there's no standardized replacement on the horizon. These include:

- `-webkit-text-stroke` and `-webkit-text-fill-color` for text outlines and fills
- `-webkit-line-clamp` for multi-line truncation (though a standardized `line-clamp` is coming)
- `-webkit-tap-highlight-color` for controlling the tap flash on iOS
- `-webkit-box-reflect` for reflection effects
- `::-webkit-scrollbar` and related pseudo-elements for scrollbar styling

These aren't going anywhere. If you remove them, you lose the feature. The only question is whether you need the feature at all.

There's also the `stretch` keyword for `width` and `height`. Firefox used to require `-moz-available`, but it now supports `-webkit-fill-available` for compatibility. The standardized `stretch` keyword is supported in Chrome and Safari, but older browsers still need the prefixed fallback. This is a case where `-webkit-fill-available` is doing real work even in Firefox.

## The Real Reason Prefixes Are Still in Your Codebase

If prefixes are mostly dead, why do they keep showing up? There are four reasons, and only one of them is "legacy code."

**1. Legacy codebases.** The obvious one. Old CSS files written between 2010 and 2016 are full of prefixes that were necessary then and are dead now. Nobody removed them because nobody wanted to risk it.

**2. Outdated build configurations.** Autoprefixer is only as good as its browserslist config. If your `browserslist` still targets IE11 or "last 5 versions" from 2015, Autoprefixer will keep adding prefixes you don't need. The tool is doing its job; the configuration is telling it to do the wrong job.

**3. CSS-in-JS libraries with built-in prefixers.** Stylis, the CSS-in-JS preprocessor used by styled-components and Emotion, adds vendor prefixes by default. Unless you explicitly disable it, it will prefix properties that don't need prefixing. Some libraries let you pass `prefixer: false` to turn it off.

**4. AI autocomplete.** This one is new and genuinely frustrating. Copilot and similar tools are trained on the entire history of the web, including years of CSS written before Autoprefixer was standard. When you type `border-radius`, the model has seen thousands of examples where `-webkit-border-radius` and `-moz-border-radius` came first. It suggests them. A developer who doesn't know the history accepts the completion, commits it, and the dead code is back—not from 2012 habits, but from a model that has no sense of what year it is.

The CSS Selection 2026 report found that the median website still ships 140 vendor-prefixed properties. And `-ms-input-placeholder`—an IE-only prefix for a browser that's been dead since 2022—still shows up on 44% of sites. That's not a compatibility requirement. That's accumulated cruft.

## How to Audit Your Prefixes

Before you delete anything, figure out what you're actually shipping and what your targets actually need.

**Step 1: Check your browserslist.** This is the configuration that drives Autoprefixer. If it includes browsers you don't support, you're generating prefixes for no one.

```json
{
  "browserslist": ["last 2 versions", "> 1%", "not dead"]
}
```

Avoid `last 5 versions` unless you genuinely support browsers that old. Avoid targeting IE11 unless you have a contract that requires it. The narrower your targets, the fewer prefixes you'll generate.

**Step 2: Run Autoprefixer and see what it adds.** Write unprefixed CSS, let Autoprefixer handle the rest, and inspect the output. If Autoprefixer isn't adding a prefix, you probably don't need it.

```css
/* Write this */
.box {
  appearance: none;
  backdrop-filter: blur(10px);
  user-select: none;
}

/* Autoprefixer outputs this for a modern browserslist */
.box {
  -webkit-appearance: none;
  appearance: none;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  -webkit-user-select: none;
  user-select: none;
}
```

Notice what's missing: no `-moz-`, no `-ms-`, no `-o-`. That's the correct output for a 2026 browserslist.

**Step 3: Check caniuse for anything questionable.** If you're unsure whether a prefix is still needed, check caniuse.com or MDN's browser compatibility tables. The data is updated regularly, and it's the authoritative source for "does Safari still need this?"

**Step 4: Use a linter.** Stylelint has rules for detecting unnecessary vendor prefixes. `stylelint-no-unsupported-browser-features` and `stylelint-use-logical` can catch prefixes you don't need based on your browserslist.

## What to Remove vs What to Keep

Here's a practical reference for common properties.

| Property                    | Prefix status in 2026            | Action                                     |
| --------------------------- | -------------------------------- | ------------------------------------------ |
| `border-radius`             | Unprefixed since 2011            | Remove `-webkit-`, `-moz-`                 |
| `box-shadow`                | Unprefixed since 2011            | Remove all prefixes                        |
| `transition`                | Unprefixed since 2013            | Remove all prefixes                        |
| `transform`                 | Unprefixed since 2014            | Remove all prefixes                        |
| `flexbox` (`display: flex`) | Unprefixed since 2015            | Remove `-webkit-`, `-moz-`, `-ms-`         |
| `appearance`                | Safari may still need `-webkit-` | Keep `-webkit-`, remove `-moz-`            |
| `backdrop-filter`           | Safari <18 needs `-webkit-`      | Keep `-webkit-` for older Safari           |
| `user-select`               | Unprefixing in progress          | Keep `-webkit-` if supporting older Safari |
| `box-decoration-break`      | Safari needs `-webkit-`          | Keep `-webkit-`                            |
| `tab-size`                  | Firefox needs `-moz-`            | Keep `-moz-`                               |
| `-webkit-text-stroke`       | No standard equivalent           | Keep (it's the only version)               |
| `-webkit-line-clamp`        | No standard equivalent yet       | Keep                                       |
| `::-webkit-scrollbar`       | No standard equivalent           | Keep if you style scrollbars               |
| `-ms-input-placeholder`     | IE-only, browser dead            | Remove                                     |

The pattern is clear: remove `-moz-`, `-ms-`, and `-o-` almost everywhere. Keep `-webkit-` where Safari still needs it, and keep the `-webkit-`-only properties that have no standard equivalent.

## A Real Story: Cleaning Up a 12,000-Line Stylesheet

A few months ago, I audited a marketing site with a 12,000-line CSS file that had been growing since 2014. The file had 1,400 vendor-prefixed declarations. Every flex container had the full five-line stack:

```css
display: -webkit-box;
display: -webkit-flex;
display: -moz-box;
display: -ms-flexbox;
display: flex;
```

Four of those five lines had done nothing for a decade. The file also had `-ms-input-placeholder`, `-o-transition`, and `-moz-border-radius` scattered throughout.

We didn't delete anything blindly. We configured a modern browserslist (`last 2 versions`, `> 0.5%`, `not dead`), ran Autoprefixer, and diffed the output against the existing CSS. Anything Autoprefixer didn't regenerate was a candidate for removal. We also manually checked the handful of properties where Safari still needs `-webkit-`.

The cleanup removed about 900 declarations—roughly 18 KB of CSS before gzip. That's not a massive performance win on its own, but it made the stylesheet dramatically easier to read and maintain. The next developer who opens that file won't have to wonder which prefixes are real.

The lesson: prefixes are a maintenance cost even when they're not a performance cost. Removing dead ones makes the codebase easier to reason about.

## Common Mistakes to Avoid

**Removing `-webkit-` prefixes that Safari still needs.** This is the most common cleanup mistake. `backdrop-filter`, `appearance`, `user-select`, and `box-decoration-break` all still need `-webkit-` for some Safari versions. Check caniuse before deleting.

**Manually adding prefixes alongside Autoprefixer.** If you write `-webkit-flex` by hand and also run Autoprefixer, the tool may skip the declaration entirely because it detects an existing prefix. Write unprefixed CSS and let the build tool handle it.

**Targeting browsers you don't support.** A browserslist that includes IE11 or "last 10 versions" will generate prefixes you'll never use. Narrow your targets to what you actually support.

**Assuming all `-webkit-` is dead.** It's not. Safari is still 16% of global traffic and 100% of iOS. `-webkit-` prefixes are load-bearing for a large chunk of users.

**Forgetting about CSS-in-JS prefixers.** If you use styled-components or Emotion, Stylis is adding prefixes by default. Disable it if you're also running Autoprefixer, or you'll get duplicate prefixes.

If you've been working with utility-first CSS, the same principles apply. Our [CSS Modules vs Tailwind](/blog/css-modules-vs-tailwind) guide covers how different styling approaches handle prefixing, and our [Astro and Tailwind performance guide](/blog/astro-tailwind-performance-guide) shows how build-time tools can eliminate unnecessary CSS before it ships.

## Wrapping Up

Vendor prefixes are a relic of a more fragmented browser landscape. In 2026, `-moz-`, `-ms-`, and `-o-` are almost entirely dead. `-webkit-` is the only one that still matters, and really, that means Safari.

The cleanup strategy is straightforward: configure a modern browserslist, let Autoprefixer add what's actually needed, and remove the prefixes it doesn't regenerate. Keep the `-webkit-`-only properties that have no standard equivalent. Check caniuse for anything you're unsure about.

For the foundational explanation of how vendor prefixes work, see our [CSS vendor prefixes guide](/blog/2025/july/css-vendor-prefixes-guide). For broader CSS architecture decisions, our [CSS Modules vs Tailwind](/blog/css-modules-vs-tailwind) comparison and our [Astro and Tailwind performance guide](/blog/astro-tailwind-performance-guide) cover how modern build pipelines handle the prefix problem automatically.

Now go delete some `-moz-border-radius`.

---

_Need help cleaning up a legacy CSS codebase or modernizing your build pipeline? Red Surge Technology specializes in frontend performance and maintainability. [Get in touch](/contact) to discuss your project._
