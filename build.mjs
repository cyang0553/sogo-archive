import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const API_URL = process.env.ARCHIVE_API_URL || 'https://script.google.com/macros/s/AKfycbzU72-9Dz01WW7lESYAyUXBH_xIc_9Bcamd6SXksybve1I81Un3bBVXrPRHb9-2l913/exec?output=json';

const SITE_URL = (
  process.env.SITE_URL || 'https://sogo-archive.pages.dev'
).replace(/\/$/, '');

const OUT = 'dist';

const response = await fetch(API_URL, { redirect: 'follow' });

if (!response.ok) {
  throw new Error(`Archive API request failed: ${response.status}`);
}

const data = await response.json();
const posts = Array.isArray(data.posts) ? data.posts : [];
const config = data.config || {};

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

const getPostPath = post =>
  `/${post.type === 'COLUMN' ? 'columns' : 'exhibitions'}/${encodeURIComponent(post.id)}/`;

const getPostUrl = post => SITE_URL + getPostPath(post);

async function write(relativePath, content) {
  const target = join(OUT, relativePath);

  await mkdir(join(target, '..'), {
    recursive: true
  });

  await writeFile(target, content, 'utf8');
}

const styles = `
[hidden] {
  display: none !important;
}

:root {
  --paper: #fbfaf7;
  --white: #ffffff;
  --ink: #242321;
  --muted: #77736c;
  --line: #dedbd4;
  --soft-line: #ebe8e1;
  --accent: #3f5143;
  --max-width: 1120px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 300;
  line-height: 1.75;
  word-break: keep-all;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(251, 250, 247, .92);
  border-bottom: 1px solid transparent;
  backdrop-filter: blur(16px);
  transition: border-color .25s ease;
}

.site-header.scrolled {
  border-bottom-color: var(--soft-line);
}

.header-inner {
  max-width: var(--max-width);
  height: 82px;
  margin: 0 auto;
  padding: 0 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  font-family: "Noto Serif KR", serif;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -.03em;
  text-decoration: none;
}

.navigation {
  display: flex;
  gap: 28px;
}

.navigation a {
  position: relative;
  padding: 5px 0;
  color: var(--muted);
  font-size: 13px;
  text-decoration: none;
}

.navigation a::after {
  content: "";
  position: absolute;
  left: 0;
  right: 100%;
  bottom: 0;
  height: 1px;
  background: var(--ink);
  transition: right .25s ease;
}

.navigation a:hover {
  color: var(--ink);
}

.navigation a:hover::after {
  right: 0;
}

.hero {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 126px 36px 116px;
  display: grid;
  grid-template-columns: 1.35fr 0.65fr;
  gap: 80px;
  align-items: end;
}

.eyebrow {
  display: block;
  margin-bottom: 28px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
}

.hero h1 {
  margin: 0;
  font-family: "Noto Serif KR", serif;
  font-size: clamp(42px, 6.2vw, 78px);
  font-weight: 400;
  line-height: 1.28;
  letter-spacing: -0.055em;
}

.hero-description {
  margin: 0 0 8px;
  color: var(--muted);
  font-family: "Noto Serif KR", serif;
  font-size: 16px;
  line-height: 2;
}

.archive {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 36px 130px;
}

.toolbar {
  padding: 25px 0;
  align-items: center;
  justify-content: space-between;
  display: flex;
  gap: 18px;
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--line);
}

.filter-button {
  border: 0;
  padding: 0;
  color: var(--muted);
  background: none;
  cursor: pointer;
  font-size: 13px;
}

.filters {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
}

.filter-button.active {
  color: var(--ink);
  font-weight: 500;
}

.post-card {
  padding: 44px 0;
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 180px;
  gap: 36px;
  border-bottom: 1px solid var(--soft-line);
  text-decoration: none;
}

.post-type {
  padding-top: 5px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
}

.post-card h2 {
  margin: 0 0 14px;
  font-family: "Noto Serif KR", serif;
  font-size: clamp(23px, 2.6vw, 34px);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.04em;
}

.post-card p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.8;
}

.post-date {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-top: 5px;
  color: var(--muted);
  font-size: 12px;
}

.arrow {
  font-size: 19px;
  transition: transform .2s ease;
}

.post-card:hover h2 {
  color: var(--accent);
}

.post-card:hover .arrow {
  transform: translate(4px, -4px);
}

.search-wrap {
  position: relative;
  width: min(280px, 42vw);
}

.search-wrap input {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  padding: 8px 26px 8px 0;
  color: var(--ink);
  background: transparent;
  outline: none;
  font: inherit;
  font-size: 13px;
}

.search-wrap input:focus {
  border-bottom-color: var(--ink);
}

.search-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  font-size: 15px;
  pointer-events: none;
}

.detail {
  max-width: 860px;
  margin: 0 auto;
  padding: 85px 36px 140px;
}

.back-link {
  display: inline-block;
  margin-bottom: 70px;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
  font-size: 12px;
  text-decoration: none;
}

.detail-kicker {
  margin-bottom: 25px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.15em;
}

.detail h1 {
  margin: 0;
  font-family: "Noto Serif KR", serif;
  font-size: clamp(38px, 6vw, 62px);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.055em;
}

.subtitle {
  margin: 23px 0 0;
  color: var(--muted);
  font-family: "Noto Serif KR", serif;
  font-size: 18px;
  line-height: 1.8;
}

.meta {
  margin-top: 45px;
  padding: 18px 0;
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  color: var(--muted);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  font-size: 12px;
}

.cover-image {
  width: 100%;
  max-height: 560px;
  margin-top: 60px;
  object-fit: cover;
}

.introduction {
  max-width: 680px;
  margin: 76px auto 0;
  padding: 44px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.introduction p {
  margin: 0;
  font-family: "Noto Serif KR", serif;
  color: #4f4c47;
  font-size: 18px;
  line-height: 2;
}

.original-link {
  display: inline-block;
  margin-top: 34px;
  padding-bottom: 4px;
  color: var(--accent);
  border-bottom: 1px solid var(--accent);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.tags {
  max-width: 680px;
  margin: 55px auto 0;
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 9px;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 10px;
}

.empty {
  padding: 80px 0;
  color: var(--muted);
  text-align: center;
}

.site-footer {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 35px 36px 48px;
  display: flex;
  justify-content: space-between;
  color: #99958d;
  border-top: 1px solid var(--line);
  font-size: 11px;
}

@media (max-width: 700px) {
  .header-inner {
    height: 68px;
    padding: 0 20px;
  }

  .navigation {
    gap: 14px;
  }

  .hero {
    padding: 78px 20px 82px;
    grid-template-columns: 1fr;
    gap: 38px;
  }

  .hero h1 {
    font-size: 43px;
  }

  .archive {
    padding: 0 20px 90px;
  }

  .toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .search-wrap {
    width: 100%;
  }

  .post-card {
    grid-template-columns: 1fr;
    gap: 13px;
    padding: 34px 0;
  }

  .post-date {
    justify-content: flex-start;
  }

  .post-date .arrow {
    margin-left: auto;
  }

  .detail {
    padding: 55px 20px 100px;
  }

  .back-link {
    margin-bottom: 50px;
  }

  .detail h1 {
    font-size: 39px;
  }

  .site-footer {
    padding: 25px 20px 35px;
    flex-direction: column;
    gap: 6px;
  }
}
`;

