---
title: "React Compiler 1.0: Do You Still Need useMemo and useCallback?"
date: "2026-11-24T10:00:00.000Z"
excerpt: "React Compiler 1.0 has been stable since October 2025 and it memoizes your components for you. Here's what it actually does, what it doesn't, and which of your useMemo calls you should keep."
cover_image: "/images/blog/uploads/react-compiler-1-0-usememo-usecallback.webp"
seo_title: "React Compiler 1.0: Do You Still Need useMemo and useCallback?"
seo_description: "React Compiler 1.0 automates memoization at build time. Learn what it handles, the seven things it can't do, when to keep useMemo and useCallback, and how to turn it on in Next.js and Vite."
author_name: "Collin Stewart"
tags:
  - React
  - React Compiler
  - Performance
  - useMemo
  - JavaScript
category: "JavaScript"
reading_time: 15
featured: false
no_index: false
---

If you have spent years learning when to reach for `useMemo`, when `useCallback` actually helps, and why wrapping everything in `React.memo` is usually a mistake, React Compiler 1.0 is a slightly uncomfortable moment. It does most of that work for you, at build time, without you writing a single hook.

The compiler went stable on October 7, 2025. It works on both React and React Native, and it optimizes components without requiring you to rewrite them[reference:0]. It has been running on large Meta apps and is described as production-ready[reference:1]. Expo SDK 54 turns it on out of the box, and both Vite and Next.js ship compiler-enabled starters for new projects[reference:2].

So the obvious question: is all that memoization knowledge now useless?

Not quite. The compiler removes the reflex. It doesn't remove the reasoning. There are still real situations where a manual `useMemo` is the right call, and there are some where adding one actively makes the compiler's job harder. This post is about the difference.

## Quick answer: do you still need useMemo and useCallback?

| Your situation                                             | What to do                                             |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| **New component, no compiler yet**                         | Write it without memos, then turn the compiler on      |
| **New component, compiler enabled**                        | Write plain code. No memos by default                  |
| **Value feeds a `useEffect` dependency**                   | Keep the memo. This is the big exception               |
| **Value passed to a `memo()` component you don't control** | Keep the memo                                          |
| **Genuinely slow calculation with rare-changing deps**     | Keep the memo                                          |
| **`memo()` with a custom `areEqual` comparator**           | Keep it — the compiler has no equivalent               |
| **Existing code that works**                               | Leave the memos. Removing them changes compiled output |

The short version: **new code, rely on the compiler. Existing code, leave working memoization alone unless you can test the removal carefully.**

That is not me being cautious. That is the current official guidance. React's docs actually walked back the original "you can remove your memos" wording because it "was coming off a bit too strong and makes it incorrectly seem like the manual memos and compiler memos are 1:1"[reference:3].

## What React Compiler actually does

It is a build-time tool, currently shipped as a Babel plugin, that reads your component's data flow and inserts memoization for you[reference:4][reference:5]. It performs two optimizations:

**It skips cascading re-renders.** The practical equivalent of wrapping every component in `memo`, automatically[reference:6].

**It memoizes expensive calculations inside components and hooks.** Same idea as `useMemo`, applied where the compiler decides it pays off[reference:7].

The interesting part is that the compiler can do things a hook cannot. `useMemo` and `useCallback` have to respect the Rules of Hooks, which means they can't sit after an early return. The compiler can. It follows control flow through branches and memoizes values on paths that a hook couldn't reach[reference:8][reference:9].

It handles optional chains and array indices as dependencies too, which is exactly the kind of case where `exhaustive-deps` gets awkward and developers give up and write `[data]` when they meant `[data?.filter]`[reference:10].

Here's the shape of the difference. Before the compiler, this was standard defensive React:

```jsx
const ExpensiveComponent = memo(function ExpensiveComponent({ data, onClick }) {
  const processedData = useMemo(() => expensiveProcessing(data), [data]);
  const handleClick = useCallback((item) => onClick(item.id), [onClick]);

  return <List items={processedData} onItemClick={handleClick} />;
});
```

