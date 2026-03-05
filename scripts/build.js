const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // parses markdown frontmatter
const { marked } = require('marked');  // converts markdown to HTML

const postsDir = './content/blog';
const posts = [];

// Read all markdown files
fs.readdirSync(postsDir).forEach(file => {
  if (!file.endsWith('.md')) return;
  const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const { data, content } = matter(raw);
  posts.push({
    ...data,
    content: marked(content),
    slug: file.replace('.md', '')
  });
});

// Sort by date
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate individual post pages
posts.forEach(post => {
  const html = generatePostHTML(post); // mirrors your existing post template
  const outDir = `./blog`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/${post.slug}.html`, html);
});

// Regenerate blog index cards
const cardHTML = posts.map(post => `
  <li class="cs-item">
    <picture class="cs-picture" aria-hidden="true">
      <img decoding="async" src="${post.cover_image}" alt="${post.title}" width="411" height="236" />
    </picture>
    <div class="cs-flex">
      <span class="cs-date">${new Date(post.date).toLocaleDateString('en-US', { day:'2-digit', month:'short', year:'numeric' })}</span>
      <h2 class="cs-h3">${post.title}</h2>
      <p class="cs-item-text">${post.excerpt}</p>
      <a href="./blog/${post.slug}.html" class="cs-link">Read More</a>
    </div>
  </li>
`).join('');

console.log('✅ Built', posts.length, 'posts');