function createPage({
  title,
  description,
  canonical,
  image = '',
  body,
  structuredData = null
}) {
  const socialImage = image
    ? `<meta property="og:image" content="${escapeHtml(image)}">`
    : '';

  const jsonLd = structuredData
    ? `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`
    : '';

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  ${socialImage}

  <meta name="twitter:card" content="summary_large_image">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500&family=Noto+Serif+KR:wght@400;500;600&display=swap"
    rel="stylesheet"
  >

  <link rel="stylesheet" href="/styles.css">
  ${jsonLd}
</head>

<body>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="/">
        ${escapeHtml(config.title || '\uc815\uc9c0\ud638\uc758 \ubbf8\uc220 \uc544\uce74\uc774\ube0c')}
      </a>

      <nav class="navigation">
        <a href="/#columns">\uce7c\ub7fc</a>
        <a href="/#exhibitions">\uc804\uc2dc \uae30\ub85d</a>
      </nav>
    </div>
  </header>

  ${body}

  <footer class="site-footer">
    <span>\u00a9 ${new Date().getFullYear()} ${escapeHtml(config.author || 'SOGO')}</span>
    <span>Words, exhibitions and places worth remembering.</span>
  </footer>
</body>
</html>`;
}

const postCards = posts.map(post => `
  <a
    class="post-card"
    data-kind="${post.type}"
    href="${getPostPath(post)}"
  >
    <span class="post-type">
      ${post.type === 'COLUMN' ? 'FULL COLUMN' : 'BLOG NOTE'}
    </span>

    <span>
      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.summary)}</p>
    </span>

    <span class="post-date">
      <span>${escapeHtml(post.date)}</span>
      <span class="arrow" aria-hidden="true">\u2197</span>
    </span>
  </a>
`).join('');

const homeBody = `
<main>
  <section class="hero">
    <div>
      <span class="eyebrow">ART \u00b7 EXHIBITION \u00b7 WRITING</span>
      <h1>\ubcf4\uace0, \uac77\uace0,<br>\uc624\ub798 \uc0dd\uac01\ud55c \uac83\ub4e4.</h1>
    </div>

    <p class="hero-description">
      ${escapeHtml(config.description || '')}
    </p>
  </section>

  <section class="archive">
    <div class="toolbar">
      <div class="filters">
        <button class="filter-button active" data-filter="ALL">\uc804\uccb4</button>
        <button class="filter-button" data-filter="COLUMN">\uce7c\ub7fc</button>
        <button class="filter-button" data-filter="BLOG">\uc804\uc2dc \uae30\ub85d</button>
      </div>

      <label class="search-wrap">
        <input id="search-input" type="search" placeholder="\uc81c\ubaa9, \uc18c\uac1c\ubb38, \ud0dc\uadf8 \uac80\uc0c9" aria-label="\uc544\uce74\uc774\ube0c \uac80\uc0c9">
        <span class="search-icon" aria-hidden="true">\u2315</span>
      </label>
    </div>

    <div id="post-list">
      ${postCards || '<p class="empty">\ub4f1\ub85d\ub41c \uae00\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</p>'}
    </div>
  </section>