With the compiler, the same optimizations happen from plain code:

```jsx
function ExpensiveComponent({ data, onClick }) {
  const processedData = expensiveProcessing(data);
  const handleClick = (item) => onClick(item.id);

  return <List items={processedData} onItemClick={handleClick} />;
}
```

Three hooks and a wrapper disappear. The behavior is meant to be the same or better.

## The reported numbers, with the caveats

Meta's own figures from the Quest Store: initial loads and cross-page navigation improved by up to 12%, some interactions were more than 2.5× faster, and memory stayed flat[reference:11].

Sanity Studio compiled 1,231 of their 1,411 components and reported a 20–30% reduction in render time and latency[reference:12].

Wakelet rolled it out to 100% of users and saw LCP go from 2.6s to 2.4s, and INP from 275ms to 240ms. Their biggest gains were in pure React elements like Radix dropdowns, where INP improved by close to 30%[reference:13].

Now the caveat, because these numbers get quoted without it. An independent test on a real ~15,000-line app found that initial load barely moved and Lighthouse scores were essentially identical before and after. Interaction performance varied a lot by use case: a theme toggle saw total blocking time drop from 280ms to zero, while a checkbox filter went from 130ms to 90ms and still didn't eliminate all re-renders because of non-memoized object references coming from an external library[reference:14].

The realistic expectation: the compiler helps most where your components are genuinely pure React and your interactions trigger unnecessary work. It does not turn a slow app fast. It removes a specific class of waste.

## What the compiler does not do

This is the section worth reading twice, because it's where the disappointment lives.

**It only compiles components and hooks.** An expensive function sitting in a module-level utility file is never memoized. The compiler matches components and hooks — roughly PascalCase functions and `use`-prefixed functions that create JSX or call hooks[reference:15].

**Memoization isn't shared across components.** If five components each call the same expensive function, it runs five times. The compiler optimizes within a component, not across your app. If that matters, you need a cache or a better data layer[reference:16].

**Class components are out of scope.** No directive or mode will memoize a class. They simply aren't matched[reference:17].

**Context subscriptions stay coarse.** A memoized component still re-renders when a context it consumes changes. The compiler behaves like `memo`, and `memo` doesn't help with context[reference:18].

**It fixes nothing architectural.** Data-fetching waterfalls, bundle size, unvirtualized lists, over-fetching — all untouched. As the guidance puts it, compiling a wrong architecture faster doesn't help[reference:19].

That last point matters for anyone who has read our [React chart performance optimization guide](/blog/react-chart-performance-optimization-guide). Most slow charts are slow because of downsampling and data volume, not because a component re-rendered. The compiler won't touch that.

## What to do with your existing memos

The rules are clearer than the internet suggests.

**New code:** write it plainly. Reach for `useMemo` or `useCallback` when you want precise control, not as a default[reference:20].

**Existing code:** leave working memoization in place, or test the removal carefully, because removing a memo changes what the compiler generates[reference:21].

There are four reasons a manual memo still earns its place[reference:22]:

1. A noticeably slow calculation whose dependencies rarely change.
2. A value passed to a component still wrapped in `memo` from a library you don't control.
3. Preventing an effect from firing too often.
4. A value that later becomes a dependency of another hook.

Number three is the one that catches people. If a memoized value feeds a `useEffect` dependency array, removing the memo can change how often that effect fires. React's own docs name this as a common reason to keep a manual memo[reference:23]. Future compiler versions may memoize more granularly, and a previously stable value feeding an effect somewhere in the tree could cause that effect to over- or under-fire.

And one that has no compiler equivalent at all: `memo()` with a custom `areEqual` comparator. Keep those[reference:24].

## The trap: an incomplete dependency array is worse than no memo

This is the counterintuitive one.

When the compiler sees `useMemo` or `useCallback`, it assumes you had a reason and preserves it. But if the dependency array is incomplete, the compiler can't follow your data flow — and it bails on the **entire component**, not just that one hook[reference:25][reference:26].

