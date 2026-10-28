---
title: "Sending Emails in React Native: Complete Guide (Expo, Linking, IMAP)"
date: "2026-10-28T10:00:00.000Z"
excerpt: "Learn how to send emails from React Native apps. Compare mailto links, Expo MailComposer, backend APIs, and native IMAP/SMTP libraries—with working code and runtime limitations."
cover_image: "/images/blog/uploads/react-native-send-email-guide.webp"
seo_title: "Sending Emails in React Native: Expo, Linking, and IMAP Guide"
seo_description: "A complete guide to sending emails in React Native. Covers mailto links, expo-mail-composer, background sending with Resend or EmailJS, and native IMAP/SMTP libraries."
author_name: "Collin Stewart"
tags:
  - React Native
  - Email
  - Expo
  - IMAP
  - Mobile Development
category: "JavaScript"
reading_time: 15
featured: false
no_index: false
---

Sending an email from a React Native app sounds like it should be a one-line operation. Then you actually try it and discover a mess of platform differences, runtime limitations, and half-abandoned libraries.

The core problem is that React Native is not Node.js. Libraries like `imapflow`, `nodemailer`, and `emailjs-imap-client` depend on Node's `net` and `tls` modules, which don't exist in the Hermes runtime. Import them in a React Native app and you get `Unable to resolve module net` before your app even starts[reference:0].

That single fact shapes the entire landscape. There are essentially four ways to send email from React Native, and they sit on a spectrum from "let the OS handle it" to "build a native mail engine." This guide walks through all four, with working code and clear guidance on which one fits your use case. If you're trying to _render_ HTML email in a React Native app, that's a different problem—see our [React Native HTML email guide](/blog/react-native-html-email).

## The Four Approaches at a Glance

Here's the map before we dive into details.

1. **`mailto:` links via `Linking`** — Opens the device's mail app with pre-filled fields. Zero dependencies. No background sending.
2. **Expo MailComposer** — Opens the system mail composer with a cleaner API than raw `Linking`. Still user-driven.
3. **Backend email APIs** — Send emails programmatically through Resend, EmailJS, or your own server. Works in the background.
4. **Native IMAP/SMTP libraries** — Full email client functionality (read and send) using native bridges. The most complex option.

Most apps should start with approach 1 or 2 and move to 3 if they need background sending. Approach 4 is only for apps that genuinely need to be an email client.

## Approach 1: mailto Links with Linking

The simplest way to send an email from React Native is to hand the job to the operating system. The `mailto:` URL scheme opens the user's default mail app with the recipient, subject, and body pre-filled.

```jsx
import { Linking } from "react-native";

async function sendEmail() {
  const url = `mailto:support@example.com?subject=${encodeURIComponent(
    "App feedback",
  )}&body=${encodeURIComponent("Here is my feedback...")}`;

  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.warn("No mail app available");
  }
}
```

React Native's `Linking` API supports the `mailto` scheme on both iOS and Android[reference:1]. The `canOpenURL` check is worth including because some devices—particularly Android emulators and locked-down enterprise devices—may not have a mail app configured.

**Pros:** Zero dependencies, zero native code, works everywhere. The user sees their own mail app, which they already trust.

**Cons:** The user has to tap "Send" themselves. There's no way to send in the background. You can't attach files reliably across platforms using `mailto:`. And the user experience is a context switch out of your app.

**When to use it:** Contact forms, feedback links, "email us" buttons, and any scenario where you want the user to review the message before sending. It's the right default for most apps.

## Approach 2: Expo MailComposer

If you're using Expo, `expo-mail-composer` wraps the system mail UI in a cleaner API than raw `Linking`. It fills in recipients, subject, body, and attachments, and returns a status indicating whether the email was sent, saved, or cancelled.

```bash
npx expo install expo-mail-composer
```

```jsx
import * as MailComposer from "expo-mail-composer";

async function composeEmail() {
  const isAvailable = await MailComposer.isAvailableAsync();
  if (!isAvailable) {
    console.warn("Mail composer is not available");
    return;
  }

  const result = await MailComposer.composeAsync({
    recipients: ["support@example.com"],
    subject: "App feedback",
    body: "Here is my feedback...",
    attachments: ["file:///path/to/attachment.pdf"],
  });

  console.log(result.status); // 'sent' | 'saved' | 'cancelled'
}
```

