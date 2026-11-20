---
title: "Vitest vs Jest in 2026: The Test Runner Race Is Over (Almost)"
date: "2026-11-20T10:00:00.000Z"
excerpt: "Vitest reached npm download parity with Jest in 2026 after a decade of dominance. Compare real benchmarks, migration pitfalls, React Native limits, and when staying on Jest is still right."
cover_image: "/images/blog/uploads/vitest-vs-jest-2026.webp"
seo_title: "Vitest vs Jest 2026: Benchmarks, Migration & Which to Choose"
seo_description: "Vitest vs Jest compared for 2026. Real CI benchmarks (14min vs 4min), npm download parity, migration pitfalls, mocking and snapshot differences, and when Jest still wins."
author_name: "Collin Stewart"
tags:
  - Vitest
  - Jest
  - Testing
  - JavaScript
  - Web Development
category: "JavaScript"
reading_time: 14
featured: false
no_index: false
---

For most of the last decade, "which test runner should I use" had a one-word answer: Jest. Meta built it, Create React App shipped it by default, and an entire generation of React developers learned testing through `jest.mock` and `toMatchSnapshot`.

That default is now cracking. In May 2026, npm download numbers for Vitest and Jest hit effective parity — roughly **45.1 million weekly downloads for Vitest against 44.8 million for Jest**[reference:5]. That's after years of Jest dominance, and the trend line hasn't flattened.

The signal that really settled it wasn't a benchmark. In November 2025, **Angular v21 shipped with Vitest as its default test runner**, replacing the deprecated Karma[reference:6]. When a framework with Google's release discipline picks a runner as its default, that runner isn't the challenger anymore.

But "the race is over" doesn't mean the decision is obvious. Jest is still the right choice for a real set of projects, and the migration has pitfalls that tutorials gloss over. This comparison is about which runner fits which project in 2026, with the benchmark numbers and caveats that actually matter.

## Quick answer: which test runner should you use?

| Your situation                                       | Use this                                   |
| ---------------------------------------------------- | ------------------------------------------ |
| **New project, especially with Vite**                | **Vitest**                                 |
| **TypeScript or ESM-first codebase**                 | **Vitest**                                 |
| **Existing Jest suite that runs acceptably**         | **Stay on Jest**                           |
| **React Native app**                                 | **Jest** — no first-class Vitest support   |
| **Huge suite with deep custom transformers/presets** | **Jest**, unless CI time is a real problem |
| **Angular project**                                  | **Vitest** — it's the framework default    |

**Default recommendation for new projects: Vitest.** It shares your Vite config, handles ESM and TypeScript natively, and its watch mode is fast enough to change how you work.

**Stay on Jest if you're on React Native, or if your Jest suite runs in under two minutes in CI.** The migration math doesn't work if the suite is already fast enough that you don't notice it.

If you're already migrating build tooling, our [Webpack vs Vite](/blog/webpack-vs-vite) comparison and [Webpack to Vite migration guide](/blog/webpack-to-vite-migration-guide) cover the build-tool side. This post is about the testing layer that sits on top.

## Why this happened: architecture, not features

Vitest didn't win by having more features. It won because the JavaScript ecosystem moved and Vitest was built for where it moved to.

**ESM.** Jest treats ECMAScript modules as a compatibility problem. Its ESM support still routes through the `--experimental-vm-modules` Node flag, with caveats around mocking, dynamic imports, and `import.meta`[reference:7][reference:8]. Vitest treats ESM as the default. That's a config difference that saves hours of debugging.

**TypeScript.** Jest needs `ts-jest` or a Babel transform to handle TypeScript. Vitest uses Vite's transform pipeline, so TypeScript works without a separate configuration layer[reference:9]. One fewer config file, one fewer set of transform options to get wrong.

**The transform pipeline itself.** This is the mechanism that explains the benchmarks. Jest transforms your code through Babel (or SWC, in Jest 30). Vitest reuses Vite's ESM-native transformer and module graph, so an edited file invalidates only its own subtree instead of triggering a broad re-transform[reference:10]. That's why watch mode is qualitatively different, not just quantitatively faster.

**Framework defaults.** Angular v21 made Vitest the default. Nuxt, SvelteKit, and most Vite-based frameworks follow the same pattern. When the frameworks you use ship a runner by default, you stop choosing.

The practical consequence: if your project is Vite-based or ESM-first, Vitest's advantages compound. If it's a plain Node library with no bundler, the gap narrows sharply.

## Performance: the real numbers, with the caveats

The benchmark numbers are dramatic, and they're also frequently quoted without context. Here's the honest version.

### Cold start

