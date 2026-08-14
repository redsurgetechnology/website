---
title: "CORS Preflight Requests Explained: What Triggers Them and How to Fix Common Errors"
date: "2026-08-14T10:00:00.000Z"
excerpt: "Confused by CORS preflight requests? Learn what triggers an OPTIONS preflight, which headers matter, and how to fix the most common cross-origin errors in your JavaScript apps."
cover_image: "/images/blog/uploads/cors-preflight.webp"
seo_title: "CORS Preflight Requests: What They Are and How to Fix Errors"
seo_description: "Understand CORS preflight requests with practical examples. Learn when browsers send OPTIONS requests, which headers to set, and how to debug cross-origin failures."
author_name: "Collin Stewart"
tags:
  - CORS
  - JavaScript
  - API
  - Web Development
  - HTTP
category: "JavaScript"
reading_time: 11
featured: false
no_index: false
---

You've probably seen it in your browser's network tab: an `OPTIONS` request that shows up before your actual `POST` or `PUT` request. It looks like a wasted round trip, and sometimes it fails with a cryptic message about `Access-Control-Allow-Origin`. That `OPTIONS` request is a CORS preflight, and it's one of the most misunderstood pieces of web security.

The browser doesn't send preflight requests to annoy you. It sends them to check with the server whether a cross-origin request is allowed before actually making it. It's a safety mechanism—a way for the browser to ask "Hey, can I send a `POST` with a JSON body and a custom header to this other origin?" without risking the actual request being made and then rejected.

If you've ever built a frontend that talks to an API on a different domain and stared at a red error in the console, you've hit a CORS preflight problem. Let's walk through what triggers a preflight, what the browser is asking, and how to make it work without tearing your hair out.

## The quick version: same-origin vs cross-origin

The browser's same-origin policy allows JavaScript to make requests to the same origin (protocol + domain + port) without any special headers. If your frontend runs on `https://app.example.com` and your API runs on `https://api.example.com`, that's cross-origin. The browser blocks the response from being read by JavaScript unless the server explicitly allows it using CORS headers.

Most of the time, a simple cross-origin `GET` request that only uses "safe" headers and no custom methods can be sent directly—that's a **simple request**. The browser sends the request immediately, and the server's `Access-Control-Allow-Origin` header tells the browser whether to let the JavaScript read the response.

But if the request is "non-simple," the browser first sends an `OPTIONS` request to the same endpoint. That's the preflight. The server's response to that `OPTIONS` tells the browser what methods, headers, and credentials are allowed. Only if the preflight succeeds does the browser send the actual request.

## What makes a request "non-simple" and triggers a preflight

A request triggers a preflight if it meets any of these conditions:

- It uses a method other than `GET`, `HEAD`, or `POST`.
- It uses a `Content-Type` header other than `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`. So sending JSON (`application/json`) triggers a preflight.
- It includes custom headers like `Authorization`, `X-Requested-With`, or anything not on the CORS-safelisted list.
- It includes credentials (cookies, HTTP authentication) in combination with non-simple characteristics.

The most common trigger in modern web apps is sending JSON. Almost every API request with a `POST` and `Content-Type: application/json` is non-simple and will trigger a preflight. That's why you see the `OPTIONS` request before your `fetch` with JSON.

If you've been using the [JavaScript Fetch API with async await](/blog/how-to-use-the-javascript-fetch-api-with-async-await), you've likely seen this happen. The `fetch` call may fail with a CORS error, but the actual HTTP request often never gets sent—the preflight failed first.

## What the preflight request and response look like

Let's see a concrete example. Suppose your frontend at `https://app.example.com` sends this:

```javascript
fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Custom-Header": "some-value",
  },
  body: JSON.stringify({ name: "Collin" }),
});
```

Before the actual `POST`, the browser sends:

```
OPTIONS /users HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type, x-custom-header
```

The browser is asking: "I want to send a POST request with these headers. Is that allowed?"

