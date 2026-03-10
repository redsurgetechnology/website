const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const postsDir = './content/blog';
const posts = [];

// Guard: skip if no content folder yet
if (!fs.existsSync(postsDir)) {
  console.log('No content/blog directory found, skipping.');
  process.exit(0);
}

// Read all markdown files
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

if (files.length === 0) {
  console.log('No posts found yet, skipping.');
  process.exit(0);
}

files.forEach(file => {
  const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const { data, content } = matter(raw);
  posts.push({
    ...data,
    content: marked(content),
    slug: file.replace('.md', '')
  });
});

// Sort: featured posts first, then by date descending
posts.sort((a, b) => {
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return 1;
  return new Date(b.date) - new Date(a.date);
});

// ─── Generate individual post pages ───────────────────────────────────────────
function generatePostHTML(post) {
  const seoTitle = post.seo_title || post.title;
  const seoDescription = post.seo_description || post.excerpt || '';
  const ogImage = post.og_image || post.cover_image || '/images/og-image.jpg';
  const canonical = post.canonical || `https://redsurgetechnology.com/blog/${post.slug}`;
  const robots = post.no_index ? 'noindex, nofollow' : 'index, follow';
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `https://redsurgetechnology.com${ogImage}`;
  const author = post.author_name || 'Red Surge Technology';
  const authorType = post.author_name && post.author_name !== 'Red Surge Technology' ? 'Person' : 'Organization';
  const lastModified = post.last_modified || post.date;
  const tags = Array.isArray(post.tags) ? post.tags : (post.tags ? [post.tags] : []);
  const tagsString = tags.join(', ');
  const publishedDate = new Date(post.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const lastModifiedDate = new Date(lastModified).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── Rich post meta bar HTML ──────────────────────────────────────────────────
  // Each item uses an inline SVG icon, semantic time/span elements, and
  // microdata attributes so crawlers can read structured data directly from the DOM.
  const metaBar = `
        <div class="cs-post-meta" itemscope itemtype="https://schema.org/BlogPosting">
          <meta itemprop="headline" content="${seoTitle}" />
          <meta itemprop="description" content="${seoDescription}" />
          <meta itemprop="url" content="${canonical}" />

          <!-- Published date -->
          <div class="cs-meta-item cs-meta-date" title="Published date">
            <svg class="cs-meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <time itemprop="datePublished" datetime="${new Date(post.date).toISOString()}">${publishedDate}</time>
          </div>

          ${post.last_modified ? `
          <!-- Last updated -->
          <div class="cs-meta-item cs-meta-updated" title="Last updated">
            <svg class="cs-meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <span>Updated: <time itemprop="dateModified" datetime="${new Date(lastModified).toISOString()}">${lastModifiedDate}</time></span>
          </div>` : `<meta itemprop="dateModified" content="${new Date(lastModified).toISOString()}" />`}

          <!-- Author -->
          <div class="cs-meta-item cs-meta-author" itemprop="author" itemscope itemtype="https://schema.org/${authorType}" title="Author">
            <svg class="cs-meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span itemprop="name">${author}</span>
          </div>

          ${post.reading_time ? `
          <!-- Reading time -->
          <div class="cs-meta-item cs-meta-readtime" title="Estimated reading time">
            <svg class="cs-meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span><meta itemprop="timeRequired" content="PT${post.reading_time}M" />${post.reading_time} min read</span>
          </div>` : ''}

          ${post.category ? `
          <!-- Category -->
          <div class="cs-meta-item cs-meta-category" title="Category">
            <svg class="cs-meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span itemprop="articleSection">${post.category}</span>
          </div>` : ''}
        </div>

        <!-- Tags -->
        ${tags.length > 0 ? `
        <div class="cs-tags" aria-label="Post tags">
          <svg class="cs-tags-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="15" height="15">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          ${tags.map(tag => `<span class="cs-tag" itemprop="keywords">${tag}</span>`).join('')}
        </div>` : ''}`;

  // ── Full LocalBusiness + BlogPosting combined JSON-LD ───────────────────────
  const jsonLd = `
    <script type="application/ld+json">
    [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${seoTitle}",
        "description": "${seoDescription}",
        "url": "${canonical}",
        "datePublished": "${new Date(post.date).toISOString()}",
        "dateModified": "${new Date(lastModified).toISOString()}",
        ${tagsString ? `"keywords": "${tagsString}",` : ''}
        ${post.category ? `"articleSection": "${post.category}",` : ''}
        ${post.reading_time ? `"timeRequired": "PT${post.reading_time}M",` : ''}
        "author": {
          "@type": "${authorType}",
          "name": "${author}"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Red Surge Technology",
          "url": "https://redsurgetechnology.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://redsurgetechnology.com/images/logo_black.png"
          }
        },
        "image": {
          "@type": "ImageObject",
          "url": "${fullOgImage}",
          "width": 1200,
          "height": 630
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "${canonical}"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Red Surge Technology",
        "url": "https://redsurgetechnology.com",
        "telephone": "+17325203386",
        "email": "info@redsurgetechnology.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Wall Township",
          "addressRegion": "NJ",
          "postalCode": "07753",
          "addressCountry": "US"
        },
        "areaServed": [
          { "@type": "County", "name": "Ocean County", "containedInPlace": { "@type": "State", "name": "New Jersey" } },
          { "@type": "County", "name": "Monmouth County", "containedInPlace": { "@type": "State", "name": "New Jersey" } }
        ],
        "priceRange": "$$",
        "image": "https://redsurgetechnology.com/images/new_redsurgetech_logo.svg",
        "sameAs": [
          "https://www.linkedin.com/company/red-surge-technology/",
          "https://www.instagram.com/redsurgetechnology/",
          "https://www.facebook.com/redsurgetech"
        ]
      }
    ]
    </script>`;

  // ── Breadcrumb JSON-LD ───────────────────────────────────────────────────────
  const breadcrumbJsonLd = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://redsurgetechnology.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://redsurgetechnology.com/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "${post.title}",
          "item": "${canonical}"
        }
      ]
    }
    </script>`;

  // ── FAQ JSON-LD (if post content contains an FAQ section) ───────────────────
  // Looks for ## Frequently Asked Questions followed by ### Q / paragraph A pairs
  function extractFaqJsonLd(htmlContent, rawMarkdown) {
    const faqRegex = /#{2,3}\s+Frequently Asked Questions[\s\S]*?(?=\n#{1,2}\s|\s*$)/i;
    const faqBlock = rawMarkdown.match(faqRegex);
    if (!faqBlock) return '';
    const qaPairs = [];
    const qaRegex = /#{3,4}\s+(.+?)\n+([\s\S]+?)(?=\n#{3,4}|\s*$)/g;
    let match;
    while ((match = qaRegex.exec(faqBlock[0])) !== null) {
      qaPairs.push({ q: match[1].trim(), a: match[2].trim().replace(/\n+/g, ' ') });
    }
    if (qaPairs.length === 0) return '';
    return `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        ${qaPairs.map(pair => `{
          "@type": "Question",
          "name": "${pair.q.replace(/"/g, '\\"')}",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "${pair.a.replace(/"/g, '\\"')}"
          }
        }`).join(',\n        ')}
      ]
    }
    <\/script>`;
  }

  // ── Breadcrumb HTML (visible on page) ───────────────────────────────────────
  const breadcrumbHTML = `
    <nav class="cs-breadcrumb" aria-label="Breadcrumb">
      <ol class="cs-breadcrumb-list">
        <li class="cs-breadcrumb-item">
          <a href="/index.html" class="cs-breadcrumb-link">Home</a>
          <span class="cs-breadcrumb-sep" aria-hidden="true">/</span>
        </li>
        <li class="cs-breadcrumb-item">
          <a href="/blog.html" class="cs-breadcrumb-link">Blog</a>
          <span class="cs-breadcrumb-sep" aria-hidden="true">/</span>
        </li>
        <li class="cs-breadcrumb-item cs-breadcrumb-current" aria-current="page">
          ${post.title}
        </li>
      </ol>
    </nav>`;

  return `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Language" content="en-US" />
    <meta name="format-detection" content="telephone=no" />

    <!-- Primary Meta Tags -->
    <title>${seoTitle} | Red Surge Technology</title>
    <meta name="description" content="${seoDescription}" />
    <meta name="author" content="${author}" />
    <meta name="robots" content="${robots}" />
    ${tagsString ? `<meta name="keywords" content="${tagsString}" />` : ''}

    <!-- Canonical -->
    <link rel="canonical" href="${canonical}" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${seoTitle}" />
    <meta property="og:description" content="${seoDescription}" />
    <meta property="og:image" content="${fullOgImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Red Surge Technology" />
    <meta property="article:published_time" content="${new Date(post.date).toISOString()}" />
    <meta property="article:modified_time" content="${new Date(lastModified).toISOString()}" />
    ${post.category ? `<meta property="article:section" content="${post.category}" />` : ''}
    ${tagsString ? `<meta property="article:tag" content="${tagsString}" />` : ''}
    ${tagsString ? tags.map(t => `<meta property="article:tag" content="${t}" />`).join('\n    ') : ''}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonical}" />
    <meta name="twitter:title" content="${seoTitle}" />
    <meta name="twitter:description" content="${seoDescription}" />
    <meta name="twitter:image" content="${fullOgImage}" />

    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#d90700" />

    <!-- CSS -->
    <link rel="stylesheet" href="/css/main.css" />
    <link rel="stylesheet" href="/css/posts.css" />

    <!-- JSON-LD: BlogPosting + LocalBusiness -->
    ${jsonLd}

    <!-- JSON-LD: Breadcrumb -->
    ${breadcrumbJsonLd}
  </head>
  <body>
    <!-- Header -->
    <header id="cs-navigation">
      <div class="cs-top-bar">
        <div class="cs-top-container">
          <div class="cs-top-contact">
            <a href="tel:7325203386" class="cs-top-link">
              <img class="cs-link-icon" src="/images/phone-grey.svg" alt="grey phone icon" width="16" height="16" aria-hidden="true" decoding="async" />
              Call us: (732) 520-3386
            </a>
            <a href="mailto:info@redsurgetechnology.com" class="cs-top-link">
              <img class="cs-link-icon" src="/images/email-grey.svg" alt="grey email icon" width="16" height="16" aria-hidden="true" decoding="async" />
              Email us: info@redsurgetechnology.com
            </a>
          </div>
          <div class="cs-top-social">
            <a href="https://www.linkedin.com/company/red-surge-technology/" class="cs-social-link" target="_blank" aria-label="LinkedIn">
              <img class="cs-social-icon" src="/images/linkedin-grey.svg" alt="grey linkedin icon" width="12" height="12" aria-hidden="true" decoding="async" />
            </a>
            <a href="https://www.instagram.com/redsurgetechnology/" class="cs-social-link" target="_blank" aria-label="Instagram">
              <img class="cs-meta-icon" src="/images/insta-grey.svg" alt="grey instagram icon" width="12" height="12" aria-hidden="true" decoding="async" />
            </a>
            <a href="https://www.facebook.com/redsurgetech" class="cs-social-link" target="_blank" aria-label="Facebook">
              <img class="cs-social-icon" src="/images/face-grey.svg" alt="grey facebook icon" width="12" height="12" aria-hidden="true" decoding="async" />
            </a>
          </div>
        </div>
      </div>
      <div class="cs-container">
        <a href="/index.html" class="cs-logo" aria-label="back to home">
          <img src="/images/new_redsurgetech_logo.svg" alt="logo" width="175" height="63" aria-hidden="true" decoding="async" />
        </a>
        <nav class="cs-nav" role="navigation">
          <button class="cs-toggle" aria-label="mobile menu toggle">
            <div class="cs-box" aria-hidden="true">
              <span class="cs-line cs-line1" aria-hidden="true"></span>
              <span class="cs-line cs-line2" aria-hidden="true"></span>
              <span class="cs-line cs-line3" aria-hidden="true"></span>
            </div>
          </button>
          <div class="cs-ul-wrapper">
            <ul id="cs-expanded" class="cs-ul" aria-expanded="false">
              <li class="cs-li"><a href="/index.html" class="cs-li-link">Home</a></li>
              <li class="cs-li"><a href="/about.html" class="cs-li-link">About</a></li>
              <li class="cs-li"><a href="/portfolio.html" class="cs-li-link">Portfolio</a></li>
              <li class="cs-li"><a href="/blog.html" class="cs-li-link cs-active">Blog</a></li>
              <li class="cs-li"><a href="/contact.html" class="cs-li-link">Contact</a></li>
            </ul>
          </div>
        </nav>
        <a href="/contact.html" class="cs-button-solid cs-nav-button">Get in Touch</a>
      </div>
    </header>

    <!-- Banner -->
    <div id="banner-712">
      <div class="cs-container">
        <h1 class="cs-int-title">${post.title}</h1>
      </div>
      <picture class="cs-background">
        <source media="(max-width: 600px)" srcset="/images/banner_bg_red-360w.webp" type="image/webp" />
        <source media="(min-width: 601px) and (max-width: 1024px)" srcset="/images/banner_bg_red-720w.webp" type="image/webp" />
        <source media="(min-width: 1025px)" srcset="/images/banner_bg_red-1280w.webp" type="image/webp" />
        <img decoding="async" src="/images/banner_bg_red-1280w.webp" alt="red technology banner background" width="1280" height="320" aria-hidden="true" />
      </picture>
    </div>

    <!-- Breadcrumb -->
    ${breadcrumbHTML}

    <!-- Content -->
    <section id="content-page-714">
      ${post.cover_image ? `
      <div class="main-img-container">
        <img fetchpriority="high" decoding="sync" src="${post.cover_image}" alt="${post.title} - Red Surge Technology Blog" width="1280" height="720" />
      </div>` : ''}
      <div>
        ${metaBar}
        ${post.content}
      </div>
    </section>

    <!-- Footer -->
    <footer id="cs-footer-1185">
      <img class="cs-graphic" aria-hidden="true" loading="lazy" decoding="async" src="/images/footer-v.svg" alt="logo" width="1920" height="163" />
      <div id="cta-1185">
        <div class="cs-content">
          <h2 class="cs-title">Stay in the Loop</h2>
          <form class="cs-form" name="Contact Form" method="post" id="subscribe-form">
            <label for="cs-email-1185" class="visually-hidden">Email Address</label>
            <input class="cs-input" type="email" id="cs-email-1185" name="find-us" placeholder="Email Address" />
            <button class="cs-button-solid cs-submit" type="submit">Subscribe Now</button>
          </form>
        </div>
      </div>
      <div class="cs-container">
        <div class="cs-logo-group">
          <a aria-label="go back to home" class="cs-logo" href="/index.html">
            <img class="cs-logo-img" aria-hidden="true" loading="lazy" decoding="async" src="/images/new_redsurgetech_logo_white.svg" alt="red surge technology white logo" width="197" height="71" />
          </a>
          <p class="cs-text">A professional website design and development company working with small businesses around the world to create a strong presence on the web.</p>
        </div>
        <ul class="cs-nav">
          <li class="cs-nav-li"><span class="cs-header">Quick Links</span></li>
          <li class="cs-nav-li"><a class="cs-nav-link" href="/index.html">Home</a></li>
          <li class="cs-nav-li"><a class="cs-nav-link" href="/about.html">About</a></li>
          <li class="cs-nav-li"><a class="cs-nav-link" href="/portfolio.html">Portfolio</a></li>
          <li class="cs-nav-li"><a class="cs-nav-link" href="/contact.html">Contact</a></li>
        </ul>
        <ul class="cs-nav">
          <li class="cs-nav-li"><span class="cs-header">Contact</span></li>
          <li class="cs-nav-li">
            <img class="cs-icon" aria-hidden="true" loading="lazy" decoding="async" src="/images/phone-stroke-footer.svg" alt="phone icon white" width="24" height="24" />
            <a class="cs-nav-link cs-phone" href="tel:+17325203386">(732) 520-3386</a>
          </li>
          <li class="cs-nav-li">
            <img class="cs-icon" aria-hidden="true" loading="lazy" decoding="async" src="/images/email-stroke-footer.svg" alt="email icon white" width="24" height="24" />
            <a class="cs-nav-link cs-email" href="mailto:info@redsurgetechnology.com">info@redsurgetechnology.com</a>
          </li>
          <li class="cs-nav-li">
            <img class="cs-icon" aria-hidden="true" loading="lazy" decoding="async" src="/images/pin-stroke-footer.svg" alt="pin icon white" width="24" height="24" />
            <a class="cs-nav-link cs-address" href="https://www.google.com/maps/place/Wall+Township,+NJ/" target="_blank" rel="noopener">
              Monmouth County<br />Wall Township, NJ 07753
            </a>
          </li>
        </ul>
      </div>
      <div class="cs-bottom">
        <div>
          <p>© Copyright 2026 &mdash; <a href="https://redsurgetechnology.com/" class="cs-nav-link">Red Surge Technology</a></p>
        </div>
        <div>
          <a href="/privacy-policy.html" class="cs-nav-link">Privacy Policy</a>
          <span>|</span>
          <a href="/terms-of-use.html" class="cs-nav-link">Terms of Use</a>
        </div>
      </div>
      <picture class="cs-background">
        <source media="(max-width: 600px)" srcset="/images/footer_bg-360w.webp" type="image/webp" />
        <source media="(min-width: 601px) and (max-width: 1024px)" srcset="/images/footer_bg-720w.webp" type="image/webp" />
        <source media="(min-width: 1025px)" srcset="/images/footer_bg-1280w.webp" type="image/webp" />
        <img loading="lazy" decoding="async" src="/images/footer_bg-1280w.webp" alt="code being edited" width="1280" height="586" />
      </picture>
    </footer>

    <script src="/js/main.js" defer></script>
    <script src="/js/posts.js" defer></script>
    <script>
      document.getElementById('subscribe-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('cs-email-1185').value;
        try {
          const response = await fetch('/.netlify/functions/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, listIds: [11], updateEnabled: true })
          });
          if (response.ok) {
            alert('Thanks for subscribing!');
          } else {
            const errorData = await response.json();
            alert('Error: ' + errorData.message);
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred.');
        }
      });
    </script>
  </body>
