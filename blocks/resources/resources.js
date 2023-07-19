import { lookupPages } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

/**
 * Creates a Card using a JSON object and style associated with the card
 * @param {Object} row JSON Object typically coming from an index array item
 * @param {Array} styles Class names that needs to be added to the card root div
 */
async function createCard(row, styles) {
  // Create card div
  const card = document.createElement('div');
  if (styles) card.classList.add(styles);

  // Add the image to the card first
  if ((row.image !== '0') && (row.title !== '0')) {
    const picture = createOptimizedPicture(row.image, row.title);
    const picLink = document.createElement('a');
    picLink.href = row.path;
    if (picture) picLink.append(picture);
    card.append(picLink);
  }
  const content = document.createElement('div');
  // Create and add the title link and description to card content and card
  const link = document.createElement('a');
  const linkContainer = document.createElement('div');
  linkContainer.classList.add('link-container');
  linkContainer.append(link);
  link.href = row.path;
  if (row.title && row.title !== '0') link.innerHTML += `${row.title}`;
  content.append(linkContainer);
  if (row.description && row.description !== '0') content.innerHTML += `<div class="description"><p>${row.description}</p></div>`;
  card.append(content);
  return (card);
}

export default async function decorate(block) {
  const pathnames = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  block.textContent = '';
  // Make a call to the index and get the json for just the pathnames the author has put in
  const pageList = await lookupPages(pathnames);
  if (pageList.length) {
    pageList.forEach(async (row) => {
      block.append(await createCard(row, 'article-card'));
    });
  } else {
    block.remove();
  }
}
