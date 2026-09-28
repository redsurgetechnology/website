---
title: "Accessibility Checklist for Developers: A Practical Workflow for Ship-Ready Code"
date: "2026-09-28T10:00:00.000Z"
excerpt: "Stop treating accessibility as a post-launch audit. This developer-focused checklist turns it into a workflow—design-time checks, code-level habits, testing tools, and CI enforcement."
cover_image: "/images/blog/uploads/accessibility-checklist-for-developers.webp"
seo_title: "Accessibility Checklist for Developers: A Practical Workflow Guide"
seo_description: "A developer-focused accessibility checklist. Covers design-time decisions, code-level patterns, testing workflows, tooling, and CI enforcement for WCAG compliance."
author_name: "Collin Stewart"
tags:
  - Accessibility
  - WCAG
  - Web Development
  - Developer Workflow
  - A11y
category: "Web Development"
reading_time: 14
featured: false
no_index: false
---

Most accessibility checklists are written for auditors. They list every WCAG success criterion in order, provide the formal definitions, and leave the developer to figure out how to actually apply them during a typical Tuesday afternoon of feature work.

This one is different. It's a developer's checklist—organized around the way you actually build software: design-time decisions, code-level patterns, testing workflows, and CI enforcement. It's not a replacement for the full WCAG 2.2 specification. It's the practical layer on top of it. If you've read our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist) or the [WebAIM checklist guide](/blog/webaim-wcag-checklist), you have the criteria. This post is about how to actually build accessibility into your day-to-day workflow.

The framing I've settled on after years of shipping accessible products: accessibility isn't a phase in the development lifecycle. It's a set of habits that show up at every phase. The developer who catches contrast issues during implementation saves ten times the effort of the one who catches them during QA. The team that enforces alt text in CI never has to run an emergency audit before launch.

Here's the checklist I use, organized by phase.

## Phase 1: Design-Time Checks

Accessibility problems that get caught in design cost almost nothing to fix. The same problems caught in production can trigger a redesign. Before a single line of code, run through these.

**Contrast decisions.** Check every text-on-background combination against WCAG AA. Normal text needs 4.5:1, large text needs 3:1, and UI components need 3:1. Use the DevTools color picker or WebAIM's Contrast Checker. If a brand color fails, don't wait until implementation to find out—flag it in the design review.

**Focus states.** Ask the designer how keyboard focus is indicated. A dashed outline? A shadow? A background change? Every interactive element needs a visible focus indicator that meets the 3:1 contrast requirement. If the design doesn't specify one, you'll end up with the default browser outline, which often gets stripped out of habit.

**Touch target sizes.** WCAG 2.2 added the Target Size (Minimum) criterion (2.5.8 AA): pointer targets must be at least 24×24 CSS pixels. Get design sign-off on this during the design phase. Retroactively enlarging small buttons after implementation is annoying.

**Motion and animation.** Ask whether any animations autoplay, loop, or exceed five seconds. These need a pause/stop/hide mechanism. Flashing content that exceeds three flashes per second needs to be redesigned entirely.

**Color as sole indicator.** Confirm that status states (error, success, warning) are conveyed by more than color alone. Icons, labels, or text prefixes all work.

**Form structure.** Make sure every input has a visible label. Placeholders don't count. Check that required fields are marked both visually and semantically.

If you're building with a design system, codify these rules into the design tokens. If the design system enforces contrast ratios and touch target sizes, individual components inherit the compliance.

## Phase 2: Component-Level Patterns

Now you're writing code. These are the checks that belong in every component you build. I've grouped them by component type.

### Every component

- **Semantic HTML.** Use `<button>` for buttons, `<a>` for links, `<input>` for inputs, `<nav>` for navigation, `<main>` for main content. The most common accessibility failure is using a `<div>` with `role="button"` when a real `<button>` would work. If you've read our [CSS attribute selectors](/blog/css-attribute-selectors) post, you know how to style based on ARIA state without fake semantic elements.

- **Accessible names.** Every interactive element has an accessible name. For icon-only buttons, use `aria-label`. For form inputs, use associated `<label>` elements.

- **Keyboard reachability.** Tab through the component. Can you reach every interactive element? Can you trigger every action with Enter or Space? Is focus ever trapped?

- **Focus visibility.** Confirm that focus is visibly indicated. Never use `outline: none` without providing a replacement indicator.

- **Text alternatives.** Every image has alt text. Decorative images use `alt=""`. Icons that convey meaning have either visible text or an `aria-label`.

- **Status announcements.** If the component changes state dynamically (loading, error, success), use `aria-live` regions to announce the change to screen readers.

### Forms

- **Associated labels.** Every `<input>` has a `<label>` with matching `for`/`id` attributes, or the input is nested inside the label.

- **Error messaging.** Errors are announced to screen readers via `aria-describedby` and `role="alert"`. The error message is specific: "Please enter a valid email" instead of "Invalid input."

- **Required fields.** Marked with the `required` attribute or `aria-required="true"`, and visually indicated.

- **Autocomplete.** Use `autocomplete` attributes so password managers and browsers can fill fields automatically. This directly supports the new 3.3.8 Accessible Authentication criterion.

- **Grouped controls.** Radio buttons and checkboxes are wrapped in `<fieldset>` with a `<legend>`.

If you're building forms in React, our [React controlled vs uncontrolled components](/blog/react-controlled-vs-uncontrolled) guide covers the patterns that make these requirements straightforward.

### Custom widgets

If you're building anything beyond a basic button or input—a custom select, a combobox, tabs, a menu—you're implementing a widget pattern that has specific accessibility requirements. Use our [WAI-ARIA authoring practices](/blog/wai-aria-authoring-practices) guide for the keyboard behavior and ARIA attributes each pattern requires.

