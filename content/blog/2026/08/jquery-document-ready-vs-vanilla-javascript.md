---
title: "jQuery Document Ready vs Vanilla JavaScript: Which One Should You Use in 2026?"
date: "2026-08-21T10:00:00.000Z"
excerpt: "jQuery's $(document).ready() was the gold standard for years. Now vanilla JavaScript offers DOMContentLoaded, defer, and ES modules. Here's a side-by-side comparison to help you decide."
cover_image: "/images/blog/uploads/jquery-document-ready-vs-vanilla-javascript.webp"
seo_title: "jQuery Document Ready vs Vanilla JavaScript: DOMContentLoaded Compared"
seo_description: "Compare jQuery's $(document).ready() with vanilla JavaScript DOMContentLoaded, defer, and readyState. Learn when each approach makes sense and how to modernize legacy code."
author_name: "Collin Stewart"
tags:
  - jQuery
  - JavaScript
  - DOM
  - Web Development
  - Legacy Code
category: "JavaScript"
reading_time: 10
featured: false
no_index: false
---

For over a decade, `$(document).ready()` was the first line of nearly every jQuery script. It was a security blanket—a promise that the DOM was ready, cross-browser compatible, and forgiving of messy markup. Back then, vanilla JavaScript didn't offer a simple equivalent. You either used jQuery or you wrote your own hacky `window.onload` workaround that fired too late.

The web has changed. Modern browsers give you `DOMContentLoaded`, the `defer` attribute, and native ES modules. You can achieve the same result with zero dependencies and often less code. But the muscle memory of `$(document).ready()` runs deep, and legacy projects still depend on it.

This post is a side-by-side look at both approaches. If you're maintaining a jQuery codebase and wondering whether to modernize, or if you're starting a new project and want to avoid unnecessary dependencies, here's what you need to know.

## What jQuery's ready actually did

Before we compare, let's pin down what `$(document).ready()` actually does under the hood. In jQuery, you pass a callback function, and jQuery runs it as soon as the browser has finished parsing the HTML and building the DOM tree. It doesn't wait for images, stylesheets, or iframes—just the document structure.

```javascript
$(document).ready(function () {
  // DOM is ready to manipulate
  $("#header").text("Hello world");
});
```

It also works in a shorthand form:

```javascript
$(function () {
  // Same thing
});
```

If you've ever read a jQuery tutorial, you've seen this pattern. It was everywhere. The reason it was so popular was simple: without jQuery, detecting the DOM ready moment in old browsers was painful. Different browsers had different events (`DOMContentLoaded` wasn't universally supported until IE9), and jQuery smoothed over those differences.

If you want a deeper walkthrough of jQuery's approach, our [jQuery document ready beginner's guide](/blog/jquery-document-ready-complete-beginners-guide) covers the history and the variations.

## The vanilla equivalent: DOMContentLoaded

Modern vanilla JavaScript has a direct replacement for `$(document).ready()`: the `DOMContentLoaded` event.

```javascript
document.addEventListener("DOMContentLoaded", function () {
  // DOM is ready to manipulate
  document.querySelector("#header").textContent = "Hello world";
});
```

This fires at the same moment—when the HTML is parsed and the DOM is built. It works in every browser released in the last decade, including IE9 and above. That's as far back as most developers need to care about.

The syntax is slightly more verbose than jQuery's shorthand, but there's no dependency. No 30 KB library to download. No extra HTTP request. No version conflicts. Just native browser APIs.

If you need a full guide on using `DOMContentLoaded` and the related `defer` and `readyState` patterns, our [JavaScript document ready](/blog/javascript-document-ready) post has you covered with practical examples.

## A quick side-by-side comparison

Let's lay out the two approaches next to each other.

**jQuery:**

```javascript
$(document).ready(function () {
  $(".button").on("click", handleClick);
});
```

**Vanilla:**

```javascript
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".button").forEach(function (btn) {
    btn.addEventListener("click", handleClick);
  });
});
```

Both do the same thing: wait for the DOM, then attach a click handler to every element with the class `button`. The vanilla version is a bit longer, but it eliminates the entire jQuery dependency.

Here's the thing, though. In modern projects, you often don't need either version. If you place your `<script>` tag at the end of `<body>`, or use the `defer` attribute in the `<head>`, the DOM is already ready by the time your code runs. No event listener required.

```html
<!-- Option 1: script at end of body -->
<body>
  <button class="button">Click me</button>
  <script src="app.js"></script>
</body>

<!-- Option 2: defer in head -->
<head>
  <script src="app.js" defer></script>
</head>
```

With either approach, the script executes after the DOM is parsed, so you can query elements directly at the top level without wrapping everything in a ready callback.

## Where jQuery still makes sense

Let's be honest: jQuery isn't dead. Millions of websites still use it, and some situations genuinely warrant it.

**Legacy codebases.** If you're maintaining a project built on jQuery, ripping out `$(document).ready()` everywhere is a risky, low-reward change. The jQuery version works. It'll keep working. Unless you're already modernizing the whole codebase, leave it alone.

