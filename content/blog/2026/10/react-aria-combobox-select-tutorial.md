---
title: "React Aria ComboBox & Select Tutorial: Build Accessible Dropdowns (2026)"
date: "2026-10-05T10:00:00.000Z"
excerpt: "Learn how to build accessible React Aria ComboBox and Select components with keyboard navigation, screen reader support, and type-ahead filtering. Step-by-step code, form integration, async loading, and testing included."
cover_image: "/images/blog/uploads/react-aria-combobox-select-tutorial.webp"
seo_title: "React Aria ComboBox & Select Tutorial: Accessible Dropdowns Guide"
seo_description: "Build accessible React Aria ComboBox and Select components. Step-by-step tutorial covering keyboard navigation, type-ahead filtering, form integration, async loading, and testing with Testing Library."
author_name: "Collin Stewart"
last_modified: 2026-10-08T10:00:00.000Z
tags:
  - React
  - Accessibility
  - React Aria
  - UI Components
  - JavaScript
category: "JavaScript"
reading_time: 17
featured: false
no_index: false
---

A dropdown looks simple. A button that opens a list. Click an option. Close. How hard could it be?

Then you actually build one and realize how much is missing. Arrow key navigation. Focus management. Screen reader announcements. Type-ahead selection. Escape to close. Click outside to close. Returning focus to the trigger after selection. Scroll management when the list is long. The WAI-ARIA spec for combobox and listbox patterns runs dozens of pages, and getting it right from scratch is a genuine challenge.

I learned this the hard way a few months ago. I inherited a project with a custom dropdown component built from scratch by a previous developer. On the surface, it looked fine — clicked open, clicked an option, closed. But when I ran it through a keyboard test, everything fell apart. No arrow key navigation. No focus return after selection. Screen readers announced it as a mystery "group" with no interaction hints. We had thousands of users hitting this component daily, and every keyboard user was stuck.

We replaced it with React Aria Select. The migration took about two hours. The component went from 180 lines of custom logic to 40 lines of composition. Every accessibility issue disappeared. The original developer's reaction said it all: "I didn't know I was missing all that."

React Aria Components encode years of accessibility research into composable primitives. You get the behavior, the keyboard handling, and the ARIA attributes. You bring the styling. This tutorial walks through building both a Select (non-filterable dropdown) and a ComboBox (type-ahead filtering) from scratch, including form integration, async loading, and testing.

If you're new to React Aria, start with our [React Aria Components overview](/blog/react-aria-components), which covers the philosophy and the broader library. This post is the hands-on component tutorial.

> **Building accessible components and want an expert review?** Red Surge Technology specializes in inclusive React applications. [Get in touch](/contact) for a free consultation.

---

## Table of contents

