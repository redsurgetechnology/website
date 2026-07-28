---
title: "JavaScript Closures Explained: Finally Understand What's Going On"
date: "2026-07-28T10:00:00.000Z"
excerpt: "Still fuzzy on JavaScript closures? You're not alone. This guide breaks down closures with simple examples, real-world patterns, and the classic for-loop trap."
cover_image: "/images/blog/uploads/javascript-closures-explained.webp"
seo_title: "JavaScript Closures Explained: Simple Examples & Real-World Use Cases"
seo_description: "JavaScript closures explained clearly. Learn how closures work, why they matter, and how to use them in event handlers, factories, and async code."
author_name: "Collin Stewart"
tags:
  - JavaScript
  - Fundamentals
  - Web Development
  - Coding
  - Closures
category: "JavaScript"
reading_time: 11
featured: false
no_index: false
---

Most developers have a moment with closures. That moment usually arrives sometime after you've been writing JavaScript for a while and someone asks you to explain what a closure actually is. You open your mouth, pause, and realize you don't quite have the words. You use them every day, but defining one cleanly feels harder than it should.

And honestly, that's not your fault. A lot of explanations make closures sound like some mysterious, advanced feature. They're not. A closure is just a function that remembers the variables from the place where it was defined, even when you call the function somewhere completely different. That's it. The rest is details.

Let me walk through how closures actually work, why they're so useful, the gotchas that trip people up, and the patterns you've probably already been using without realizing it.

## Lexical scoping is the foundation

Before closures make sense, you need to understand lexical scoping. In JavaScript, where a variable is defined determines where it can be accessed. A variable declared inside a function can't be seen from outside that function. A variable declared outside any function can be seen from inside any function.

```javascript
const outside = "I'm visible everywhere";

function demo() {
  const inside = "I'm only visible here";
  console.log(outside); // works
  console.log(inside); // works
}

console.log(outside); // works
console.log(inside); // ReferenceError
```

That's lexical scoping. The `inside` variable is scoped to the `demo` function. Nothing outside that function can touch it. You've probably internalized this without thinking about it.

Now, what happens if you return a function from inside `demo`? That inner function has access to the variables in its outer scope. That's where closures come from.

```javascript
function createGreeter(name) {
  const greeting = `Hello, ${name}`;

  return function () {
    console.log(greeting);
  };
}

const greetCollin = createGreeter("Collin");
greetCollin(); // "Hello, Collin"
```

The inner function is returned and called later, long after `createGreeter` has finished executing. Yet it still remembers `greeting`. That remembered bundle of variables is the closure. The function "closes over" its surrounding state.

## Why closures are everywhere without you noticing

Once you know what to look for, you'll see closures all over your codebase. Every event handler you write is a closure. Every callback you pass to `setTimeout` or `fetch` is a closure. Every React component function that uses state or props is a closure.

```javascript
function setupButton(buttonId, message) {
  const button = document.getElementById(buttonId);

  button.addEventListener("click", function () {
    alert(message); // This is a closure—'message' comes from the outer function
  });
}

setupButton("btn1", "You clicked button one");
```

The click handler function accesses `message` from the outer `setupButton` function. By the time someone actually clicks the button, `setupButton` finished running ages ago. The closure keeps `message` alive.

This is also how debounce and throttle functions work. The timer variable is stored in the closure, persisting across multiple function calls.

