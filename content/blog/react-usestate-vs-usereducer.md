---
title: "React useState vs useReducer: Which One Wins for Your Next Component?"
date: "2026-08-03T10:00:00.000Z"
excerpt: "Stuck between useState and useReducer? Learn the real differences, when to pick one over the other, and how to refactor messy state logic without losing your mind."
cover_image: "/images/blog/uploads/react-usestate-vs-usereducer.webp"
seo_title: "React useState vs useReducer: How to Choose the Right State Hook"
seo_description: "Confused about useState vs useReducer in React? We break down the tradeoffs with practical code comparisons, performance tips, and a real-world refactoring story."
author_name: "Collin Stewart"
tags:
  - React
  - JavaScript
  - Hooks
  - State Management
  - Web Development
category: "JavaScript"
reading_time: 10
featured: false
no_index: false
---

React gives you two main hooks for managing state in functional components: `useState` and `useReducer`. They both hold onto values across renders, they both trigger re-renders when those values change, and they can both technically be used in almost any situation. So why do they exist as separate tools?

It’s not because one is the "advanced" version of the other. It’s because they model state differently, and picking the right one makes your components easier to read, test, and maintain. The wrong choice doesn’t break your app immediately, but it slowly turns your component into a knot of spaghetti logic that nobody wants to touch.

I’ve watched teams default to `useState` for everything because it’s simpler to explain, and I’ve seen other teams jump straight to `useReducer` because it feels more professional. Both approaches create problems when applied dogmatically. The trick is understanding what each hook is actually good at.

## The mental model behind useState

`useState` is built around the idea that state is a collection of independent variables. You declare a piece of state, get its current value, and get a setter function that replaces that value entirely. There’s no structure imposed on how those state variables relate to one another.

```javascript
const [count, setCount] = useState(0);
const [step, setStep] = useState(1);
const [isPaused, setIsPaused] = useState(false);
```

Each `useState` call stands alone. Changing `count` doesn’t automatically affect `step`, and toggling `isPaused` doesn’t reset anything unless you write that logic yourself. This independence is `useState`’s biggest strength. For simple, unrelated values—a toggle here, a counter there—it’s exactly the right amount of abstraction.

The trouble starts when those values stop being independent. A form with five fields that all need to reset at once. A multi-step wizard where moving to the next step should clear the current step’s data. A search interface where changing the query should reset the pagination. With `useState`, you end up writing coordination logic that sits outside the state itself, scattered across event handlers.

```javascript
// Coordinating state manually gets messy
const handleSearch = (query) => {
  setQuery(query);
  setPage(1); // Don't forget to reset pagination
  setResults([]); // Clear old results
  setError(null); // Clear old error
};
```

Forgetting one of those setters creates a bug. And because the logic is duplicated in every handler that changes `query`, it’s easy to forget. This is the exact kind of subtle inconsistency that creeps into components over time.

## The mental model behind useReducer

`useReducer` models state as a single object that can only be updated by dispatching actions. An action describes what happened—"the user typed a new search query," "the form was submitted," "the timer finished." A reducer function takes the current state and the action, then returns the next state.

```javascript
const initialState = {
  query: "",
  results: [],
  page: 1,
  error: null,
};

function searchReducer(state, action) {
  switch (action.type) {
    case "NEW_QUERY":
      return {
        query: action.payload,
        results: [],
        page: 1,
        error: null,
      };
    case "RESULTS_LOADED":
      return {
        ...state,
        results: action.payload.results,
      };
    case "NEXT_PAGE":
      return {
        ...state,
        page: state.page + 1,
      };
    case "ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}
```

The reducer enforces the rules about how state transitions work. When a new query arrives, you don’t have to remember to reset pagination and clear errors in every event handler—the reducer does it for you. The logic lives in one place, and it’s easy to test because it’s a pure function: state and action in, next state out.

`useReducer` also makes complex state transitions more predictable. Instead of setting multiple state variables in a specific order and hoping React batches them correctly, you dispatch a single action that describes the entire transition. The reducer applies all the changes atomically.

## When useState is all you need