`composeAsync` opens a mail modal on iOS and a mail app intent on Android[reference:2]. `getClients()` lists available mail apps, which is useful if you want to let the user pick their preferred client[reference:3].

**A platform gotcha:** On iOS Simulators, `MailComposer` can't be used because you can't sign into a mail account on a simulator[reference:4]. `isAvailableAsync()` will return `false`. Test on a real device.

**Pros:** Cleaner API than `Linking`, supports attachments, returns a status. It's the best user-driven option for Expo apps.

**Cons:** Still requires the user to tap "Send." Still no background sending.

**When to use it:** Same use cases as `Linking`, but you need attachments or want to know whether the user actually sent the email.

## Approach 3: Sending in the Background with a Backend API

The query "react native send email in background" has a simple answer that developers often resist: **you can't send email directly from a React Native app in the background.** iOS doesn't support background mail composition, and Android's mail intents are user-driven[reference:5].

The solution is to send the email from a server. Your React Native app makes an HTTP request to a backend endpoint, and the backend sends the email using a proper email service.

This is the architecture Expo recommends for Resend: create an API route with Expo Router, install the Resend SDK server-side, and call it from the app[reference:6].

```javascript
// app/api/send-email+api.ts (server-side)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { to, subject, body } = await request.json();

  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to,
    subject,
    html: `<p>${body}</p>`,
  });

  return Response.json({ success: true });
}
```

```jsx
// From your React Native component
async function sendInBackground() {
  await fetch("https://your-app.com/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: "user@example.com",
      subject: "Welcome!",
      body: "Thanks for signing up.",
    }),
  });
}
```

Other backend options include **EmailJS** (`@emailjs/react-native`), which lets you send emails directly from client code without a custom backend[reference:7], and **Nodemailer** on your own Node.js server.

**Pros:** True background sending. Works with attachments, HTML templates, and any email provider. You can use React Email to build the templates—see our [React Email component guide](/blog/react-email-component).

**Cons:** Requires a backend or a third-party service. API keys must be kept server-side, never in the app bundle.

**When to use it:** Password resets, order confirmations, notifications, scheduled emails, and any scenario where the email should send without user interaction.

## Approach 4: Native IMAP/SMTP Libraries

If you're building an email client—not just sending notifications—you need to read email too. That means IMAP for receiving and SMTP for sending. And that means dealing with the React Native runtime limitations head-on.

As `react-native-mail-engine` puts it: pure-JS clients like `imapflow`, `node-imap`, and `emailjs-imap-client` depend on Node's `net`/`tls` sockets, which don't exist in Hermes/RN. They throw on import[reference:8]. The only native binding that ever worked, `react-native-mailcore`, has been dead since 2020. `react-native-mona-imap` is Android-only and hasn't shipped iOS support since 2016[reference:9].

That leaves a small number of maintained options.

**`react-native-mail-engine`** is a Nitro module that bridges to MailCore2 on iOS and JavaMail on Android. It supports IMAP, SMTP, MIME, IDLE, and XOAUTH2, with both platforms covered. It requires React Native 0.79+ with the New Architecture enabled, and it needs a development build—it won't run in Expo Go[reference:10].

```jsx
import { MailEngine } from "react-native-mail-engine";

const account = await MailEngine.connect({
  host: "imap.example.com",
  port: 993,
  secure: true,
  auth: { user: "user@example.com", pass: "password" },
});

const mailbox = await account.mailbox("INBOX");
const messages = await mailbox.fetch({ limit: 20 });
```

**`react-native-email-imap-smtp`** is another Nitro-based option. It's fully available on Android and Web (via a local HTTP proxy using `imapflow` + `nodemailer`), but iOS is marked as not yet complete[reference:11].

**`react-native-mail-client`** and **`react-native-inbox`** are npm packages that advertise IMAP/SMTP support, but their native implementation quality and maintenance status vary. Evaluate them carefully before committing[reference:12].

**If you just need to _send_ via SMTP without reading mail**, `react-native-smtp-mailer` is a narrower option. It's send-only but simpler than a full mail engine[reference:13].

**Pros:** Full email client functionality. Read, search, send, manage folders.

**Cons:** Native modules require development builds and platform-specific configuration. The ecosystem is small and fragile. The New Architecture requirement excludes older projects.

