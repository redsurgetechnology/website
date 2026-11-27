---
title: "React 19 Features in 2026: What's Actually Stable from 19.0 to 19.3"
date: "2026-11-27T10:00:00.000Z"
excerpt: "Most React 19 articles were written in December 2024 and never updated. Here's every feature that's actually stable in 19.3, what shipped in 19.1 and 19.2, and what breaks when you upgrade."
cover_image: "/images/blog/uploads/react-19-features-2026.webp"
seo_title: "React 19 Features in 2026: What's Stable in 19.0–19.3"
seo_description: "React 19 features explained for 2026. Covers Actions, use(), Activity, useEffectEvent, View Transitions, Fragment Refs, browser(), and the breaking changes in 19.3."
author_name: "Collin Stewart"
tags:
  - React
  - React 19
  - JavaScript
  - Web Development
  - Frontend
category: "JavaScript"
reading_time: 16
featured: false
no_index: false
---

Most React 19 articles have a timestamp problem. They were written the week 19.0 landed in December 2024, and they describe a release that has since grown two more minor versions, a stable compiler, and a set of APIs those articles never mention.

That gap matters if you're learning React 19 in late 2026. Reading a launch article tells you about Actions and the `use()` hook, which is correct. It doesn't tell you that `<Activity>` and `useEffectEvent` shipped in 19.2, that `<ViewTransition>` and Fragment Refs went stable in 19.3, or that the React Compiler is no longer experimental. You end up with a partial picture of a framework that has moved on.

This is the current-state reference. Every feature below is grouped by the version that stabilized it, with what it replaces and whether it's safe to use in production today. If you're deciding where to spend your upgrade effort, the migration order at the end is the part worth reading first.

## The version timeline, in one table

| Version  | Date         | What landed                                                                                                                 |
| -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **19.0** | Dec 5, 2024  | Actions, `useActionState`, `useFormStatus`, `useOptimistic`, `use()`, `ref` as a prop, document metadata, Server Components |
| **19.1** | Mar 28, 2025 | Owner Stacks and `captureOwnerStack` (development-only debugging)                                                           |
| **19.2** | Oct 1, 2025  | `<Activity>`, `useEffectEvent`, Partial Pre-rendering, Performance Tracks                                                   |
| **19.3** | Sep 9, 2026  | `<ViewTransition>`, Fragment Refs, `browser()`, Trusted Types, direct Context rendering from Server Components              |

React also moved under the React Foundation, hosted by the Linux Foundation, announced at React Conf in October 2025. That changed who stewards releases, not the API.

On adoption: React 19.3 is now the most-downloaded version of React on npm, and React overall sits around 85 million weekly downloads. The upgrade is no longer early-adopter territory. It's the default.

## 19.0: the changes that rewrote how you write components

The 19.0 release was the big one. Four of its additions changed daily habits, and one of them quietly made an entire category of library obsolete.

### Actions and the hooks built on them

An "Action" is just an async function used inside a transition. The point is that React now tracks the pending state, the result, and the error for you, instead of you wiring three `useState` calls around every form submit.

`useActionState` is the one you'll use most. It takes an action and an initial state, and returns the current state, a wrapped action you pass to `<form>`, and a pending flag.

```jsx
import { useActionState } from "react";

async function updateProfile(prevState, formData) {
  const name = formData.get("name");
  if (!name) return { error: "Name is required" };

  await saveProfile({ name });
  return { success: true };
}

function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <form action={formAction}>
      <input name="name" />
      {state?.error && <p role="alert">{state.error}</p>}
      <button disabled={isPending}>{isPending ? "Saving…" : "Save"}</button>
    </form>
  );
}
```

That's the entire submit lifecycle. No `pending` boolean, no `error` state, no try/catch in the handler, no manual `onSubmit`. The React 19 changelog even renamed "form state" to "action state" in the error messages in 19.3, which tells you how the team thinks about it now.

`useFormStatus` is the smaller companion. It lets a submit button read the pending state of its parent form without you passing `isPending` down as a prop. It only works inside a `<form>`, and only in a child component — a common trip-up.

`useOptimistic` handles the pattern where you show the result immediately and roll back if the server disagrees. Toggles, likes, comments, cart updates.

```jsx
const [optimisticLikes, addOptimisticLike] = useOptimistic(
  likes,
  (current, delta) => current + delta,
);
```

You call `addOptimisticLike(1)` inside a transition, then run the real action. If the action throws, React discards the optimistic value and renders the real one. The rollback is the feature. Doing this by hand used to mean keeping a shadow copy of state and remembering to clean it up on every failure path.