If your component has two or three independent state values and they don’t need to coordinate with each other, stick with `useState`. A modal’s open/closed state, a loading boolean, a counter—these are simple, self-contained pieces of data.

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => setCount((c) => c + 1)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ background: isHovered ? "#eee" : "#fff" }}
    >
      Count: {count}
    </button>
  );
}
```

There’s no coordination between `count` and `isHovered`. They don’t affect each other. Adding `useReducer` here would be over-engineering. It would add lines of code without making the component clearer.

The same applies to form fields that don’t depend on each other. A login form with an email field and a password field can happily use two `useState` calls. The fields are independent. There’s no need to coordinate them.

If you’ve been working with [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide), you’ll recognize this pattern of choosing the simplest tool that handles the job. Sometimes the best error handling is a typed `catch`. Sometimes the best state management is a couple of `useState` calls.

## When useReducer earns its keep

`useReducer` becomes valuable when state values are interdependent. If changing one piece of state requires resetting or recalculating another, the reducer pattern keeps that logic contained.

Multi-step forms are the textbook example. Each step might have its own validation state, its own data, and its own loading indicators. Moving forward or backward needs to clear the right things and preserve the right things. A reducer makes these transitions explicit.

```javascript
function formReducer(state, action) {
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        step: state.step + 1,
        errors: {}, // Clear errors between steps
      };
    case "PREV_STEP":
      return {
        ...state,
        step: state.step - 1,
      };
    case "SET_FIELD":
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
      };
    case "SET_ERRORS":
      return {
        ...state,
        errors: action.errors,
      };
    default:
      return state;
  }
}
```

Any handler that moves the wizard forward doesn’t need to know about clearing errors. The reducer handles it. If a new requirement comes in—"clear the temporary upload when moving back a step"—you add it to the reducer in one place, not across five event handlers.

Another sign it’s time for `useReducer`: your `useState` component has multiple setter calls inside a single event handler, and they always appear together. That’s the coordination logic screaming to be centralized.

## A refactoring story that changed how I think about state

I was working on a search interface for a job board a while back. The component let users filter by keyword, location, salary range, and job type. There was a search button, pagination, and a "clear all filters" link. I built it with `useState`—six different state variables, all managed with individual setters.

The initial build worked. But over time, the component got harder to change. The product team wanted the filters to apply automatically when the user stopped typing, not just on button click. That meant the debounce handler needed to know which filters were active. It needed to clear pagination, set loading, and track whether the results were stale. I found myself copying the same three lines of state updates into four different places.

When the team asked for a "save this search" feature that would serialize the current filters to a URL, I realized the state logic had sprawled beyond what I could easily track. I spent an afternoon refactoring to `useReducer`. The reducer had actions like `SET_FILTER`, `APPLY_FILTERS`, `RESULTS_LOADED`, and `RESET`. The coordination logic lived in the reducer, and the event handlers became single dispatch calls.

The component went from 180 lines to about 120, and the bug where pagination didn’t reset on filter change—which had been reported twice—disappeared because the reducer now enforced that transition. The refactor didn’t take long, but it made the code dramatically easier to reason about. I should have started with `useReducer` the moment I realized filters and pagination were coupled.

## Performance: useState vs useReducer

Both hooks trigger re-renders when state changes. Neither is inherently faster. The performance difference comes from how you use them.

With `useState`, it’s easy to accidentally create new objects or arrays on every render, which can cause unnecessary re-renders in memoized child components. `useReducer` doesn’t solve this automatically, but because the state is typically a single object, it’s easier to see when you’re creating unnecessary references.

If you’ve been optimizing with [preventing unnecessary re-renders in React](/blog/prevent-unnecessary-rerenders-react), you’ll know that stable references matter. A reducer that returns the same state object (by reference) when no change is needed tells React to skip the re-render. `useState`’s setter always triggers a re-render, even if you set the same value. With `useReducer`, you can bail out of a re-render by returning the identical state object.

```javascript
function counterReducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "NOOP":
      return state; // Same reference, React skips re-render
    default:
      return state;
  }
}
```

This isn’t the primary reason to choose `useReducer`, but it’s a nice bonus when you’re chasing performance.

## TypeScript and reducers: a match made in heaven

If you’re using TypeScript, `useReducer` shines even brighter. You can type the state and the actions, giving you autocomplete and compile-time checks on every dispatch call.

```typescript
type State = {
  query: string;
  results: SearchResult[];
  page: number;
  loading: boolean;
};

type Action =
  | { type: "NEW_QUERY"; payload: string }
  | { type: "RESULTS_LOADED"; payload: SearchResult[] }
  | { type: "NEXT_PAGE" }
  | { type: "SET_LOADING"; payload: boolean };

function searchReducer(state: State, action: Action): State {
  switch (action.type) {
    case "NEW_QUERY":
      return {
        ...state,
        query: action.payload,
        results: [],
        page: 1,
        loading: true,
      };
    case "RESULTS_LOADED":
      return { ...state, results: action.payload, loading: false };
    case "NEXT_PAGE":
      return { ...state, page: state.page + 1 };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
  }
}
```

TypeScript ensures that every action has the correct shape, and that the reducer handles all possible action types. Dispatch a misspelled action type, and the editor tells you immediately. This catches a category of bugs that `useState` can’t prevent—you can call `setQuery(123)` and TypeScript won’t complain unless you’ve typed the state carefully.

If you’ve been working through [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide), you’ll appreciate that typed reducers add a similar safety net to your state logic.

## The "just use both" approach

You don’t have to pick one hook per component. Components can mix `useState` and `useReducer`. Use `useReducer` for the complex, interdependent state and `useState` for simple, independent UI state like hover effects or local toggles.

```javascript
function SearchPage() {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Complex search logic handles by reducer
  // Simple modal toggle handled by useState
  // ...
}
```

This is pragmatic. The complex state gets the structure it needs. The simple state stays simple. No one complains that you’re mixing hooks—they’re tools, not identities.

## Wrapping up

`useState` and `useReducer` aren’t competing for the same job. `useState` is for independent values that don’t need to coordinate. `useReducer` is for interdependent state where changes to one value should trigger updates to others.

If you’re writing a simple counter or a toggle, reach for `useState`. If you’re writing a multi-step form, a complex search filter, or any component where event handlers are calling multiple setters in the same breath, reach for `useReducer`.

The goal isn’t to use the more "advanced" hook. It’s to use the hook that makes your state logic clear, testable, and easy to change six months from now.

---

_Struggling with messy React state logic that’s getting harder to maintain? Red Surge Technology helps teams refactor components, adopt clean patterns, and ship with confidence. [Get in touch](/contact) to talk about your project._
