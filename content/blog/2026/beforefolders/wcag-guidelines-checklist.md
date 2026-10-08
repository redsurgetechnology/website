---
title: "WCAG Guidelines Checklist: The Complete A & AA Guide for 2026"
date: "2025-06-09T09:00:00.000-04:00"
excerpt: "A practical WCAG guidelines checklist covering every Level A and AA success criterion in WCAG 2.2. Learn what to test, how to test it, and how to build accessibility into your workflow."
cover_image: "/images/blog/wcag-guidelines-checklist/wcag-guidelines-checklist-blogindex.webp"
seo_title: "WCAG Guidelines Checklist: Complete A & AA Guide (2026)"
seo_description: "The complete WCAG 2.2 guidelines checklist for Level A and AA. Learn every success criterion, how to test it, plus tools, workflow tips, and a downloadable reference."
author_name: "Collin Stewart"
last_modified: 2026-10-08T09:00:00.000-04:00
tags:
  - accessibility
  - wcag
  - wcag checklist
  - web standards
  - compliance
  - a11y
category: "Accessibility"
reading_time: 22
featured: false
no_index: false
---

We put so much effort into making our designs look sleek and modern. We agonize over type scales, hover states, animation curves. And then we forget the most fundamental thing: making sure everyone can actually use what we built.

A few years back, I watched someone try to use one of my projects with a screen reader. They hit a form I'd been proud of — clean layout, subtle focus states, nice validation messages. But the labels weren't programmatically associated with the inputs. The error messages appeared visually but weren't announced. From my side, everything looked perfect. From theirs, the form was a wall of unlabeled text boxes that made no sense.

I've never forgotten that. It wasn't a bug I could see. It was a bug I could only see by using the product the way I hadn't been.

That's what a WCAG guidelines checklist is for. Not to satisfy a compliance audit. Not to avoid a lawsuit. To make sure the site you built actually works for the people who show up to use it — all of them.

This guide walks through the complete WCAG 2.2 Level A and AA checklist, why it matters, and how to weave accessibility into every phase of your workflow so it becomes a habit instead of a scramble before launch.

> **Want a fresh pair of eyes on your accessibility?** Red Surge Technology audits and rebuilds websites for small businesses across New Jersey. [Get in touch](/contact) for a free consultation.

---

## Table of contents

