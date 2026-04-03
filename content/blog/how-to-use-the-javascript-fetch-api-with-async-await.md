---
title: "How to Use the JavaScript Fetch API with Async/Await"
date: 2026-04-03T09:00:00.000-04:00
excerpt: "Learn how to use the JavaScript Fetch API with async/await to make GET and POST requests, handle errors properly, and build real-world data fetching patterns — no jQuery required."
cover_image: /images/blog/uploads/javascript-fetch-api-async-await.webp
seo_title: "How to Use the JavaScript Fetch API with Async/Await (2026 Guide)"
seo_description: "A practical intermediate guide to the JavaScript Fetch API with async/await — covering GET and POST requests, error handling, loading states, and real-world patterns."
author_name: "Collin Stewart"
last_modified: 2026-04-03T09:00:00.000-04:00
tags:
  - javascript
  - fetch api
  - async await
  - web development
  - tutorial
  - frontend
category: "JavaScript"
reading_time: 9
featured: false
no_index: false
---

If you've been writing JavaScript for a while, you've probably used `fetch()` at some point — maybe to pull data from an API, submit a form, or load some JSON. But there's a big difference between code that *works* and code that handles the real world well: proper error handling, clean async patterns, and requests that don't silently fail when something goes wrong.

This guide is for developers who know the basics of JavaScript and want to move past copy-pasted fetch snippets and actually understand what's happening. We'll cover how `fetch()` works under the hood, how to pair it cleanly with `async/await`, how to handle errors the right way (this is where most tutorials fall short), and a handful of real-world patterns you'll use in actual projects.

> **Building a website for your business and wondering if it's doing its job?** We design and build fast, conversion-focused websites for small businesses. [See what Red Surge Technology offers](/about).

---

## What Is the Fetch API?

The Fetch API is the modern, native browser interface for making HTTP requests in JavaScript. It replaced `XMLHttpRequest` (XHR) — the older, callback-based approach that powered early AJAX — and it's been fully supported across all major browsers since around 2017.

The key thing to understand about `fetch()` is that it is **Promise-based**. When you call `fetch()`, it doesn't return the data — it returns a Promise that *resolves* to a `Response` object. You then have to call another method on that response (like `.json()`) to actually extract the data, which is *also* a Promise.

This two-step nature trips up a lot of developers early on, and it's why pairing `fetch()` with `async/await` makes the code so much cleaner to read and reason about.

---

## The Basic Structure: GET Request with Async/Await

Here's the cleanest way to write a basic GET request:

```javascript
async function getData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
```

Simple enough — but this version has a critical flaw. It has **no error handling**. If the server returns a 404 or 500, `fetch()` won't throw an error. It will resolve successfully with a `Response` object that has `response.ok` set to `false`. If you don't check for that, your code will quietly try to parse an error page as JSON and produce confusing bugs.

Here's how it should actually look:

```javascript
async function getData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
```

Now wrap the call in a `try/catch` at the point where you use it:

```javascript
async function loadUser() {
  try {
    const user = await getData('https://api.example.com/users/1');
    console.log(user);
  } catch (error) {
    console.error('Failed to load user:', error.message);
  }
}
```

This pattern separates two distinct failure modes that developers often conflate:

- **Network errors** (no internet, DNS failure, CORS block) — these cause `fetch()` to reject the Promise entirely, and `catch` handles them.
- **HTTP errors** (404, 500, 401) — these cause `fetch()` to *resolve*, but with a non-OK response. The `if (!response.ok)` check handles these.

Miss either one and you'll have bugs that are hard to track down in production.

---

## Making a POST Request

GET requests are read-only. When you need to send data to a server — submitting a form, creating a record, logging a user in — you'll use a POST request. Here's the full pattern:

```javascript
async function postData(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`POST failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
```

A few things worth noting here:

**`method: 'POST'`** — `fetch()` defaults to GET, so you need to specify any other method explicitly. The same applies for PUT, PATCH, and DELETE.

**`headers: { 'Content-Type': 'application/json' }`** — this tells the server what format your request body is in. Without it, many server-side frameworks will fail to parse the body and you'll get an empty object on the backend — a frustrating bug to debug.

**`JSON.stringify(payload)`** — the `body` option only accepts a string (or a few other specific types like `FormData` or `Blob`). Plain JavaScript objects need to be serialized first.

A real usage example, submitting a contact form:

```javascript
async function submitContactForm(formData) {
  try {
    const result = await postData('/api/contact', {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });

    console.log('Form submitted successfully:', result);
    showSuccessMessage();
  } catch (error) {
    console.error('Submission failed:', error.message);
    showErrorMessage();
  }
}
```

---

## Handling Different Response Types

Not every API returns JSON. `fetch()` gives you several methods on the `Response` object to handle different content types:

```javascript
// JSON — most APIs
const data = await response.json();

// Plain text
const text = await response.text();

// Binary data (images, files, PDFs)
const blob = await response.blob();

// Form data
const formData = await response.formData();

