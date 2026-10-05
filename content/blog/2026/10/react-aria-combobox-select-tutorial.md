---
title: "React Aria ComboBox & Select Tutorial: Build Accessible Dropdowns That Work"
date: "2026-10-05T10:00:00.000Z"
excerpt: "Learn how to build accessible React Aria ComboBox and Select components with keyboard navigation, screen reader support, and type-ahead filtering. Step-by-step code included."
cover_image: "/images/blog/uploads/react-aria-combobox-select-tutorial.webp"
seo_title: "React Aria ComboBox & Select Tutorial: Accessible Dropdowns Guide"
seo_description: "Build accessible React Aria ComboBox and Select components. Step-by-step tutorial covering keyboard navigation, type-ahead filtering, form integration, and testing with Testing Library."
author_name: "Collin Stewart"
tags:
  - React
  - Accessibility
  - React Aria
  - UI Components
  - JavaScript
category: "JavaScript"
reading_time: 15
featured: false
no_index: false
---

A dropdown looks simple. A button that opens a list. Click an option. Close. How hard could it be?

Then you actually build one and realize how much is missing. Arrow key navigation. Focus management. Screen reader announcements. Type-ahead selection. Escape to close. Click outside to close. Returning focus to the trigger after selection. Scroll management when the list is long. The WAI-ARIA spec for combobox and listbox patterns runs dozens of pages, and getting it right from scratch is a genuine challenge.

React Aria Components handle all of this for you. They're unstyled, accessible primitives from Adobe that encode years of accessibility research into composable React components. You get the behavior and ARIA attributes. You bring the styling.

This tutorial walks through building both a Select (non-filterable dropdown) and a ComboBox (type-ahead filtering) using React Aria Components. We'll cover setup, anatomy, styling, form integration, and testing. If you're new to React Aria, start with our [React Aria Components overview](/blog/react-aria-components), which covers the philosophy and the broader library. This post is the hands-on component tutorial.

## When to Use Select vs ComboBox

React Aria provides both Select and ComboBox, and choosing the right one matters for user experience.

**Use Select when:**

- The list of options is fixed and doesn't need filtering.
- The user needs to pick from a known set (country, category, status).
- The list is short enough to scan visually (under ~20 items).
- You don't need the user to type a custom value.

**Use ComboBox when:**

- The list is long and benefits from filtering as the user types.
- You want to combine a text input with suggestions (autocomplete).
- The user might need to search for an option by name.
- You want the flexibility of typed input with guided selection.

As the React Spectrum docs put it: "Use ComboBox when users need to filter a list by typing. Use Select for a non-filterable dropdown." That's the clean distinction. ComboBox is for autocomplete and filtering. Select is for picking.

If you need multi-select with filtering, React Aria has a separate pattern (TagField) that we won't cover here.

## Installation and Setup

Install the React Aria Components package:

```bash
npm install react-aria-components
```

That's the only dependency you need. React Aria Components ship with TypeScript types and work with React 18 and 19.

Unlike the underlying React Aria hooks (`@react-aria/combobox`, `@react-aria/select`), React Aria Components give you pre-composed components that handle the props plumbing for you. You don't manage `useComboBox`, `useListBox`, `useButton`, and `usePopover` separately. You compose `<ComboBox>`, `<Label>`, `<Input>`, `<Popover>`, `<ListBox>`, and `<ListBoxItem>`.

If you've built dropdowns with raw hooks before, you know how much ceremony is involved. React Aria Components eliminate most of it.

## Building a Select Component

Let's start with the simpler of the two: a non-filterable Select.

### The anatomy of a Select

A React Aria Select consists of these parts:

- **`<Select>`** — The root component. Manages state and provides context.
- **`<Label>`** — The visible label. Associated with the input via `aria-labelledby`.
- **`<Button>`** — The trigger that opens the dropdown.
- **`<SelectValue>`** — Displays the currently selected value (or placeholder).
- **`<Popover>`** — The popup container.
- **`<ListBox>`** — The list of options.
- **`<ListBoxItem>`** — Individual option.

Here's the minimal working Select:

```jsx
import {
  Select,
  SelectValue,
  Label,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
} from "react-aria-components";

function FavoriteAnimal() {
  return (
    <Select>
      <Label>Favorite Animal</Label>
      <Button>
        <SelectValue />
      </Button>
      <Popover>
        <ListBox>
          <ListBoxItem>Aardvark</ListBoxItem>
          <ListBoxItem>Cat</ListBoxItem>
          <ListBoxItem>Dog</ListBoxItem>
          <ListBoxItem>Kangaroo</ListBoxItem>
          <ListBoxItem>Panda</ListBoxItem>
          <ListBoxItem>Snake</ListBoxItem>
        </ListBox>
      </Popover>
    </Select>
  );
}
```

That's a complete, accessible Select. Keyboard navigation, screen reader support, focus management, escape to close, click outside to close—all handled. No ARIA attributes written by hand. No event listeners for keyboard handling.

### Adding a placeholder

`<SelectValue>` accepts a `placeholder` prop for when nothing is selected:

