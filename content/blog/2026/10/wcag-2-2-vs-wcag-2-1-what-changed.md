---
title: "WCAG 2.2 vs WCAG 2.1: What Changed and Why It Matters"
date: "2026-10-16T10:00:00.000Z"
excerpt: "WCAG 2.2 added nine success criteria and removed one. Here's exactly what changed from 2.1, which criteria affect you, and how to migrate your accessibility practices."
cover_image: "/images/blog/uploads/wcag-2-2-vs-2-1-what-changed.webp"
seo_title: "WCAG 2.2 vs WCAG 2.1: What Changed and How to Migrate"
seo_description: "Compare WCAG 2.2 and WCAG 2.1. Learn the nine new success criteria, the removed 4.1.1 Parsing criterion, and how to update your accessibility checklist for 2026."
author_name: "Collin Stewart"
tags:
  - Accessibility
  - WCAG
  - Web Development
  - Compliance
  - A11y
category: "Web Development"
reading_time: 14
featured: false
no_index: false
---

WCAG 2.2 has been the current standard since October 2023. It's been adopted by the European Accessibility Act, referenced in U.S. accessibility litigation, and baked into procurement requirements around the world. And yet, plenty of teams are still working from WCAG 2.1 checklists—or from memory and habit.

The difference matters. WCAG 2.2 added nine new success criteria and removed one. Six of the new criteria sit at Level A or AA, which means they're part of the practical compliance target for most organizations. If you're claiming WCAG 2.1 AA conformance in 2026, you're likely missing requirements that affect real users.

This post breaks down exactly what changed between 2.1 and 2.2, which criteria affect you, and how to migrate your accessibility practices. If you want the complete checklist, see our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist). For the developer-focused version, see our [WCAG checklist for web developers](/blog/wcag-checklist-for-web-developers). And for the WebAIM-aligned resource, see our [WebAIM WCAG checklist guide](/blog/webaim-wcag-checklist).

## The Short Version

WCAG 2.2 adds **nine new success criteria** and removes **one obsolete criterion** (4.1.1 Parsing). It's fully backwards compatible: conforming to WCAG 2.2 AA means you automatically satisfy every regulation that points at WCAG 2.1 or 2.0[reference:0].

The new criteria focus on three audiences that earlier versions served less well: people with cognitive and learning disabilities, people with motor disabilities, and sighted keyboard users[reference:1].

## The Nine New Success Criteria

Here's the complete list, with conformance levels.

| #      | Criterion                            | Level | What It Requires                              |
| ------ | ------------------------------------ | ----- | --------------------------------------------- |
| 2.4.11 | Focus Not Obscured (Minimum)         | AA    | Focused elements aren't entirely hidden       |
| 2.4.12 | Focus Not Obscured (Enhanced)        | AAA   | Focused elements aren't partially hidden      |
| 2.4.13 | Focus Appearance                     | AAA   | Focus indicators meet size and contrast       |
| 2.5.7  | Dragging Movements                   | AA    | Drag actions have single-pointer alternatives |
| 2.5.8  | Target Size (Minimum)                | AA    | Targets are at least 24×24 CSS pixels         |
| 3.2.6  | Consistent Help                      | A     | Help appears in the same place on every page  |
| 3.3.7  | Redundant Entry                      | A     | Users don't re-enter previously provided data |
| 3.3.8  | Accessible Authentication (Minimum)  | AA    | Auth doesn't rely on cognitive tests          |
| 3.3.9  | Accessible Authentication (Enhanced) | AAA   | Stricter auth accessibility requirements      |

Six of these are at Level A or AA. Three are Level AAA. The Level AA additions are the practical upgrade target for most teams[reference:2].

## The New Level AA Criteria (The Ones That Matter Most)

### 2.4.11 Focus Not Obscured (Minimum)

**What it requires:** When an element receives keyboard focus, it must not be entirely hidden by other content. Sticky headers, cookie banners, chat widgets, and non-modal dialogs are common culprits[reference:3].

**Why it matters:** Sighted keyboard users need to see what they're focused on. If a sticky header covers the focused element, they lose track of where they are on the page.

**Common failures:**

- Tabbing into a form field below a sticky header obscures the focus indicator.
- Tabbing through a list with a sticky cart icon obscures focused items.
- Chat widgets in the corner overlap focused footer content.

**How to fix it:** Add `scroll-margin-top` and `scroll-margin-bottom` matching the sticky header/footer height to focusable elements. Or add scroll-into-view JavaScript that accounts for sticky-element offsets[reference:4].