</main>

<script>
  let activeFilter = 'ALL';

  function updateVisiblePosts() {
    const query = (document.querySelector('#search-input').value || '')
      .trim()
      .toLowerCase();

    document.querySelectorAll('.post-card').forEach(post => {
      const matchesFilter =
        activeFilter === 'ALL' ||
        post.dataset.kind === activeFilter;

      const matchesQuery =
        !query ||
        post.textContent.toLowerCase().includes(query);

      post.hidden = !(matchesFilter && matchesQuery);
    });
  }

  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-button').forEach(item => {
        item.classList.remove('active');
      });

      button.classList.add('active');
      activeFilter = button.dataset.filter;
      updateVisiblePosts();
    });
  });

  document.querySelector('#search-input')
    .addEventListener('input', updateVisiblePosts);

  const siteHeader = document.querySelector('.site-header');
  const updateHeader = () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 4);
  };

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
</script>
`;

await write(
  'index.html',
  createPage({
    title: config.title || '\uc815\uc9c0\ud638\uc758 \ubbf8\uc220 \uc544\uce74\uc774\ube0c',
    description: config.description || '',
    canonical: `${SITE_URL}/`,
    body: homeBody,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.title || '\uc815\uc9c0\ud638\uc758 \ubbf8\uc220 \uc544\uce74\uc774\ube0c',
      url: `${SITE_URL}/`
    }
  })
);

for (const post of posts) {
  const tags = (post.tags || [])
    .map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join('');

  const metadata = [
    post.date,
    post.location,
    post.period
  ]
    .filter(Boolean)
    .map(value => `<span>${escapeHtml(value)}</span>`)
    .join('');

  const image = post.imageUrl
    ? `<img
        class="cover-image"
        src="${escapeHtml(post.imageUrl)}"
        alt="${escapeHtml(post.title)}"
      >`
    : '';

  const originalLink = post.originalUrl
    ? `<a
        class="original-link"
        href="${escapeHtml(post.originalUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${escapeHtml(post.ctaLabel || '\uc804\uccb4 \uae00 \uc77d\uae30')} \u2197
      </a>`
    : '';

  const detailBody = `
  <main class="detail">
    <a class="back-link" href="/">\u2190 \ubaa9\ub85d\uc73c\ub85c \ub3cc\uc544\uac00\uae30</a>

    <article>
      <header>
        <div class="detail-kicker">
          ${post.type === 'COLUMN' ? 'FULL COLUMN' : 'BLOG NOTE'}
          \u00b7 ${escapeHtml(post.category)}
        </div>

        <h1>${escapeHtml(post.title)}</h1>

        ${post.subtitle
          ? `<p class="subtitle">${escapeHtml(post.subtitle)}</p>`
          : ''
        }

        <div class="meta">${metadata}</div>
      </header>

      ${image}

      <div class="introduction">
        <p>${escapeHtml(post.summary)}</p>
        ${originalLink}
      </div>

      ${tags ? `<div class="tags">${tags}</div>` : ''}
    </article>
  </main>
  `;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    datePublished: post.rawDate || post.date,
    author: {
      '@type': 'Person',
      name: config.author || 'SOGO'
    },
    mainEntityOfPage: getPostUrl(post),
    ...(post.imageUrl ? { image: post.imageUrl } : {})
  };

  const folder =
    post.type === 'COLUMN' ? 'columns' : 'exhibitions';

  await write(
    `${folder}/${post.id}/index.html`,
    createPage({
      title: `${post.title} \u2014 ${config.title}`,
      description: post.summary,
      canonical: getPostUrl(post),
      image: post.imageUrl,
      body: detailBody,
      structuredData
    })
  );
}

const siteUrls = [
  `${SITE_URL}/`,
  ...posts.map(getPostUrl)
];

await write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${siteUrls
  .map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`)
  .join('\n')}
</urlset>`
);

await write(
  'robots.txt',
  `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
);

await write(
  '404.html',
  createPage({
    title: `\ud398\uc774\uc9c0\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4 \u2014 ${config.title}`,
    description: '\uc694\uccad\ud55c \ud398\uc774\uc9c0\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.',
    canonical: `${SITE_URL}/404.html`,
    body: `
      <main class="detail">
        <h1>\ud398\uc774\uc9c0\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.</h1>
        <p>
          <a class="back-link" href="/">\uc544\uce74\uc774\ube0c\ub85c \ub3cc\uc544\uac00\uae30</a>
        </p>
      </main>
    `
  })
);

await write('styles.css', styles);
await write('archive.json', JSON.stringify(data, null, 2));

console.log(`Built ${posts.length} posts into ${OUT}/`);
