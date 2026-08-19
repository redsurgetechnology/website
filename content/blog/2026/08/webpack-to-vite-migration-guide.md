---
title: "Webpack to Vite Migration Guide: A Practical Step-by-Step Walkthrough"
date: "2026-08-19T10:00:00.000Z"
excerpt: "Thinking about moving from Webpack to Vite? This migration guide walks you through the process, from moving files to replacing loaders, with real-world pitfalls and fixes."
cover_image: "/images/blog/uploads/webpack-to-vite-migration-guide.webp"
seo_title: "Webpack to Vite Migration Guide: Step-by-Step for 2026"
seo_description: "A practical Webpack to Vite migration guide. Learn how to replace webpack.config.js, update scripts, handle environment variables, and fix common compatibility issues."
author_name: "Collin Stewart"
tags:
  - Vite
  - Webpack
  - Build Tools
  - Migration
  - JavaScript
category: "JavaScript"
reading_time: 14
featured: false
no_index: false
---

So you've heard the good news: Vite starts the dev server in milliseconds, bundles faster, and has a much simpler config. You've seen the comparison, maybe read our [Webpack vs Vite](/blog/webpack-vs-vite) breakdown, and you're convinced. Now you want to migrate an existing project.

The good news is that for many projects, the migration is surprisingly smooth. Vite is designed to work out of the box with modern frameworks and standard practices. The bad news is that if your Webpack config is a 400-line monster with custom loaders and `require.context` hacks, you'll have some work to do.

I've guided several migrations—some straightforward, some hairier. Here's a structured approach that will save you from the most common pitfalls. We'll go step by step, from prep to final cleanup, and I'll flag the gotchas that tend to trip people up.

## Pre-migration checklist: know what you're working with

Before you touch anything, inspect your current `webpack.config.js` (or `webpack.config.ts`) and note the following:

- **Entry points** – are they simple, or do you have multiple entries?
- **Loaders** – what file types are you handling? (TypeScript, CSS, Sass, images, SVGs, etc.)
- **Plugins** – which Webpack plugins are you using, and do they have Vite equivalents?
- **Environment variables** – how does your app access `process.env.X`?
- **Special syntax** – do you use `require.context`? Webpack-specific import syntax? `__dirname`?
- **Testing** – are you using Jest with a Webpack transform?

Understanding these will help you map each piece to its Vite counterpart. If your config is simple—just `ts-loader` and `css-loader`—you'll be done in minutes. If it's complex, take your time.

## Step 1: install Vite and the necessary plugins

First, add Vite to your project:

```bash
npm install -D vite
```

If you're using React, add the official React plugin:

```bash
npm install -D @vitejs/plugin-react
```

For Vue, it's `@vitejs/plugin-vue`; for Svelte, `@vitejs/plugin-svelte`; for plain JS, you may not need anything. These plugins handle hot module replacement, JSX transformation, and other framework-specific needs that Webpack loaders used to manage.

If you use TypeScript with React, Vite handles `.tsx` files natively; you just need the plugin for JSX runtime.

## Step 2: move and update the index.html

In Webpack, `index.html` often lives in the project root or a `public/` folder and references a generated bundle. Vite expects `index.html` at the project root and uses it as the dev server entry point.

Create a new `index.html` at the project root (or move the existing one). Update the script tag to point to your main source file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

The `type="module"` is important. Vite serves your source files as native ES modules during development, so the browser loads them directly. No bundling step, no `src` attribute pointing to a generated chunk.

If you previously had HTML in a `public/` folder, Vite uses `public/` for static assets that should be served as-is. Move anything like `favicon.ico`, `robots.txt`, or `manifest.json` there, and reference them with absolute paths.

## Step 3: create a minimal Vite config

Replace your `webpack.config.js` with `vite.config.ts` (or `.js`). Here's a basic React example:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

That's it. No loaders, no entry point, no output config. Vite uses sensible defaults for development and production. The `resolve.alias` option replaces Webpack's `resolve.alias` for path shortcuts.

