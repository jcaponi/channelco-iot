import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}
// Build Article Props
// Retreive metadata value based on the key
function getMetadata(key) {
  const metaElement = document.querySelector(`meta[name="${key}"]`);
  if (metaElement) {
    return metaElement.getAttribute('content');
  }
  return '';
}
// Build the article properties block
function buildArticlePropsBlock(main) {
  const rawPublishedDate = getMetadata('publisheddate');
  // eslint-disable-next-line no-use-before-define
  const publishedDate = formatPublishedDate(rawPublishedDate);
  const author = `Author: ${getMetadata('author')}`;
  const vertical = `Vertical: ${getMetadata('vertical')}`;
  const application = `Application: ${getMetadata('application')}`;
  const featuredSIs = `Featured SIs: ${getMetadata('featuredsis')}`;
  const featuredTech = `Featured Tech: ${getMetadata('featured-tech')}`;

  const headerList = document.createElement('div');
  headerList.classList.add('header-list');
  headerList.innerHTML = `${publishedDate} / ${author}`;

  const articleKeyDiv = document.createElement('div');
  articleKeyDiv.classList.add('article-key');

  const articleKeyList = document.createElement('ul');
  articleKeyList.classList.add('article-key-list');

  const verticalItem = document.createElement('li');
  verticalItem.classList.add('article-key-item');
  verticalItem.textContent = vertical;

  const applicationItem = document.createElement('li');
  applicationItem.classList.add('article-key-item');
  applicationItem.textContent = application;

  const featuredSIsItem = document.createElement('li');
  featuredSIsItem.classList.add('article-key-item');
  featuredSIsItem.textContent = featuredSIs;

  const featuredTechItem = document.createElement('li');
  featuredTechItem.classList.add('article-key-item');
  featuredTechItem.textContent = featuredTech;

  articleKeyList.appendChild(verticalItem);
  articleKeyList.appendChild(applicationItem);
  articleKeyList.appendChild(featuredSIsItem);
  articleKeyList.appendChild(featuredTechItem);

  articleKeyDiv.appendChild(articleKeyList);

  const hook = main.querySelector('picture');
  if (hook) {
    hook.parentElement.prepend(headerList);
    hook.parentElement.prepend(articleKeyDiv);
  }
}

// Format the published date
function formatPublishedDate(rawDate) {
  const date = new Date(rawDate);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */

function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    // eslint-disable-next-line no-undef
    buildArticlePropsBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
