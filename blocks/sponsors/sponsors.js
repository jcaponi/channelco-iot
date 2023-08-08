import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

function toggleVisibility(el) {
  const expanded = el.getAttribute('aria-expanded') === 'true';
  el.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

async function getData(link) {
  const results = await fetch(link);
  const resultsJson = await results.json();
  return resultsJson.data;
}

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
    picture.addEventListener('click', (event) => {
      toggleVisibility(picture.parentElement);
      event.stopPropagation();
    });
    if (picture) card.append(picture);
  }
  const content = document.createElement('div');
  content.classList.add('content');
  if (row.title && row.title !== '0') content.innerHTML += `<h5>${row.title}</h5>`;
  // Create and add the title link and description to card content and card
  if (row.description && row.description !== '0') content.innerHTML += `<div class="description"><p>${row.description}</p></div>`;
  const link = document.createElement('a');
  const linkContainer = document.createElement('div');
  linkContainer.classList.add('link-container');
  linkContainer.append(link);
  link.href = row.path;
  if (row.title && row.title !== '0') link.innerHTML += `Visit ${row.title} website`;
  content.append(linkContainer);

  card.append(content);
  return (card);
}

export default async function decorate(block) {
  const dataLink = block.querySelector('a');
  const dataSrc = new URL(dataLink.href).pathname;
  block.textContent = '';
  if (!dataSrc) block.remove();
  if (dataSrc) {
    const sponsorsList = await getData(dataSrc);
    if (sponsorsList) {
      sponsorsList.forEach(async (row) => {
        block.append(await createCard(row, 'sponsor-card'));
      });
    }
    document.addEventListener('click', (event) => {
      const openModals = block.querySelectorAll('.sponsor-card[aria-expanded="true"] .content');
      openModals.forEach((modal) => {
        const isClickInside = modal.contains(event.target);
        if (!isClickInside) {
          toggleVisibility(modal.parentElement);
          event.stopPropagation();
        }
      });
    });
  }
}
