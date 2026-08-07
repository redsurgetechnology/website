---
title: "JavaScript Document Ready: Vanilla JS DOMContentLoaded Explained"
date: "2026-08-07T10:00:00.000Z"
excerpt: "Stop relying on jQuery's $(document).ready() for DOM detection. Learn how to use vanilla JavaScript's DOMContentLoaded event, the defer attribute, and modern async patterns."
cover_image: "/images/blog/uploads/javascript-document-ready.webp"
seo_title: "JavaScript Document Ready: Vanilla JS DOMContentLoaded vs jQuery"
seo_description: "Master the JavaScript document ready equivalent without jQuery. Learn DOMContentLoaded, defer, async, and how to safely manipulate the DOM as soon as it's ready."
author_name: "Collin Stewart"
tags:
  - JavaScript
  - DOM
  - jQuery
  - Web Development
  - Events
category: "JavaScript"
reading_time: 10
featured: false
no_index: false
---

Back when jQuery ruled the frontend, every developer started their script with a sacred incantation:

```javascript
$(document).ready(function () {
  // Safe to mess with the DOM here
});
```

It was simple, bulletproof, and cross‑browser compatible—something vanilla JavaScript didn't offer in the IE6 era. But the web has moved on. Today, native browser APIs give you everything you need to know exactly when the DOM is ready, often without writing a single event listener.

If you've only ever reached for `$(document).ready()` out of habit, or if you've been slapping `DOMContentLoaded` everywhere without really understanding the alternatives, this post is for you. Let's walk through what "document ready" actually means, how to detect it in plain JavaScript, and when you might not need any detection code at all.

## What "document ready" actually means

Before any JavaScript can touch a page element—add a class, change text, attach an event listener—that element must exist in the browser's Document Object Model. The DOM is built incrementally as the browser parses the HTML. If your script runs before the `<body>` has finished parsing, any attempt to query for elements will return `null` or an empty collection, and your code silently fails.

"Document ready" is the moment when the browser has finished parsing the entire HTML document and built the complete DOM tree. Images, stylesheets, and external resources may still be loading, but every `<div>`, `<button>`, and `<p>` tag is accessible.

If you've been exploring DOM manipulation patterns, like those in our [JavaScript debounce vs throttle guide](/blog/javascript-debounce-vs-throttle), you'll know that those techniques only work once the elements they target actually exist. That's the whole point of waiting for document ready.

## The vanilla JavaScript equivalent: DOMContentLoaded

The modern, jQuery‑free way to detect document ready is the `DOMContentLoaded` event. It fires exactly when the HTML is fully parsed and the DOM is ready, without waiting for stylesheets or images.

```javascript
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");
  // All your initialization code goes here
});
```

That's it. One event listener, zero dependencies. It works in every modern browser—IE9 and up, which is as far back as anyone needs to care about these days. If you really need IE8 support, you're probably still using jQuery anyway.

One important gotcha: `DOMContentLoaded` waits for synchronous scripts to finish executing, but it does **not** wait for asynchronous scripts or stylesheets. If your code depends on CSS layout being fully computed (to measure element sizes, for example), you might need the `load` event instead, which fires after everything—images, iframes, stylesheets—has loaded.

```javascript
window.addEventListener("load", function () {
  console.log("Page fully loaded, including all assets");
});
```

But for typical DOM manipulation—showing a modal, attaching click handlers, initialising a carousel—`DOMContentLoaded` is exactly what you want.

## A common mistake: scripts that run too early

The most common reason developers reach for document ready is that they placed their `<script>` tag in the `<head>` without any attributes. In that position, the script runs immediately, before the browser has parsed any body content.

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="app.js"></script>
    <!-- Runs before body exists -->
  </head>
  <body>
    <button id="myButton">Click me</button>
  </body>
</html>
```

Inside `app.js`, `document.getElementById('myButton')` returns `null` because the button hasn't been parsed yet. You could wrap all your code in `DOMContentLoaded`, but there's a simpler fix: put your scripts at the end of `<body>`.

```html
<body>
  <button id="myButton">Click me</button>
  <script src="app.js"></script>
  <!-- Runs after the button exists -->
</body>
```

Now the script executes after the DOM elements it needs are already available. No event listener required. It's the oldest trick in the book, and it still works perfectly.

## The modern solution: the defer attribute

If you prefer to keep `<script>` tags in the `<head>`—for organisation, or because your build tool places them there—use the `defer` attribute. A deferred script downloads in parallel with HTML parsing but doesn't execute until the DOM is fully built, right before `DOMContentLoaded` fires.

```html
<head>
  <script src="app.js" defer></script>