The short version: don't build custom widgets unless you have to. Use a headless component library like [React Aria Components](/blog/react-aria-components), which handles the accessible behavior for you.

## Phase 3: Testing Workflow

You can't audit accessibility by reading a checklist. You have to test. Here's the workflow I use for every feature.

**1. Run automated checks.** Axe, WAVE, or Lighthouse catch 30–40% of issues automatically. Run them in your dev environment on every page you touch. They're excellent for contrast, alt text presence, and structural issues.

**2. Keyboard test.** Unplug your mouse. Tab through the feature. Can you reach every element? Is focus visible? Is focus ever obscured by sticky elements? Does the component work with Enter and Space?

**3. Screen reader test.** Use VoiceOver on Mac or NVDA on Windows. Navigate by headings, landmarks, and form controls. Listen to how your component is announced. This is where you catch issues that automated tools miss.

**4. Zoom test.** Zoom to 200% and check for content loss. Test at 320px width for reflow. Check that text spacing adjustments don't break layout.

**5. Touch target test.** Measure interactive elements. Anything smaller than 24×24 needs to be enlarged or spaced adequately.

**6. Test with reduced motion.** Enable "reduce motion" in your OS settings and confirm that animations are disabled or reduced.

**7. Test with high contrast mode.** Windows High Contrast Mode and forced-colors mode in browsers reveal issues with background images, custom focus indicators, and color-based state.

I combine these into a short pre-commit checklist that I run through in about ten minutes for a typical component. It's not exhaustive, but it catches the majority of issues before they reach code review.

## Phase 4: Tooling and CI Enforcement

The most important thing you can do for accessibility is make it automatic. Manual checklists get skipped under deadline pressure. Automated enforcement doesn't.

**ESLint plugins.** Add `eslint-plugin-jsx-a11y` to your React projects. It catches missing alt text, incorrect ARIA usage, keyboard handler issues, and a long list of common mistakes at lint time.

```json
{
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

**Storybook addons.** If you use Storybook, add `@storybook/addon-a11y`. It runs axe-core on every story and surfaces violations directly in the Storybook UI. Designers and PMs see accessibility issues during review, not developers during implementation.

**CI accessibility tests.** Add axe-core to your test suite. For React projects, `jest-axe` or `vitest-axe` runs accessibility tests on rendered components. Any violation fails the build.

```javascript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("Button is accessible", async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Playwright or Cypress a11y checks.** For end-to-end testing, integrate `@axe-core/playwright` or `cypress-axe`. These catch issues that only appear when components are composed into pages.

**Lighthouse CI.** Add Lighthouse CI to your pull request checks. Set a minimum accessibility score threshold. Fail the build if it drops below.

With these tools in place, accessibility stops being a manual step and becomes a structural property of your codebase. Our post on [preventing unnecessary re-renders in React](/blog/prevent-unnecessary-rerenders-react) covers a similar philosophy—make the right thing the automatic thing.

## Phase 5: Code Review Checklist

Code review is your last line of defense. Add these to your PR template so reviewers don't have to remember them.

- Does this component use semantic HTML instead of ARIA where possible?
- Are all interactive elements keyboard accessible?
- Is focus visibly indicated and never obscured?
- Do all images have appropriate alt text?
- Do form inputs have associated labels?
- Are errors announced to screen readers?
- Are touch targets at least 24×24 CSS pixels?
- Are color contrast ratios met?
- Does the component work with screen readers?

Print this on a card and put it next to your monitor. Better yet, add it to your pull request template so it's part of every review.

If you've been following our accessibility series, from [WCAG 2.2 checklist](/blog/wcag-2-2-checklist) to [WebAIM WCAG checklist](/blog/webaim-wcag-checklist), you have the criteria. This review checklist is how you keep them top of mind.

## A Real Story: The Cost of Catching Accessibility Late

I once worked on a project where accessibility was treated as a post-launch audit. The team built a beautiful analytics dashboard over six weeks. Everything looked great. Then the accessibility auditor delivered their report.

The primary data visualization was a custom canvas chart with no text alternative. Building an accessible alternative would have taken two weeks—either a table view or an ARIA live region announcing data changes. Two weeks of work that could have been half a day if designed in from the start.

The custom dropdown had no keyboard support. Another several days of work to retrofit.

The color scheme failed contrast in five places. Design redraw, re-review, re-implementation.

The total cost of the audit was around four weeks of engineering time—all of it avoidable if the team had run through this checklist during development.

The lesson: accessibility caught at the end is exponentially more expensive than accessibility built in from the start. The checklist isn't about perfection; it's about catching the obvious issues before they compound.

## Wrapping Up

This checklist isn't exhaustive. It doesn't cover every WCAG criterion, and it isn't a substitute for testing with actual assistive technology. But it's the practical workflow I use on every project—design-time decisions, code-level patterns, testing rituals, and CI enforcement. Each phase catches a different class of issue, and together they prevent the majority of accessibility failures from reaching production.

If you're new to accessibility, start with the design-time and component-level checks. Get comfortable with keyboard testing and screen reader basics. Then add tooling and CI enforcement as you mature. Accessibility is a practice, not a checkbox, and the practice gets easier with every feature you build.

For deeper dives, see our [WCAG checklist for web developers](/blog/wcag-checklist-for-web-developers), our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist), and our [beginner's guide to web accessibility](/blog/web-accessibility-for-beginners). And if you're building React applications, our [React Aria Components](/blog/react-aria-components) guide covers the accessible primitives that handle many of these checks for you.

Now go build something that works for everyone.

---

_Need help building accessibility into your development workflow or auditing an existing product? Red Surge Technology specializes in inclusive web experiences for teams that want to ship confidently. [Get in touch](/contact) to discuss your project._