**jQuery plugins.** If your project depends on jQuery plugins (carousels, date pickers, modal libraries), those plugins often expect jQuery to be loaded and the DOM to be ready. Mixing vanilla and jQuery can cause timing issues, so keeping jQuery for consistency makes sense.

**Team familiarity.** If everyone on your team knows jQuery and nobody wants to learn modern JavaScript patterns, forcing vanilla `DOMContentLoaded` may slow things down. That said, if you're building something new, it's worth investing in vanilla skills—jQuery's relevance will only continue to fade.

## Where vanilla JavaScript clearly wins

**Performance.** jQuery adds about 30 KB (minified and gzipped) to your page. For a single DOM ready call, that's a hefty tax. Vanilla `DOMContentLoaded` adds nothing. On mobile connections, that extra weight matters. If you care about [page speed and performance](/blog/improve-website-page-speed-seo-nj), dropping jQuery is a quick win.

**Modern frameworks.** React, Vue, and Svelte don't use jQuery's DOM ready pattern at all. Component lifecycle methods handle the DOM readiness for you. If you're building with a modern framework, `$(document).ready()` isn't just unnecessary—it doesn't fit the mental model.

**Native features.** The `defer` attribute, ES modules, and `document.readyState` give you more control than jQuery ever did. You can choose exactly when your code runs relative to the DOM, stylesheets, and images.

**No dependency.** Every dependency is a security and maintenance burden. jQuery is stable now, but it's no longer actively updated with new features. Vanilla JavaScript is maintained by the browser vendors themselves and never needs a version bump.

If you've been reducing your JavaScript bundle size, as we discuss in our [React bundle size guide](/blog/reduce-javascript-bundle-size-react), eliminating jQuery is one of the highest-impact changes you can make.

## A story about modernizing a legacy widget

A couple of years ago, I inherited a marketing site that used jQuery heavily. Every page included three jQuery plugins and a custom `$(document).ready()` block that initialized sliders, tooltips, and form validation. The site worked, but page load was sluggish, and the jQuery dependency was eating into the performance budget.

I didn't rip everything out at once. Instead, I tackled the `$(document).ready()` blocks first. For each one, I asked: "Is this code doing something that can be done with native `DOMContentLoaded` or `defer`?" About half the time, the answer was yes. Those blocks became vanilla, and I removed the jQuery import from those pages.

The sliders and tooltips were harder—they depended on jQuery plugins. I left those alone initially. Over time, I replaced the plugins with lightweight vanilla alternatives (or built custom versions), and eventually dropped jQuery entirely.

The page load time improved by about 40%. The JavaScript bundle shrank dramatically. The maintenance burden disappeared because there were no more version updates or security patches to worry about.

The lesson: you don't have to do a big bang migration. Start with the ready blocks, move to vanilla `DOMContentLoaded`, and chip away at the rest.

## `document.readyState`: the underrated alternative

jQuery's ready function handles one edge case beautifully: what if the DOM is already ready by the time your script runs? jQuery checks and calls your callback immediately. Vanilla JavaScript can do the same thing with `document.readyState`.

```javascript
function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

onReady(function () {
  // DOM is ready
});
```

This pattern is exactly what jQuery does under the hood. `document.readyState` tells you whether the document is still loading, already interactive, or complete. If it's not loading, you can run your code immediately. This is useful for third-party scripts, dynamically injected scripts, or modules that might load after the page has already rendered.

## The "which should I use" answer

If you're starting a new project and don't need jQuery for anything else, use vanilla JavaScript. Use the `defer` attribute or `DOMContentLoaded`, depending on where your script lives. You'll get better performance, no dependency, and a more modern codebase.

If you're maintaining a legacy jQuery project and it's working fine, don't rush to replace every `$(document).ready()`. Instead, modernize incrementally. When you touch a page or component, convert the ready block to vanilla. Over time, the jQuery usage will shrink until you can drop it entirely.

If you're actively building with jQuery plugins that don't have vanilla equivalents, accept that jQuery is part of your stack for now. Use `$(document).ready()` where it's already in place, and focus your modernization energy elsewhere.

## Wrapping up

The `$(document).ready()` versus `DOMContentLoaded` debate isn't really about which one is "correct." jQuery's ready function was the right tool for its era, and vanilla JavaScript has caught up. Today, the choice is about dependencies, performance, and the trajectory of your codebase.

Vanilla JavaScript gives you the same capability with less overhead. The patterns—`DOMContentLoaded`, `defer`, `document.readyState`—are easy to learn and widely supported. If you're moving away from jQuery, this is one of the easiest places to start.

If you want the full vanilla tutorial, check out our [JavaScript document ready guide](/blog/javascript-document-ready). And if you're still working with jQuery, the [beginner's guide to jQuery document ready](/blog/jquery-document-ready-complete-beginners-guide) will help you understand the legacy patterns you're maintaining.

The web has moved on. Your DOM ready code should too—eventually.

---

_Modernizing a legacy jQuery codebase or starting fresh with vanilla JavaScript? Red Surge Technology helps teams reduce dependencies and build faster, maintainable frontends. [Get in touch](/contact) to discuss your project._
