// eslint-disable-next-line import/no-cycle
import {
  sampleRUM,
  buildBlock,
  loadBlock,
} from './lib-franklin.js';

// add more delayed functionality here

function buildAsideBlock(main) {
  const block = buildBlock('aside', [[]]);
  block.classList.add('block');
  block.setAttribute('data-block-name', 'aside');
  // append the aside block to either newslist-container or first non hero-header-container section
  const container = document.querySelector('.newslist-container') || document.querySelector(".hero-header-container+div.section");
  if (container) {
    container.append(block);
  }
  loadBlock(block);
}

/**
 * Build delayed auto blocks in a container element.
 * @param {Element} main The container element
 */
function buildDelayedAutoBlocks(main) {
  try {
    buildAsideBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Delayed Auto Blocking failed', error);
  }
}

buildDelayedAutoBlocks(document.querySelector('main'));

// Core Web Vitals RUM collection
sampleRUM('cwv');