```jsx
<SelectValue placeholder="Select an animal" />
```

### Controlling selection

React Aria uses `selectedKey` and `onSelectionChange` for controlled selection, or `defaultSelectedKey` for uncontrolled initial selection:

```jsx
<Select defaultSelectedKey="cat">
  {/* ... */}
  <ListBox>
    <ListBoxItem id="aardvark">Aardvark</ListBoxItem>
    <ListBoxItem id="cat">Cat</ListBoxItem>
    <ListBoxItem id="dog">Dog</ListBoxItem>
  </ListBox>
</Select>
```

Each `ListBoxItem` needs a unique `id`. The selected key is passed to `onSelectionChange`, which receives the id of the selected item.

```jsx
<Select onSelectionChange={(key) => console.log("Selected:", key)}>
  {/* ... */}
</Select>
```

### Rendering options dynamically

Hardcoding items works for demos, but real Selects render from data. React Aria Components support dynamic collections via the `items` prop:

```jsx
const animals = [
  { id: "aardvark", name: "Aardvark" },
  { id: "cat", name: "Cat" },
  { id: "dog", name: "Dog" },
];

<Select>
  <Label>Favorite Animal</Label>
  <Button>
    <SelectValue />
  </Button>
  <Popover>
    <ListBox items={animals}>
      {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
    </ListBox>
  </Popover>
</Select>;
```

The `items` prop accepts any iterable. The child function receives each item and returns the JSX for that item. React Aria handles the key extraction from the `id` field.

### Styling with render props

React Aria Components support a `className` prop that accepts a function. The function receives render state, so you can style based on whether the select is open, focused, invalid, etc.

```jsx
<Button
  className={({ isOpen, isFocused }) =>
    `select-button ${isOpen ? "open" : ""} ${isFocused ? "focused" : ""}`
  }
>
  <SelectValue />
</Button>
```

This is the same pattern used by many headless UI libraries. The difference is that React Aria exposes more state than most, including `isInvalid`, `isDisabled`, `isRequired`, and `isOpen`.

### Form integration

React Aria Select integrates with native HTML forms. The selected value is submitted with the form, just like a native `<select>`:

```jsx
<form>
  <Select name="animal">
    <Label>Favorite Animal</Label>
    <Button>
      <SelectValue />
    </Button>
    <Popover>
      <ListBox>
        <ListBoxItem id="cat">Cat</ListBoxItem>
        <ListBoxItem id="dog">Dog</ListBoxItem>
      </ListBox>
    </Popover>
  </Select>
  <button type="submit">Submit</button>
</form>
```

The `name` prop on `<Select>` sets the form field name. React Aria renders a hidden `<select>` element that mirrors the state, so form submission works out of the box. This is one of those details that saves hours of debugging.

If you're working with controlled and uncontrolled form patterns, our [React controlled vs uncontrolled components](/blog/react-controlled-vs-uncontrolled) guide covers the broader concepts.

## Building a ComboBox Component

ComboBox is Select plus a text input. The user can type to filter the list, and the input's value is separate from the selected item.

### The anatomy of a ComboBox

- **`<ComboBox>`** — Root component.
- **`<Label>`** — Visible label.
- **`<Group>`** — Wraps the input and optional button.
- **`<Input>`** — The text input.
- **`<Button>`** — Optional dropdown trigger.
- **`<Popover>`** — Popup container.
- **`<ListBox>`** and **`<ListBoxItem>`** — Options.

```jsx
import {
  ComboBox,
  Input,
  Label,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
} from "react-aria-components";

const animals = [
  { id: "aardvark", name: "Aardvark" },
  { id: "cat", name: "Cat" },
  { id: "dog", name: "Dog" },
  { id: "kangaroo", name: "Kangaroo" },
  { id: "panda", name: "Panda" },
];

function AnimalPicker() {
  return (
    <ComboBox defaultItems={animals}>
      <Label>Favorite Animal</Label>
      <Input />
      <Button>▼</Button>
      <Popover>
        <ListBox>{(item) => <ListBoxItem>{item.name}</ListBoxItem>}</ListBox>
      </Popover>
    </ComboBox>
  );
}
```

Type into the input, and the list filters. Arrow keys navigate the filtered results. Enter selects. Escape closes. The input's value stays in sync with the selection.

### Controlling the input value

ComboBox distinguishes between the input value (what the user typed) and the selected key (what they chose). You can control both:

```jsx
<ComboBox
  defaultInputValue="cat"
  defaultSelectedKey="cat"
  onInputChange={(value) => console.log("Input:", value)}
  onSelectionChange={(key) => console.log("Selected:", key)}
>
  {/* ... */}
</ComboBox>
```

This separation matters for scenarios like autocomplete where you want to trigger a search on input change but only commit a value when the user selects an option.

### Filtering behavior

By default, React Aria uses `useFilter` for filtering. It does case-insensitive substring matching on the text value of each item. The text value is derived from the item's content, but you can override it with the `textValue` prop:

```jsx
<ListBoxItem textValue="Cat (Felis catus)">Cat</ListBoxItem>
```

This is useful when the visible label contains extra information (like a scientific name) that shouldn't participate in filtering.

### Grouping options

For long lists, grouping helps. Use `<ListBoxSection>` with a `<Header>`:

```jsx
<ListBox>
  <ListBoxSection>
    <Header>Domestic</Header>
    <ListBoxItem id="cat">Cat</ListBoxItem>
    <ListBoxItem id="dog">Dog</ListBoxItem>
  </ListBoxSection>
  <ListBoxSection>
    <Header>Wild</Header>
    <ListBoxItem id="lion">Lion</ListBoxItem>
    <ListBoxItem id="tiger">Tiger</ListBoxItem>
  </ListBoxSection>
</ListBox>
```

Screen readers announce the section headers when navigating, which helps users understand the structure of the list.

## Testing React Aria Components

One of React Aria's strengths is testability. The components expose the same accessible queries that screen readers use, so you can write tests that mirror real user behavior.

With `@testing-library/react` and `@testing-library/user-event`, you can test keyboard interactions:

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ComboBox,
  Input,
  Label,
  ListBox,
  ListBoxItem,
} from "react-aria-components";

test("filters options as user types", async () => {
  const user = userEvent.setup();
  render(
    <ComboBox>
      <Label>Animal</Label>
      <Input />
      <ListBox>
        <ListBoxItem id="cat">Cat</ListBoxItem>
        <ListBoxItem id="dog">Dog</ListBoxItem>
        <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
      </ListBox>
    </ComboBox>,
  );

  await user.type(screen.getByLabelText("Animal"), "ka");
  expect(screen.getByText("Kangaroo")).toBeInTheDocument();
  expect(screen.queryByText("Cat")).not.toBeInTheDocument();
});
```

The `getByLabelText` query works because React Aria properly associates the label with the input. The filtering works because React Aria handles the filter logic. You're testing behavior, not implementation details.

For a deeper dive into testing accessibility with Testing Library, see our [Accessibility checklist for developers](/blog/accessibility-checklist-for-developers), which covers CI enforcement and testing workflows.

## Common Pitfalls and How to Avoid Them

**Forgetting the `id` on ListBoxItem.** Every item needs a unique `id`. Without it, selection won't work correctly and React will warn about missing keys.

**Not wrapping in `<Group>` for ComboBox.** The Group component is required for ComboBox to style the input and button together. Without it, the layout breaks.

**Missing the `name` prop for form submission.** If you want the selected value to be submitted with a form, set the `name` prop on `<Select>`. Without it, the form submission won't include the value.

**Styling the Popover like a normal div.** The Popover is positioned absolutely and manages its own z-index and overflow. Don't try to style it like a static container. Use the `className` render prop to access state.

**Forgetting `aria-label` for icon-only triggers.** If your trigger button has no visible text, add `aria-label` to the Button component. React Aria Components will forward it correctly.

If you've been working through our [WAI-ARIA authoring practices](/blog/wai-aria-authoring-practices) guide, you know that combobox and listbox are among the most complex ARIA patterns. React Aria Components encode those patterns so you don't have to memorize the spec.

## A Real Story: Replacing a Custom Dropdown

A few months ago, I inherited a project with a custom dropdown component built from scratch. It had been written by a previous developer who understood the basics but missed several accessibility requirements.

The dropdown worked for mouse users. Click the trigger, click an option, done. But keyboard users couldn't navigate the options with arrow keys. Screen readers announced the dropdown as a "group" with no indication that it was interactive. Focus was lost when the dropdown closed, leaving keyboard users stranded at the top of the page.

We replaced it with React Aria Select. The migration took about two hours. The component went from 180 lines of custom logic to 40 lines of composition. The accessibility issues disappeared entirely. Keyboard navigation worked. Screen readers announced the component correctly. Focus returned to the trigger after selection.

The developer who had written the original dropdown was surprised by how much React Aria handled. "I didn't know I was missing all that," he said. That's the common reaction. React Aria makes the invisible requirements visible.

## Wrapping Up

React Aria Components give you accessible Select and ComboBox components without the burden of implementing the ARIA patterns yourself. The composition model is clean, the TypeScript support is excellent, and the accessibility behavior is thoroughly tested across browsers and assistive technologies.

For Select: compose `<Select>`, `<Label>`, `<Button>`, `<SelectValue>`, `<Popover>`, `<ListBox>`, and `<ListBoxItem>`. For ComboBox: swap `<Select>` for `<ComboBox>`, add `<Input>`, and wrap the input and button in `<Group>`.

For deeper dives, see our [React Aria Components overview](/blog/react-aria-components) for the broader library, our [WAI-ARIA authoring practices](/blog/wai-aria-authoring-practices) guide for the underlying patterns, and our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist) for the compliance requirements these components help you meet.

Now go build dropdowns that work for everyone.

---

_Need help building accessible components or migrating a custom UI to React Aria? Red Surge Technology specializes in inclusive React applications. [Get in touch](/contact) to discuss your project._
