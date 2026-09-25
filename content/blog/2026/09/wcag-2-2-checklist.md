---
title: "WCAG 2.2 Checklist: The Complete Level AA Guide for Developers in 2026"
date: "2026-09-25T10:00:00.000Z"
excerpt: "A practical WCAG 2.2 checklist covering all 55 Level A and AA success criteria. Includes the six new criteria, common failures, testing methods, and implementation guidance."
cover_image: "/images/blog/uploads/wcag-2-2-checklist.webp"
seo_title: "WCAG 2.2 Checklist: Complete Level AA Guide for Developers 2026"
seo_description: "Your complete WCAG 2.2 Level AA checklist. Covers all 55 success criteria, the six new 2.2 additions, common failures, testing methods, and practical developer guidance."
author_name: "Collin Stewart"
tags:
  - Accessibility
  - WCAG
  - WCAG 2.2
  - Web Development
  - Compliance
category: "Web Development"
reading_time: 16
featured: false
no_index: false
---

WCAG 2.2 has been the current standard since October 2023. It's been adopted by legal frameworks, procurement requirements, and accessibility policies around the world. And yet, many teams are still working from WCAG 2.1 checklists—or worse, from memory and habit.

The difference matters. WCAG 2.2 added nine new success criteria and retired one. Two of the new criteria sit at Level AA, which means they're part of the practical compliance target for most organizations. If you're claiming WCAG 2.2 AA conformance but haven't updated your checklist, you're likely missing requirements that affect real users.

This guide is a practical, developer-focused WCAG 2.2 checklist. We'll cover the structure of the standard, walk through all 55 Level A and AA success criteria, highlight the six new additions from 2.2, and provide concrete guidance for testing and implementation. If you've read our [WCAG checklist for web developers](/blog/wcag-checklist-for-web-developers), you have the developer-focused basics. This post is the updated, 2.2-specific version.

## What Is WCAG 2.2 and Why It Matters

WCAG 2.2 is the third update to the Web Content Accessibility Guidelines, following 2.0 (2008) and 2.1 (2018). It was published as a W3C Recommendation on October 5, 2023. Like its predecessors, it organizes accessibility requirements under four principles—Perceivable, Operable, Understandable, Robust—broken into testable success criteria at Levels A, AA, and AAA.

The key point for compliance: WCAG 2.2 is fully backwards compatible. If you conform to 2.2 AA, you automatically satisfy every regulation that points at 2.1 or 2.0. There's no downside to targeting the latest version.

WCAG 2.2 added nine new success criteria and removed one (4.1.1 Parsing, which became obsolete as browsers improved their handling of malformed markup). The new criteria focus on three audiences that earlier versions served less well: people with cognitive and learning disabilities, people with motor disabilities, and sighted keyboard users.

If you're building a checklist for a compliance audit, the magic number is 55. A Level AA conformance claim in WCAG 2.2 means passing all 55 Level A and AA success criteria—50 inherited from 2.1 plus five net new from 2.2 (nine added, one retired at Level A).

## The Four POUR Principles

WCAG is organized around four principles. Every success criterion belongs to one of them. Understanding the principles helps you reason about accessibility even when you don't remember the specific criteria.

**Perceivable.** Information and user interface components must be presentable to users in ways they can perceive. This covers text alternatives, captions, adaptable content, and distinguishable content.

**Operable.** User interface components and navigation must be operable. This covers keyboard accessibility, timing, seizures, and navigability.

**Understandable.** Information and the operation of the user interface must be understandable. This covers readability, predictability, and input assistance.

**Robust.** Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies. This covers compatibility and proper use of markup.

## WCAG 2.2 Level AA Checklist: Perceivable

The Perceivable principle covers content that users can perceive through sight, hearing, or touch.

### 1.1 Text Alternatives

**1.1.1 Non-text Content (A).** All non-text content has a text alternative that serves the equivalent purpose. Images have appropriate alt text. Decorative images use empty alt (`alt=""`). Form image buttons have descriptive values. Complex images (charts, diagrams) have extended descriptions.

### 1.2 Time-based Media

**1.2.1 Audio-only and Video-only (Prerecorded) (A).** Provide a transcript for audio-only content. Provide either a transcript or audio description for video-only content.

**1.2.2 Captions (Prerecorded) (A).** Provide synchronized captions for all prerecorded video with audio.

**1.2.3 Audio Description or Media Alternative (Prerecorded) (A).** Provide an audio description or a full text alternative for prerecorded video.

**1.2.4 Captions (Live) (AA).** Provide real-time captions for live audio content.

