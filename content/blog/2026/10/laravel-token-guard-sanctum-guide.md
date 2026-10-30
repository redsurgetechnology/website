---
title: "Laravel Token Guard & Sanctum: Complete API Authentication Guide"
date: "2026-10-30T10:00:00.000Z"
excerpt: "Laravel's token guard is the foundation of API authentication. Learn how Sanctum implements it, how to issue and protect tokens, and how to avoid the mistakes that break mobile and SPA auth."
cover_image: "/images/blog/uploads/laravel-token-guard-sanctum-guide.webp"
seo_title: "Laravel Token Guard & Sanctum: Complete API Authentication Guide"
seo_description: "A complete guide to Laravel's token guard and Sanctum. Learn token issuance, abilities, expiration, route protection, custom guards, and SPA vs API token authentication."
author_name: "Collin Stewart"
tags:
  - Laravel
  - Sanctum
  - Authentication
  - API
  - PHP
category: "Laravel"
reading_time: 14
featured: false
no_index: false
---

Laravel's authentication system has a reputation for being flexible to the point of confusion. Guards, providers, middleware, drivers—the vocabulary alone can make you want to close the docs and go build something in Express. But the token guard, once you understand it, is one of the cleanest parts of the framework.

If you've read our guide on [understanding Laravel guards](/blog/understanding-laravel-guards), you know that a guard is what determines how Laravel identifies an authenticated user for a given request. The session guard reads from cookies and server-side sessions. The token guard reads from an API token in the request. Same concept, different storage.

Here's the part that trips people up in 2026: the classic `token` guard driver—the one that reads a static `api_token` column from the `users` table—is legacy. Laravel's modern answer is Sanctum, which implements token authentication properly: hashed tokens, per-device revocation, abilities, and optional expiration. Sanctum's guard driver is still a token guard. It's just a much better one.

This guide walks through how the token guard works, how Sanctum implements it, and how to set up API authentication that doesn't fall apart when you add a second client. If you're coming from a different ecosystem, our [Astro JWT authentication](/blog/astro-jwt-authentication) guide covers the same concepts from a JavaScript perspective.

## What the Token Guard Actually Does

A guard's job is to answer one question: _who is making this request?_ The session guard answers it by looking up a session ID in a cookie and loading the associated user. The token guard answers it by reading a token from the request and finding the user that token belongs to.

The classic token guard driver does this with a plain column on the `users` table:

```php
// config/auth.php — the legacy approach
'guards' => [
    'api' => [
        'driver' => 'token',
        'provider' => 'users',
        'storage_key' => 'api_token',
    ],
],
```

That works for a prototype. It falls apart the moment a user needs to be logged in on two devices, because there's only one `api_token` column. Logging in on your phone logs you out on your laptop. There's no way to revoke a single device. There's no expiration. There are no scopes. The token is stored in plaintext, so a database leak exposes every user's credentials.

Sanctum fixes all of that. It stores tokens in a separate `personal_access_tokens` table, hashes them before storage, and gives each token a name, abilities, and an optional expiration. The guard driver is called `sanctum`, but it's still doing the token guard's job: reading a bearer token and resolving the user.

## How Sanctum Works: Two Problems, One Package

Sanctum's documentation is refreshingly direct about this: it solves two separate problems.

**Problem one: API tokens.** You want to issue personal access tokens to users—for mobile apps, CLI tools, third-party integrations. The tokens are long-lived, revocable, and scoped with abilities. This is the token guard use case.

**Problem two: SPA authentication.** You have a first-party single-page app that needs to talk to your Laravel API. For this, Sanctum does **not** use tokens at all. It uses Laravel's cookie-based session authentication, which gives you CSRF protection and avoids storing credentials in JavaScript-accessible storage.

Those are two different mechanisms living in the same package. And that's the source of most Sanctum confusion. The `auth:sanctum` middleware accepts either one. It checks for an authentication cookie first, and if none is present, it checks the `Authorization` header for a bearer token[reference:0].

The practical implication: if your SPA is on the same top-level domain as your API, use cookie mode. If your client is a mobile app, a desktop app, or an external service, use token mode. Trying to use API tokens for your own first-party SPA is explicitly discouraged in the docs[reference:1].

## Installation and Setup

On Laravel 11 and later, the `install:api` command does the setup for you:

```bash
php artisan install:api
```

That command installs Sanctum, publishes its migration, and creates the `routes/api.php` file if it doesn't exist[reference:2]. If you're on an older version, you'll run `composer require laravel/sanctum`, publish the config and migrations, and run `php artisan migrate` manually.

The one thing the installer can't do for you is add the `HasApiTokens` trait to your user model. Do that yourself:

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
}
```

Without that trait, `$user->createToken()` doesn't exist, and you'll spend twenty minutes wondering why the method is undefined.

## Issuing Tokens

Token creation is straightforward. Call `createToken` with a name, and optionally pass abilities and an expiration date.

```php
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    $token = $user->createToken('mobile-app')->plainTextToken;

    return response()->json(['token' => $token]);
});
```

The `plainTextToken` property is the only time you'll see the actual token. Sanctum stores a SHA-256 hash of it in the database, so if you lose the plaintext, you can't recover it—you have to issue a new one. That's the correct behavior, and it's a meaningful improvement over the legacy approach of storing tokens in plaintext.

### Abilities

Abilities are Sanctum's scoping mechanism. Pass an array of strings as the second argument:

```php
$token = $user->createToken('mobile-app', ['orders:read', 'orders:create'])->plainTextToken;
```

A token with `['*']` (the default) has every ability. A token with a specific list only has those abilities. You check them with `tokenCan`:

```php
if ($request->user()->tokenCan('orders:create')) {
    // allow the action
}
```

Or, more cleanly, with the `abilities` middleware:

```php
Route::middleware(['auth:sanctum', 'abilities:orders:read,orders:create'])
    ->get('/orders', [OrderController::class, 'index']);