### The use() API

`use()` reads a promise or a context during render. It's the one API in React that can be called conditionally or after an early return, because it isn't a hook in the rules-of-hooks sense.

```jsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map((c) => <Comment key={c.id} {...c} />);
}
```

Wrapped in `<Suspense>`, this replaces a large amount of `useEffect` plus `useState` plus loading-flag data fetching. It's also why the older advice about "always fetch in an effect" is now conditional rather than absolute.

One caveat worth knowing: 19.3 added a warning when `use` is called incorrectly in a conditional. The API permits conditional calls, but not in every position, and the compiler-adjacent rules around it are stricter than they first appear.

### ref as a regular prop

`forwardRef` is on its way out. In React 19 you can accept `ref` as a normal prop on a function component.

```jsx
// Before
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);

// React 19
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

Ref callbacks can also return a cleanup function, which finally gives you a proper teardown path for things you attach to a DOM node in a ref callback. `forwardRef` still works and isn't removed, but there's no reason to write new code with it.

### Document metadata in JSX

You can render `<title>`, `<meta>`, and `<link>` anywhere in your component tree, and React hoists them into `<head>`.

```jsx
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.excerpt} />
      <h1>{post.title}</h1>
    </article>
  );
}
```

`react-helmet` and its descendants are no longer necessary for this. The remaining reason to keep a helmet-style library is if you need features beyond hoisting — though for most apps, you don't.

### Server Components as a stable primitive

RSC shipped stable in 19.0, and by 2026 it's the recommended approach for new React applications rather than an experimental mode. That has knock-on effects on everything else in this list, because client-side data fetching is now a narrower concern than it was in 2023.

If the server/client boundary still feels fuzzy, our guide on [what the Next.js server actually is](/blog/what-is-the-nextjs-server-rsc-architecture) covers the module graph split and why `'use client'` propagates downward. And if you're choosing between the server-side patterns, our [API Routes vs Route Handlers vs Server Actions](/blog/nextjs-api-routes-vs-route-handlers-vs-server-actions) comparison covers when each applies.

## 19.1: the quiet release

19.1 added Owner Stacks and `captureOwnerStack`. It's a development-only debugging API that tells you which component _rendered_ the component that's currently rendering, rather than just where it sits in the tree.

That distinction sounds academic until you're debugging a context provider three layers up that's causing a re-render you didn't expect. Owner Stacks point at the cause; component stacks point at the location. It's a small release, but if you've ever stared at a stack trace that named twelve components and none of them was the problem, it's a welcome one.

## 19.2: visibility, effects, and pre-rendering

Three features landed here, and two of them solve problems that used to require a workaround.

### <Activity>

`<Activity>` lets you hide a subtree without unmounting it. It supports two modes: `visible` and `hidden`.

```jsx
<Activity mode={isVisible ? "visible" : "hidden"}>
  <ExpensiveTab />
</Activity>
```

When hidden, React keeps the component's state but stops rendering it, and deprioritizes any work inside it. Toggle back and the state is still there. No remount, no refetch, no scroll position reset.

This replaces the pattern of rendering a component with `display: none` (which keeps it mounted but doesn't deprioritize the work) or conditionally rendering it (which throws away state). Tabs, modals, and side panels are the obvious use cases. So is any "keep this alive so the user doesn't lose their place" scenario.

### useEffectEvent

The classic effect problem: you want an effect to react to one value, but it also reads another value that changes constantly, and adding it to the dependency array makes the effect re-run on every change.

The old workaround was a ref. `useEffectEvent` is the first-class version. It extracts non-reactive logic into an Effect Event, so the effect can read the latest value without listing it as a dependency.

```jsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification("Connected", theme);
  });

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on("connected", onConnected);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
}
```

The effect depends on `roomId` only. `theme` is read at the moment the event fires, not captured when the effect ran. This fixes a bug class that developers have been working around with refs for years.

### Partial Pre-rendering and Performance Tracks

Partial Pre-rendering lets you serve a static shell immediately and stream in the dynamic parts. It's mostly a framework-level concern, but it's worth knowing the primitive exists if you're tuning perceived load time.

Performance Tracks add React's own scheduling work into the Chrome DevTools performance panel, so you can see React's render phases alongside your JavaScript, layout, and paint. If you've been guessing why an interaction felt slow, this is the tool that stops the guessing.

## 19.3: animations, fragments, and the browser escape hatch

The September 2026 release moved two long-experimental APIs to stable and added a genuinely new way to handle server rendering edge cases.

### <ViewTransition>

This is the headline. Wrap a piece of UI in `<ViewTransition>`, and when a transition changes it, React animates it using the browser's View Transition API.

```jsx
import { ViewTransition, useState, startTransition } from "react";