**1.2.5 Audio Description (Prerecorded) (AA).** Provide audio description for prerecorded video content.

### 1.3 Adaptable

**1.3.1 Info and Relationships (A).** Information, structure, and relationships conveyed through presentation are also available programmatically or in text. Use proper headings, lists, tables, and form labels.

**1.3.2 Meaningful Sequence (A).** When the sequence of content affects meaning, the correct reading sequence is programmatically determinable.

**1.3.3 Sensory Characteristics (A).** Instructions don't rely solely on sensory characteristics like shape, color, size, visual location, orientation, or sound.

**1.3.4 Orientation (AA).** Content doesn't restrict its view and operation to a single display orientation unless essential.

**1.3.5 Identify Input Purpose (AA).** The purpose of each input field collecting user information is programmatically determinable using autocomplete attributes.

### 1.4 Distinguishable

**1.4.1 Use of Color (A).** Color isn't used as the only visual means of conveying information.

**1.4.2 Audio Control (A).** If audio plays automatically for more than three seconds, provide a mechanism to pause, stop, or control volume.

**1.4.3 Contrast (Minimum) (AA).** Text and images of text have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.

**1.4.4 Resize Text (AA).** Text can be resized up to 200% without loss of content or functionality.

**1.4.5 Images of Text (AA).** Use real text instead of images of text, except where essential or customizable.

**1.4.10 Reflow (AA).** Content reflows to a single column without horizontal scrolling at 320 CSS pixels width, except for content requiring two-dimensional layout.

**1.4.11 Non-text Contrast (AA).** UI components and graphical objects have a contrast ratio of at least 3:1 against adjacent colors.

**1.4.12 Text Spacing (AA).** No loss of content or functionality when users adjust line height, paragraph spacing, letter spacing, and word spacing.

**1.4.13 Content on Hover or Focus (AA).** Hover or focus content is dismissible, hoverable, and persistent.

## WCAG 2.2 Level AA Checklist: Operable

The Operable principle covers interface components, navigation, and interaction.

### 2.1 Keyboard Accessible

**2.1.1 Keyboard (A).** All functionality is available from a keyboard.

**2.1.2 No Keyboard Trap (A).** Keyboard focus can be moved away from any component using standard keyboard mechanisms.

**2.1.4 Character Key Shortcuts (A).** If single-character keyboard shortcuts are implemented, users can turn them off, remap them, or they're only active on focus.

### 2.2 Enough Time

**2.2.1 Timing Adjustable (A).** Users can turn off, adjust, or extend time limits.

**2.2.2 Pause, Stop, Hide (A).** Users can pause, stop, or hide moving, blinking, or auto-updating content.

### 2.3 Seizures and Physical Reactions

**2.3.1 Three Flashes or Below Threshold (A).** Content doesn't flash more than three times per second.

### 2.4 Navigable

**2.4.1 Bypass Blocks (A).** Provide a mechanism to skip repeated content (skip links, landmarks, headings).

**2.4.2 Page Titled (A).** Pages have descriptive titles.

**2.4.3 Focus Order (A).** Focusable components receive focus in an order that preserves meaning and operability.

**2.4.4 Link Purpose (In Context) (A).** The purpose of each link is determinable from the link text or its context.

**2.4.5 Multiple Ways (AA).** More than one way exists to locate a web page within a set of pages (search, sitemap, navigation).

**2.4.6 Headings and Labels (AA).** Headings and labels describe topic or purpose.

**2.4.7 Focus Visible (AA).** Keyboard focus indicator is visible.

**2.4.11 Focus Not Obscured (Minimum) (AA)** ⭐ NEW.** The focused element is not entirely hidden by other content.

### 2.5 Input Modalities

**2.5.1 Pointer Gestures (A).** Multipoint or path-based gestures have a single-pointer alternative.

**2.5.2 Pointer Cancellation (A).** Functions triggered by pointer down can be cancelled or undone.

**2.5.3 Label in Name (A).** Accessible name contains the visible label text.

**2.5.4 Motion Actuation (A).** Functionality operated by device motion has a UI alternative and can be disabled.

**2.5.7 Dragging Movements (AA)** ⭐ NEW.** Functionality that uses dragging has a single-pointer alternative.

**2.5.8 Target Size (Minimum) (AA)** ⭐ NEW.** Pointer targets are at least 24×24 CSS pixels, or equivalently spaced.

## WCAG 2.2 Level AA Checklist: Understandable

The Understandable principle covers readability, predictability, and input assistance.