// Low-level binary buffer
const buffer = await response.arrayBuffer();
```

You can only call one of these once per response — they consume the response body as a stream. If you need to both read the body *and* do something else with it, you can clone the response first with `response.clone()`.

A practical example — checking the content type before parsing:

```javascript
async function fetchResource(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`);
  }

  const contentType = response.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  if (contentType.includes('text/')) {
    return response.text();
  }

  return response.blob();
}
```

---

## Adding Request Headers

Many APIs require authentication tokens, API keys, or custom headers. You pass these in the `headers` option:

```javascript
async function fetchProtectedData(url, token) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Api-Version': '2',
    },
  });

  if (!response.ok) {
    throw new Error(`Auth request failed: ${response.status}`);
  }

  return response.json();
}
```

You can also use the `Headers` constructor for more control, which lets you append, delete, and check for existing headers programmatically — useful when building reusable API clients.

---

## Cancelling a Fetch Request with AbortController

One limitation of early `fetch()` implementations was that there was no clean way to cancel an in-flight request. `AbortController` fixes that — and it's essential for any UI where a user can navigate away or trigger a new search before the old one completes.

```javascript
function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { signal: controller.signal })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      return response.json();
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    });
}
```

A real-world use case — cancelling a previous search request when the user types again:

```javascript
let currentController = null;

async function searchUsers(query) {
  // Cancel the previous request if it's still in flight
  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();

  try {
    const response = await fetch(`/api/users?q=${encodeURIComponent(query)}`, {
      signal: currentController.signal,
    });

    if (!response.ok) throw new Error(`Search failed: ${response.status}`);
    return await response.json();

  } catch (error) {
    if (error.name === 'AbortError') {
      // This is expected — previous request was cancelled
      return null;
    }
    throw error;
  }
}
```

This pattern prevents race conditions where an older, slower request resolves after a newer one and overwrites the correct result.

---

## Building a Reusable API Client

Once you're writing `fetch()` calls across a real project, you'll want to centralise the shared logic — base URL, auth headers, error handling — rather than duplicating it in every function. Here's a clean pattern for a reusable API client:

```javascript
class ApiClient {
  constructor(baseUrl, token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error ${response.status}: ${errorBody}`);
    }

    // Handle empty responses (e.g., 204 No Content)
    const contentType = response.headers.get('Content-Type') ?? '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Usage
const api = new ApiClient('https://api.example.com', userToken);

const user = await api.get('/users/1');
const newPost = await api.post('/posts', { title: 'Hello', body: 'World' });
```

This is the kind of abstraction that makes working with APIs in a real codebase clean and maintainable. It's a simple pattern, but it eliminates a huge amount of repetition and makes it trivial to swap in a new base URL, rotate tokens, or add request logging later.

---

## Practical Loading State Pattern

In any UI, you'll want to show a loading indicator while a fetch is in progress and handle both success and error states. Here's a clean vanilla JS pattern for that:

```javascript
async function fetchAndRender(url, containerEl) {
  // Show loading state
  containerEl.innerHTML = '<p class="loading">Loading...</p>';

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load: ${response.status}`);
    }

    const data = await response.json();

    // Render success state
    containerEl.innerHTML = `
      <ul>
        ${data.map(item => `<li>${item.name}</li>`).join('')}
      </ul>
    `;

  } catch (error) {
    // Render error state
    containerEl.innerHTML = `
      <p class="error">Something went wrong: ${error.message}</p>
    `;
  }
}
```

This three-state pattern — loading / success / error — is the foundation of how virtually every modern UI handles async data fetching, whether you're in vanilla JS, React, Vue, or anything else.

---

## Frequently Asked Questions About the JavaScript Fetch API

### What's the difference between fetch() and XMLHttpRequest?

`XMLHttpRequest` is the older approach — callback-based, verbose, and harder to read. `fetch()` is Promise-based, which makes it much cleaner to use with `async/await`. The two also differ in how they handle cookies and CORS by default. Unless you're supporting very old browsers or need specific XHR features, `fetch()` is the right choice for all new code.

### Why doesn't fetch() throw an error on a 404 or 500?

This surprises a lot of developers. `fetch()` only rejects its Promise on *network-level* failures — no connection, DNS errors, and so on. HTTP error status codes (4xx, 5xx) are considered valid responses from the server's perspective. You need to check `response.ok` or `response.status` yourself and throw if needed. Always include this check — it's the most common source of silent bugs in fetch-based code.

### Should I use fetch() or Axios?

For most projects, the native Fetch API is more than capable. Axios adds automatic JSON parsing, request/response interceptors, and slightly more consistent error handling — but it's an extra dependency. If you're already building the reusable client pattern shown above, you'll get most of the same benefits from `fetch()` with zero added bundle weight.

### How do I send form data instead of JSON?

Use the `FormData` API as the body, and don't set a `Content-Type` header — the browser will automatically set the correct multipart form boundary:

```javascript
const formData = new FormData(formElement);
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

### How do I handle CORS errors with fetch()?

CORS errors are enforced by the browser as a security measure and can only be properly fixed on the server — by setting the correct `Access-Control-Allow-Origin` response headers. On the client side, setting `mode: 'no-cors'` will suppress the error but make the response opaque (unreadable), which is rarely useful. If you're hitting CORS during development, a dev proxy (like Vite's `server.proxy`) is the cleanest workaround.

### Can I use fetch() in Node.js?

Yes — `fetch()` has been available natively in Node.js since version 18, without needing any polyfill or library. For older Node versions, `node-fetch` was the standard workaround. If you're on Node 18+, the native `fetch()` behaves identically to the browser version.

---

*Written by Collin Stewart, founder of Red Surge Technology. We build fast, modern websites for small businesses across New Jersey. If you found this useful, check out our other posts on [web design](/blog/how-much-does-a-website-cost-for-a-small-business-in-new-jersey) and [local SEO](/blog/the-local-seo-guide-for-ocean-monmouth-county-businesses).*