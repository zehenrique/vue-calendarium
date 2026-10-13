// Documentation website: renders the repository's Markdown files (README, docs/, CHANGELOG, ...)
// as pages of docs.html. The Markdown is bundled at build time, so the website always matches
// the files in the repository. Open a page with docs.html?page=<slug>.
import { marked } from 'marked';
import './site.css';
import './site-nav.js';

const REPO_URL = 'https://github.com/zehenrique/vue-calendarium/blob/main/';
const RAW_URL = 'https://raw.githubusercontent.com/zehenrique/vue-calendarium/main/';

const rootFiles = import.meta.glob(['../README.md', '../CHANGELOG.md', '../CONTRIBUTING.md', '../CODE_OF_CONDUCT.md'], { query: '?raw', import: 'default', eager: true });
const docsFiles = import.meta.glob('../docs/*.md', { query: '?raw', import: 'default', eager: true });
const markdownByPath = Object.fromEntries(
  Object.entries({ ...rootFiles, ...docsFiles }).map(([file, markdown]) => [file.replace(/^\.\.\//, ''), markdown])
);

// Sidebar order. Markdown files in docs/ that are not listed here appear under "More".
const SECTIONS = [
  { title: 'Getting started', pages: [
    { slug: 'overview', path: 'README.md', label: 'Overview' },
    { slug: 'usage', path: 'docs/USAGE.md', label: 'Usage guide' },
    { slug: 'upgrade', path: 'docs/UPGRADING.md', label: 'Upgrade to v2' },
  ] },
  { title: 'Guides', pages: [
    { slug: 'views', path: 'docs/VIEWS.md', label: 'Views' },
    { slug: 'events', path: 'docs/EVENTS.md', label: 'Events and dialogs' },
    { slug: 'recurring-events', path: 'docs/RECURRING_EVENTS.md', label: 'Recurring events' },
    { slug: 'drag-and-drop', path: 'docs/DRAG_AND_DROP.md', label: 'Drag and drop' },
    { slug: 'mobile', path: 'docs/MOBILE.md', label: 'Mobile layout' },
    { slug: 'gestures', path: 'docs/GESTURES.md', label: 'Touch gestures' },
    { slug: 'languages', path: 'docs/I18N.md', label: 'Languages and formats' },
    { slug: 'accessibility', path: 'docs/ACCESSIBILITY.md', label: 'Accessibility' },
    { slug: 'troubleshooting', path: 'docs/TROUBLESHOOTING.md', label: 'Troubleshooting' },
  ] },
  { title: 'Reference', pages: [
    { slug: 'api', path: 'docs/API.md', label: 'API' },
    { slug: 'ghost-events', path: 'docs/GHOST_EVENTS.md', label: 'Ghost events' },
  ] },
  { title: 'Styling', pages: [
    { slug: 'styling', path: 'docs/STYLING.md', label: 'Styling guide' },
    { slug: 'theme-reference', path: 'docs/THEME_REFERENCE.md', label: 'Theme reference' },
    { slug: 'theme-examples', path: 'docs/THEME_EXAMPLES.md', label: 'Theme examples' },
    { slug: 'colors', path: 'docs/COLORS.md', label: 'Colors' },
  ] },
  { title: 'Project', pages: [
    { slug: 'changelog', path: 'CHANGELOG.md', label: 'Changelog' },
    { slug: 'contributing', path: 'CONTRIBUTING.md', label: 'Contributing' },
    { slug: 'code-of-conduct', path: 'CODE_OF_CONDUCT.md', label: 'Code of conduct' },
  ] },
];

const listedPaths = new Set(SECTIONS.flatMap(section => section.pages.map(page => page.path)));
const unlistedPages = Object.keys(markdownByPath)
  .filter(path => path.startsWith('docs/') && !listedPaths.has(path))
  .sort()
  .map(path => ({
    slug: path.slice('docs/'.length, -'.md'.length).toLowerCase().replace(/_/g, '-'),
    path,
    label: (markdownByPath[path].match(/^# (.+)$/m)?.[1] ?? path).trim(),
  }));
if (unlistedPages.length) SECTIONS.push({ title: 'More', pages: unlistedPages });

const PAGES = SECTIONS.flatMap(section => section.pages);
const pageByPath = Object.fromEntries(PAGES.map(page => [page.path, page]));

// Same heading ids as GitHub, so links like docs/UPGRADING.md#3-remove-the-hammerjs-setup work on both
function slugify(text) {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
}

function pageUrl(page) {
  return `./docs.html?page=${page.slug}`;
}

/**
 * Point relative links at the website page for that file, or at the file on GitHub.
 * @param {string} href - Link target as written in the Markdown
 * @param {string} fromPath - Repository path of the Markdown file
 * @param {boolean} [isImage] - Images load from the raw file instead of the GitHub file page
 */
function resolveLink(href, fromPath, isImage = false) {
  if (/^([a-z]+:|#)/i.test(href)) return href;
  const url = new URL(href, `https://repo.invalid/${fromPath}`);
  const file = url.pathname.slice(1);
  if (isImage) return RAW_URL + file;
  const page = pageByPath[file];
  return (page ? pageUrl(page) : REPO_URL + file) + url.hash;
}

function renderMarkdown(page) {
  const usedIds = new Map();
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth, text }) {
    const base = slugify(text);
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    const id = count ? `${base}-${count}` : base;
    return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
  };

  return marked.parse(markdownByPath[page.path], {
    renderer,
    walkTokens(token) {
      if (token.type === 'link' || token.type === 'image') token.href = resolveLink(token.href, page.path, token.type === 'image');
    },
  });
}

function renderSidebar(container, currentPage) {
  for (const section of SECTIONS) {
    const heading = document.createElement('p');
    heading.className = 'docs-toc__section';
    heading.textContent = section.title;
    const list = document.createElement('ul');
    for (const page of section.pages) {
      const link = document.createElement('a');
      link.href = pageUrl(page);
      link.textContent = page.label;
      if (page === currentPage) link.setAttribute('aria-current', 'page');
      const item = document.createElement('li');
      item.append(link);
      list.append(item);
    }
    container.append(heading, list);
  }
}

function renderDocs() {
  const slug = new URLSearchParams(location.search).get('page') ?? 'overview';
  const page = PAGES.find(candidate => candidate.slug === slug);
  const content = document.querySelector('.doc');

  renderSidebar(document.querySelector('.docs-toc__links'), page);
  document.querySelector('.docs-toc__current').textContent = page?.label ?? 'Documentation';

  // Highlight the matching item in the site navigation bar (Docs, Changelog or Upgrade to v2)
  const navKey = ['changelog', 'upgrade'].includes(page?.slug) ? page.slug : 'docs';
  document.querySelector(`.site-nav__links [data-nav="${navKey}"]`)?.setAttribute('aria-current', 'page');

  if (!page) {
    document.title = 'Page not found · vue-calendarium';
    const heading = document.createElement('h1');
    heading.textContent = 'Page not found';
    const text = document.createElement('p');
    text.textContent = 'There is no documentation page with that name. Pick one from the list.';
    content.append(heading, text);
    return;
  }

  // Trusted content: the Markdown is this repository's own, bundled at build time
  content.innerHTML = renderMarkdown(page);
  document.title = page.path === 'README.md' ? 'vue-calendarium documentation' : `${content.querySelector('h1')?.textContent ?? page.label} · vue-calendarium`;

  const sourceLink = document.createElement('a');
  sourceLink.href = REPO_URL + page.path;
  sourceLink.textContent = page.path;
  const source = document.createElement('p');
  source.className = 'doc-source';
  source.append('Source: ', sourceLink);
  content.append(source);

  // The browser looked for the #anchor before the content existed
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

// The contents list is always open on wide screens and collapsible on phones
const toc = document.querySelector('.docs-toc');
const wideScreen = window.matchMedia('(min-width: 960px)');
const syncToc = () => { toc.open = wideScreen.matches; };
syncToc();
wideScreen.addEventListener('change', syncToc);

renderDocs();