### 2.5.7 Dragging Movements

**What it requires:** Any functionality that uses dragging must have a single-pointer alternative (tap, click, button, keyboard activation), unless dragging is essential[reference:5].

**Why it matters:** Users with motor impairments may not be able to perform precise drag gestures. A single-pointer alternative makes the functionality accessible to more people.

**Common failures:**

- Image carousels with swipe-only navigation.
- Product configurators with drag-only interactions.
- Quantity adjusters that require dragging to change values.

**How to fix it:** Add explicit "previous" and "next" buttons to carousels. Add `+`/`-` buttons to quantity steppers. Add tap-to-zoom or keyboard-zoom in addition to drag-to-zoom[reference:6].

### 2.5.8 Target Size (Minimum)

**What it requires:** Pointer-input targets must be at least 24×24 CSS pixels, or have equivalent spacing. There are exceptions for inline links and essential sizing[reference:7].

**Why it matters:** Small tap targets are hard to hit for users with motor impairments, on mobile devices, or in situations where precision is difficult.

**Common failures:**

- Small icon buttons (close, delete, menu).
- Closely spaced links in navigation.
- Tiny checkboxes and radio buttons.

**How to fix it:** Increase the size of small buttons and icons. Add padding if the visual size can't change. Ensure adequate spacing between targets.

### 3.3.8 Accessible Authentication (Minimum)

**What it requires:** Authentication doesn't rely on cognitive function tests (like remembering a password or solving a puzzle) unless an alternative or assistance is provided[reference:8].

**Why it matters:** Users with cognitive disabilities may struggle with memory-based authentication. Alternative methods make authentication accessible to more people.

**Common failures:**

- CAPTCHAs that require solving puzzles.
- Password fields that block pasting.
- Complex password requirements that are hard to remember.

**How to fix it:** Support password managers. Allow paste into password fields. Provide alternatives like email links, passkeys, or biometric authentication.

## The New Level A Criteria

### 3.2.6 Consistent Help

**What it requires:** Help mechanisms (contact links, chat widgets, self-help options) appear in the same relative order on every page where they appear[reference:9].

**Why it matters:** Users who need help shouldn't have to search for it on every page. Consistent placement builds familiarity and reduces frustration.

**How to fix it:** Place help mechanisms in a consistent location across your site. If the help link is in the footer on one page, it should be in the same position in the footer on every page.

### 3.3.7 Redundant Entry

**What it requires:** Users don't have to re-enter information they've already provided in the same process. This is particularly relevant for multi-step forms and checkout flows[reference:10].

**Why it matters:** Users with cognitive disabilities may struggle to remember what they entered earlier. Re-entering information is frustrating and error-prone.

**How to fix it:** Pre-fill fields with previously entered data. Allow users to select "same as shipping address" for billing. Auto-populate information from earlier steps.

## The Removed Criterion: 4.1.1 Parsing

WCAG 2.2 removes 4.1.1 Parsing. The criterion required that markup be well-formed and free of parsing errors. It was removed because modern browsers handle parsing errors gracefully, and accessibility errors due to assistive technology directly parsing HTML no longer exist or are addressed in other criteria[reference:11][reference:12].

If you were auditing for 4.1.1 Parsing, you can drop it from your checklist. The other criteria cover the intent.

## The Three Level AAA Criteria

For teams targeting AAA conformance, WCAG 2.2 adds three more criteria.

**2.4.12 Focus Not Obscured (Enhanced) (AAA):** No part of the focused component can be hidden by author-created content. This is stricter than the AA version, which only requires that the component not be _entirely_ hidden[reference:13].

**2.4.13 Focus Appearance (AAA):** Focus indicators must meet specific size and contrast requirements. This builds on the existing Focus Visible criterion[reference:14].

**3.3.9 Accessible Authentication (Enhanced) (AAA):** Stricter requirements for authentication accessibility, removing some of the exceptions allowed at the AA level.

## A Comparison Table: WCAG 2.1 vs WCAG 2.2

| Dimension                  | WCAG 2.1              | WCAG 2.2                           |
| -------------------------- | --------------------- | ---------------------------------- |
| **Published**              | June 2018             | October 2023                       |
| **Total success criteria** | 78 (A + AA + AAA)     | 86 (A + AA + AAA)                  |
| **New criteria**           | —                     | 9 added                            |
| **Removed criteria**       | —                     | 4.1.1 Parsing removed              |
| **Focus on**               | General accessibility | Cognitive, motor, sighted keyboard |
| **Backwards compatible**   | —                     | Yes—2.2 AA satisfies 2.1 and 2.0   |