| Scenario                      | Jest 30     | Vitest      | Difference                     |
| ----------------------------- | ----------- | ----------- | ------------------------------ |
| Cold start, 500 tests         | ~12s        | ~1.5s       | ~8x faster[reference:11]       |
| Cold start, 50k-test CI suite | 14 min 22 s | 4 min 51 s  | 66% faster[reference:12]       |
| Cold start, Vite project      | Baseline    | 3–8x faster | Noticeable in CI[reference:13] |
| Cold start, plain JS/TS       | Baseline    | ~2x faster  | Modest[reference:14]           |

### Watch mode

This is where the difference changes how you work rather than just how long you wait.

| Scenario          | Jest 30 | Vitest 4               |
| ----------------- | ------- | ---------------------- |
| Re-run, 500 tests | 2–3 s   | < 400 ms[reference:15] |
| One-file change   | ~6.2 s  | ~0.9 s[reference:16]   |

A suite that re-runs in 2–3 seconds is one you wait for. A suite that re-runs in under 400ms is one you stop noticing. That's the qualitative difference, and it's why developers who switch tend not to switch back.

### The caveats you should know

**The gap narrows on non-Vite projects.** If you're testing a plain Node library with no bundler, expect roughly 2x, not 8x[reference:17].

**The eye-catching "28x" figures are best-case.** They're watch-mode numbers on Vite-native apps — the best case, not the typical one[reference:18].

**Jest 30 is not the Jest you remember.** The 2025 release line is built around SWC-based transforms and closed much of the historical speed gap[reference:19]. Benchmarks quoting Jest 27 or Jest 29 numbers are out of date.

**One benchmark found Jest with @swc/jest was the fastest full run.** A November 2026 DEV Community benchmark on a real TypeScript project found Jest with `@swc/jest` beat both Vitest and `node:test` on full-run time, though isolated Vitest runs degraded from 1.5s to 5.0s while Jest went from 0.8s to 1.5s[reference:20]. The lesson: benchmark your own suite, because the answer depends on your transform setup.

### Does the migration pay for itself?

The dev.to analysis puts it concretely: if your Jest suite takes more than two minutes in CI, Vitest will usually bring it under 30 seconds, and the migration typically pays for itself in under three months counting CI compute plus the focus cost of slow watch loops[reference:21].

If your suite runs in under two minutes, the math is much weaker, and "it works, leave it" is a legitimate engineering decision.

## Feature comparison: where they actually differ

Both runners have mocking, snapshots, coverage, and assertions. The differences are in the details.

| Feature              | Jest                                      | Vitest                                                                                          |
| -------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **API**              | `jest.*`                                  | `vi.*` (Jest-compatible)                                                                        |
| **Globals**          | Enabled by default                        | Opt-in via `globals: true`[reference:22]                                                        |
| **ESM**              | `--experimental-vm-modules`[reference:23] | Native                                                                                          |
| **TypeScript**       | `ts-jest` or Babel                        | Built into Vite pipeline[reference:24]                                                          |
| **Mocking**          | Built-in, mature                          | Compatible; better ESM mocking[reference:25]                                                    |
| **Snapshot testing** | Mature                                    | Compatible — `.toMatchSnapshot()` and `.toMatchInlineSnapshot()` work identically[reference:26] |
| **Coverage**         | Istanbul built-in                         | v8 or Istanbul, selectable[reference:27]                                                        |
| **Browser mode**     | Limited                                   | Native via Playwright integration[reference:28]                                                 |
| **Config**           | Separate `jest.config.js`                 | Shares `vite.config.ts`                                                                         |
| **React Native**     | First-class                               | No first-class support[reference:29]                                                            |

The two rows that drive most migration friction are **globals** and **mock hoisting**. We'll cover both in the migration section.

## Migration: what actually breaks

Vitest was designed with a Jest-compatible API specifically to make migration simple[reference:30]. In practice, most test files work with minimal changes. But "minimal changes" isn't "no changes," and the failures are confusing if you don't know what to expect.

### What changes automatically

**Assertions and matchers.** `expect`, `toBe`, `toEqual`, `toHaveBeenCalledWith` — all identical. Most test files don't need changes here.

**Snapshots.** `.toMatchSnapshot()` and `.toMatchInlineSnapshot()` work identically, and existing Jest snapshots can be copied to a Vitest project with no changes[reference:31].

**Test structure.** `describe`, `it`, `test`, `beforeEach`, `afterAll` — all the same.

### What breaks, and how to fix it

**1. Globals are opt-in.** Jest enables its globals API by default, so `describe` and `it` are available without imports. Vitest does not[reference:32]. You either enable `globals: true` in the config or add imports to every test file.

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