function Gallery() {
  const [showItem, setShowItem] = useState(false);

  return (
    <>
      <button
        onClick={() => startTransition(() => setShowItem((prev) => !prev))}
      >
        Toggle
      </button>

      {showItem && (
        <ViewTransition>
          <Video />
        </ViewTransition>
      )}
    </>
  );
}
```

React chooses the animation based on how the tree changed: `enter` when the boundary is added, `exit` when it's removed, `update` when children change style or content, and `share` when a named boundary moves from one place to another.

Two details matter in practice. First, only updates inside a transition animate. A plain `setState` is treated as urgent and renders immediately, which is the correct behavior — you don't want a page transition on every keystroke. Second, `<ViewTransition>` currently only works in the DOM. React Native support is in progress but not shipped.

`addTransitionType` is the customization hook. When a carousel forwards to slide three, you want the animation to run right-to-left; when it goes backward to slide three, left-to-right. Same state, different cause, different animation.

```jsx
startTransition(() => {
  addTransitionType("next");
  setCurrentSlide((c) => c + 1);
});
```

You then map transition types to animation classes in your CSS, or use the Web Animations API through `onEnter`, `onExit`, `onShare`, and `onUpdate`.

The integration with Suspense is the part that changes what you can build without a library. Wrap a Suspense boundary in `<ViewTransition>` and React animates from the fallback to the resolved content:

```jsx
<ViewTransition>
  <Suspense fallback={<Placeholder />}>
    <LazyVideo />
  </Suspense>
</ViewTransition>
```

### Fragment Refs

The older problem: you want to attach a ref to a group of children, but there's no single parent element, and adding a wrapper `<div>` would break the layout. Or the child comes from a library and doesn't forward refs at all.

Fragment Refs let you pass a ref to `<Fragment>` and get back a `FragmentInstance`, which exposes a limited set of DOM methods that operate on the group.

```jsx
function PostList({ posts }) {
  const fragmentRef = useRef(null);

  useEffect(() => {
    fragmentRef.current?.focus();
  }, []);

  return (
    <Fragment ref={fragmentRef}>
      {posts.map((post) => (
        <Heading key={post.id}>{post.title}</Heading>
      ))}
    </Fragment>
  );
}
```

The instance gives you `focus`, `focusLast`, `blur`, `addEventListener`, `removeEventListener`, `dispatchEvent`, `observeUsing` (for IntersectionObserver and ResizeObserver), `getClientRects`, `getRootNode`, `compareDocumentPosition`, and `scrollIntoView`.

The interesting one is `observeUsing`. It lets a wrapper component add viewport-observation behavior to children it doesn't control, without modifying them and without inserting a DOM node. That's the pattern that used to require a wrapper div you didn't want.

### browser(): opting out of server rendering

If your app server-renders, every component renders twice: once on the server to produce HTML, once on the client to attach behavior. Some components can't produce meaningful HTML on the server because they depend on `localStorage`, the device timezone, or a browser-only API.

The old workarounds were a `mounted` state flag set in an effect, or a `typeof window !== 'undefined'` check. Both work, both are ugly, and neither plays well with Suspense.

`browser()` is the first-class version. It's exported from `react-dom`, and you call it through `use()`.

```jsx
import { Suspense, use } from "react";
import { browser } from "react-dom";

function TimeZone({ defaultValue }) {
  if (defaultValue) return <p>{defaultValue}</p>;

  use(browser());
  const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  return <p>{timeZone}</p>;
}
```

On the server, `use(browser())` suspends, so the nearest Suspense fallback appears in the HTML. On the client after hydration, it doesn't suspend, and the component renders normally.

The part that makes it more than a convenience: because `use()` can be called conditionally, you can opt out of server rendering only when needed. In the example above, if a `defaultValue` is passed, the component renders server-side. If not, it suspends. That's a level of control the `mounted` flag never gave you.

A realistic application: a data-fetching hook like `useQuery` that should render on the server when initial data was passed in, and suspend when it wasn't.

```jsx
function useBrowserQuery(query, options) {
  if (options.initialData === undefined) {
    use(browser());
  }
  return useQuery(query, options);
}
```

### Trusted Types and Context from Server Components

Two smaller additions that matter for specific teams.

`react-dom` now works with the browser's Trusted Types API, which is a CSP mechanism that blocks DOM-based XSS by refusing to assign raw strings to injection sinks. If your organization enforces Trusted Types, React no longer needs a workaround.

Server Components can now import and render a Context directly from a `'use client'` module, without a wrapper provider component. Previously you needed a client component whose only job was to pass a prop into the provider. That wrapper is gone:

```jsx
// user-context.js
"use client";
export const UserContext = createContext(null);