1. [React Aria ComboBox vs Select: which one do you need?](#react-aria-combobox-vs-select-which-one-do-you-need)
2. [Installing React Aria Components](#installing-react-aria-components)
3. [Building a Select component step by step](#building-a-select-component-step-by-step)
4. [Building a ComboBox component step by step](#building-a-combobox-component-step-by-step)
5. [Async loading and remote data](#async-loading-and-remote-data)
6. [Styling React Aria Components](#styling-react-aria-components)
7. [Form integration and validation](#form-integration-and-validation)
8. [Testing React Aria components](#testing-react-aria-components)
9. [Common pitfalls and how to avoid them](#common-pitfalls-and-how-to-avoid-them)
10. [Frequently Asked Questions](#frequently-asked-questions)
11. [Wrapping up](#wrapping-up)

---

## React Aria ComboBox vs Select: which one do you need?

React Aria gives you both `<Select>` and `<ComboBox>`, and they solve related but different problems. Picking the wrong one frustrates users.

<div class="cs-table-wrap cs-table-wrap--stack">
<table>
<thead>
<tr>
<th>Feature</th>
<th>Select</th>
<th>ComboBox</th>
</tr>
</thead>
<tbody>
<tr>
<td data-label="Feature">User can type to filter</td>
<td data-label="Select">No</td>
<td data-label="ComboBox">Yes</td>
</tr>
<tr>
<td data-label="Feature">Best for option count</td>
<td data-label="Select">Under ~20 options</td>
<td data-label="ComboBox">20+ options, or unknown</td>
</tr>
<tr>
<td data-label="Feature">Has a text input</td>
<td data-label="Select">No (button only)</td>
<td data-label="ComboBox">Yes</td>
</tr>
<tr>
<td data-label="Feature">Supports custom typed value</td>
<td data-label="Select">No</td>
<td data-label="ComboBox">Yes (with <code>allowsCustomValue</code>)</td>
</tr>
<tr>
<td data-label="Feature">Async / remote loading</td>
<td data-label="Select">Possible, less common</td>
<td data-label="ComboBox">Common (search-as-you-type)</td>
</tr>
<tr>
<td data-label="Feature">Use case</td>
<td data-label="Select">Country picker, category filter, status change</td>
<td data-label="ComboBox">User search, tag input, autocomplete</td>
</tr>
</tbody>
</table>
</div>

The React Spectrum docs put it cleanly: use ComboBox when users need to filter a list by typing. Use Select for a non-filterable dropdown. That's the fundamental distinction.

A practical rule: if the user knows what they want and just needs to pick it, use Select. If the user knows roughly what they want and needs to search for it, use ComboBox.

If you need multi-select with filtering, React Aria has a separate pattern (TagField) that we won't cover here — but the same composition principles apply.

## Installing React Aria Components

Install the package:

```bash
npm install react-aria-components
```

That's the only dependency you need. React Aria Components ship with TypeScript types, work with React 18 and 19, and have zero runtime dependencies beyond React itself.

Unlike the lower-level React Aria hooks (`@react-aria/combobox`, `@react-aria/select`), React Aria Components give you pre-composed components that handle the props plumbing for you. You don't wire up `useComboBox`, `useListBox`, `useButton`, and `usePopover` separately. You compose `<ComboBox>`, `<Label>`, `<Input>`, `<Popover>`, `<ListBox>`, and `<ListBoxItem>`.

If you've built dropdowns with raw hooks before, you know how much ceremony is involved. React Aria Components eliminate most of it.

## Building a Select component step by step

Let's start with the simpler of the two.

### The anatomy of a Select

A React Aria Select consists of these parts:

- **`<Select>`** — The root component. Manages state and provides context.
- **`<Label>`** — The visible label. Automatically associated with the button via `aria-labelledby`.
- **`<Button>`** — The trigger that opens the dropdown.
- **`<SelectValue>`** — Displays the currently selected value (or placeholder).
- **`<Popover>`** — The popup container that positions itself.
- **`<ListBox>`** — The list of options.
- **`<ListBoxItem>`** — An individual option.

Here's a minimal working Select:

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

That's a complete, accessible Select. Keyboard navigation, screen reader support, focus management, escape to close, click outside to close — all handled. No ARIA attributes written by hand.

### Adding a placeholder

`<SelectValue>` accepts a `placeholder` prop for the empty state:

```jsx
<SelectValue placeholder="Select an animal" />
```

The placeholder only displays when nothing is selected. Once the user picks an option, the SelectValue shows the option's text.

### Controlling selection

React Aria uses `selectedKey` and `onSelectionChange` for controlled selection, or `defaultSelectedKey` for uncontrolled initial selection:

```jsx
<Select defaultSelectedKey="cat">
  <Label>Favorite Animal</Label>
  <Button>
    <SelectValue />
  </Button>
  <Popover>
    <ListBox>
      <ListBoxItem id="aardvark">Aardvark</ListBoxItem>
      <ListBoxItem id="cat">Cat</ListBoxItem>
      <ListBoxItem id="dog">Dog</ListBoxItem>
    </ListBox>
  </Popover>
</Select>
```

Each `ListBoxItem` needs a unique `id`. The selected key is passed to `onSelectionChange`, which receives the id of the selected item.

```jsx
<Select onSelectionChange={(key) => console.log("Selected:", key)}>
  {/* ... */}
</Select>
```

### Rendering options dynamically

Hardcoding items works for demos. Real Selects render from data. React Aria Components support dynamic collections via the `items` prop:

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

The `items` prop accepts any iterable. The child function receives each item and returns the JSX. React Aria handles key extraction from the `id` field automatically.

### Rendering rich option content

ListBoxItems can contain any JSX. Use `<Text>` for the accessible name and put extra markup (avatars, badges, descriptions) alongside:

```jsx
<ListBoxItem id={item.id} textValue={item.name}>
  <img src={item.avatar} alt="" />
  <Text slot="label">{item.name}</Text>
  <Text slot="description">{item.role}</Text>
</ListBoxItem>
```

The `textValue` prop is critical here. It's what screen readers announce and what the type-ahead filtering matches against. Without it, React Aria would try to derive the text from the JSX, which usually produces something messy like "PhotoJane DoeSoftware Engineer."

## Building a ComboBox component step by step

ComboBox is Select plus a text input. The user can type to filter, and the input value stays separate from the selected item.

### The anatomy of a ComboBox

- **`<ComboBox>`** — Root component.
- **`<Label>`** — Visible label.
- **`<Group>`** — Wraps the input and optional button. Required for layout.
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

This separation matters for autocomplete scenarios where you want to trigger a search on input change but only commit a value when the user selects an option.

### Filtering behavior

By default, React Aria uses case-insensitive substring matching on the text value of each item. The text value is derived from the item's content, but you can override it with the `textValue` prop:

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

Screen readers announce the section headers when navigating, which helps users understand the structure.

## Async loading and remote data

The most common real-world ComboBox use case is search-as-you-type against a remote API. React Aria supports this via controlled `items` and `onInputChange`:

```jsx
function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setUsers([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/users?q=${encodeURIComponent(query)}`,
        );
        const data = await response.json();
        if (!cancelled) setUsers(data);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <ComboBox
      items={users}
      inputValue={query}
      onInputChange={setQuery}
      allowsEmptyCollection
    >
      <Label>Find a user</Label>
      <Input />
      <Popover>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ListBox>
            {(user) => (
              <ListBoxItem id={user.id} textValue={user.name}>
                {user.name}
              </ListBoxItem>
            )}
          </ListBox>
        )}
      </Popover>
    </ComboBox>
  );
}
```

Two important flags here. `allowsEmptyCollection` prevents React Aria from closing the popover when the list is empty (which would happen before the fetch resolves). And notice the debounce on `setTimeout` — 300ms — which prevents a fetch on every keystroke. If you want to go deeper on debouncing, our guide on [JavaScript debounce vs throttle](/blog/javascript-debounce-vs-throttle) covers the techniques.

For async loading, you'll also want to skip React Aria's client-side filtering, since the server already did the filtering. Set `defaultFilter={null}` on the ComboBox when `items` are already filtered remotely.

## Styling React Aria Components

React Aria Components support a `className` prop that accepts a function. The function receives render state, so you can style based on whether the select is open, focused, invalid, and so on.

```jsx
<Button
  className={({ isOpen, isFocused, isDisabled }) =>
    `select-button ${isOpen ? "open" : ""} ${
      isFocused ? "focused" : ""
    } ${isDisabled ? "disabled" : ""}`
  }
>
  <SelectValue />
</Button>
```

This is the same pattern used by many headless UI libraries. The difference is that React Aria exposes more state than most: `isInvalid`, `isDisabled`, `isRequired`, `isOpen`, `isFocused`, `isFocusVisible`, `isHovered`, and more.

You can also use data attributes instead of class functions, which works beautifully with Tailwind:

```jsx
<Button className="rounded border px-3 py-2 data-[open]:border-blue-500 data-[focused]:ring-2">
  <SelectValue />
</Button>
```

React Aria sets `data-open`, `data-focused`, `data-invalid`, and similar attributes automatically. Tailwind's `data-[...]` syntax picks them up without any extra configuration.

### Styling the Popover

The Popover is absolutely positioned and manages its own z-index. Don't try to style it like a static container. Use `className` and render state:

```jsx
<Popover
  className={({ isEntering, isExiting }) =>
    `popover ${isEntering ? "entering" : ""} ${isExiting ? "exiting" : ""}`
  }
  offset={4}
>
  <ListBox>{/* ... */}</ListBox>
</Popover>
```

The `offset` prop controls the gap between the trigger and the popover. React Aria also handles collision detection — if the popover would overflow the viewport, it flips to the other side automatically.

If you're using Tailwind and want a deeper look at how utility-first CSS fits with headless components, our [CSS Modules vs Tailwind](/blog/css-modules-vs-tailwind) comparison covers the tradeoffs.

## Form integration and validation

React Aria Select and ComboBox integrate with native HTML forms out of the box. The selected value is submitted with the form, just like a native `<select>`:

```jsx
<form>
  <Select name="animal" isRequired>
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

The `name` prop sets the form field name. React Aria renders a hidden `<select>` element that mirrors the state, so form submission works exactly like a native select. This is one of those details that saves hours of debugging.

### Validation states

Set `isInvalid` and render a `<FieldError>` to display error messages that are properly announced by screen readers:

```jsx
<Select name="animal" isRequired isInvalid={!value && submitted}>
  <Label>Favorite Animal</Label>
  <Button>
    <SelectValue />
  </Button>
  <FieldError>Please select an animal.</FieldError>
  <Popover>
    <ListBox>{/* ... */}</ListBox>
  </Popover>
</Select>
```

The `<FieldError>` component is only rendered when the field is invalid, and it's announced by screen readers via `aria-describedby` on the trigger. No manual ARIA attributes required.

If you're building broader form patterns, our guide on [React controlled vs uncontrolled components](/blog/react-controlled-vs-uncontrolled) covers the state management tradeoffs.

## Testing React Aria components

One of React Aria's strengths is testability. The components expose the same accessible queries screen readers use, so your tests mirror real user behavior.

With `@testing-library/react` and `@testing-library/user-event`:

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

For testing keyboard interactions specifically:

```jsx
test("arrow keys navigate options", async () => {
  const user = userEvent.setup();
  render(<FavoriteAnimal />);

  await user.click(screen.getByLabelText("Favorite Animal"));
  await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

  expect(screen.getByLabelText("Favorite Animal")).toHaveTextContent("Cat");
});
```

For a deeper dive into testing accessibility with Testing Library, see our [Accessibility checklist for developers](/blog/accessibility-checklist-for-developers), which covers CI enforcement and testing workflows.

## Common pitfalls and how to avoid them

**Forgetting the `id` on ListBoxItem.** Every item needs a unique `id`. Without it, selection breaks and React warns about missing keys. If you're rendering from data, use `items` and let React Aria extract keys.

**Not wrapping the ComboBox input in `<Group>`.** The Group component is required for ComboBox to lay out the input and button together. Without it, the layout breaks in subtle, hard-to-debug ways.

**Missing the `name` prop for form submission.** If you want the selected value to submit with the form, set the `name` prop. Without it, the form submission silently excludes the value.

**Styling the Popover like a normal div.** The Popover is positioned absolutely with computed collision handling. Don't apply `position: static` or manipulate its z-index manually.

**Forgetting `textValue` on rich items.** If a ListBoxItem contains JSX beyond plain text, always set `textValue`. Otherwise screen readers and filtering get garbage.

**Missing `aria-label` for icon-only triggers.** If your trigger button has no visible text, add `aria-label` to the Button component. React Aria forwards it correctly to the accessibility tree.

**Skipping `allowsEmptyCollection` for async search.** Without it, the popover closes when the list is empty — including during the loading phase before your fetch resolves.

If you've been working through our [WAI-ARIA authoring practices](/blog/wai-aria-authoring-practices) guide, you know combobox and listbox are among the most complex ARIA patterns. React Aria Components encode those patterns so you don't have to memorize the spec.

## Frequently Asked Questions

### What's the difference between React Aria Select and ComboBox?

Select is a non-filterable dropdown — the user clicks a button, sees a list, picks an option. ComboBox is a text input combined with a dropdown, so the user can type to filter the options and optionally enter a custom value. Use Select for short, known option lists. Use ComboBox for long lists, autocomplete, or search-as-you-type patterns.

### Do I need to install the underlying React Aria hooks separately?

No. Installing `react-aria-components` gives you the pre-composed components. The underlying hooks (`@react-aria/combobox`, `@react-aria/select`) are for building custom primitives from scratch. For most projects, React Aria Components is the right choice — it's less code and fewer opportunities to miss an accessibility detail.

### How do I make a React Aria ComboBox filter asynchronously from an API?

Control `inputValue` and `items` yourself, pass `allowsEmptyCollection` so the popover stays open during loading, and set `defaultFilter={null}` so React Aria doesn't double-filter results the server already filtered. Debounce the input value before fetching to avoid a request on every keystroke.

### Does React Aria work with TypeScript?

Yes, and it's one of the library's strengths. All components ship with full TypeScript types. The `items` prop, selection keys, and render-state functions are all typed. You get autocomplete for `ListBoxItem` props and catch typos at compile time.

### How do I style React Aria components?

React Aria is unstyled. Pass `className` (a string or a function of render state) to any component. For Tailwind users, React Aria automatically sets data attributes like `data-open`, `data-focused`, and `data-invalid` that you can target with `data-[...]:` variants. No configuration needed.

### Can I use React Aria with React 19?

Yes. React Aria Components support React 18 and React 19. The library is actively maintained by Adobe and updates quickly when new React versions ship.

### How does React Aria handle keyboard navigation in ComboBox?

Arrow Down and Arrow Up move the highlighted option. Enter selects the highlighted option. Escape closes the popover. Home and End jump to the first and last option. Type-ahead also works — typing letters while the list is open jumps to matching options. All of this is handled automatically.

### Does React Aria Select support form submission?

Yes. Set the `name` prop on `<Select>` and React Aria renders a hidden native `<select>` that mirrors the state. Submitting the form includes the selected value, and this works with `FormData` and server actions without any extra wiring.

### How do I handle validation errors in React Aria?

Set `isInvalid` on the root component and render a `<FieldError>` child. React Aria wires up `aria-describedby` on the input, announces the error when the field is focused, and shows the error message only when invalid. No manual ARIA handling required.

### Can I use React Aria components outside of a React Spectrum application?

Yes. React Aria Components are standalone — you don't need React Spectrum (Adobe's design system) or its theming. They're designed to be used with any styling approach: plain CSS, CSS Modules, Tailwind, styled-components, or emotion.

### How does React Aria compare to other headless UI libraries like Radix or Headless UI?

All three are headless. Radix UI focuses on general-purpose primitives, Headless UI is smaller and simpler, and React Aria is the most comprehensive for accessibility specifically. React Aria's keyboard interactions, ARIA attributes, and screen reader announcements are more thoroughly tested across assistive technologies. If accessibility is a hard requirement, React Aria is the safest choice.

### What if I need multi-select with filtering?

React Aria has a separate TagField pattern for that use case. The composition differs slightly — it uses `<TagGroup>` alongside the ComboBox — but the underlying accessibility principles are the same. The React Aria docs cover it in depth.

## Wrapping up

React Aria Components give you accessible Select and ComboBox components without the burden of implementing the ARIA patterns yourself. The composition model is clean, the TypeScript support is excellent, and the accessibility behavior is thoroughly tested across browsers and assistive technologies.

For Select: compose `<Select>`, `<Label>`, `<Button>`, `<SelectValue>`, `<Popover>`, `<ListBox>`, and `<ListBoxItem>`. For ComboBox: swap `<Select>` for `<ComboBox>`, add `<Input>`, and wrap the input and button in `<Group>`.

Once you've built one, the pattern repeats. Country pickers, category filters, user search, tag inputs — they all use the same primitives with different data. The accessibility comes free.

For deeper dives, see our [React Aria Components overview](/blog/react-aria-components) for the broader library, our [WAI-ARIA authoring practices](/blog/wai-aria-authoring-practices) guide for the underlying patterns, and our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist) for the compliance requirements these components help you meet.

Now go build dropdowns that work for everyone.

---

_Need help building accessible components or migrating a custom UI to React Aria? Red Surge Technology specializes in inclusive React applications. [Get in touch](/contact) to discuss your project._