### 3.1 Readable

**3.1.1 Language of Page (A).** The default human language of each page is programmatically determinable.

**3.1.2 Language of Parts (AA).** The human language of each passage or phrase is programmatically determinable.

### 3.2 Predictable

**3.2.1 On Focus (A).** Receiving focus doesn't automatically trigger a change of context.

**3.2.2 On Input (A).** Changing a UI component doesn't automatically cause a change of context unless the user is advised.

**3.2.3 Consistent Navigation (AA).** Navigation mechanisms are consistent across pages.

**3.2.4 Consistent Identification (AA).** Components with the same functionality are identified consistently.

**3.2.6 Consistent Help (A)** ⭐ NEW.** Help mechanisms appear in the same relative order on each page.

### 3.3 Input Assistance

**3.3.1 Error Identification (A).** Errors are identified and described to the user in text.

**3.3.2 Labels or Instructions (A).** Labels or instructions are provided for user input.

**3.3.3 Error Suggestion (AA).** If an error is detected and suggestions are known, provide suggestions.

**3.3.4 Error Prevention (Legal, Financial, Data) (AA).** For pages with legal commitments or financial transactions, submissions are reversible, checked, or confirmed.

**3.3.7 Redundant Entry (A)** ⭐ NEW.** Information already provided in the same process isn't required again.

**3.3.8 Accessible Authentication (Minimum) (AA)** ⭐ NEW.** Authentication doesn't rely on cognitive function tests unless an alternative or assistance is provided.

## WCAG 2.2 Level AA Checklist: Robust

The Robust principle covers compatibility with assistive technologies and future user agents.

### 4.1 Compatible

**4.1.2 Name, Role, Value (A).** For all UI components, the name and role are programmatically determinable; states, properties, and values can be set; and changes are notified to assistive technologies.

**4.1.3 Status Messages (AA).** Status messages can be programmatically determined through role or properties without receiving focus.

Note: 4.1.1 Parsing was removed in WCAG 2.2. Modern browsers handle parsing errors gracefully, and the criterion was no longer necessary.

## What's New in WCAG 2.2: The Six Criteria That Matter Most

Six of the nine new criteria sit at Level A or AA, which means they're part of the practical compliance target. Here's what each one requires and how to meet it.

### 2.4.11 Focus Not Obscured (Minimum) (AA)

**What it requires:** When an element receives keyboard focus, it must not be entirely hidden by other content. Sticky headers, cookie banners, chat widgets, and non-modal dialogs are common culprits.

**How to meet it:** Ensure that focused elements are scrolled into view and not covered by sticky or fixed elements. Test by tabbing through your interface with a sticky header present. If the focused element is completely hidden, you have a violation.

### 2.5.7 Dragging Movements (AA)

**What it requires:** Any functionality that uses dragging must have a single-pointer alternative. Sliders, drag-and-drop interfaces, and map panning are common examples.

**How to meet it:** Provide alternative controls—buttons, input fields, or click-based interactions—for any drag-based functionality. A slider, for example, should also be adjustable with arrow keys or a text input.

### 2.5.8 Target Size (Minimum) (AA)

**What it requires:** Pointer targets must be at least 24×24 CSS pixels, with some exceptions for inline links and essential sizing.

**How to meet it:** Increase the size of small buttons, icons, and interactive elements. Add padding if the visual size can't change. Ensure adequate spacing between targets.

### 3.2.6 Consistent Help (A)

**What it requires:** Help mechanisms (contact links, chat widgets, self-help options) appear in the same relative order on every page where they appear.

**How to meet it:** Place help mechanisms in a consistent location across your site. If the help link is in the footer on one page, it should be in the same position in the footer on every page.

### 3.3.7 Redundant Entry (A)

**What it requires:** Users don't have to re-enter information they've already provided in the same process. This is particularly relevant for multi-step forms and checkout flows.

**How to meet it:** Pre-fill fields with previously entered data. Allow users to select "same as shipping address" for billing. Auto-populate information from earlier steps.

### 3.3.8 Accessible Authentication (Minimum) (AA)

**What it requires:** Authentication doesn't rely on cognitive function tests (like remembering a password or solving a puzzle) unless an alternative or assistance is provided.

**How to meet it:** Support password managers. Allow paste into password fields. Provide alternatives like email links, passkeys, or biometric authentication. Avoid CAPTCHAs that require solving puzzles.

If you're building forms with authentication, our [React controlled vs uncontrolled components](/blog/react-controlled-vs-uncontrolled) guide covers form handling patterns that support these requirements.