</html>`;
}

// ─── Generate post pages (skip if handcrafted HTML already exists) ─────────────
posts.forEach(post => {
  if (post.custom_url) {
    console.log(`  ⏭️  Skipping ${post.slug} (has custom_url, using existing HTML)`);
    return;
  }

  const outPath = `./blog/${post.slug}.html`;

  if (fs.existsSync(outPath)) {
    console.log(`  ⏭️  Skipping blog/${post.slug}.html (already exists)`);
    return;
  }

  const html = generatePostHTML(post);
  fs.mkdirSync('./blog', { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`  📄 Generated blog/${post.slug}.html`);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function generateCardHTML(post) {
  const postUrl = post.custom_url || `/blog/${post.slug}.html`;
  const tags = Array.isArray(post.tags) ? post.tags : (post.tags ? [post.tags] : []);
  return `
          <li class="cs-item${post.featured ? ' cs-featured' : ''}">
            <picture class="cs-picture" aria-hidden="true">
              <img decoding="async" src="${post.cover_image || '/images/og-image.jpg'}" alt="${post.title}" width="411" height="236" />
            </picture>
            <div class="cs-flex">
              <div class="cs-meta">
                <span class="cs-date">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <time datetime="${new Date(post.date).toISOString()}">${new Date(post.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
                </span>
                ${post.category ? `<span class="cs-category">${post.category}</span>` : ''}
                ${post.reading_time ? `<span class="cs-reading-time">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ${post.reading_time} min read
                </span>` : ''}
              </div>
              <h2 class="cs-h3">${post.title}</h2>
              <p class="cs-item-text">${post.excerpt || ''}</p>
              ${tags.length > 0 ? `<div class="cs-card-tags">${tags.slice(0, 3).map(tag => `<span class="cs-tag">${tag}</span>`).join('')}</div>` : ''}
              <a href="${postUrl}" class="cs-link">
                Read More <span class="screen-reader-text">about ${post.title}</span>
                <img class="cs-arrow" loading="lazy" decoding="async" src="/images/event-chevron.svg" alt="chevron icon" width="20" height="20" aria-hidden="true" />
              </a>
            </div>
          </li>`;
}

function generateCardGroupsHTML(pagePosts) {
  const rows = chunkArray(pagePosts, 3);
  return rows.map(row => {
    const items = row.map(generateCardHTML).join('');
    const padding = row.length < 3
      ? Array(3 - row.length).fill(`<li class="cs-item" style="visibility:hidden"></li>`).join('')
      : '';
    return `
        <ul class="cs-card-group">
          ${items}
          ${padding}
        </ul>`;
  }).join('');
}

function generatePaginationHTML(currentPage, totalPages) {
  if (totalPages <= 1) return '';

  let links = '';
  for (let i = 1; i <= totalPages; i++) {
    const href = i === 1 ? '/blog.html' : `/blog-page-${i}.html`;
    const active = i === currentPage ? ' cs-active' : '';
    links += `<a href="${href}" class="cs-pagination-link${active}" aria-label="Page ${i}">${i}</a>`;
  }

  const prevHref = currentPage > 1
    ? (currentPage === 2 ? '/blog.html' : `/blog-page-${currentPage - 1}.html`)
    : null;
  const nextHref = currentPage < totalPages
    ? `/blog-page-${currentPage + 1}.html`
    : null;

  return `
    <nav class="cs-pagination" aria-label="Blog pagination">
      ${prevHref ? `<a href="${prevHref}" class="cs-pagination-link cs-prev" aria-label="Previous page">← Prev</a>` : ''}
      ${links}
      ${nextHref ? `<a href="${nextHref}" class="cs-pagination-link cs-next" aria-label="Next page">Next →</a>` : ''}
    </nav>`;
}

// ─── Generate paginated blog index pages ──────────────────────────────────────
const POSTS_PER_PAGE = 9;
const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

const blogTemplatePath = './blog.html';
const blogTemplate = fs.readFileSync(blogTemplatePath, 'utf8');

for (let page = 1; page <= totalPages; page++) {
  const pagePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const cardGroupsHTML = generateCardGroupsHTML(pagePosts);
  const paginationHTML = generatePaginationHTML(page, totalPages);
  const fullHTML = `${cardGroupsHTML}\n${paginationHTML}`;

  let pageHTML = blogTemplate.replace(
    /<!-- CMS_POSTS_START -->[\s\S]*?<!-- CMS_POSTS_END -->/,
    `<!-- CMS_POSTS_START -->\n${fullHTML}\n    <!-- CMS_POSTS_END -->`
  );

  if (page === 1) {
    fs.writeFileSync(blogTemplatePath, pageHTML);
    console.log(`  📄 Updated blog.html (page 1 of ${totalPages})`);
  } else {
    pageHTML = pageHTML.replace(
      `<link rel="canonical" href="https://redsurgetechnology.com/blog" />`,
      `<link rel="canonical" href="https://redsurgetechnology.com/blog-page-${page}" />`
    );
    fs.writeFileSync(`./blog-page-${page}.html`, pageHTML);
    console.log(`  📄 Generated blog-page-${page}.html`);
  }
}

console.log(`✅ Built ${posts.length} post(s) across ${totalPages} page(s)`);