The server must respond with something like:

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: content-type, x-custom-header
Access-Control-Max-Age: 86400
```

If the server omits `X-Custom-Header` from `Access-Control-Allow-Headers`, the preflight fails, and the actual `POST` is never sent. The console shows an error like:

```
Access to fetch at 'https://api.example.com/users' from origin 'https://app.example.com' has been blocked by CORS policy: Request header field x-custom-header is not allowed by Access-Control-Allow-Headers in preflight response.
```

This is the most common CORS preflight error. The browser explicitly tells you which header is missing.

## Handling preflight requests on the server

Your server needs to respond to `OPTIONS` requests appropriately. The exact implementation depends on your backend framework, but the logic is the same: check the `Origin`, `Access-Control-Request-Method`, and `Access-Control-Request-Headers`, and return the appropriate `Access-Control-Allow-*` headers.

Here's a minimal Express example:

```javascript
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://app.example.com");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Custom-Header",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
```

If you're building an API with [Next.js API routes](/blog/next-js-api-routes), you can add CORS headers directly in the route handler or in a middleware. Many frameworks also have CORS middleware packages that handle preflight automatically.

A key detail: the preflight response should be a `2xx` status, typically `204 No Content` or `200 OK`. It must include `Access-Control-Allow-Origin` (or `*` if you allow any origin, but be careful with credentials), and it must echo back the requested methods and headers.

## The `Access-Control-Max-Age` header and caching preflights

Each preflight round trip adds latency, especially for APIs with many cross-origin requests. You can tell the browser to cache the preflight response using the `Access-Control-Max-Age` header. This value, in seconds, tells the browser how long it can skip the preflight for the same request.

```javascript
res.setHeader("Access-Control-Max-Age", "86400"); // Cache for 24 hours
```

Once the browser caches the preflight, it won't send another `OPTIONS` for the same combination of origin, method, and headers until the cache expires. This can significantly reduce overhead for frequently used requests.

Be careful not to set `Access-Control-Max-Age` too high if your CORS policy changes frequently. But for most applications, caching for a few hours or a day is safe.

## Credentials and the `withCredentials` pitfall

If you need to send cookies or HTTP authentication with cross-origin requests, you must set `credentials: 'include'` in your `fetch` call. The preflight request then also checks that the server allows credentials.

On the server, you must set:

```
Access-Control-Allow-Credentials: true
```

And you cannot use `Access-Control-Allow-Origin: *` in combination with credentials. The browser rejects any response that tries to use a wildcard with credentials. You must specify the exact origin.

This is a common source of confusion. If you enable `withCredentials` and the server still uses `*`, the preflight will fail, and the browser will block the request.

```javascript
fetch("https://api.example.com/user", {
  credentials: "include",
});
```

Server response:

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

## A real story about a mysterious CORS preflight failure

I once spent an entire afternoon debugging a cross-origin API call that worked fine in development but failed in production. The frontend was deployed on Vercel, and the API was on a separate subdomain. The `GET` requests worked, but `POST` with JSON failed every time.

The browser console showed the standard CORS error, but the network tab revealed the real problem: the `OPTIONS` preflight was returning a `404 Not Found`. The backend, a Next.js API route, was not handling `OPTIONS` requests at all. It only defined `GET` and `POST` handlers, and Next.js returned 404 for `OPTIONS`.

The fix was to add an `OPTIONS` handler to the API route that returned `204 No Content` with the appropriate `Access-Control-Allow-*` headers. Once the preflight succeeded, the actual `POST` went through without issue.

The lesson: always check the preflight response status, not just the final request. A 404 on the preflight is easy to miss if you're only looking at the failed request.

## How to debug preflight errors quickly

When a CORS preflight fails, the browser's console error message is usually precise. It will tell you exactly what's missing:

- "No 'Access-Control-Allow-Origin' header is present on the requested resource" means the server didn't return the origin header.
- "Request header field X-Custom-Header is not allowed by Access-Control-Allow-Headers in preflight response" means you need to add that header to the allowed list.
- "The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '\*' when the request's credentials mode is 'include'" means you need to specify an explicit origin.

Open the Network tab, find the `OPTIONS` request, and inspect the response headers. That will usually reveal exactly what's wrong.

If you've been struggling with [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide), you know that understanding the exact error message is half the battle. CORS errors are no different—they're verbose for a reason.

## Wrapping up

CORS preflight requests are the browser's way of asking permission before sending a non-simple cross-origin request. They're triggered by JSON bodies, custom headers, and non-standard methods. The server must respond to the `OPTIONS` request with the correct `Access-Control-Allow-*` headers, or the actual request never happens.

Next time you see a CORS error, don't just blindly add `*` to `Access-Control-Allow-Origin`. Check the preflight response. Make sure the server handles `OPTIONS` requests. Check the allowed headers. Check the credentials. A methodical approach will save you hours of frustration.

---

_Tired of fighting CORS errors in your web apps? Red Surge Technology builds APIs and frontends that work together seamlessly, with proper cross-origin configuration from the start. [Get in touch](/contact) to discuss your project._