```jsx
// The component stops being compiled entirely
const filtered = useMemo(() => data.filter(filter), [data]);
// 'filter' is missing
```

```jsx
// Compiles fine, compiler optimizes around it
const filtered = useMemo(() => data.filter(filter), [data, filter]);
```

```jsx
// Best for new code
const filtered = data.filter(filter);
```

So a half-maintained manual memo doesn't just fail to help. It prevents the compiler from helping anywhere in that component. If you're keeping memos, keep their dependencies complete. The `preserve-manual-memoization` lint rule enforces exactly this[reference:27].

## How to turn it on

The compiler works with React 17 and up. If you're not on React 19, you set a minimum target in the compiler config and add `react-compiler-runtime` as a dependency[reference:28].

**Next.js 16** has stable support. Install the plugin, then flip one flag:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

You still need `babel-plugin-react-compiler` installed as a peer dependency — Next.js declares it as optional and won't install it for you[reference:29][reference:30].

**Vite** changed shape recently. With `@vitejs/plugin-react` v6.0.0 or later, the inline Babel option was removed, so you use the `reactCompilerPreset`:

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
```

On older plugin versions you can pass the plugin through `react({ babel: { plugins: ['babel-plugin-react-compiler'] } })` instead[reference:31].

For plain Babel, the compiler has to run **first** in the plugin pipeline. It needs the original source to analyze properly[reference:32].

## How to know it's actually working

The React DevTools "Memo ✨" badge is the thing everyone cites, and it's misleading. The badge means the compiler **processed** the component. It does not mean the component got optimized. A component that bailed out can still show the badge[reference:33].

Two more reliable checks. First, the build output — compiled components contain `import { c as _c } from "react/compiler-runtime"` and a `const $ = _c(n)` line[reference:34]. Second, run the healthcheck:

```bash
npx react-compiler-healthcheck@latest
```

It reports how many components compile, whether StrictMode is in use, and which libraries are flagged as incompatible[reference:35][reference:36].

## Rolling it out without breaking things

The one-big-PR rollout is a bad idea. There are three supported ways to go gradually: Babel `overrides` to apply the compiler to specific directories, `compilationMode: 'annotation'` so only components marked `"use memo"` get compiled, or runtime feature flags[reference:37][reference:38].

The directive system is simple. `"use memo"` includes a function. `"use no memo"` excludes one. Module-level placement applies to the whole file; function-level overrides the module. `"use no memo"` wins over every compilation mode and must be the first statement in the function body[reference:39][reference:40].

Treat `"use no memo"` as temporary. Write the reason in a comment and a ticket number. The count of these directives in a codebase is a health metric — left unmanaged, they become `@ts-ignore`[reference:41].

## When something breaks, debug the rules first

Most compiler problems are not compiler bugs. They're code that was quietly breaking the Rules of React and happened to work because your manual memoization was covering for it.

The failure mode is specific: code that **relies on memoization for correctness**. Because the compiler memoizes differently than you did, effects over-fire, loops go infinite, or updates go missing[reference:42].

The debugging move is to isolate. Add `"use no memo"` to the suspect component. If the bug disappears, it's almost certainly a Rules of React violation[reference:43]. Then try removing all manual memoization from that component as well — if the bug is still there with zero memoization, you have a genuine rules violation to fix, not a compiler issue[reference:44].

## A story about an effect that never stopped firing

A team I worked with turned the compiler on across their app in one commit. Most things got faster. One settings page started making API calls in a loop, which is a fun thing to discover on a Friday.

The component built a config object inline, then passed it into a `useEffect` dependency array. Before the compiler, that object was recreated on every render, so the effect fired constantly — but it also happened to bail out early because of a guard condition, so nobody noticed. The compiler memoized the object, which changed the timing, the guard stopped catching the case, and the effect started firing in a loop.

The fix was not to disable the compiler. The fix was to acknowledge that the effect was depending on an object identity it shouldn't have depended on. We moved the derived value into the effect and depended on its primitive parts.

The lesson stuck with me. The compiler didn't create a bug. It surfaced a dependency that had been wrong for two years. That's the pattern with most compiler "regressions" — they're latent bugs that manual memoization was masking.

## What this means for the re-render advice you already read

If you've read our guide on [preventing unnecessary re-renders in React](/blog/prevent-unnecessary-rerenders-react), a lot of it still holds and some of it is now conditional.

The parts that hold: isolate state, don't put derived data in state, split contexts by update frequency, and measure before optimizing. None of that changes.

The parts that change: "wrap this in `React.memo`" and "stabilize this callback with `useCallback`" are now things the compiler does for you, if you let it. Which means the modern version of that advice is: write the plain version, turn the compiler on, then add a manual memo only when you have a specific reason and can point at it.

If you're on React Server Components, most of this is moot for server-side data anyway — see our guide on [what the Next.js server actually is](/blog/what-is-the-nextjs-server-rsc-architecture) for where the client boundary sits. The compiler applies to client components.

## Wrapping up

React Compiler 1.0 is the biggest change to React performance work since hooks. It replaces the reflex — memo everything, then profile — with a build step that memoizes precisely and lets you write normal code.

What it doesn't do is replace judgment. It won't fix your data fetching, your bundle size, or your unvirtualized list. It won't memoize your utility functions. It won't help with context. And if your code depends on memoization for correctness rather than performance, it will find that out for you, loudly.

So: turn it on, delete the memo ceremony in new code, leave the old memos alone until you can test removing them, and keep the four exceptions in your head. That's the whole adjustment.

For the React 19 context this sits inside, see our [React Server Components guide](/blog/react-server-components-nextjs). For the state management side, our [useState vs useReducer comparison](/blog/react-usestate-vs-usereducer) and [Zustand vs Redux breakdown](/blog/zustand-vs-redux-2026) cover what the compiler doesn't touch.

## Frequently asked questions

### Do I still need useMemo with React Compiler?

For new code, no — not by default. Write the calculation inline and let the compiler memoize it. Keep a manual `useMemo` when the value feeds a `useEffect` dependency array, when it's passed to a `memo()` component you don't control, when the calculation is genuinely expensive and rarely changes, or when the value becomes a dependency of another hook.

### Does React Compiler remove my existing useMemo and useCallback?

No. It preserves existing `useMemo`, `useCallback`, and `React.memo` calls and assumes you had a reason for them. It only compiles a component if its own analysis matches or exceeds your manual memoization — which is why an incomplete dependency array causes it to skip the whole component.

### Does React Compiler make React.memo unnecessary?

Mostly, yes. One of its two core optimizations is the automatic equivalent of wrapping every component in `memo`. The exception is `memo()` with a custom `areEqual` comparator, which has no compiler equivalent and should stay.

### Does React Compiler work with React 18?

Yes. It supports React 17 and up. For 17 and 18 you set a minimum target in the compiler config and add `react-compiler-runtime` as a dependency. On React 19 you don't need the runtime package.

### Why did my component not get optimized by the compiler?

Common causes: it's a class component, it's a module-level function rather than a component or hook, the dependency array in a manual `useMemo` is incomplete, or it uses a pattern the compiler skips — a `try` without a `catch`, a `try`/`finally`, `for await`, a class declaration inside the component, or a JSX tag declared locally. Run `npx react-compiler-healthcheck@latest` to see what's compiling and enable the `todo` lint rule to surface silent skips.

### What is "use no memo"?

A directive that excludes a function from compilation. Use it to isolate whether a bug is compiler-related, or to work around a library that isn't compatible yet. It takes precedence over all compilation modes and must be the first statement in the function body. Treat it as temporary and document why it's there.

### Does React Compiler help with context re-renders?

No. Compiler memoization behaves like `memo`, and a memoized component still re-renders when a context it consumes changes. Context subscriptions don't become fine-grained. Splitting contexts by update frequency is still the fix.

---

_Need help rolling out React Compiler without a Friday-afternoon incident, or auditing a codebase that depends on memoization for correctness? Red Surge Technology builds and modernizes React applications. [Get in touch](/contact) to discuss your project._
