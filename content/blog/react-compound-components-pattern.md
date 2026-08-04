---
title: "React Compound Components Pattern: Write Smarter, More Flexible UI"
date: "2026-08-04T10:00:00.000Z"
excerpt: "Learn the React compound components pattern to build flexible, reusable UI without prop drilling. Tabs, accordions, and selects become cleaner and more intuitive."
cover_image: "/images/blog/uploads/react-compound-components-pattern.webp"
seo_title: "React Compound Components Pattern: Build Flexible UI Components"
seo_description: "Master the React compound components pattern with practical examples. Learn how to share state implicitly using Context, build Tabs and Select, and when this pattern shines."
author_name: "Collin Stewart"
tags:
  - React
  - JavaScript
  - Design Patterns
  - Component Architecture
  - Web Development
category: "JavaScript"
reading_time: 11
featured: false
no_index: false
---

Some React components start out simple. A `<Tabs>` component that takes an array of labels and some content. It works. Then the designer wants one tab to have a badge. Then another tab needs an icon. Then the active tab needs a completely different background style. Suddenly your clean, prop-driven component has eighteen props, half of them optional, and the code is a maze of conditional rendering.

There's a better way. Instead of forcing all the configuration through a single component's props, you let the developer compose the UI using a set of related components that share state behind the scenes. This is the compound components pattern. It's not a library or a new API—it's a way of structuring your components so they're flexible without being complicated.

The `<select>` and `<option>` elements in HTML are the original compound components. You don't pass an array of options to `<select>`. You nest `<option>` elements inside it. The parent and children communicate through the DOM hierarchy. React's compound components pattern brings that same composability to your own components, using Context to share state instead of the DOM.

## The problem compound components solve

Imagine building a `<Select>` component from scratch. The standard approach is a single component that takes an `options` array and an `onChange` callback.

```javascript
<Select
  options={[
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
  ]}
  value={selected}
  onChange={setSelected}
/>
```

This works until you need a custom option renderer. Or a header inside the dropdown. Or an option with a tooltip. Or an option that navigates instead of selecting. Each new requirement forces you to add more props and more conditional logic. Eventually, the component becomes a Swiss Army knife that's bad at everything.

The compound components approach inverts the control. Instead of passing data as props, you compose the UI with child components that know how to talk to the parent.

```javascript
<Select value={selected} onChange={setSelected}>
  <Select.Option value="dog">Dog</Select.Option>
  <Select.Option value="cat">Cat</Select.Option>
  <Select.Header>Favorites</Select.Header>
  <Select.Option value="bird">Bird</Select.Option>
</Select>
```

The developer has full control over the markup and can insert anything between options. The parent `<Select>` provides state through React Context, and the `<Select.Option>` components consume that context to know if they're selected, to fire the onChange, and to apply active styles.

This is the same pattern that libraries like [React Aria Components](/blog/react-aria-components) use. They give you composable parts that handle accessibility and behavior, while you control the visual output.

## How the magic actually works

The implementation is surprisingly straightforward. A Context holds the state and any callbacks. The parent component provides that context. Child components consume it.

Let's build a `<Tabs>` component to see it in action.

```javascript
import { createContext, useContext, useState } from "react";

// 1. Create the context
const TabsContext = createContext();

// 2. The parent component provides state
function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}
```

So far, nothing special. The `<Tabs>` component just wraps its children in a context provider. Now the child components can access that context.

```javascript
// 3. Custom hook to consume the context safely
function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a <Tabs>");
  }
  return context;
}

// 4. The TabList and Tab components
function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ children, id }) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(id)}
      style={{
        padding: "10px 16px",
        background: isActive ? "#3b82f6" : "#e5e7eb",
        color: isActive ? "white" : "black",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function TabPanel({ children, id }) {
  const { activeTab } = useTabs();
  if (activeTab !== id) return null;

  return <div role="tabpanel">{children}</div>;
}
```

Finally, we attach the child components to the parent, so they can be used with dot notation.

```javascript
Tabs.TabList = TabList;
Tabs.Tab = Tab;
Tabs.TabPanel = TabPanel;

export { Tabs };
```

Now the developer uses them naturally.