```javascript
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

The returned function remembers `timer` and `delay`. Every time you call the debounced version, it accesses and updates that same `timer` variable. If you've read our deep dive on [JavaScript debounce vs throttle](/blog/javascript-debounce-vs-throttle), you've already seen closures doing real work under the hood.

## The classic for-loop trap

There's one closure gotcha that almost everyone hits. It involves creating functions inside a loop and trying to capture the loop variable.

```javascript
for (var i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
// Output: 4, 4, 4 (not 1, 2, 3)
```

All three callbacks share the same `i` variable. By the time they run, the loop has finished and `i` is 4. The fix, historically, was to create a new scope for each iteration using an IIFE (immediately invoked function expression).

```javascript
for (var i = 1; i <= 3; i++) {
  (function (capturedI) {
    setTimeout(function () {
      console.log(capturedI);
    }, capturedI * 1000);
  })(i);
}
// Output: 1, 2, 3
```

These days, `let` solves this more cleanly. `let` is block-scoped, so each loop iteration gets its own `i`.

```javascript
for (let i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
// Output: 1, 2, 3
```

This trips up beginners because `var` doesn't create a new binding per iteration, but `let` does. It's a subtle difference that only makes sense once you understand closures. If you're preparing for interviews, this exact question comes up a lot—our [TypeScript interview questions](/blog/typescript-interview-questions) guide covers similar gotchas where scoping matters.

## Closures in async code

Async operations and closures go hand in hand. When you `await` a promise inside an async function, any variables you reference after the `await` are captured in a closure.

```javascript
async function fetchUserData(userId) {
  const user = await fetch(`/users/${userId}`).then((r) => r.json());
  // The variable 'user' is available here, inside this function's closure
  return user.name;
}
```

The tricky part is when you mix loops and async operations. If you're iterating over an array and making async calls inside the loop, the closure captures the loop variable. With `var`, you'd get the classic trap again. With `let` or `for...of`, each iteration gets its own scope.

```javascript
const ids = [1, 2, 3];
const results = [];

for (const id of ids) {
  const data = await fetch(`/users/${id}`).then((r) => r.json());
  results.push(data);
}
```

Each iteration's closure captures the `id` for that specific iteration. No surprises.

If you've been working with promises and need to fire off multiple requests at once, our comparison of [Promise.all vs Promise.allSettled](/blog/promise-all-vs-promise-allsettled) shows how closures keep your data handling clean when responses come back.

## Practical use: private variables

Closures give you a way to create truly private variables in JavaScript. Before classes had private fields (the `#` syntax), closures were the main way to hide data.

```javascript
function createCounter() {
  let count = 0;

  return {
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    getCount() {
      return count;
    },
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getCount()); // 2
console.log(counter.count); // undefined
```

The `count` variable is completely inaccessible from the outside. Only the methods returned from `createCounter` can touch it. This is the module pattern, and it's the foundation of how JavaScript handled encapsulation before ES modules.

Even today, closures are used for this in functional programming patterns and React hooks. The `useState` hook uses closures under the hood to remember state between renders.

## A memory consideration worth mentioning

Because closures keep references to variables, they can prevent garbage collection. If a closure captures a large object and the closure itself stays alive (like an event listener that's never removed), that object stays in memory.

```javascript
function setupLargeDataHandler() {
  const hugeDataset = new Array(1000000).fill("data");

  document.addEventListener("click", function () {
    console.log(hugeDataset.length); // Closure keeps hugeDataset alive
  });
}
```

As long as that click listener exists, the entire `hugeDataset` array stays in memory, even if the function only uses its `length`. This can become a problem in long-running applications if you're not mindful.

The fix is to only capture what you need, or to clean up event listeners when they're no longer needed. React's `useEffect` cleanup function exists partly for this reason—removing listeners so closures can be garbage collected.

## A story about a closure bug that took an afternoon to find

I once spent half a day debugging a React component that was behaving inconsistently. It was a search form with autocomplete. The user typed a query, and debounced results appeared. Most of the time it worked perfectly. But occasionally, the results displayed for one search term while the user had already typed a different term.

The issue was a stale closure. The fetch callback inside the `useEffect` captured the `query` state variable from an old render. When a new render happened, the old callback was still floating around due to the debounce timer, and it would fire with the old `query` value.

```javascript
// Buggy version — stale closure
useEffect(() => {
  const timer = setTimeout(() => {
    fetchResults(query); // 'query' might be stale
  }, 300);
  return () => clearTimeout(timer);
}, [query]);
```

The fix involved making sure the cleanup function actually cleared the timer and that the effect properly depended on the latest query. Understanding closures helped me trace exactly why the old value was being used.

This is the kind of bug that only makes sense once you can mentally visualize what variables a function is closing over and when those variables update. If you've been exploring [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide), you've seen how closures can interact with error objects in catch clauses, sometimes holding onto them longer than expected.

## Closures and the event loop

Closures play a role in how asynchronous code behaves alongside the event loop. When you pass a callback to `setTimeout`, that callback closes over the current scope. But the callback doesn't run immediately—it's placed in the task queue and executes after the current call stack clears.

```javascript
let message = "first";

setTimeout(function () {
  console.log(message); // What does this log?
}, 0);

message = "second";
// Output: 'second'
```

Even though the timeout is set to zero, the callback runs after the current synchronous code finishes. By then, `message` has been reassigned. The closure captures the variable reference, not a snapshot of the value. So it sees the updated value.

If you want to capture a snapshot, you need to pass the value in a way that creates a new binding—using a function parameter or an immediately invoked function.

## Wrapping up

Closures aren't a special feature you opt into. They're a consequence of how JavaScript handles scope and functions. Every function you write forms a closure over its surrounding scope. You're using them constantly, whether you realize it or not.

The key things to remember: a closure is a function plus its remembered outer variables. Lexical scoping determines which variables those are. The classic for-loop trap happens because `var` doesn't create a new binding per iteration. And closures are what make callbacks, event handlers, debouncing, and async code work the way they do.

If closures still feel a bit fuzzy after reading this, that's normal. The best way to internalize them is to build something that uses them deliberately. Write a debounce function from scratch. Build a counter with private state. Create a few event handlers that access outer variables. The moment you see a closure working in code you wrote, the concept goes from abstract to obvious.

---

_Brushing up on JavaScript fundamentals and want to level up your overall frontend skills? Red Surge Technology works with developers and teams to build solid, maintainable codebases. [Get in touch](/contact) to discuss how we can help._