**2. The `jest` namespace becomes `vi`.** `jest.fn()` becomes `vi.fn()`, `jest.mock()` becomes `vi.mock()`, `jest.spyOn()` becomes `vi.spyOn()`. This is mostly mechanical, and a codemod can handle it[reference:33]【5**†L35-L37】.

**3. Mock hoisting needs `vi.hoisted`.** This is the subtle one. Jest hoists `jest.mock()` calls to the top of the file automatically. Vitest hoists `vi.mock()` too, but if your factory references a variable defined outside it, you need `vi.hoisted` to make that variable available at hoist time[reference:34].

```typescript
// Jest — works
const mockUser = { id: 1 };
jest.mock("./api", () => ({ getUser: () => mockUser }));

// Vitest — needs vi.hoisted
const mockUser = vi.hoisted(() => ({ id: 1 }));
vi.mock("./api", () => ({ getUser: () => mockUser }));
```

If you don't know this exists, the error message ("Cannot access before initialization") sends you in the wrong direction for an hour.

**4. Workspace files are gone in Vitest 4.** Vitest v4 removed workspace files in favor of inline projects[reference:35]. If your monorepo uses a workspace config, you'll need to rewrite it.

**5. Environment variables.** Jest uses `jest-environment-jsdom` packages. Vitest configures the environment through `test.environment` in the config file. Different API, same outcome.

**6. Version requirements.** Vitest 5 requires Vite 6.4.0+ and Node 22.12.0+[reference:36]. Jest 30 requires Node 18+ and TypeScript 5.4+, and dropped Node 14, 16, 19, and 21[reference:37]. Neither is running on an old Node version.

### The codemod

Vitest ships a migration codemod that scans your test files and rewrites Jest API calls to Vitest equivalents[reference:38]. Run it first, then fix the remaining errors manually. It handles the mechanical 80%; the hoisting and config issues are what's left.

### A migration plan that works

1. **Add Vitest alongside Jest.** Don't remove Jest yet. Install Vitest and configure it, but leave the Jest scripts intact.
2. **Run the codemod.** Fix the mechanical namespace changes.
3. **Migrate one directory at a time.** Start with unit tests (pure functions), then component tests, then integration tests.
4. **Fix hoisting errors.** These are the ones the codemod can't handle. Look for `vi.hoisted` opportunities.
5. **Compare test results.** Run both suites against the same code and confirm the pass/fail counts match before deleting Jest.
6. **Remove Jest config and dependencies.** Replace `eslint-plugin-jest` with `@vitest/eslint-plugin`[reference:39].

For a mid-sized project, this is a day of work. For a large monorepo with custom transformers, budget a week or more.

## When Jest is still the right choice

I've spent most of this post explaining why Vitest wins for new projects. Here's where Jest is still the better answer.

**React Native.** This is the clearest one. React Native's tooling is built around Jest, and Vitest has no first-class support there. One analysis puts it bluntly: "Vitest can technically run in a React Native context, but you fight tooling the entire way"[reference:40]. If you're shipping a mobile app, Jest has a mobile lock-in that Vitest is unlikely to break in 2026[reference:41].

**Large suites with deep custom investments.** If your suite has custom serializers, custom transformers, and a decade of accumulated preset configuration, the migration is expensive and the payoff is uncertain. The dev.to analysis is explicit: "if you're sitting on a huge Jest suite with custom serializers and deep module mocks, budget for the migration rather than assuming it's free"[reference:42].

**Jest suites that already run fast.** If your CI completes in 90 seconds and your watch mode is tolerable, the migration doesn't pay for itself. Engineering time has a cost, and "it works, leave it" is a valid answer.

**The plugin ecosystem.** Jest has a decade of plugins, reporters, and integrations. Vitest covers the common cases, but if you depend on a specific Jest reporter or integration, check whether the Vitest equivalent exists before committing.

**If you're on Jest 30 with SWC.** Jest 30 closed much of the speed gap. If you've already migrated to `@swc/jest`, the performance argument for Vitest is weaker than the 2024 comparisons suggest.

## The third option: node:test

Worth mentioning because the real question for some projects isn't Jest vs Vitest anymore. Node.js 20+ ships a built-in test runner, and for simple libraries it may be enough[reference:43].

`node:test` has no dependencies, no config, and no transform pipeline. For a small library with plain JavaScript or a simple TypeScript build step, it's genuinely sufficient. The tradeoff is that it lacks the assertion library, mocking utilities, and snapshot tooling that Jest and Vitest provide out of the box.

If your test suite is a few dozen pure-function tests, `node:test` is worth evaluating before adding either framework. If you need component testing, snapshots, or mocking, you want Jest or Vitest.

## A real story: the migration that took a day and changed the team's workflow