</head>
<body>
  <button id="myButton">Click me</button>
</body>
```

Inside `app.js`, you can safely query for `#myButton` at the top level—no event listener needed. `defer` scripts maintain their order, so if you have multiple deferred scripts that depend on each other, they execute in sequence.

The `async` attribute is similar but not the same. An `async` script executes as soon as it finishes downloading, regardless of whether the DOM is ready, and it doesn't respect execution order. `async` is great for independent third‑party scripts like analytics. For your application code that manipulates the DOM, `defer` is almost always what you want.

If you've been exploring [modern website performance optimizations](/blog/why-modern-websites-feel-slower), you'll appreciate that `defer` improves perceived load time by not blocking rendering, while still giving you a fully‑baked DOM when your code runs.

## What if you're not sure the DOM is ready yet?

Sometimes you're writing a script that might execute after `DOMContentLoaded` has already fired—for example, in a dynamically loaded module or a third‑party widget. In that case, checking `document.readyState` tells you whether you need to listen for the event at all.

```javascript
function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

onReady(function () {
  console.log("DOM is ready!");
});
```

The `document.readyState` property has three values: `'loading'` (HTML still being parsed), `'interactive'` (DOM ready, but some resources still loading), and `'complete'` (everything loaded). If the state is already `'interactive'` or `'complete'`, the DOM is ready, and you can call your function immediately.

This is exactly what jQuery's `$(document).ready()` does under the hood. But now you can do it in four lines of vanilla JavaScript.

## The jQuery-to-vanilla migration

If you're maintaining an older project that still uses `$(document).ready()`, the migration path is straightforward. Most ready‑block code doesn't actually depend on jQuery; it just uses jQuery selectors for convenience. Replace the jQuery wrapper with `DOMContentLoaded` and swap `$()` for `document.querySelectorAll()`.

Before:

```javascript
$(document).ready(function () {
  $(".accordion-toggle").on("click", function () {
    $(this).next(".accordion-content").slideToggle();
  });
});
```

After:

```javascript
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".accordion-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      const content = this.nextElementSibling;
      content.classList.toggle("open");
    });
  });
});
```

The animation (`slideToggle`) requires a CSS transition instead of jQuery's `slideToggle()`, but the DOM logic is the same. And you've just removed a 30 KB library dependency.

## A real story about a script that loaded too late

I once worked on a content site that had a "back to top" button. The button was initialised inside a `DOMContentLoaded` listener, and it worked perfectly. Then the marketing team added a heavy analytics script that loaded asynchronously and sometimes took five seconds to finish. The `load` event—which the analytics team used to send page timing data—fired long after the button was already working.

A new developer, seeing the `load` event in the codebase, assumed it was the "proper" way to initialise UI components. They moved the back‑to‑top button initialization from `DOMContentLoaded` to `load`. Suddenly, users on slow connections saw no button for five seconds. A tiny change broke a perfectly good feature.

The fix was reverting to `DOMContentLoaded` for UI initialization and keeping the `load` event only for analytics. The lesson: `DOMContentLoaded` is for DOM‑dependent code. `load` is for asset‑dependent code. Mixing them up causes real user‑visible delays.

## When you don't need any "ready" code at all

Modern frameworks like React, Vue, and Svelte handle DOM readiness for you. When a component mounts, its DOM elements already exist. You never need `DOMContentLoaded` inside a React component's `useEffect` with an empty dependency array (that runs after paint, but the DOM is guaranteed to be there).

If you're writing vanilla JavaScript for a project that uses ES modules and the `defer` attribute, you might not need any readiness detection. The script executes after the DOM is parsed, and your top‑level code can safely query for elements.

```html
<script type="module" src="app.js"></script>
```

ES module scripts automatically behave like they have `defer`. They execute after the DOM is ready, in order, without blocking rendering. It's the cleanest approach for modern browsers.

## Wrapping up

The `$(document).ready()` era is over—not because jQuery is dead, but because the web platform caught up. `DOMContentLoaded` gives you the same guarantee in vanilla JavaScript. The `defer` attribute and ES modules let you write code that doesn't need any readiness wrapper at all.

If you're starting a new project, use `<script defer>` or `<script type="module">` and write your code at the top level. If you're supporting dynamic scripts that might load after the page has already loaded, use `document.readyState` to handle both cases elegantly. And if you find a stray `$(document).ready()` in an old codebase, you now know exactly how to replace it.

No more incantations. Just the DOM, ready when you are.

---

_Brushing up on modern JavaScript fundamentals and want to write cleaner, dependency‑free code? Red Surge Technology helps teams modernise their frontend stack. [Get in touch](/contact) to discuss your project._
