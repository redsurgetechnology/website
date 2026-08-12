---
title: "React Controlled vs Uncontrolled Components: A Practical Guide for Forms and Beyond"
date: "2026-08-05T10:00:00.000Z"
excerpt: "Confused about controlled vs uncontrolled components in React? Learn the real tradeoffs, when to use each, and how to avoid common form handling pitfalls."
cover_image: "/images/blog/uploads/react-controlled-vs-uncontrolled.webp"
seo_title: "React Controlled vs Uncontrolled Components: When to Use Each"
seo_description: "Master controlled vs uncontrolled components in React. Practical examples for forms, file inputs, and performance, plus a real refactoring story."
author_name: "Collin Stewart"
tags:
  - React
  - JavaScript
  - Forms
  - State Management
  - Web Development
category: "JavaScript"
reading_time: 11
featured: false
no_index: false
---

There are two ways to handle form inputs in React. You can let the DOM handle the input's value, only grabbing it when you need it. Or you can take full control, binding the input's value to React state and updating it on every keystroke. These two approaches are called uncontrolled and controlled components, and they're the source of more confusion than they deserve.

The React docs mention both, but they don't always make it clear why you'd pick one over the other. The discussion often devolves into "controlled is the React way" versus "uncontrolled is simpler." Neither statement is completely true. Both patterns exist for a reason, and picking the right one can save you from a lot of unnecessary code—or a lot of subtle bugs.

I've watched junior developers wrap every single input in `useState` without thinking, and I've seen senior developers avoid controlled components so religiously that they can't validate a field in real time. The truth is, this isn't a binary choice. It's a spectrum, and your job is to find the right spot on it for each input.

## The fundamental difference

In a controlled component, React state is the single source of truth. The input's `value` prop is set to a state variable, and an `onChange` handler updates that state. React owns the value completely.

```javascript
function ControlledForm() {
  const [email, setEmail] = useState("");

  return (
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  );
}
```

Every keystroke triggers a state update, which triggers a re-render, which puts the new value back into the input. The user sees exactly what's in state. If you want to validate the email on the fly, format it, or restrict certain characters, you can do that in the `onChange` handler. The UI always reflects your logic.

In an uncontrolled component, the DOM owns the value. You access it with a ref when you need it—typically on form submission.

```javascript
function UncontrolledForm() {
  const emailRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    // Use the email...
  };

  return <input type="email" ref={emailRef} />;
}
```

React doesn't know or care what's in that input until you read it from the ref. There's no state update on every keystroke. There's no re-render. The input behaves exactly like a plain HTML input, which can feel refreshingly simple.

## The "one source of truth" advantage

The biggest argument for controlled components is that they make your UI predictable. The input's value is always `state.email`. If you need to display that value somewhere else—a preview, a character count, a validation message—you just read from state. You don't need to sync anything.

```javascript
function EmailWithValidation() {
  const [email, setEmail] = useState("");
  const isValid = email.includes("@");

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {!isValid && <p className="error">Please enter a valid email</p>}
      <p>Character count: {email.length}</p>
    </div>
  );
}
```

The validation message and character count update instantly because they're derived from state. If you used an uncontrolled input, you'd need to either read from the ref on every keystroke (which defeats the purpose) or maintain a separate state variable that mirrors the input (which is essentially a controlled component with extra steps).

Real-time validation, conditional submit buttons, input masks, and instant search all benefit from having the value in React state. This is the controlled component's killer feature, and it's the reason most form libraries—Formik, React Hook Form, Final Form—use controlled inputs under the hood.

## The performance objection (and when it actually matters)

The classic argument against controlled components is performance. Every keystroke triggers a state update and a re-render. Type a sentence, and React re-renders the component fifty times. That sounds bad, but it's usually not. React is fast at re-rendering, and if your component tree is shallow, the user won't notice.

The problem arises with complex forms—dozens of fields, deeply nested components, expensive validation logic running on every keystroke. If you've read our guide on [preventing unnecessary re-renders in React](/blog/prevent-unnecessary-rerenders-react), you know that uncontrolled re-renders in large trees can cause jank. A controlled input at the top of a complex form can cascade renders through every child, even if the child doesn't depend on the input value.

This is where uncontrolled components can genuinely help. By keeping the value in the DOM, you avoid the render cascade entirely. Libraries like React Hook Form embrace this—they use refs under the hood, only pulling values when needed, and minimize re-renders.

But for most forms, performance isn't the deciding factor. A login form with three fields isn't going to benefit from uncontrolled components. A spreadsheet-like data grid with hundreds of cells might. Don't optimize prematurely; start controlled and switch to uncontrolled only if you measure a problem.

## The file input exception