1. [What WCAG actually is (in plain English)](#what-wcag-actually-is-in-plain-english)
2. [Understanding WCAG levels: A, AA, and AAA](#understanding-wcag-levels-a-aa-and-aaa)
3. [Why a WCAG checklist belongs in your workflow](#why-a-wcag-checklist-belongs-in-your-workflow)
4. [The complete WCAG 2.2 Level A and AA checklist](#the-complete-wcag-22-level-a-and-aa-checklist)
5. [A story about what happens when accessibility slips](#a-story-about-what-happens-when-accessibility-slips)
6. [Building accessibility into every phase of your workflow](#building-accessibility-into-every-phase-of-your-workflow)
7. [Essential tools for WCAG testing and auditing](#essential-tools-for-wcag-testing-and-auditing)
8. [Keeping your checklist current as standards evolve](#keeping-your-checklist-current-as-standards-evolve)
9. [Frequently asked questions about WCAG guidelines](#frequently-asked-questions-about-wcag-guidelines)
10. [Making accessibility a habit, not a hurdle](#making-accessibility-a-habit-not-a-hurdle)

---

## What WCAG actually is (in plain English)

WCAG — the **Web Content Accessibility Guidelines** — is the internationally recognized standard for digital accessibility, published by the World Wide Web Consortium (W3C). It defines what "accessible" means in concrete, testable terms.

The current version is **WCAG 2.2**, published in October 2023. It builds on WCAG 2.1 by adding nine new success criteria focused on cognitive accessibility, low vision, and motor impairments. WCAG 3.0 is in active development but won't replace 2.2 for years.

When someone says a website "meets WCAG standards," they almost always mean **WCAG 2.2 Level AA**. That's the level most laws, procurement requirements, and auditors reference.

The guidelines are organized around four principles — often abbreviated **POUR**:

- **Perceivable** — content must be available to the senses (sight, hearing, touch)
- **Operable** — interface elements must work with keyboard, mouse, touch, or assistive tech
- **Understandable** — content and behavior must be predictable and clear
- **Robust** — content must work reliably with current and future assistive technologies

Every success criterion in WCAG fits under one of those four principles. That framework is useful because it gives you a mental model for accessibility that doesn't require memorizing the entire spec.

## Understanding WCAG levels: A, AA, and AAA

WCAG is organized into three conformance levels. Think of them like building code requirements for a physical space: Level A is the fire exit — non-negotiable and life-saving. Level AA is the wheelchair ramp — expected and widely referenced. Level AAA is the heated sidewalk — admirable, but not always practical.

### Level A — the essential foundation

Level A criteria are the minimum bar for accessibility. Without these, people with certain disabilities literally cannot use your website. These aren't "nice to have" — they're "the door is locked" issues.

At Level A, you must:

- Provide text alternatives for all non-text content
- Ensure all functionality is available through a keyboard
- Never use content that flashes more than three times per second
- Provide labels for form inputs
- Give each page a meaningful title

Miss any Level A criterion and you're actively excluding users.

### Level AA — the standard you should target

Level AA is the conformance level referenced by most accessibility laws. When a website says it's "WCAG compliant," it almost always means Level AA.

Level AA builds on Level A by adding requirements that address the most common and impactful barriers:

- Minimum color contrast of 4.5:1 for normal text
- Captions for live audio content
- Consistent navigation across pages
- Error messages that identify the problem and suggest a fix
- A visible focus indicator for keyboard users

> **Practical target:** If you're building or renovating a website today, aim for WCAG 2.2 Level AA. It's the standard that legal requirements reference, accessibility auditors check against, and users actually need. Level AAA is aspirational — focus your energy on nailing AA first.

### Level AAA — the highest standard

Level AAA criteria represent the gold standard: sign language interpretation for prerecorded audio, lower secondary reading level for all text, extended audio descriptions. While admirable, many AAA criteria are impractical for all content in all contexts. Most organizations target AA compliance and selectively implement AAA where feasible.

## Why a WCAG checklist belongs in your workflow

When you're juggling stakeholder meetings, design revisions, development sprints, and that surprise "Can we launch a week early?" email, accessibility requirements slip through the cracks. A checklist isn't just helpful — it's a safety net.

### The human impact

Behind every guideline is a real person trying to accomplish something. Someone using a screen reader and hitting a button that wasn't coded for keyboard focus. Someone with low vision squinting at light grey text. Someone who can't use a mouse struggling with a dropdown that only responds to hover. Every checklist item you verify is a barrier removed for a real person.

### Legal protection

ADA lawsuits related to website accessibility have increased dramatically in recent years, and courts have consistently ruled that websites qualify as places of public accommodation. Thousands of demand letters and lawsuits are filed annually in the US alone. The **European Accessibility Act** came into force in June 2025, expanding requirements across the EU. A documented checklist process demonstrates good-faith effort and provides real legal protection.

### SEO benefits

Many accessibility best practices directly overlap with search engine optimization:

- Descriptive **alt text** helps Google understand your images
- Proper **heading hierarchy** helps search engines parse content structure
- Descriptive **link text** provides contextual relevance signals
- Fast, clean, **semantic HTML** is exactly what search engines reward

Building for accessibility and building for SEO are largely the same work. If you want to go deeper on the performance side, our guide on [improving website page speed for SEO](/blog/improve-website-page-speed-seo-nj) covers the Core Web Vitals angle.

## The complete WCAG 2.2 Level A and AA checklist

Below is a comprehensive breakdown of every criterion you need to meet for WCAG 2.2 Level AA compliance, organized by POUR category. Each item includes the WCAG success criterion reference, what it requires, and how to test for it.

### Perceivable: making content available to the senses

#### 1.1.1 Non-text Content (Level A)

All images, icons, charts, and other non-text content must have a text alternative conveying the same purpose. For decorative images, use an empty alt attribute (`alt=""`) so screen readers skip them. For complex images like charts, provide a longer description nearby or linked.

**How to test:** Run an automated scan with WAVE or axe. Then manually review every image on key pages. Ask: if I couldn't see this image, would the alt text give me the same information?

#### 1.2.1 Audio-only and Video-only (Level A)

For audio-only content (podcasts, audio clips), provide a text transcript. For video-only content, provide either a text transcript or an audio track describing the visual content.

**How to test:** Check that every audio and video asset has an associated transcript or audio description.

#### 1.2.2 Captions (Prerecorded) (Level A)

All prerecorded video with audio must have synchronized captions. Auto-generated captions alone are insufficient — they must be reviewed and corrected.

**How to test:** Enable captions on every video and verify they match spoken content, identify speakers, and include relevant non-speech sounds.

#### 1.2.3 Audio Description or Media Alternative (Level A)

For prerecorded video, provide either an audio description track narrating important visual information, or a text alternative combining the transcript with descriptions of visual content.

**How to test:** Watch each video without looking at the screen. Can you understand everything important from the audio description or transcript alone?

#### 1.2.4 Captions (Live) (Level AA)

Live video broadcasts with audio must have real-time captions. This is particularly relevant for webinars, live streams, and virtual events.

**How to test:** Schedule a live test broadcast with your captioning service and verify captions appear in real time with acceptable accuracy.

#### 1.2.5 Audio Description (Prerecorded) (Level AA)

All prerecorded video content must include an audio description track narrating important visual details during natural pauses in the audio.

**How to test:** Play the video with the audio description track enabled. Verify that scene changes, on-screen text, facial expressions, and key actions are described.

#### 1.3.1 Info and Relationships (Level A)

Information, structure, and relationships conveyed through visual presentation must be programmatically available. This covers heading hierarchy, list markup, table headers, form label associations, and semantic HTML.

**How to test:** Inspect your HTML. Are headings using `h1`–`h6` correctly? Are lists in `ul` or `ol` elements? Do form inputs have properly associated `label` elements?

#### 1.3.2 Meaningful Sequence (Level A)

When the reading sequence affects meaning, the correct reading order must be programmatically determinable. DOM order should match visual reading order.

**How to test:** Disable CSS and read the raw content. Does it flow logically? Screen readers follow DOM order, not visual position.

#### 1.3.3 Sensory Characteristics (Level A)

Instructions must not rely solely on sensory characteristics like shape, color, size, visual location, orientation, or sound. "Click the round button" or "Press the red button" fails this criterion.

**How to test:** Review all instructional text. If any instruction references only visual or auditory cues, add text labels.

#### 1.3.4 Orientation (Level AA)

Content must not restrict its view and operation to a single display orientation unless a specific orientation is essential.

**How to test:** Rotate your device between portrait and landscape. Does content reflow correctly? Are all functions still available?

#### 1.3.5 Identify Input Purpose (Level AA)

For input fields that collect common user information, the purpose of each field must be programmatically identifiable using HTML autocomplete attributes.

**How to test:** Inspect form inputs and verify that appropriate `autocomplete` attributes are present for common fields.

#### 1.4.1 Use of Color (Level A)

Color must not be the only visual means of conveying information or distinguishing an element. Error states, required fields, and links must have additional indicators beyond color.

**How to test:** View your page in grayscale. Can you still identify links, error messages, and required fields?

#### 1.4.2 Audio Control (Level A)

If audio plays automatically for more than three seconds, there must be a mechanism to pause, stop, or control the volume independently from the system volume.

**How to test:** Check any page with auto-playing audio. Is there a visible, accessible control to stop or adjust it?

#### 1.4.3 Contrast (Minimum) (Level AA)

Text and images of text must have a contrast ratio of at least 4.5:1 against their background, except for large text (18pt+ or 14pt+ bold), which requires 3:1. Logos and decorative text are exempt.

**How to test:** Use the WebAIM Contrast Checker or axe DevTools to test every text/background combination in your design system. Pay special attention to grey text on light backgrounds — the most common failure.

#### 1.4.4 Resize Text (Level AA)

Users must be able to resize text up to 200% without loss of content or functionality, and without horizontal scrolling.

**How to test:** Set your browser zoom to 200%. Does all content remain readable and functional? Use relative units (rem, em, %) rather than fixed pixels.

#### 1.4.5 Images of Text (Level AA)

Text should not be embedded in images unless the visual presentation is essential (like a logo) or the text is purely decorative. Use styled HTML text instead.

**How to test:** Scan your site for images containing text. Can any be replaced with styled HTML text?

#### 1.4.10 Reflow (Level AA)

Content must be viewable at 320px width without horizontal scrolling, and without requiring two-dimensional scrolling for vertical content.

**How to test:** Resize your browser to 320px wide or test on a small mobile device. Can you read and interact with everything?

#### 1.4.11 Non-text Contrast (Level AA)

UI components (buttons, form fields, icons) and graphical objects must have a contrast ratio of at least 3:1 against adjacent colors. This includes focus indicators, input borders, and chart elements.

**How to test:** Check button borders, input field boundaries, and icon colors against their backgrounds.

#### 1.4.12 Text Spacing (Level AA)

Users must be able to override text spacing. When line height is 1.5, paragraph spacing is 2em, letter spacing is 0.12em, and word spacing is 0.16em, no content or functionality should be lost.

**How to test:** Use a browser extension to apply text spacing overrides. Verify all text remains visible and no elements overlap or clip.

#### 1.4.13 Content on Hover or Focus (Level AA)

Content that appears on hover or focus (tooltips, dropdowns, popovers) must be dismissible, hoverable, and persistent until dismissed.

**How to test:** Trigger every hover/focus-revealed element. Can you dismiss it with Escape? Can you move your mouse to the revealed content without it disappearing?

### Operable: making the interface work for everyone

#### 2.1.1 Keyboard (Level A)

All functionality must be operable through a keyboard interface without requiring specific timings for individual keystrokes.

**How to test:** Put your mouse aside. Use only Tab, Shift+Tab, Enter, Space, and arrow keys to navigate and operate every interactive element. Can you do everything?

#### 2.1.2 No Keyboard Trap (Level A)

Keyboard focus must never become trapped in a component. If focus can move into a component, it must be movable away using only the keyboard.

**How to test:** Tab into every modal, dropdown, autocomplete, and rich text editor. Can you always Tab out? Test the Escape key as a common escape mechanism.

#### 2.1.4 Character Key Shortcuts (Level A)

Single-character keyboard shortcuts must be remappable, able to be turned off, or only active when the relevant component has focus.

**How to test:** Identify any single-key shortcuts. Verify they can be disabled, remapped, or are scoped to focused components.

#### 2.2.1 Timing Adjustable (Level A)

For any time limit set by the content, users must be able to turn it off, adjust it to at least ten times the default, or be warned and given at least 20 seconds to extend.

**How to test:** Identify any session timeouts, quiz timers, or auto-advancing carousels. Can the user control or disable them?

#### 2.2.2 Pause, Stop, Hide (Level A)

For any moving, blinking, scrolling, or auto-updating content that starts automatically and lasts more than five seconds, there must be a mechanism to pause, stop, or hide it.

**How to test:** Identify auto-playing carousels, animated backgrounds, live chat widgets, and auto-refreshing content. Can each be paused or hidden?

#### 2.3.1 Three Flashes or Below Threshold (Level A)

No page content may flash more than three times in any one-second period.

**How to test:** Review animated or video content. Use a flash analysis tool if uncertain.

#### 2.4.1 Bypass Blocks (Level A)

Users must be able to bypass repeated blocks of content (like navigation menus). Provide a "Skip to main content" link at the top of each page.

**How to test:** Tab to the first focusable element on the page. Is there a visible skip link? Does it work correctly?

#### 2.4.2 Page Titled (Level A)

Each page must have a descriptive, unique `<title>` element that identifies its topic or purpose.

**How to test:** Check every page's browser tab title. Is it descriptive and unique?

#### 2.4.3 Focus Order (Level A)

Focusable components must receive focus in an order that preserves meaning and operability. The tab order should follow visual reading order.

**How to test:** Tab through every interactive element. Does the focus order follow logical reading order?

#### 2.4.4 Link Purpose (In Context) (Level A)

The purpose of each link must be determinable from the link text alone or with its programmatically determined context. Avoid "click here" and "read more" links.

**How to test:** Review all links. If you read each link text out of context, would you know where it leads?

#### 2.4.5 Multiple Ways (Level AA)

Users must be able to locate pages in more than one way, unless the page is a step in a process.

**How to test:** Can users reach any page through at least two different methods (search + navigation, for example)?

#### 2.4.6 Headings and Labels (Level AA)

Headings and labels must describe the topic or purpose of the content they introduce.

**How to test:** Read every heading and form label. Does each one clearly describe what follows?

#### 2.4.7 Focus Visible (Level AA)

Any keyboard-operable user interface must have a visible focus indicator.

**How to test:** Tab through the entire page. Is the focus indicator clearly visible at every step? Never use `outline: none` without a visible alternative.

#### 2.4.11 Focus Not Obscured (Level AA)

When a component receives keyboard focus, it must not be entirely hidden by other content.

**How to test:** Tab through your page, especially through sticky headers, fixed footers, and modals. Is the focused element always visible?

#### 2.5.1 Pointer Gestures (Level A)

Any functionality using multipoint or path-based gestures must also be operable with a single pointer without a path-based gesture, unless the multipoint gesture is essential.

**How to test:** Identify gesture-dependent interactions (carousels, maps, sliders). Can they be operated with simple taps and clicks instead?

#### 2.5.2 Pointer Cancellation (Level A)

Functions operated by a single pointer must use the up-event for execution, provide an abort or undo mechanism, or ensure the down-event is not used for execution.

**How to test:** Click and hold on buttons, then drag away before releasing. Does the action cancel rather than execute?

#### 2.5.3 Label in Name (Level A)

For UI components with visible text labels, the accessible name must include the visible label text.

**How to test:** Inspect the accessible name of every labeled component. Does it contain the visible label text?

#### 2.5.4 Motion Actuation (Level A)

Functions operated by device motion must also be operable through conventional UI controls, and users must be able to disable motion actuation.

**How to test:** Identify any motion-triggered features. Is there an alternative control method and a way to disable motion?

#### 2.5.7 Dragging Movements (Level AA)

Any functionality that requires dragging must also be achievable by single-pointer actions without dragging.

**How to test:** For every drag-and-drop interface, can the same action be completed with simple clicks?

#### 2.5.8 Target Size (Minimum) (Level AA)

Interactive elements must have a target size of at least 24 by 24 CSS pixels, with some exceptions.

**How to test:** Measure the clickable area of every button, icon, and interactive element. Is it at least 24x24px?

### Understandable: making content clear and predictable

#### 3.1.1 Language of Page (Level A)

The default human language of each page must be programmatically determinable using the `lang` attribute on the `<html>` element.

**How to test:** Inspect the `html` element. Is `lang` set to the correct language code (e.g., `lang="en"`)?

#### 3.1.2 Language of Parts (Level AA)

If a page contains content in a language different from the default, that content must have its language programmatically identified.

**How to test:** Search for passages in a different language. Do they have a `lang` attribute?

#### 3.2.1 On Focus (Level A)

When a component receives focus, it must not initiate a change of context.

**How to test:** Tab through every element. Does anything unexpected happen when an element receives focus?

#### 3.2.2 On Input (Level A)

Changing a form control's setting must not automatically cause a change of context unless the user has been advised in advance.

**How to test:** Interact with every form control and filter. Does changing a value trigger an unexpected page change?

#### 3.2.3 Consistent Navigation (Level AA)

Navigation mechanisms repeated across multiple pages must appear in the same relative order each time.

**How to test:** Compare navigation across different pages. Is the order and structure consistent?

#### 3.2.4 Consistent Identification (Level AA)

Components with the same functionality across pages must be identified consistently.

**How to test:** Compare icons, button labels, and form field names across pages. Are functionally identical elements labeled consistently?

#### 3.2.6 Consistent Help (Level A)

If help mechanisms are repeated on multiple pages, they must appear in the same relative order.

**How to test:** Identify all help mechanisms. Do they appear in a consistent location?

#### 3.3.1 Error Identification (Level A)

When an input error is automatically detected, the error must be described in text and the item in error must be identified.

**How to test:** Submit every form with invalid data. Is each error clearly described? Does the user know which field has the error and how to fix it?

#### 3.3.2 Labels or Instructions (Level A)

All content requiring user input must have labels or instructions.

**How to test:** Review every form. Does every field have a visible, persistent label? Are required fields clearly marked?

#### 3.3.3 Error Suggestion (Level AA)

When an input error is detected and correction suggestions are known, the suggestions must be provided to the user.

**How to test:** For every validation error, is there a helpful suggestion? "Invalid email" should be "Please enter an email with an @ symbol, like name@example.com."

#### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)

For forms that submit legal commitments, financial transactions, or modify user data, submissions must be reversible, checked for errors, or confirmed before finalizing.

**How to test:** Identify forms that commit users to legal or financial actions. Is there a review/confirm/cancel step before final submission?

#### 3.3.7 Accessible Authentication (Level AA)

Authentication processes must not rely on cognitive function tests unless an alternative is provided. Password managers and "forgot password" flows should be supported.

**How to test:** Test your login flow. Can users paste passwords? Do password managers work? Is there a password recovery option?

### Robust: ensuring compatibility with assistive technology

#### 4.1.2 Name, Role, Value (Level A)

For all UI components, the name, role, and value must be programmatically determinable. Custom widgets must expose proper semantics through native HTML or ARIA.

**How to test:** Use a screen reader or browser accessibility inspector to verify every interactive element has a proper accessible name, role, and current state.

#### 4.1.3 Status Messages (Level AA)

Status messages that don't receive focus must be announced to screen reader users without interrupting their current task. Use `role="status"`, `role="alert"`, or `aria-live` regions appropriately.

**How to test:** Trigger status messages (form submission confirmation, "item added to cart," search results count). Are they announced without requiring focus movement?

## A story about what happens when accessibility slips

Last November, I was helping a small arts nonprofit set up a virtual holiday craft fair — cozy tutorials, live music performances, a global audience tuning in from different time zones. We prepped everything meticulously: promotional emails, social media posts, downloadable ornament templates, and what I thought was a solid captioning setup for the live segments.

The event launched smoothly. The first performer strummed their guitar, the chat filled with holiday emojis, everything looked great — until the live craft demonstration began. The captioning feed, which was supposed to switch to identify the new speaker and describe the step-by-step folding technique, instead stubbornly displayed the previous performer's name and lyrics throughout the entire 25-minute craft segment. Viewers wrote in the chat: "I can't follow along." "The captions are from the last session." "Is there a transcript somewhere?"

I felt a wave of embarrassment — but also clarity. The automated captioning service we relied on was technically functional, but nobody had tested it with a live handoff between segments. The tool was fine. Our process was the failure point. We'd checked the box for "captions provided" without verifying that they were accurate, timely, and appropriate for each segment.

From that day forward, every live event I'm involved with includes a 15-minute dry run with a volunteer reading at different speeds and switching between speakers. We test the caption handoff, verify speaker identification, and confirm that non-verbal sounds appear correctly. That small investment of time has caught issues before they affected real viewers at every event since.

The lesson: **testing under real conditions matters more than checking boxes on a list.** Accessibility is an ongoing conversation with your users — not a certification you earn once and frame on the wall.

## Building accessibility into every phase of your workflow

The most effective accessibility programs don't treat compliance as a separate phase or a pre-launch audit. They weave accessibility thinking into every stage of the project lifecycle.

### Planning phase

Kick off every project by explicitly defining which WCAG level you're targeting. Write it into your project brief, acceptance criteria, and definition of done. When stakeholders ask "Why does this cost more?" or "Why is this taking longer?", having a documented accessibility standard provides a clear, defensible answer. It also ensures designers, developers, content creators, and QA testers are all working toward the same goal.

### Design phase

Accessibility decisions made during design prevent exponentially more rework than fixes made during development. Sketch high-contrast wireframes from the start. Annotate mockups with alt text descriptions for key images. Define a color palette that meets AA contrast requirements before a single line of CSS is written. Document heading hierarchy in your wireframes. Specify focus indicator styles alongside hover and active states. Design the keyboard interaction pattern for every custom component before a developer starts building it.

A practical habit: run every new color combination through a contrast checker before adding it to your design system. The five minutes this takes saves hours of CSS fixes later.

### Development phase

Run automated accessibility scans at the end of every sprint — not just before launch. Tools like axe DevTools, Lighthouse, and Pa11y can be integrated into your CI/CD pipeline to catch regressions automatically. But automated tools catch only 30–40% of issues. Manual testing is irreplaceable: tab through every new feature with a keyboard, test custom components with a screen reader (VoiceOver on Mac, NVDA on Windows — both free), and verify that error messages and status updates are announced correctly.

Write semantic HTML from the start. Use `<button>` elements for buttons, not `<div>` elements with click handlers. Associate every form input with a label. Structure pages with landmark elements like `<header>`, `<nav>`, `<main>`, and `<footer>`. Most accessibility issues that make it to production trace back to basic HTML choices made early in development.

### Launch and beyond

Before pressing "Go live," perform a final manual pass against your WCAG checklist. Document any remaining issues, assign owners, and set deadlines for resolution. Schedule a follow-up audit one week post-launch to catch issues that only surface under real traffic. Accessibility isn't a launch-day checkbox — it's a commitment to continuous improvement.

> **Pro tip:** Create an accessibility statement page on your site. List your target conformance level, known issues, and contact information for users who encounter barriers. This demonstrates good faith, provides a feedback channel, and is referenced in some accessibility regulations.

## Essential tools for WCAG testing and auditing

You don't need an expensive enterprise suite to test for accessibility. Here are the tools I use regularly — all with free tiers sufficient for most projects.

- **[axe DevTools](https://www.deque.com/axe/)** — Browser extension and CI integration from Deque Systems. Catches roughly 30–40% of WCAG issues automatically, integrates into Chrome DevTools, and provides clear explanations and fix suggestions.
- **[WAVE Evaluation Tool](https://wave.webaim.org/)** — From WebAIM. Provides visual overlays directly on your page showing errors, alerts, features, structural elements, and contrast issues. Excellent for quick visual audits and for explaining issues to non-technical stakeholders.
- **Lighthouse** — Built into Chrome DevTools. Runs an accessibility audit alongside performance, SEO, and best-practices checks.
- **Colour Contrast Analyzer** — A desktop application (from TPGi) that lets you sample colors from anywhere on screen and instantly checks AA and AAA contrast ratios. Invaluable during design reviews.
- **NVDA (Windows) and VoiceOver (Mac)** — Free screen readers for real-world testing. You don't need to become an expert user — just learn basic navigation and verify your pages make sense non-visually.
- **Pa11y** — Command-line tool that can be integrated into build processes and CI/CD pipelines for automated regression testing.

The key insight: **no single tool catches everything.** Automated tools find the objective, programmatically detectable issues. Manual keyboard and screen reader testing catches the subjective, experience-level issues. Use both. If you want to see how this fits into a broader performance and UX strategy, our guide on [mobile-first web design](/blog/mobile-first-web-design-guide-2026) covers the overlap between usability and accessibility.

## Keeping your checklist current as standards evolve

Accessibility standards aren't frozen in time. WCAG 2.2 was published in October 2023, adding nine new success criteria. WCAG 3.0 is under active development and will represent a significant restructuring when finalized.

To stay current without constant fire drills:

- **Subscribe to W3C WAI announcements.** The Web Accessibility Initiative mailing list provides early notice of draft guidelines, public comment periods, and finalized standards.
- **Schedule quarterly mini-audits** rather than waiting for an annual comprehensive review. A 90-minute quarterly check catches regressions and keeps the team engaged with accessibility thinking.
- **Host short, focused training sessions.** A 30-minute "Keyboard Testing 101" brown bag lunch or a "Captioning Quick Tips" coffee hour keeps accessibility skills fresh.
- **Review your checklist against the latest WCAG version annually.** When new criteria are added, assess which apply to your site and add them with testing procedures.

If you want a broader primer on the fundamentals, our post on [web accessibility for beginners](/blog/web-accessibility-for-beginners) walks through the concepts from the ground up.

## Frequently Asked Questions

### What is a WCAG guidelines checklist?

A WCAG guidelines checklist is a structured list of the success criteria defined in the Web Content Accessibility Guidelines, organized so you can systematically verify each one against your website. It typically covers the four POUR principles (Perceivable, Operable, Understandable, Robust) and is filtered by conformance level — usually Level A and AA, since AA is the standard most laws reference.

### What's the difference between WCAG A, AA, and AAA?

Level A is the minimum bar — without these criteria, some users literally cannot use your website. Level AA is the standard most laws and regulations reference, and it's what most organizations target. Level AAA is the gold standard — aspirational, sometimes impractical for all content types, and rarely required. Most teams should target AA and selectively implement AAA where feasible.

### Do I need to meet every single WCAG criterion?

For Level AA conformance, yes — all Level A and Level AA criteria must be met. That said, WCAG includes exceptions for some criteria (essential exceptions, decorative content, logos), and perfect compliance is genuinely difficult. What matters most is documented, good-faith effort: regular audits, clear processes, and a roadmap for addressing known issues.

### How long does a WCAG audit take?

A thorough WCAG 2.2 AA audit typically takes 10 to 40 hours depending on the size and complexity of your site. A small marketing site with 5–10 pages can be audited in about 10 hours. A large application with complex interactive components and authentication flows can take 40+ hours. Automated scans take minutes; manual keyboard and screen reader testing is where most of the time goes.

### What's the difference between WCAG 2.1 and WCAG 2.2?

WCAG 2.2, published in October 2023, builds on WCAG 2.1 by adding nine new success criteria and removing one (4.1.1 Parsing, which became redundant as modern browsers handle malformed HTML gracefully). The new criteria in 2.2 primarily improve accessibility for users with cognitive disabilities, low vision, and motor impairments. If your site already meets WCAG 2.1 AA, upgrading to 2.2 AA requires addressing the new criteria.

### What's the difference between WebAIM's checklist and the W3C's checklist?

The W3C's WCAG specification is the authoritative standard — dense, comprehensive, and organized by success criterion. WebAIM (Web Accessibility In Mind) provides a more approachable, plain-language version that translates each criterion into practical terms with real-world examples. Many teams use both: W3C for authoritative reference and WebAIM for practical implementation guidance.

### Is WCAG compliance required by law?

In the US, the ADA has been increasingly applied to websites by courts, and Section 508 applies directly to federal agencies and their contractors. The EU's European Accessibility Act (EAA) came into force in June 2025. Enforcement varies, but the trend is clear: accessibility requirements are expanding, not shrinking. If you have specific legal questions about your obligations, consult an attorney familiar with digital accessibility law.

### How often should I run an accessibility audit?

At minimum, annually. For active products with frequent releases, quarterly or continuous automated testing is better. Run a manual audit after any significant redesign, new feature launch, or major dependency upgrade. Automated scans should run on every commit as part of your CI pipeline.

### Does WCAG compliance improve SEO?

Yes, significantly. Many accessibility best practices directly overlap with SEO: descriptive alt text helps Google understand images, semantic HTML helps search engines parse structure, descriptive link text provides contextual signals, and fast, clean markup improves Core Web Vitals. Building for accessibility and building for SEO are largely the same work.

### What are the most commonly failed WCAG criteria?

Based on WebAIM's annual analysis of the top one million homepages, the most common failures are low color contrast, missing image alt text, missing form labels, empty links, missing document language, and missing or duplicate page titles. Together, these account for the vast majority of detected issues — and most are straightforward to fix.

## Making accessibility a habit, not a hurdle

Accessibility isn't a trend, a marketing checkbox, or a legal liability to manage. It's a commitment to building digital spaces that work for everyone who arrives at them — regardless of how they perceive, navigate, or interact with the web.

A robust WCAG guidelines checklist, used consistently throughout your workflow, transforms accessibility from an overwhelming abstract requirement into a concrete set of achievable practices. It builds empathy into your process by reminding you that behind every criterion is a real person trying to accomplish something on your site. It shields you from legal exposure by documenting good-faith effort. And it sweetens your SEO by producing cleaner, more semantic, more usable code.

Take this checklist. Tuck it into your next project charter. Set a recurring calendar reminder for your quarterly accessibility review. And the next time you're about to launch, run through that keyboard test one more time.

If you found this useful, our guides on [web accessibility for beginners](/blog/web-accessibility-for-beginners), [mobile-first web design](/blog/mobile-first-web-design-guide-2026), and [CSS Grid for responsive layouts](/blog/css-grid-layout-responsive-web-design) are natural next reads. And if you'd like help auditing or improving your site's accessibility, [get in touch](/contact) — we're happy to help.