```

If the token lacks any of the listed abilities, Sanctum throws a `MissingAbilityException` and returns a 403. That's the behavior you want—fail closed, not open.

### Expiration

By default, tokens created without an explicit expiration date don't expire. Sanctum's config file has an `expiration` setting that you can use to apply a global default, but it's `null` out of the box. For mobile apps, long-lived tokens are often fine because the user can revoke them. For higher-security contexts, set an expiration:

```php
$token = $user->createToken(
    'mobile-app',
    ['*'],
    now()->addDays(30)
)->plainTextToken;
```

The third argument is a `DateTimeInterface`. Once the token expires, Sanctum rejects it automatically.

## Protecting Routes

Any route that requires authentication gets the `auth:sanctum` middleware:

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::get('/orders', [OrderController::class, 'index']);
});
```

That's it. The middleware handles both token and cookie authentication. For a request with a bearer token, Sanctum resolves the token, checks expiration, and sets the authenticated user. For a request with a session cookie, it defers to the session guard.

One subtlety worth knowing: when a request comes in with both a cookie and a bearer token, Sanctum checks the cookie first. If the cookie authenticates, the token is ignored. That's usually what you want, but it can be surprising if you're testing token auth in a browser that's already logged in.

## Revoking Tokens

Users need a way to log out. For a single device, delete the current token:

```php
$request->user()->currentAccessToken()->delete();
```

For all devices, delete every token:

```php
$request->user()->tokens()->delete();
```

That's the entire logout implementation. No session invalidation, no cache clearing, no JWT blacklist. The token is gone from the database, and subsequent requests with it get a 401.

## Custom Guards and Multiple Models

The default Sanctum setup authenticates against the `users` provider. If you have a separate `admins` table, or if you want named guards for different API surfaces, you can define custom guards in `config/auth.php`.

```php
'guards' => [
    'sanctum' => [
        'driver' => 'sanctum',
        'provider' => 'users',
    ],
    'admin-api' => [
        'driver' => 'sanctum',
        'provider' => 'admins',
    ],
],
```

Each guard can point at a different provider, which means a different Eloquent model. The route middleware references the guard name:

```php
Route::middleware('auth:admin-api')->get('/admin/stats', ...);
```

There's also a pattern where teams create custom guard drivers with named tokens—for example, a `mobile` token that's scoped differently from a `partner` token. The `cetria/laravel-auth` package does this by registering a custom driver and adding it to `config/auth.php`[reference:3]. It's a valid pattern when you need token names to carry semantic meaning beyond abilities, but for most applications, abilities are sufficient.

## Common Mistakes to Avoid

**Using the legacy `token` driver for new projects.** It works, but it can't support multiple devices, revocation, or abilities. Use Sanctum.

**Using API tokens for a first-party SPA.** If your SPA is on the same top-level domain, cookie mode is safer (CSRF protection, no token in JavaScript-accessible storage). Token mode is for mobile and external clients.

**Forgetting `HasApiTokens`.** The trait is required. Without it, `createToken` is undefined and you'll get a confusing error.

**Storing the plaintext token.** `plainTextToken` is returned once. Store it securely on the client. The server only keeps the hash.

**Not configuring `SANCTUM_STATEFUL_DOMAINS` for SPA mode.** If your SPA is on `localhost:3000` and your API is on `localhost:8000`, Sanctum needs to know that the SPA's domain is stateful. Add it to the env var and to `config/cors.php`'s `supports_credentials` setting.

**Assuming `tokenCan` works on session-authenticated requests.** For cookie-authenticated requests, `tokenCan` returns `false` because there's no token. If you need ability checks that work in both modes, use Laravel policies or gates instead.

## A Real Story: The Logout That Didn't Log Out

A team I worked with had a mobile app using the legacy `api_token` column. They added a "log out" button that cleared the token from the device's secure storage. That should have been enough—except the token was still valid on the server. If someone had captured it from a network log, they could keep using it indefinitely. The user thought they were logged out, but they weren't.

We migrated to Sanctum and changed the logout endpoint to call `$user->currentAccessToken()->delete()`. Now logging out actually invalidates the token server-side. The migration took about half a day—one migration for the `personal_access_tokens` table, one trait on the model, and a handful of route middleware changes. The security posture improved dramatically for very little effort.

The lesson: the legacy token guard is a token guard, but it's not a complete one. Sanctum is what the token guard should have been from the start.

## Wrapping Up

Laravel's token guard answers the question "who is making this API request?" Sanctum is the modern implementation of that guard—hashing tokens, supporting multiple devices, scoping access with abilities, and handling expiration. It also adds cookie-based SPA authentication, which is a separate feature you should use only when it fits.

The setup is small: install, add the trait, create tokens, protect routes. The details—abilities, expiration, custom guards, SPA configuration—are where the real decisions live. Get those right, and your API authentication will be secure and maintainable.

For the broader guard architecture, see our [understanding Laravel guards](/blog/understanding-laravel-guards) guide. For token-based authentication in a JavaScript context, our [Astro JWT authentication](/blog/astro-jwt-authentication) guide covers the equivalent patterns.

Now go issue a token that you can actually revoke.

---

_Need help designing or auditing your Laravel API authentication? Red Surge Technology builds secure, maintainable backends for modern applications. [Get in touch](/contact) to discuss your project._
