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
  const tags = Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '');
  const publishedDate = new Date(post.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

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
    ${tags ? `<meta name="keywords" content="${tags}" />` : ''}

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
    ${tags ? `<meta property="article:tag" content="${tags}" />` : ''}

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

    <!-- JSON-LD BlogPosting -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${seoTitle}",
      "description": "${seoDescription}",
      "url": "${canonical}",
      "datePublished": "${new Date(post.date).toISOString()}",
      "dateModified": "${new Date(lastModified).toISOString()}",
      ${tags ? `"keywords": "${tags}",` : ''}
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
    }
    </script>
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
              <img class="cs-social-icon" src="/images/insta-grey.svg" alt="grey instagram icon" width="12" height="12" aria-hidden="true" decoding="async" />
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

    <!-- Content -->
    <section id="content-page-714">
      ${post.cover_image ? `
      <div class="main-img-container">
        <img fetchpriority="high" decoding="sync" src="${post.cover_image}" alt="${post.title}" width="1280" height="720" />
      </div>` : ''}
      <div>
        <!-- Post Meta -->
        <div class="cs-post-meta">
          <span class="cs-date">${publishedDate}</span>
          ${post.category ? `<span class="cs-category">${post.category}</span>` : ''}
          ${post.reading_time ? `<span class="cs-reading-time">${post.reading_time} min read</span>` : ''}
          ${author ? `<span class="cs-author">By ${author}</span>` : ''}
          ${post.last_modified ? `<span class="cs-last-modified">Updated: ${new Date(post.last_modified).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>` : ''}
        </div>
        ${tags ? `<div class="cs-tags">${post.tags.map(tag => `<span class="cs-tag">${tag}</span>`).join('')}</div>` : ''}
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

// ─── Generate post pages ───────────────────────────────────────────────────────
posts.forEach(post => {
  const html = generatePostHTML(post);
  const outDir = './blog';
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/${post.slug}.html`, html);
  console.log(`  📄 Generated blog/${post.slug}.html`);
});

// ─── Generate blog index cards ─────────────────────────────────────────────────
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const rows = chunkArray(posts, 3);

const cardGroupsHTML = rows.map(row => {
  const items = row.map(post => `
          <li class="cs-item${post.featured ? ' cs-featured' : ''}">
            <picture class="cs-picture" aria-hidden="true">
              <img decoding="async" src="${post.cover_image || '/images/og-image.jpg'}" alt="${post.title}" width="411" height="236" />
            </picture>
            <div class="cs-flex">
              <div class="cs-meta">
                <span class="cs-date">${new Date(post.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                ${post.category ? `<span class="cs-category">${post.category}</span>` : ''}
                ${post.reading_time ? `<span class="cs-reading-time">${post.reading_time} min read</span>` : ''}
              </div>
              <h2 class="cs-h3">${post.title}</h2>
              <p class="cs-item-text">${post.excerpt || ''}</p>
              <a href="./blog/${post.slug}.html" class="cs-link">
                Read More <span class="screen-reader-text">Details</span>
                <img class="cs-arrow" loading="lazy" decoding="async" src="./images/event-chevron.svg" alt="chevron icon" width="20" height="20" aria-hidden="true" />
              </a>
            </div>
          </li>`).join('');

  const padding = row.length < 3
    ? Array(3 - row.length).fill(`<li class="cs-item" style="visibility:hidden"></li>`).join('')
    : '';

  return `
        <ul class="cs-card-group">
          ${items}
          ${padding}
        </ul>`;
}).join('');

// ─── Read and update blog.html ─────────────────────────────────────────────────
const blogIndexPath = './blog.html';
let blogHTML = fs.readFileSync(blogIndexPath, 'utf8');

blogHTML = blogHTML.replace(
  /<!-- CMS_POSTS_START -->[\s\S]*?<!-- CMS_POSTS_END -->/,
  `<!-- CMS_POSTS_START -->\n${cardGroupsHTML}\n    <!-- CMS_POSTS_END -->`
);

fs.writeFileSync(blogIndexPath, blogHTML);

console.log(`✅ Built ${posts.length} post(s) and updated blog.html`);