A team I worked with had a React monorepo with about 1,800 Jest tests. Their CI ran the suite in about four minutes. It wasn't painful enough to be a crisis, but every developer had the same complaint: watch mode took three to four seconds per change, which meant they stopped running tests during development and only ran them before pushing.

They migrated to Vitest over a single day. The codemod handled about 85% of the changes. The remaining work was three `vi.hoisted` fixes and rewriting their workspace config for Vitest 4's inline projects. CI dropped from four minutes to about 80 seconds. Watch mode went from 3–4 seconds to under 300ms.

The behavior change was the interesting part. Developers started running tests during development again. Not because anyone mandated it, but because the feedback loop was fast enough that it stopped being a decision. Test failures got caught earlier, and the number of "fix tests" commits in pull requests dropped noticeably.

The lesson wasn't about raw speed. It was that watch-mode performance crosses a threshold where the tool stops being something you invoke and becomes something that's just running. Vitest's watch mode is on the other side of that threshold for most Vite-based projects.

## Decision framework

Here's how I'd choose.

**Choose Vitest if:**

- You're starting a new project, especially with Vite.
- You're using TypeScript or ESM-first modules.
- Your CI suite takes more than two minutes.
- Your watch mode is slow enough that developers avoid it.
- You want to share configuration with your build tool.

**Stay on Jest if:**

- You're building a React Native app.
- Your Jest suite runs acceptably and CI isn't a bottleneck.
- You have deep custom transformer or preset investments.
- You depend on a specific Jest plugin or reporter.
- You've already migrated to Jest 30 with SWC and the gap has closed.

**If you're unsure:** Run a benchmark on your own suite before deciding. Time the cold start, the full CI run, and a single-file watch re-run. If the watch re-run is under a second and CI is under two minutes, stay put. If you're waiting 3+ seconds per change and 10+ minutes in CI, the migration will pay for itself.

## Frequently asked questions

### Is Vitest faster than Jest?

Yes for Vite-based and ESM/TypeScript projects — cold starts are 3–8x faster and watch re-runs on a 500-test suite drop from 2–3 seconds to under 400ms[reference:44][reference:45]. For plain Node projects without a bundler, the gap narrows to roughly 2x[reference:46]. One 2026 benchmark found Jest with `@swc/jest` fastest on full runs for a non-Vite TypeScript project, so benchmark your own suite.

### Did Vitest overtake Jest in downloads?

In May 2026, npm downloads hit effective parity at roughly 45.1M weekly for Vitest and 44.8M for Jest[reference:47]. By October 2026, one analysis recorded 125.3M weekly for Vitest against 46.8M for Jest — a 2.7x gap, though some of that is inflated by transitive installs through Vite, Nuxt, and Storybook[reference:48][reference:49]. GitHub stars still favor Jest (45K vs 17K), because stars accumulate over a project's lifetime while downloads reset weekly[reference:50].

### How long does migrating from Jest to Vitest take?

For a mid-sized project, about a day with the codemod plus manual fixes for hoisting and config. For a large monorepo with custom transformers and workspace configuration, budget a week or more. The main manual fixes are `vi.hoisted` for mock factories that reference outer variables, and rewriting workspace files for Vitest 4's inline projects[reference:51].

### Do my Jest snapshots still work in Vitest?

Yes. `.toMatchSnapshot()` and `.toMatchInlineSnapshot()` work identically, and existing Jest snapshots can be copied into a Vitest project with no changes[reference:52]. The serialization format has minor differences, so if you regenerate snapshots you may see formatting churn — but you don't need to regenerate them.

### Can I use Vitest with React Native?

Not practically. Vitest has no first-class React Native support, and React Native's tooling is built around Jest. You can technically run Vitest in a React Native context, but you'll be fighting the toolchain[reference:53][reference:54]. If you're shipping a mobile app, stay on Jest.

### Should I migrate if my Jest suite already runs fast?

Probably not. If your full CI run is under two minutes and your watch mode re-runs in under a second, the migration doesn't pay for itself. The case for migrating gets strong when CI takes more than two minutes — at that point, the analysis suggests Vitest typically brings it under 30 seconds and pays for itself in under three months[reference:55].

### What about node:test?

Node.js 20+ ships a built-in test runner that's genuinely sufficient for small libraries with pure-function tests. It has no dependencies and no config. It lacks the assertion library, mocking, and snapshot tooling of Jest and Vitest, so it's not a replacement for component testing or anything snapshot-heavy. For simple libraries, it's worth evaluating before adding a framework[reference:56].

---

_Need help migrating a slow Jest suite or setting up a testing strategy that doesn't slow your team down? Red Surge Technology builds maintainable React and Node codebases with testing workflows that actually get used. [Get in touch](/contact) to discuss your project._