## Common WCAG 2.2 Failures and How to Fix Them

Based on the WebAIM Million and my own audits, here are the issues that come up most often.

**Low contrast text.** Affects roughly 79% of pages. Use a contrast checker to verify. Normal text needs 4.5:1, large text needs 3:1.

**Missing alt text.** About 55% of pages have images without alt text. Every meaningful image needs descriptive alt text; decorative images need `alt=""`.

**Empty links and buttons.** Links and buttons with no accessible name are invisible to screen readers. Use `aria-label` for icon-only buttons.

**Missing form labels.** Inputs without associated `<label>` elements are frustrating for screen reader users. Placeholder text is not a label.

**Skipped heading levels.** Jumping from `<h2>` to `<h4>` breaks the document outline. Use headings in order.

**Focus obscured by sticky elements.** New in 2.2. Tab through your interface with sticky headers and chat widgets present. If focus disappears behind them, you have a violation.

**Drag-only interactions.** New in 2.2. If a slider or drag-and-drop interface can't be operated with clicks or keyboard, provide an alternative.

**Small tap targets.** New in 2.2. Buttons and links smaller than 24×24 CSS pixels are a problem for users with motor impairments.

## How to Test WCAG 2.2 Compliance

A complete accessibility audit combines automated tools, manual testing, and assistive technology testing.

**Automated tools.** Tools like axe, WAVE, and Lighthouse catch 30–40% of issues automatically. Run them on every page. They're excellent for contrast, alt text presence, and structural issues.

**Keyboard testing.** Unplug your mouse. Tab through every interactive element. Can you reach everything? Is focus visible? Is focus ever obscured? Can you operate every function?

**Screen reader testing.** Use NVDA (Windows) or VoiceOver (Mac). Navigate by headings, landmarks, and form controls. Listen to how your content is announced. This is where you catch issues that automated tools miss.

**Zoom and reflow testing.** Zoom to 200% and check for content loss. Test at 320px width for reflow. Check text spacing adjustments.

**Target size testing.** Measure interactive elements. Anything smaller than 24×24 pixels needs to be enlarged or spaced adequately.

If you've been working through our [WebAIM WCAG checklist guide](/blog/webaim-wcag-checklist), you know how to pair automated tools with manual testing. WebAIM's WAVE is particularly useful for visual feedback on where issues are.

## A Real Story: Updating a Client Site for WCAG 2.2

A few months ago, I audited a client's e-commerce site that had been built to WCAG 2.1 AA standards. They wanted to claim 2.2 compliance.

The 2.1 criteria were in good shape—contrast, alt text, form labels, keyboard navigation. But the 2.2 additions revealed gaps.

The checkout flow had a multi-step form where users had to re-enter their shipping address for billing. That violated 3.3.7 Redundant Entry. We added a "same as shipping" checkbox and pre-filled the billing fields.

The slider for filtering price range was drag-only. No keyboard alternative, no input field. That violated 2.5.7 Dragging Movements. We added a dual-input field that users could type into.

The chat widget in the corner obscured the focused element when tabbing through the footer. That violated 2.4.11 Focus Not Obscured. We repositioned the widget so it didn't overlap focusable content.

None of these fixes were massive. But they were requirements that a 2.1 checklist wouldn't have caught. The lesson: if you're claiming 2.2 compliance, you need a 2.2 checklist.

## Wrapping Up

WCAG 2.2 is the current standard. If you're building for compliance, for user experience, or both, it's worth updating your checklist. The six new Level A and AA criteria—focus not obscured, dragging movements, target size, consistent help, redundant entry, and accessible authentication—address real gaps that affect real users.

This checklist covers all 55 Level A and AA success criteria. It's comprehensive, but it's not a substitute for the official spec. Use it as a practical reference during development, and consult the W3C documentation when you need to drill into specific requirements.

For a developer-focused companion to this checklist, see our [WCAG checklist for web developers](/blog/wcag-checklist-for-web-developers). For the WebAIM-specific resource, see our [WebAIM WCAG checklist guide](/blog/webaim-wcag-checklist). And for building accessible React components, our [React Aria Components](/blog/react-aria-components) guide covers primitives that handle many of these requirements out of the box.

Accessibility is a practice, not a checkbox. The checklist helps you ask the right questions. The answers come from testing with real users and real assistive technology.

---

_Need help auditing your website for WCAG 2.2 compliance or updating your accessibility practices? Red Surge Technology specializes in building inclusive web experiences. [Get in touch](/contact) to discuss your accessibility goals._
