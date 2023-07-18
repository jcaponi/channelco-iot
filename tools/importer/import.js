/* eslint-disable no-undef */
const createMetadataBlock = (main, document, url) => {
  const meta = {};
  // add the template
  meta.Template = 'Article';

  // find the Title, Description and Subtitle
  const title = document.head.querySelector('meta[property="og:title"]');
  if (title) {
    meta.Title = title.content;
  } else {
    const titleFromContent = document.querySelector('body article main article header h2.page-title');
    if (titleFromContent) meta.Title = titleFromContent.textContent;
  }
  const subtitle = document.querySelector('article main article header.article-header h3.article-subtitle');
  if (subtitle) meta.Subtitle = subtitle.textContent;
  const desc = document.head.querySelector('meta[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  } else {
    const description = document.head.querySelector('meta[name="description"]');
    if (description) meta.Description = description.content;
  }

  // Published date
  const publishedDate = document.head.querySelector('meta[property="article:published_time"]');
  if (publishedDate) meta.PublishedDate = publishedDate.content;

  // Author
  const articleHeader = document.querySelector('article main article header.article-header ul.article-header-list');
  if (articleHeader) {
    const author = articleHeader.querySelector('span[rel="sioc:has_creator"] a');
    if (author) {
      meta.Author = author.text;
      articleHeader.remove();
    }
  }

  // Article Key metadata
  const articleKey = document.querySelector('article main article div.article-preface .article-key');
  if (articleKey) {
    const articleKeysList = articleKey.querySelectorAll('.article-key-list li');
    if (articleKeysList) {
      articleKeysList.forEach((li) => {
        const tag = li.textContent.split(':');
        const key = tag[0].trim();
        const val = tag[1].trim();
        if (tag) meta[key] = val;
      });
      articleKey.remove();
    }
  }

  // sponsor header
  const { pathname } = new URL(url);
  if (pathname.includes('/content/')) {
    meta.sponsor = 'intel';
  }

  // find the <meta property="og:image"> element
  // const img = document.querySelector('[property="og:image"]');
  // if (img) {
  //   // create an <img> element
  //   const el = document.createElement('img');
  //   el.src = img.content;
  //   meta.Image = el;
  // }

  // helper to create the metadata block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  main.append(block);

  // returning the meta object might be usefull to other rules
  return meta;
};

function createVideoBlock(main) {
  const embeddedVideos = main.querySelectorAll('iframe[src^="https://players.brightcove.net"]');
  embeddedVideos.forEach((video) => {
    const videoUrl = video.src;
    const cells = [
      ['Video'],
      [videoUrl],
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  });
}

export default {
  transform: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
  }) => {
    // Remove unnecessary parts of the content
    const main = document.body;
    const results = [];

    // Remove other stuff that shows up in the page
    const nav = main.querySelector('div.wrap nav');
    if (nav) nav.remove();
    const header = main.querySelector('div.wrap header');
    if (header) header.remove();
    const mainHeader = main.querySelector('main header.main-header');
    if (mainHeader) mainHeader.remove();
    const skipLinkWrapper = main.querySelector('p.skip-link__wrapper');
    if (skipLinkWrapper) skipLinkWrapper.remove();
    const mainAd = main.querySelector('article main .main-content .row div.tmsads');
    if (mainAd && mainAd.parentElement) {
      mainAd.parentElement.remove();
    }
    const rightNav = main.querySelector('article main .main-content .row aside');
    if (rightNav) rightNav.remove();

    // create video block for embedded videos
    createVideoBlock(main);

    // Remove all iframes
    main.querySelectorAll('iframe').forEach((el) => el.remove());
    // Remove Footer
    const footer = main.querySelector('footer');
    if (footer) footer.remove();

    createMetadataBlock(main, document, url);

    // main page import - "element" is provided, i.e. a docx will be created
    results.push({
      element: main,
      path: new URL(url).pathname,
    });

    return results;
  },
};
