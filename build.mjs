import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const API_URL =
  process.env.ARCHIVE_API_URL ||
  'https://script.google.com/macros/s/AKfycbzU72-9Dz01WW7lESYAyUXBH_xIc_9Bcamd6SXksybve1I81Un3bBVXrPRHb9-2l913/exec?output=json';

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
  border-bottom: 1px solid var(--line);
}

.header-inner {
  max-width: var(--max-width);
  height: 78px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  font-family: "Noto Serif KR", serif;
  font-size: 17px;
  font-weight: 500;
  text-decoration: none;
}

.navigation {
  display: flex;
  gap: 25px;
}

.navigation a {
  color: var(--muted);
  font-size: 12px;
  text-decoration: none;
}

.hero {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 115px 32px 105px;
  display: grid;
  grid-template-columns: 1.35fr 0.65fr;
  gap: 70px;
  align-items: end;
}

.eyebrow {
  color: var(--accent);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
}

.hero h1 {
  margin: 24px 0 0;
  font-family: "Noto Serif KR", serif;
  font-size: clamp(42px, 6vw, 76px);
  font-weight: 400;
  line-height: 1.28;
  letter-spacing: -0.055em;
}

.hero-description {
  margin: 0;
  color: var(--muted);
  font-family: "Noto Serif KR", serif;
  line-height: 2;
}

.archive {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 32px 120px;
}

.toolbar {
  padding: 22px 0;
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
}

.filter-button.active {
  color: var(--ink);
  font-weight: 500;
}

.post-card {
  padding: 40px 0;
  display: grid;
  grid-template-columns: 105px minmax(0, 1fr) 120px;
  gap: 30px;
  border-bottom: 1px solid var(--line);
  text-decoration: none;
}

.post-type {
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.14em;
}

.post-card h2 {
  margin: 0 0 12px;
  font-family: "Noto Serif KR", serif;
  font-size: clamp(23px, 2.5vw, 33px);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.04em;
}

.post-card p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.post-date {
  color: var(--muted);
  font-size: 11px;
  text-align: right;
}

.detail {
  max-width: 820px;
  margin: 0 auto;
  padding: 80px 32px 130px;
}

.back-link {
  display: inline-block;
  margin-bottom: 65px;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
  font-size: 12px;
  text-decoration: none;
}

.detail-kicker {
  color: var(--accent);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.15em;
}

.detail h1 {
  margin: 24px 0 0;
  font-family: "Noto Serif KR", serif;
  font-size: clamp(38px, 6vw, 60px);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.055em;
}

.subtitle {
  color: var(--muted);
  font-family: "Noto Serif KR", serif;
  font-size: 17px;
}

.meta {
  margin-top: 40px;
  padding: 17px 0;
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  color: var(--muted);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  font-size: 11px;
}

.cover-image {
  width: 100%;
  max-height: 560px;
  margin-top: 55px;
  object-fit: cover;
}

.introduction {
  max-width: 650px;
  margin: 65px auto 0;
  padding: 40px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.introduction p {
  margin: 0;
  font-family: "Noto Serif KR", serif;
  font-size: 17px;
  line-height: 2;
}

.original-link {
  display: inline-block;
  margin-top: 30px;
  padding-bottom: 4px;
  color: var(--accent);
  border-bottom: 1px solid var(--accent);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
}

.tags {
  max-width: 650px;
  margin: 45px auto 0;
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
  padding: 30px 32px 45px;
  display: flex;
  justify-content: space-between;
  color: #99958d;
  border-top: 1px solid var(--line);
  font-size: 10px;
}

@media (max-width: 700px) {
  .header-inner {
    height: 66px;
    padding: 0 20px;
  }

  .navigation {
    gap: 14px;
  }

  .hero {
    padding: 72px 20px 75px;
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero h1 {
    font-size: 42px;
  }

  .archive {
    padding: 0 20px 85px;
  }

  .post-card {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 32px 0;
  }

  .post-date {
    text-align: left;
  }

  .detail {
    padding: 50px 20px 90px;
  }

  .back-link {
    margin-bottom: 45px;
  }

  .detail h1 {
    font-size: 38px;
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
        ${escapeHtml(config.title || '정지호의 미술 아카이브')}
      </a>

      <nav class="navigation">
        <a href="/#columns">칼럼</a>
        <a href="/#exhibitions">전시 기록</a>
      </nav>
    </div>
  </header>

  ${body}

  <footer class="site-footer">
    <span>© ${new Date().getFullYear()} ${escapeHtml(config.author || 'SOGO')}</span>
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
      ${post.type === 'COLUMN' ? 'COLUMN' : 'EXHIBITION NOTE'}
    </span>

    <span>
      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.summary)}</p>
    </span>

    <span class="post-date">${escapeHtml(post.date)}</span>
  </a>
`).join('');

const homeBody = `
<main>
  <section class="hero">
    <div>
      <span class="eyebrow">ART · EXHIBITION · WRITING</span>
      <h1>보고, 걷고,<br>오래 생각한 것들.</h1>
    </div>

    <p class="hero-description">
      ${escapeHtml(config.description || '')}
    </p>
  </section>

  <section class="archive">
    <div class="toolbar">
      <button class="filter-button active" data-filter="ALL">전체</button>
      <button class="filter-button" data-filter="COLUMN">칼럼</button>
      <button class="filter-button" data-filter="BLOG">전시 기록</button>
    </div>

    <div id="post-list">
      ${postCards || '<p class="empty">등록된 글이 없습니다.</p>'}
    </div>
  </section>
</main>

<script>
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-button').forEach(item => {
        item.classList.remove('active');
      });

      button.classList.add('active');

      document.querySelectorAll('.post-card').forEach(post => {
        post.hidden =
          button.dataset.filter !== 'ALL' &&
          post.dataset.kind !== button.dataset.filter;
      });
    });
  });
</script>
`;

await write(
  'index.html',
  createPage({
    title: config.title || '정지호의 미술 아카이브',
    description: config.description || '',
    canonical: `${SITE_URL}/`,
    body: homeBody,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.title || '정지호의 미술 아카이브',
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
        ${escapeHtml(post.ctaLabel || '전체 글 읽기')} ↗
      </a>`
    : '';

  const detailBody = `
  <main class="detail">
    <a class="back-link" href="/">← 목록으로 돌아가기</a>

    <article>
      <header>
        <div class="detail-kicker">
          ${post.type === 'COLUMN' ? 'COLUMN' : 'EXHIBITION NOTE'}
          · ${escapeHtml(post.category)}
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
      title: `${post.title} — ${config.title}`,
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
    title: `페이지를 찾을 수 없습니다 — ${config.title}`,
    description: '요청한 페이지를 찾을 수 없습니다.',
    canonical: `${SITE_URL}/404.html`,
    body: `
      <main class="detail">
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p>
          <a class="back-link" href="/">아카이브로 돌아가기</a>
        </p>
      </main>
    `
  })
);

await write('styles.css', styles);
await write('archive.json', JSON.stringify(data, null, 2));

console.log(`Built ${posts.length} posts into ${OUT}/`);