There's one input type where uncontrolled is basically mandatory: `type="file"`. The file input's value is a `FileList` object, and it's read-only. You can't set `value` on a file input programmatically—it's a security restriction in browsers. So controlled components are out.

```javascript
function FileUpload() {
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (file) uploadFile(file);
  };

  return <input type="file" ref={fileRef} />;
}
```

This is an uncontrolled component, and it's the only sensible way to handle file inputs. You can combine it with controlled state for the file metadata or upload progress, but the raw file input must remain uncontrolled.

## A story about a form that broke in production

I once worked on a checkout flow that used controlled inputs for credit card details. The card number, expiration, and CVC were all in React state, with real-time formatting (inserting spaces every four digits, adding a slash between month and year). It worked beautifully in development.

Then we got reports from users that the form was broken on certain Android devices. The card number field would lose focus after every few keystrokes. The formatting was causing the cursor to jump to the end, and on some keyboards, that triggered a blur event.

The fix was to keep the input visually formatted but store the raw value in state and only apply formatting on blur. We used an uncontrolled approach for the visual display, syncing it with state when the user left the field. It was a hybrid: uncontrolled for the input's native behavior, controlled for the validation logic.

That experience taught me that the controlled vs uncontrolled distinction isn't always strict. Sometimes the best approach is a mix of both—using a ref to read the value when you need it, but also maintaining state for validation messages or dependent UI.

## The hybrid approach using React Hook Form

React Hook Form popularized a hybrid approach that many developers now use. It registers inputs as uncontrolled (using refs under the hood), but it gives you access to values, errors, and touched states in real time without triggering full re-renders.

```javascript
import { useForm } from "react-hook-form";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email", { required: true })} />
      {errors.email && <span>Email is required</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

The input behaves as uncontrolled—no `value` prop, no `onChange` handler. But the library tracks the value, validates it, and surfaces errors, all without forcing a re-render on every keystroke. Under the hood, it's using refs and subscribing to specific fields to update only what needs to update.

If you've been building forms with [React's useState vs useReducer](/blog/react-usestate-vs-usereducer), you'll find that libraries like React Hook Form replace a lot of the boilerplate you'd otherwise write. They handle the controlled/uncontrolled decision for you, giving you the real-time validation of controlled components with the performance of uncontrolled ones.

## When to go fully controlled

Controlled components are the right call when you need to derive UI from input values in real time. Instant search fields that filter results as you type. Character counters. Live previews. Password strength meters. Any situation where the input value drives other parts of the UI immediately.

They're also better when you need to manipulate the value programmatically. Formatting a phone number as the user types. Restricting input to digits only. Converting to uppercase. These require you to set the `value` prop, which means controlled.

And they're better for complex validation that depends on multiple fields. If the validity of the "confirm password" field depends on the "password" field, you need both values in state so you can compare them on every change. Doing this with refs would be awkward.

If you've been exploring [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide), you know that typed, predictable state prevents bugs. Controlled forms give you typed, predictable form state that you can validate, transform, and submit with confidence.

## When to stay uncontrolled

Uncontrolled components shine when you don't need real-time validation or derived UI. A simple contact form with name, email, and message that only validates on submit. A search bar that only fires a request when the user presses Enter. A settings page where users click "Save" to apply changes.

They're also simpler to integrate with non-React code. If you're embedding React into a legacy application or working with a third-party library that expects to own the DOM, uncontrolled components avoid conflicts.

And as mentioned, they can improve performance in forms with many fields. If you're building a data grid where each cell is an input, making them all controlled can cause noticeable lag. Uncontrolled cells with refs avoid the re-render overhead.

## The mental model shift

I've found it helpful to think of controlled and uncontrolled not as competing strategies but as different ownership models. With controlled, React owns the value. With uncontrolled, the DOM owns the value. The question is: who needs to know about the value right now?

If React needs to know (for validation, formatting, dependent UI), go controlled. If only the DOM needs to know until the user submits, go uncontrolled. If both need to know at different times, use a hybrid—a library like React Hook Form or a custom hook that syncs when needed.

## Wrapping up

The controlled vs uncontrolled debate isn't about which is "more React." It's about which ownership model fits your use case. Controlled components give you real-time access to input values, making validation and dependent UI straightforward. Uncontrolled components keep things simple and performant when you don't need that real-time access.

Most forms in production use a mix of both, whether explicitly or through a library. The important thing is to make the choice deliberately, not out of habit. Next time you add an input to a component, take a second to ask: does React need to know about every keystroke, or can it wait until the form is submitted?

---

_Building forms in React and want to strike the right balance between control and performance? Red Surge Technology helps teams implement clean, maintainable form patterns. [Get in touch](/contact) to discuss your project._