**When to use it:** You're building an email client, a CRM inbox, a helpdesk tool, or a companion app for a self-hosted IMAP server. For anything short of that, use a backend API instead.

## Why imapflow Doesn't Work in React Native

Developers often search for "imapflow React Native" expecting a straightforward integration. The answer is that `imapflow` is a Node.js library. It requires Node 20 or newer and depends on `net` and `tls` sockets that the Hermes runtime doesn't provide[reference:14][reference:15].

You can use `imapflow` in two places:

1. **On your backend.** A Node.js server can use `imapflow` to fetch email and expose it to your app through an API.
2. **Behind a local proxy.** `react-native-email-imap-smtp` bundles an `imapflow`-based proxy for web, but that's a workaround for browser environments, not a native React Native solution[reference:16].

If you see a tutorial claiming you can `npm install imapflow` in a React Native app and use it directly, it's wrong. The import will fail.

## A Decision Framework

Here's how to choose based on what you're actually building.

**Do you just need to open the user's mail app with pre-filled fields?**
→ Use `Linking.openURL('mailto:...')` or `expo-mail-composer`. Done.

**Do you need to send emails in the background (password reset, order confirmation, notifications)?**
→ Use a backend API: Resend, EmailJS, or your own Node.js server with Nodemailer.

**Do you need to read email as well as send it (email client, CRM inbox, helpdesk)?**
→ Use `react-native-mail-engine` if you can adopt the New Architecture and a development build. Otherwise, build a backend that uses `imapflow` and expose a REST API to your app.

**Are you building a web app with React Native Web?**
→ The proxy approach in `react-native-email-imap-smtp` can work, but a backend API is cleaner and more secure.

## Security and API Key Handling

A common mistake in React Native email integrations is embedding API keys in the app bundle. React Native apps are not secure environments—anything in the bundle can be extracted.

If you're using Resend, EmailJS, or any email API, the key should live on your server. The app should call your server, and your server should call the email provider. Expo's Resend guide is explicit about this: the API key goes in `.env.local`, the SDK runs server-side in an API route, and the app never sees the key[reference:17].

The same applies to SMTP credentials. Never ship them in the app. If you're using a native mail engine, the user should authenticate with their own credentials, and those credentials should be stored in the device keychain (via `expo-secure-store` or `react-native-keychain`), not in AsyncStorage.

## A Real Story: The Wrong Architecture

A team I worked with built a support inbox feature into their React Native app. They wanted users to send and receive support emails without leaving the app. The first implementation tried to use `nodemailer` directly in React Native. It crashed on launch with a module resolution error for `net`. They spent two days trying to polyfill Node's networking modules before realizing the approach was fundamentally wrong.

We rebuilt it with a split architecture. The app talked to a Node.js backend. The backend used `imapflow` to fetch the support inbox and `nodemailer` to send replies. The app rendered the threads with a `FlatList` and the HTML email renderer we covered in our [React Native HTML email guide](/blog/react-native-html-email). The backend handled credentials, retries, and attachments.

The rebuild took about a week, but it was the only architecture that actually worked. The lesson: React Native is not a Node.js runtime. Treat email as a backend concern unless you have a very specific reason to build a native mail engine.

## Wrapping Up

Sending email from React Native comes down to four approaches, and the right one depends on whether you need background sending and whether you need to read email.

For simple user-driven emails, `Linking` or `expo-mail-composer` is all you need. For background sending, use a backend API—Resend, EmailJS, or Nodemailer on your own server. For a full email client, use a native IMAP/SMTP bridge like `react-native-mail-engine`, and be prepared for the New Architecture and development-build requirements. And remember that `imapflow` and other Node.js email libraries won't run in React Native—they belong on your server.

If you're rendering the emails you receive, our [React Native HTML email guide](/blog/react-native-html-email) covers the rendering side. If you're building the templates you send, our [React Email component guide](/blog/react-email-component) shows how to compose them in React. And if you're working on the broader app experience, our [React Native Expo animations guide](/blog/react-native-expo-animations-guide) covers the UI layer.

Now go send some email—from the right layer of your stack.

---

_Need help building email features or choosing the right architecture for your React Native app? Red Surge Technology specializes in mobile development and backend integrations. [Get in touch](/contact) to discuss your project._