```javascript
<Tabs defaultTab="dogs">
  <Tabs.TabList>
    <Tabs.Tab id="dogs">Dogs</Tabs.Tab>
    <Tabs.Tab id="cats">Cats</Tabs.Tab>
  </Tabs.TabList>
  <Tabs.TabPanel id="dogs">Content about dogs</Tabs.TabPanel>
  <Tabs.TabPanel id="cats">Content about cats</Tabs.TabPanel>
</Tabs>
```

The `<Tabs.Tab>` and `<Tabs.TabPanel>` components don't need any props drilled down. They read the active tab and the setter directly from context. The API is clean, the markup is flexible, and the state is managed in one place.

If the designer wants a badge on the "Cats" tab, the developer adds it inside the `<Tabs.Tab>` element. No props need to be added to the `<Tabs>` component. That's the power of compound components.

## An accordion story (and why I almost over-engineered it)

A while back, I built a help center with an accordion component. The initial version was simple: a single `<Accordion>` that took an array of items, each with a title and content. It worked perfectly for the first two weeks.

Then the product team wanted one accordion item to contain a video, not just text. Then another needed a nested accordion inside it. Then they wanted to add a "Was this helpful?" button at the bottom of specific items.

I spent an afternoon trying to extend the original component with more and more props—`renderItem`, `itemProps`, `customFooter`. The code got ugly fast. Then I remembered the compound components pattern.

I refactored the accordion into `<Accordion>`, `<Accordion.Item>`, `<Accordion.Button>`, and `<Accordion.Panel>`. The refactor took about two hours, and suddenly all the edge cases disappeared. The video, the nested accordion, the feedback button—they were all just content placed inside `<Accordion.Panel>`. The component didn't need to know about them.

The lesson: compound components shine when you can't predict all the future use cases. They give the developer the power to compose, not just configure.

## When to use compound components (and when not to)

Compound components aren't always the right choice. They add indirection. A developer reading the code needs to understand that `<Tabs.Tab>` gets its props from a parent provider, not from its immediate parent in the JSX. This mental model is easy once you learn it, but it's an extra step.

Use compound components when:

- The component has multiple parts that need to share state (tabs, accordion, select, menu, modal).
- You expect developers to customize the markup—inserting custom elements between the standard ones.
- The component has optional children that may or may not appear (a footer in a modal, an icon in a tab, a description in an option).

Avoid compound components for components with a fixed structure that won't change. A simple button doesn't need a `<Button.Text>` and `<Button.Icon>`. A regular prop is fine.

If you've been working on keeping your React app performant, you'll find that compound components play nicely with the patterns from [preventing unnecessary re-renders](/blog/prevent-unnecessary-rerenders-react). Since state lives in the parent and is distributed via context, child components can be memoized and only re-render when their specific slice of state changes.

## Adding state management: useState or useReducer?

The compound components pattern is just the UI layer. The state management inside the parent can be `useState` or `useReducer`. For a simple tabs component, `useState` is enough. For something like a multi-select with search, filtering, and keyboard navigation, `useReducer` becomes invaluable.

As we covered in [useState vs useReducer](/blog/react-usestate-vs-usereducer), a reducer helps when state transitions are interdependent. A `<Select>` that needs to handle open/close, search query, highlighted index, and selected value all at once benefits from a reducer that ensures consistency.

```javascript
function selectReducer(state, action) {
  switch (action.type) {
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false, query: "", highlightedIndex: -1 };
    case "SET_QUERY":
      return { ...state, query: action.payload, highlightedIndex: 0 };
    // ...
  }
}
```

The component structure stays the same—the parent provides the context. The difference is whether the context value comes from `useState` or `useReducer`. The pattern itself is state-management-agnostic.

## Wrapping up

The compound components pattern is one of those ideas that, once you understand it, you'll start seeing places to use it everywhere. It turns monolithic, prop-heavy components into flexible, composable APIs that feel natural to use.

The implementation is surprisingly simple: a Context, a Provider, and a few child components that consume that context. The payoff is huge. Developers using your components get the flexibility to customize the markup without you having to predict every edge case. And because the state lives in one place, the logic is easier to test and debug.

Next time you find yourself adding the ninth optional prop to a component, ask yourself: should this be a compound component instead?

---

_Building a React component library that's both powerful and flexible? Red Surge Technology helps teams design composable component APIs that scale with their products. [Get in touch](/contact) to discuss your project._
