---
title: "Astro JWT Authentication: A Practical Guide to Securing Your Astro Site with JSON Web Tokens"
date: "2026-08-11T10:00:00.000Z"
excerpt: "Learn how to implement JWT authentication in Astro—from issuing tokens on login to verifying them in API routes, protecting pages, and handling token refresh."
cover_image: "/images/blog/uploads/astro-jwt-authentication.webp"
seo_title: "Astro JWT Authentication: Secure Your Astro Site with JSON Web Tokens"
seo_description: "Add JWT authentication to Astro. Create login endpoints, verify tokens in server-side routes, and manage sessions without a heavy backend."
author_name: "Collin Stewart"
tags:
  - Astro
  - JWT
  - Authentication
  - JavaScript
  - Security
category: "JavaScript"
reading_time: 12
featured: false
no_index: false
---

Astro's main superpower is generating static HTML—fast, SEO‑friendly, and easy to deploy. But most real‑world applications need some kind of authentication: a members‑only area, a dashboard, or an API that knows who's making the request. Suddenly you need tokens, session cookies, and protected routes, and the static‑by‑default model feels at odds with that.

JSON Web Tokens (JWT) offer a lightweight way to add authentication without a separate backend server. They're compact, self‑contained, and work beautifully with Astro's API routes and server‑side rendering. You can issue a token after a user logs in, store it in an HTTP‑only cookie, and verify it on every subsequent request—all within your Astro project.

In this guide I'll walk through a complete JWT setup: hashing passwords, generating access and refresh tokens, protecting API endpoints, and conditionally rendering UI based on the user's session. You can drop this into an existing Astro site or use it as the starting point for a new one.

## The overall flow

Before we write any code, let's map out how the pieces fit together.

1.  A user submits their email and password to a login endpoint (`/api/auth/login`).
2.  The endpoint checks the credentials (against a database or a static list).
3.  If valid, the server creates a JWT containing the user's ID and role, signs it with a secret, and sends it back—either in the response body or, better, as an HTTP‑only, Secure cookie.
4.  The browser automatically includes this cookie on every subsequent request.
5.  Any API route that needs authentication reads the cookie, verifies the JWT, and extracts the user information.
6.  If the token is missing or invalid, the route returns 401 Unauthorized.
7.  Astro pages that require authentication can either be rendered on the server (SSR mode) and check the cookie before returning HTML, or they can be client‑side heavy and call an authenticated API endpoint.

We'll store the token in a cookie rather than `localStorage` because cookies are inaccessible to JavaScript when marked `HttpOnly`, which protects against XSS attacks. They're also automatically sent with every request, saving you from manually attaching headers.

## Project setup: installing the JWT library

Astro doesn't care what runtime you use—Node.js, Deno, Bun, or the Edge—so you have a choice of JWT libraries. For this guide I'll use `jose`, which works in any standard Web API environment and is ideal for Astro's modern runtime flexibility.

```bash
npm install jose
```

I also recommend `bcryptjs` (pure JavaScript) or `bcrypt` (native bindings) for hashing passwords.

```bash
npm install bcryptjs
```

Now let's create a simple environment variable for the JWT secret. In an `.env` file:

```
JWT_SECRET="a-very-long-random-string-change-me"
```

Never commit this secret to version control. In production, use a strong, randomly generated value and store it in your hosting provider's environment variable dashboard.

## Building the login endpoint

An Astro API route is just a `.ts` or `.js` file inside `src/pages/api/`. Create `src/pages/api/auth/login.ts`:

```typescript
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

// Mock user database – replace with your actual data source
const users = [
  {
    id: 1,
    email: "user@example.com",
    // bcrypt hash of "password123"
    password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0ZGgYt0qCF8gFsGvOLKhC2z0Mf/7q",
  },
];

export async function POST({ request, cookies }) {
  const { email, password } = await request.json();

  const user = users.find((u) => u.email === email);
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Invalid email or password" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return new Response(
      JSON.stringify({ error: "Invalid email or password" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Create JWT with the user's ID
  const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
  const token = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  // Set the token as an HTTP‑only cookie
  cookies.set("token", token, {
    httpOnly: true,
    secure: import.meta.env.PROD, // HTTPS only in production
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours in seconds
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
```

Key details:

