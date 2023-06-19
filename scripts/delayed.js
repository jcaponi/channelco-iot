// eslint-disable-next-line import/no-cycle
import {
  sampleRUM,
  buildBlock,
  loadBlock,
} from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

function buildAsideBlock(main) {
  const block = buildBlock('aside', [[]]);
  block.classList.add('block');
  block.setAttribute('data-block-name', 'aside');
  main.append(block);
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