If you had `process.env.NODE_ENV` checks, Vite provides `import.meta.env.MODE` instead (see step 6).

If you were using webpack-specific import syntax like `import.meta.glob` is Vite's answer to `require.context` (more on that later).

## Step 4: update package.json scripts

Webpack projects typically have scripts like:

```json
{
  "scripts": {
    "start": "webpack serve --mode development",
    "build": "webpack --mode production"
  }
}
```

Replace them with Vite equivalents:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

`npm run dev` starts the Vite dev server. `npm run build` creates a production build in `dist/`. `npm run preview` serves the production build locally to test before deployment.

Run `npm run dev` and see if the page loads. In many simple projects, this works immediately.

## Step 5: update imports and environment variables

Two common changes will break your code:

**1. `process.env.X` → `import.meta.env.VITE_X`**

Vite does not expose `process.env` in the browser. Instead, use `import.meta.env`. Only variables prefixed with `VITE_` are exposed from `.env` files to client code.

Create a `.env` file at the project root:

```
VITE_API_URL=https://api.example.com
VITE_FEATURE_FLAG=true
```

In your code, replace `process.env.API_URL` with `import.meta.env.VITE_API_URL`. For variables used only in `vite.config.ts` or server-side code, you can still use `process.env` if you load them with a library like `dotenv`, but for client code, `import.meta.env` is the way.

**2. `require` → `import`**

Webpack supports CommonJS `require`. Vite is ESM-first. Change `const x = require('x')` to `import x from 'x'`. If you have dynamic `require` calls, see the next section.

## Step 6: replace `require.context` with `import.meta.glob`

Webpack's `require.context` allowed you to load many files at once, useful for auto-importing components or routes. Vite's equivalent is `import.meta.glob`.

Before (Webpack):

```javascript
const modules = require.context("./components", false, /\.jsx$/);
modules.keys().forEach((key) => {
  const component = modules(key).default;
  // register component
});
```

After (Vite):

```javascript
const modules = import.meta.glob("./components/*.jsx");
for (const path in modules) {
  const component = (await modules[path]()).default;
  // register component
}
```

`import.meta.glob` returns a promise for each module. If you need synchronous access, you can use `import.meta.glob` with `{ eager: true }` to import all modules at once, but that increases the bundle. For most use cases, lazy loading is better.

## Step 7: CSS and preprocessors

Webpack used `css-loader`, `style-loader`, and `sass-loader`. Vite handles CSS natively and supports Sass, Less, and Stylus with the appropriate preprocessor installed.

- **Plain CSS**: just import it. Vite processes it automatically.
- **CSS Modules**: Vite treats files ending in `.module.css` as CSS Modules automatically, no config needed.
- **Sass/Less**: install `sass` or `less` as a dev dependency, and Vite will handle `*.scss` / `*.less` imports out of the box.
- **PostCSS**: Vite automatically reads `postcss.config.js` if present. No special plugin needed.

If you had a custom Webpack setup for CSS Modules or PostCSS presets, verify your `postcss.config.js` is compatible with Vite (most are).

## Step 8: static assets and URL handling

In Webpack, you often used `file-loader` or `url-loader` for images and fonts. Vite handles assets natively. Importing an image returns its URL:

```javascript
import logo from "./logo.png";
console.log(logo); // "/src/logo.png" in dev, hashed URL in production
```

Assets smaller than 4 KB are inlined as base64 by default (configurable via `build.assetsInlineLimit`). For assets in `public/`, reference them with absolute paths like `/logo.png`.

If you were using `file-loader` with custom naming, you can customize Vite's output via `build.rollupOptions`, but for most projects the defaults are fine.

## Step 9: TypeScript adjustments

Vite supports TypeScript out of the box, but it does not perform type checking during build. It uses esbuild to transpile TS to JS quickly. Type errors won't fail the build.