// layout.js (Server Component)
import { UserContext } from "./user-context";

export async function Layout({ children }) {
  const currentUser = await getCurrentUser();
  return <UserContext value={currentUser}>{children}</UserContext>;
}
```

It's a small removal of boilerplate, but it's the kind of boilerplate that made people give up on context in server-heavy apps.

## The React Compiler, in one paragraph

The compiler reached 1.0 in October 2025 and is now on by default in new React setups. It memoizes components and expensive calculations at build time, which makes most manual `useMemo`, `useCallback`, and `React.memo` calls unnecessary in new code. It does not make them safe to delete everywhere — particularly when a memoized value feeds an effect dependency. That's a big enough topic to deserve its own treatment, so see our [React Compiler 1.0 guide](/blog/react-compiler-1-0-usememo-usecallback) for the exceptions and the rollout order.

The short version for this post: the compiler is part of the React 19 story, not a separate optional add-on.

## What breaks when you upgrade

The removals are the part that turns an afternoon upgrade into a week. These are the ones that actually show up in real codebases.

**`ReactDOM.render`, `ReactDOM.hydrate`, and `unmountComponentAtNode`** are removed. Use `createRoot` and `hydrateRoot` from `react-dom/client`. If you're still on the legacy root API, this is the blocking change.

**`ReactDOM.findDOMNode`** is removed. Use a ref directly on the DOM node.

**String refs** (`this.refs.foo`) are removed. Use `createRef` or a callback ref.

**`propTypes` validation no longer runs.** Your `.propTypes` assignments aren't removed and won't throw, they just stop doing anything at runtime. Worth knowing if you were relying on those warnings in development.

**`defaultProps` on function components** is removed. Use default parameter values instead.

**`createFactory`** is removed.

**UMD builds** are gone. If you were loading React from a script tag without a build step, you need a bundler now.

**`ref` is a prop, not a special case.** Code that reads `props.ref` expecting it to be undefined will behave differently, though this is rare in application code and more common in libraries.

The practical move is to run an automated migration before you touch anything by hand. There's a codemod for the string refs case (`npx codemod@latest react/19/replace-string-ref`), and an ESLint plugin (`eslint-plugin-react-19-upgrade`) that flags the removed DOM APIs, string refs, and `propTypes` usage. Running both gives you a worklist instead of a surprise.

## A migration order that doesn't stall

The mistake I see most often is teams trying to adopt Actions, Server Components, and the compiler in the same quarter. They're independent changes, and doing them together makes it impossible to tell which one broke something.

Here's the order I'd use.

**1. Get onto 19.x with nothing else changed.** Upgrade the dependencies, run the codemods, fix the removed APIs, ship it. No new features. This is a mechanical release and you want it isolated.

**2. Turn the compiler on, in annotation mode.** Use `compilationMode: 'annotation'` so only components marked `"use memo"` get compiled, and expand from there. Removing manual memoization is a separate, later step.

**3. Adopt Actions for new forms only.** Don't rewrite existing forms. Write new ones with `useActionState` and `useFormStatus`, and let the pattern spread as you touch code.

**4. Move to Server Components where they fit.** This is the biggest architectural change, and it's better done feature by feature. Our guide on [React Server Components in Next.js](/blog/react-server-components-nextjs) covers the boundary rules, and our [ISR vs SSR comparison](/blog/nextjs-isr-vs-ssr) covers how the rendering strategy interacts with it.

**5. Add the 19.2 and 19.3 APIs where they solve a problem you actually have.** Don't add `<Activity>` for its own sake. Add it when a tab keeps losing state.

The order matters less than the isolation. Each step should be a shippable release.

## A story about an upgrade that stalled on propTypes

A team I worked with planned a two-day React 19 upgrade. They budgeted for `createRoot`, a handful of ref fixes, and called it done.

Day three, they were still going. The blocker wasn't an API removal. It was that their test suite asserted on `propTypes` warnings. Dozens of tests checked that passing a wrong type produced a console warning, and React 19 doesn't emit those warnings anymore. The tests failed, and the failures looked like regressions rather than expected behavior.

The fix was deleting those assertions, which took an afternoon once they understood the cause. The lesson wasn't about `propTypes` specifically. It was that a major version bump changes things your test suite has opinions about, and the removals list is the wrong place to look for those.

If you take one thing from this section: before upgrading, grep your tests for anything that asserts on a console warning, a deprecation message, or a runtime type check. That's where the surprises hide.

## Wrapping up

React 19 in late 2026 is a different release from the one that shipped in December 2024. The core ideas — Actions, `use()`, ref as a prop, Server Components — have been stable for two years. What's changed since is the polish: `Activity` for state-preserving visibility, `useEffectEvent` for the effect-dependency problem, View Transitions for animations that don't need a library, Fragment Refs for the wrapper-div problem, and `browser()` for the server-rendering escape hatch.

If you're upgrading, isolate the mechanical release from the feature adoption. If you're learning, read the 19.2 and 19.3 material alongside the 19.0 material, because most of what's online stops at 19.0.

For the pieces that sit on top of React 19, see our [React Compiler guide](/blog/react-compiler-1-0-usememo-usecallback), our [React Server Components guide](/blog/react-server-components-nextjs), and our [React Hook Form vs Formik vs TanStack Form](/blog/react-hook-form-vs-formik-vs-tanstack-form) comparison if you're deciding how much form state React should manage for you.

## Frequently asked questions

### What's the latest version of React in 2026?

React 19.3 shipped on September 9, 2026, and 19.3.x is the current line. React 19.0 shipped December 5, 2024, 19.1 followed in March 2025, and 19.2 in October 2025. React 19.3 is the most-downloaded version on npm.

### What are the main new features in React 19?

The headline features from 19.0 are Actions, `useActionState`, `useFormStatus`, `useOptimistic`, the `use()` API, `ref` as a regular prop, automatic document metadata hoisting, and stable Server Components. Since then, 19.2 added `<Activity>`, `useEffectEvent`, and Partial Pre-rendering, and 19.3 added `<ViewTransition>`, Fragment Refs, and `browser()`.

### Is React 19 stable?

Yes. React 19.0 was a stable release, not a canary or experimental branch. By 2026 it's the default in every major starter and framework, and the React Compiler that shipped alongside it reached 1.0 in October 2025.

### What's the difference between React 19.0 and 19.3?

19.0 introduced the foundational APIs — Actions, `use()`, ref as a prop, Server Components. 19.2 added visibility control with `<Activity>`, a proper fix for effect dependencies with `useEffectEvent`, and Partial Pre-rendering. 19.3 stabilized View Transitions and Fragment Refs, added the `browser()` API for opting components out of server rendering, added Trusted Types support, and allowed Server Components to render Context directly.

### What is <Activity> in React 19?

A component that hides and shows subtrees while preserving their state. It has two modes, `visible` and `hidden`. When hidden, React keeps the state, stops rendering the subtree, and deprioritizes work inside it. It replaced the older workarounds of `display: none` or conditional rendering that throws state away.

### What does use() do in React 19?

`use()` reads a promise or a context during render. It's the one API that can be called conditionally or after an early return, which is what makes patterns like `use(browser())` possible. Wrapped in `<Suspense>`, it replaces a lot of `useEffect` plus `useState` data-fetching code.

### Does React 19 remove forwardRef?

No. `forwardRef` still works and isn't deprecated in a way that breaks existing code. But `ref` is now a regular prop on function components, so there's no reason to write new components with `forwardRef`.

### What breaks when upgrading to React 19?

`ReactDOM.render`, `ReactDOM.hydrate`, `unmountComponentAtNode`, and `findDOMNode` are removed. String refs are removed. `propTypes` validation no longer runs. `defaultProps` on function components is removed. `createFactory` is removed. UMD builds are gone. Run the React 19 codemods and the `eslint-plugin-react-19-upgrade` plugin before migrating by hand.

### Do I still need react-helmet with React 19?

For hoisting `<title>`, `<meta>`, and `<link>` into `<head>`, no. React 19 does this natively from anywhere in the component tree. You'd only need a helmet-style library for features beyond hoisting.

### Does <ViewTransition> work in React Native?

Not yet. As of 19.3, `<ViewTransition>` only works in the DOM. React Native support is in progress but hasn't shipped. If you're building for mobile, our [React Native Skia vs Reanimated](/blog/react-native-skia-vs-reanimated) comparison covers the animation options that do work today.

---

_Upgrading a large React codebase to 19.x and want the mechanical release isolated from the feature adoption? Red Surge Technology builds and modernizes React applications. [Get in touch](/contact) to discuss your migration._
