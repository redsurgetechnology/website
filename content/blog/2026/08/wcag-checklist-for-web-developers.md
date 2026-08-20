---
title: "WCAG Checklist for Web Developers: Your Actionable Accessibility Cheat Sheet"
date: "2026-08-20T10:00:00.000Z"
excerpt: "A practical WCAG checklist built for web developers. Skip the legalese and get actionable checks for color contrast, keyboard navigation, forms, ARIA, and more."
cover_image: "/images/blog/uploads/wcag-checklist-for-web-developers.webp"
seo_title: "WCAG Checklist for Web Developers: Actionable Accessibility Guide"
seo_description: "Use this practical WCAG checklist for web developers to build accessible websites. Covers contrast, keyboard support, forms, ARIA, and testing tips you can apply today."
author_name: "Collin Stewart"
tags:
  - Accessibility
  - WCAG
  - Web Development
  - ARIA
  - Testing
category: "Web Development"
reading_time: 14
featured: false
no_index: false
---

The WCAG guidelines are thorough, but they read like legal documents. Thousands of words, dozens of success criteria, and enough cross-references to make your head spin. Web developers don't need more documentation—they need a checklist they can actually use while building.

That's what this post is. A developer-focused, practical WCAG checklist. No fluff, no legalese. Just the accessibility checks that matter most when you're writing HTML, CSS, and JavaScript, organized by what you're building.

If you've ever stared at the official WCAG spec and wondered where to start, this is your starting point. We'll cover the criteria that cause the most real-world failures, with concrete tests you can run in your browser's DevTools.

## Why a developer checklist matters

Most accessibility issues aren't caused by malicious intent. They're caused by ignorance. Developers don't know that a color contrast ratio of 4.5:1 is required for normal text. They don't realize that a `<div>` with an `onClick` handler isn't keyboard accessible. They don't know that `aria-label` only works on certain elements.

The WCAG guidelines fix the ignorance problem, but they create an overwhelming one. The spec is organized by principle (Perceivable, Operable, Understandable, Robust) and by level (A, AA, AAA). That's useful for auditors but not for developers trying to build a login form.

A checklist gives you a concrete set of checks you can apply to each component you build. Did I provide alt text? Did I test keyboard navigation? Did I check the contrast ratio? These are binary questions with clear answers.

If you're new to accessibility concepts, our [beginner's guide to web accessibility](/blog/web-accessibility-for-beginners) explains the "why" behind these checks. This checklist is the "what."

## The non-negotiable basics

These checks apply to every page, every component, every feature. If you do nothing else, do these.

**1. Every image has meaningful alt text.** Decorative images should have empty alt (`alt=""`) so screen readers skip them. Functional images (icons, buttons with only an image) need descriptive alt text that conveys the action or content, not just a description of the picture.

**2. Color is never the only way to convey information.** If an error message is red text, add an icon or text label like "Error:" so colorblind users can distinguish it. Links should be underlined or have another visual indicator besides color.

**3. Text contrast meets WCAG AA.** Normal text needs a 4.5:1 contrast ratio against its background. Large text (18pt or 14pt bold and larger) needs 3:1. Use the DevTools color picker or a contrast checker tool.

**4. Every interactive element is keyboard accessible.** Tab to it. Activate it with Enter or Space. See a visible focus indicator. If you can't use a button, link, or form field without a mouse, it's not accessible.

**5. Page has a logical heading structure.** One `<h1>` per page, headings in order (`h1` → `h2` → `h3`). Don't skip levels. Headings are the primary navigation method for screen reader users.

**6. Form inputs have associated labels.** Every `<input>`, `<select>`, and `<textarea>` needs a `<label>` that's programmatically associated via `for` and `id`, or by wrapping the input inside the label. Placeholder text is not a label.

**7. Videos have captions; audio has transcripts.** Pre-recorded video must have synchronized captions (WCAG A). Audio-only content needs a text transcript.

**8. No keyboard traps.** If you can tab into a modal, you must be able to tab out. Focus should be trapped within modals deliberately, with a close button that works.

These basics cover the majority of accessibility complaints. Get them right and you're ahead of most websites.

## Forms: the most common source of frustration

Forms are where accessibility failures hurt the most. A user who can't complete a form can't sign up, make a purchase, or contact you. Here's your form checklist:

- Every input has a visible label that's programmatically associated.
- Required fields are marked both visually (asterisk) and semantically (`required` attribute or `aria-required="true"`).
- Error messages are clear, specific, and announced by screen readers. Use `aria-describedby` to link the error message to the input.
- Error states are not communicated by color alone. Add an icon, text, or both.
- Form validation happens on submit, not on every keystroke (or if it does, it doesn't prevent focus or interrupt the user).
- Radio buttons and checkboxes are grouped with `<fieldset>` and `<legend>`.
- Select menus work with keyboard: arrow keys navigate options, Enter selects, Escape closes.
- Autocomplete attributes (`autocomplete="name"`, `email`, etc.) are set where appropriate so users can fill forms faster.
- Focus returns to the input that had an error after submit, or focus moves to the error summary.
- There's a way to skip repeated content (like navigation) and jump to the main content: a "Skip to main content" link.

Here's a quick example of an accessible text input with error:

```html
<label for="email">Email address</label>
<input
  type="email"
  id="email"
  name="email"
  required
  aria-describedby="email-error"
  aria-invalid="true"
/>
<p id="email-error" role="alert">Please enter a valid email address.</p>
```

The `aria-describedby` links the input to the error, and `role="alert"` ensures screen readers announce it immediately when it appears.

## Images and media: the alt text checklist

Alt text is simple in concept, nuanced in practice. Here's how to nail it:

- Informative images: describe the content and function (e.g., "Pie chart showing revenue by quarter").
- Decorative images: use `alt=""` (empty) so screen readers skip them.
- Images as links or buttons: describe the destination or action, not the image (e.g., "View cart" instead of "Shopping cart icon").
- Complex charts or diagrams: provide a long description nearby or via `aria-describedby`.
- Icons with adjacent text: if an icon is decorative and the text conveys the meaning, use `aria-hidden="true"` on the icon and skip the alt.

Screen readers announce images as "Image: [alt text]". So don't include "Image of" or "Picture of" in the alt—the screen reader already says that.

If you've been building components with [React Aria Components](/blog/react-aria-components), you know that accessible names and roles are often handled for you. For custom images, you still need to provide alt text.

## Keyboard navigation and focus management

Keyboard accessibility is the backbone of WCAG compliance. If a user can't navigate with Tab and Shift+Tab, they can't use your site.

- All interactive elements are reachable by Tab. This includes links, buttons, form fields, and custom widgets (sliders, accordions, tabs).
- Custom widgets have keyboard support that matches their pattern. For example, tabs use arrow keys to switch, Enter to activate. Accordions use Tab to move between headers, Enter/Space to expand/collapse.
- Focus is never lost. When a modal opens, focus moves to the modal. When it closes, focus returns to the element that triggered it.
- Skip links work: "Skip to main content" is the first focusable element on the page.
- Focus indicators are visible and have sufficient contrast. Don't use `outline: none` unless you provide a better indicator.

If you're building a custom select, autocomplete, or menu, the WAI-ARIA authoring practices provide the expected keyboard behavior. Our [WAI-ARIA authoring practices guide](/blog/wai-aria-authoring-practices) breaks down the patterns for common widgets.

## ARIA: use it sparingly and correctly

ARIA can make accessibility better—or much worse if misused. The first rule of ARIA: **don't use ARIA if a native HTML element does the job.**

- Use native `<button>`, `<a>`, `<input>`, `<select>`, `<dialog>` elements whenever possible. They have built-in accessibility.
- `aria-label` only works on elements with a role. Don't put it on a `<div>` without a role.
- `aria-hidden="true"` hides content from screen readers. Use it only for decorative or duplicated content.
- `aria-expanded` must reflect the actual state of a collapsible element.
- `aria-live="polite"` announces dynamic content changes. Use it for notifications, status updates, form results.
- Roles should match the element's behavior. Don't give a `<div>` `role="button"` unless you also implement Tab focus, Enter/Space activation, and the correct semantics.

If you're styling based on ARIA states (e.g., `[aria-expanded="true"]`), you can create accessible, stateful components without extra CSS classes. That's exactly what we covered in [CSS attribute selectors](/blog/css-attribute-selectors). The ARIA attribute serves double duty: it informs assistive tech and drives your styles.

## Color and contrast: the most common failure

Contrast failures are the most frequently cited WCAG violations. They're easy to check and easy to fix.

- Normal text (under 18pt): 4.5:1 contrast ratio.
- Large text (18pt+ or 14pt bold+): 3:1 contrast ratio.
- UI components (borders, icons, focus indicators): 3:1 against adjacent colors.
- Links in body text: 3:1 against surrounding text, plus another indicator (underline) on hover/focus.
- Placeholder text: 4.5:1 (though some browsers may not enforce this, it's still required).

Use the Chrome DevTools color picker or a tool like WebAIM's Contrast Checker. If a color combination fails, adjust the text color or background color until it passes.

Remember: `rgba(0,0,0,0.5)` on white is effectively gray. If you use opacity, compute the effective color before checking contrast.

## Mobile and responsive accessibility

WCAG applies to mobile web too. Small screens, touch targets, and viewport settings introduce additional considerations.

- Tap targets are at least 44×44 CSS pixels (WCAG 2.5.5 AAA) or at least 24×24 with adequate spacing (WCAG 2.5.8 AA).
- Pinch zoom is not disabled. Don't use `user-scalable=no` in the viewport meta tag.
- Content reflows to a single column without horizontal scrolling at 320px width.
- Touch gestures have alternatives (e.g., a carousel that swipes should also have buttons).
- No content is hidden behind overlays on small screens.
- Keyboard access works with mobile keyboard (no custom gestures required).

Many of the same principles apply: sufficient contrast, logical order, visible focus, and touch-friendly targets.

## Testing: you can't fix what you don't find

You can't audit accessibility by reading a checklist. You have to test. Here's a practical testing workflow:

**1. Run an automated checker.** Tools like axe (available as a browser extension or in CI) catch 30–50% of issues automatically. Run it on every page.

**2. Test with keyboard only.** Unplug your mouse. Try to complete every task on your site. Tab through forms, open modals, navigate menus. If you get stuck, users will too.

**3. Test with a screen reader.** NVDA (Windows) or VoiceOver (Mac) are free. Learn the basics: use heading navigation, form controls, and landmarks. This is the closest you'll get to the actual user experience.

**4. Check contrast ratios** with a tool like WebAIM's Contrast Checker or the DevTools color picker.

**5. Test on mobile.** Resize your browser, use DevTools device emulation, and test on a real phone if possible.

**6. Check your HTML semantics.** View the source. Are headings in order? Are labels associated with inputs? Are buttons actually `<button>` elements?

If you've implemented caching or dynamic content updates, test those too. A screen reader user should hear updates when content changes asynchronously. Our guide on [why modern websites feel slower](/blog/why-modern-websites-feel-slower) touches on how perceived performance affects accessibility—a page that loads instantly but is not announced to screen readers is still broken.

## A real story: the "invisible" button

A few months ago, I was auditing a client's checkout page. It had a "Remove item" button next to each product—a small X icon with no visible text. Visually, it was clear. Accessibly, it was a disaster.

The button was a `<span>` with an `onClick` handler. No role, no tabindex, no label. Screen readers saw nothing. Keyboard users couldn't reach it. The fix was two lines of HTML: change `<span>` to `<button>` and add an `aria-label="Remove item"`. That's it.

The client had no idea the button was invisible to 10% of their users. It wasn't malice; it was ignorance. A five-minute accessibility check would have caught it.

The lesson: run the checklist. Even the basics will catch issues that are invisible to sighted users but obvious to assistive technology.

## Wrapping up

This checklist isn't exhaustive—WCAG has 78 success criteria—but it covers the issues that cause the vast majority of real-world failures. If you can check every item on this list, you'll be ahead of 90% of websites.

Print it out. Stick it on your monitor. Use it as a pre-launch checklist. Run through it during code reviews. Make accessibility a habit, not an afterthought.

And if you want the full specification without the legal jargon, check out our [WCAG guidelines checklist](/blog/wcag-guidelines-checklist) for a plain-English summary of each criterion. The two posts work together: that one gives you the full list; this one gives you the actionable developer checklist.

---

_Want to make accessibility a core part of your development workflow? Red Surge Technology builds inclusive web experiences from the ground up. [Get in touch](/contact) to discuss your project._