If you want type checking, add `vue-tsc` (for Vue) or `tsc --noEmit` before `vite build` in your scripts. For React, you can use `tsc --noEmit && vite build`.

Also, update `tsconfig.json`:

- Set `"module": "ESNext"` and `"moduleResolution": "bundler"` (or `"node"` if you're on an older version).
- Add `"types": ["vite/client"]` if you use `import.meta.env` to get proper type hints.
- Remove any Webpack-specific path aliases and add them to Vite's `resolve.alias`.

## Step 10: replace Jest with Vitest

If you were using Jest with a Webpack transform, consider switching to Vitest, which shares Vite's config and transform pipeline. Vitest is API-compatible with Jest for most tests.

Install Vitest:

```bash
npm install -D vitest
```

Update `package.json`:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

Your existing test files usually work without changes. Vitest automatically picks up `*.test.ts` and `*.spec.ts` files.

If you have complex Jest config with module mappers, you can often replace it with Vite's `resolve.alias` and `define` options. The migration from Jest to Vitest is usually straightforward.

## Common pitfalls and how to fix them

Here are the issues I've seen most often during migrations:

**`__dirname` is not defined** – Vite runs in the browser, so Node-specific globals are absent. Use `import.meta.url` or Vite's `define` to inject constants. For config files, `__dirname` works because the config runs in Node.

**`process` is not defined** – Use `import.meta.env` for environment variables in client code. If you need `process` in the browser (for a library), you can polyfill it via `vite-plugin-node-stdlib-browser`.

**Deep imports from a package fail** – Some packages rely on Node.js internals. Vite pre-bundles dependencies, but some need explicit `optimizeDeps` config. If a package fails, add it to `optimizeDeps.include`.

**`module.exports` in dependencies** – Most modern packages are ESM-compatible, but some older ones use CommonJS. Vite's pre-bundling handles this automatically in most cases. If not, consider replacing the dependency.

**Webpack-specific syntax like `import.meta.webpackHot`** – Remove or replace with Vite's HMR API (`import.meta.hot`).

**Long absolute imports** – Update `resolve.alias` in Vite config to match your Webpack aliases.

## A real-world migration story

I migrated a React dashboard from Webpack to Vite a few months ago. The Webpack config was 350 lines, with custom loaders for SVG sprites, a custom babel plugin, and a complicated `SplitChunksPlugin` setup. The dev server took 80 seconds to start, which made every change painful.

We followed the steps above. The initial migration took about two hours to get the page loading. The remaining time was spent on three issues: replacing `require.context` for auto-importing routes, fixing a few Sass imports that used Webpack-specific tilde (`~`) syntax, and swapping the Jest config for Vitest.

The result: dev server started in under 2 seconds. Hot module replacement was instant. The team's productivity jumped immediately. The build time dropped from 45 seconds to 18 seconds. The simplified config was easier for new developers to understand.

The main lesson: don't try to replicate every Webpack customization in Vite. Many of those customizations existed because Webpack required them. Vite's defaults often eliminate the need entirely.

## Wrapping up

Migrating from Webpack to Vite is a worthwhile investment for most projects. The dev server speed alone will make you wonder why you waited. The simplified config reduces maintenance burden, and the faster builds improve CI pipelines.

Start with a minimal Vite config, get the app running, then gradually add back any customizations you actually need. Don't port your Webpack config line by line—re-evaluate each piece. Many of the loaders and plugins you thought you needed are built into Vite or replaced by simpler configuration.

If you're still on the fence, revisit our [Webpack vs Vite](/blog/webpack-vs-vite) comparison for the full picture. And if performance is your main motivation, check out our guide on [why modern websites feel slower](/blog/why-modern-websites-feel-slower) to see how tooling fits into the bigger picture.

---

_Ready to modernize your frontend tooling? Red Surge Technology helps teams migrate from Webpack to Vite with minimal downtime. [Get in touch](/contact) to discuss your migration._