- The JWT contains a `sub` (subject) claim with the user's ID, and an `email` claim. You can add any other claims you need—role, name, etc.—but keep the payload small.
- The cookie is `HttpOnly` (JavaScript can't read it), `Secure` in production, and `SameSite: 'lax'` (balances security and usability). The `path: '/'` makes it available to every route.
- The token expires in two hours. That means even if someone steals the cookie, they only have a two‑hour window.

If you've previously set up generic authentication with our [Astro authentication guide](/blog/astro-js-authentication-guide), you'll notice that JWT specifically removes the need for server‑side session storage. The token itself carries the session data.

## Verifying the JWT in a protected route

Now that we can issue tokens, we need a way to verify them. Create a utility function in `src/lib/auth.ts`:

```typescript
import { jwtVerify } from "jose";

export async function getUserFromToken(token: string) {
  const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.sub, email: payload.email };
  } catch (error) {
    // Token expired, invalid signature, etc.
    return null;
  }
}
```

Now any API route can call this function to authenticate the request. Create a protected endpoint at `src/pages/api/user/profile.ts`:

```typescript
import { getUserFromToken } from "../../../lib/auth";

export async function GET({ cookies }) {
  const token = cookies.get("token")?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch user data from your database
  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
```

The beauty of this pattern is that any cookie‑based client (the browser, a mobile app, a SPA) automatically sends the token. You don't need to handle `Authorization` headers unless you're dealing with a third‑party API client.

If you enjoy deep‑diving into error handling patterns, our post on [TypeScript error handling in try catch blocks](/blog/typescript-error-handling-in-try-catch-blocks-guide) covers similar logic—the `jwtVerify` function throws if the token is malformed, so the `try/catch` in `getUserFromToken` is essential.

## Protecting Astro pages: server‑side checks

An Astro page can be rendered on the server (SSR mode) by adding `export const prerender = false;` at the top. You can then access the cookies via `Astro.cookies` and decide what to render.

```astro
---
// src/pages/dashboard.astro
export const prerender = false;

const token = Astro.cookies.get('token')?.value;
let user = null;

if (token) {
  const { getUserFromToken } = await import('../lib/auth');
  user = await getUserFromToken(token);
}

if (!user) {
  return Astro.redirect('/login');
}
---
<html>
  <body>
    <h1>Welcome, {user.email}</h1>
    <!-- dashboard content -->
  </body>
</html>
```

If the token is missing or invalid, the user is redirected to the login page. Because this runs on the server, the protected content never reaches the browser.

## Refreshing tokens and logout

Short‑lived access tokens limit the damage of a stolen cookie, but you don't want users logging in every two hours. The standard solution is a **refresh token**—a longer‑lived token stored in another cookie, used only to obtain new access tokens.

When the access token expires, the client calls a refresh endpoint (`/api/auth/refresh`). That endpoint reads the refresh token, verifies it, and issues a new access token (and optionally a new refresh token, for rotation).

```typescript
// Inside /api/auth/refresh.ts
export async function POST({ cookies }) {
  const refreshToken = cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return new Response(JSON.stringify({ error: "No refresh token" }), {
      status: 401,
    });
  }

  const user = await getUserFromToken(refreshToken);
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid refresh token" }), {
      status: 401,
    });
  }

  // Issue new access token
  const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
  const newAccessToken = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  cookies.set("token", newAccessToken, {
    /* same options as before */
  });

  return new Response(JSON.stringify({ success: true }));
}
```

Logout is trivial: just delete the cookies.

```typescript
// /api/auth/logout.ts
export async function POST({ cookies }) {
  cookies.delete("token", { path: "/" });
  cookies.delete("refresh_token", { path: "/" });
  return new Response(JSON.stringify({ success: true }));
}
```

## A real‑world pitfall: token size and cookie limits

JWTs can grow quickly if you stuff them with too many claims. A typical JWT with just `sub` and `email` is around 200 bytes. Add permissions, roles, and metadata, and you might exceed the 4 KB cookie size limit. Keep tokens lean—only store the user ID, and fetch the rest from a database on the server.

Also, remember that every request that includes the cookie sends the token over the wire. If you're serving a page with 50 sub‑requests (images, CSS, JS), those requests don't need the token. You can mitigate this by setting the cookie's `path` to only apply to `/api` and your SSR pages, but this gets fiddly. Many developers prefer to handle authentication at the API layer and let the static pages remain public.

## Wrapping up

Astro's API routes and cookie support make JWT authentication surprisingly straightforward. You can have a fully functional login system without any external service or additional server. The key takeaways:

- Use `jose` for JWT operations—it's lightweight and works across all Astro runtimes.
- Store tokens in HTTP‑only, Secure cookies for safety.
- Verify the token in API routes or server‑side rendered pages before returning sensitive data.
- Keep JWTs small; only include user identifiers, not the whole profile.
- Implement refresh tokens for a better user experience.

If you've already set up general authentication with our [Astro authentication guide](/blog/astro-js-authentication-guide), adding JWT to the mix gives you a stateless, scalable alternative to session‑based auth. And if you're concerned about performance, our post on [why modern websites feel slower](/blog/why-modern-websites-feel-slower) includes tips on keeping auth checks fast.

Now you can protect your Astro site without giving up its static magic.

---

_Need help implementing authentication in your Astro project? Red Surge Technology builds secure, performant web applications with modern frameworks. [Get in touch](/contact) to discuss your project._