The backwards compatibility is the key point for compliance. If you're building to WCAG 2.2 AA, you're automatically compliant with every regulation that references 2.1 or 2.0[reference:15].

## How to Migrate from WCAG 2.1 to WCAG 2.2

If your team is currently working from a WCAG 2.1 checklist, here's how to update your practices.

**Step 1: Update your checklist.** Add the six new Level A and AA criteria to your audit checklist. Remove 4.1.1 Parsing. Our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist) has the complete list.

**Step 2: Audit for the new criteria.** Run a focused audit for the six new A/AA criteria. These are the gaps you're most likely to have:

- Sticky elements obscuring focus (2.4.11).
- Drag-only interactions without alternatives (2.5.7).
- Small tap targets (2.5.8).
- Inconsistent help placement (3.2.6).
- Redundant data entry (3.3.7).
- CAPTCHAs and password restrictions (3.3.8).

**Step 3: Update your design system.** Codify the new requirements into your design tokens. Minimum touch target sizes, focus indicator styles, and help placement rules should all be part of the system.

**Step 4: Update your testing workflow.** Add checks for the new criteria to your testing process. Our [Accessibility checklist for developers](/blog/accessibility-checklist-for-developers) covers the testing workflow in detail.

**Step 5: Update your CI pipeline.** Add automated checks for contrast, target size, and focus visibility. Tools like axe-core catch some of these automatically.

## Common Migration Mistakes

**Assuming 2.2 is a huge change.** It's not. Nine new criteria, one removed. For teams already conforming to 2.1 AA, the upgrade is smaller than it sounds[reference:16].

**Ignoring the AA additions because they're "new."** The six A/AA criteria aren't optional if you're claiming 2.2 conformance. They're part of the standard.

**Forgetting to remove 4.1.1 Parsing from the checklist.** If you're still auditing for it, you're wasting effort. It's obsolete.

**Not testing with keyboard only.** Focus Not Obscured (2.4.11) can only be caught by tabbing through the interface with sticky elements present. Automated tools won't catch it.

**Not testing with motor impairments in mind.** Target Size (2.5.8) and Dragging Movements (2.5.7) require thinking about users who can't perform precise gestures. Test on mobile devices with real fingers, not just a mouse.

## A Real Story: Upgrading a Client Site from 2.1 to 2.2

A few months ago, I audited a client's e-commerce site that had been built to WCAG 2.1 AA standards. They wanted to claim 2.2 compliance for an upcoming RFP.

The 2.1 criteria were in good shape. But the 2.2 additions revealed gaps. The checkout flow had a multi-step form where users had to re-enter their shipping address for billing. That violated 3.3.7 Redundant Entry. We added a "same as shipping" checkbox and pre-filled the billing fields.

The price range slider was drag-only. No keyboard alternative, no input field. That violated 2.5.7 Dragging Movements. We added a dual-input field that users could type into.

The chat widget in the corner obscured the focused element when tabbing through the footer. That violated 2.4.11 Focus Not Obscured. We repositioned the widget so it didn't overlap focusable content.

The fixes took about three days total. None were massive. But they were requirements that a 2.1 checklist wouldn't have caught.

The lesson: if you're claiming 2.2 compliance, you need a 2.2 checklist. The delta is small, but it's not zero.

## Wrapping Up

WCAG 2.2 is the current standard. The upgrade from 2.1 is smaller than it sounds—nine new criteria, one removed—but the new criteria matter for real users. Focus Not Obscured helps sighted keyboard users. Dragging Movements and Target Size help users with motor impairments. Consistent Help, Redundant Entry, and Accessible Authentication help users with cognitive disabilities.

If you're already conforming to 2.1 AA, the migration path is clear: add the six new A/AA criteria to your checklist, audit for them, and update your design system and testing workflow. The effort is measured in days, not weeks.

For the complete checklist, see our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist). For the developer-focused version, see our [WCAG checklist for web developers](/blog/wcag-checklist-for-web-developers). For the WebAIM-aligned resource, see our [WebAIM WCAG checklist guide](/blog/webaim-wcag-checklist). And for the original guidelines checklist, see our [WCAG guidelines checklist](/blog/wcag-guidelines-checklist).

Now go update your checklist.

---

_Need help auditing your website for WCAG 2.2 compliance or migrating from 2.1? Red Surge Technology specializes in accessibility audits and remediation. [Get in touch](/contact) to discuss your accessibility goals._
