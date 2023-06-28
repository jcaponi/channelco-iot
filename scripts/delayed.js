// eslint-disable-next-line import/no-cycle
import {
  sampleRUM,
  buildBlock,
  loadBlock,
} from './lib-franklin.js';

// add more delayed functionality here
function buildTopAd(main) {
  const topAdHTML = `
  <div class="top-ad">
    <span class="ad-title">Advertisement</span> <br />
    <!-- /21804213519/CRN/Ros_Top_Leader-->
    <div id="unit-1659129517463" class="tmsads"></div>
  </div>
  `;
  const range = document.createRange();
  const topAdEl = range.createContextualFragment(topAdHTML);
  const contentContainer = main.querySelector('.content-container');
  if (contentContainer) {
    contentContainer.parentNode.insertBefore(topAdEl, contentContainer);
  }
}

function buildAsideBlock(main) {
  const block = buildBlock('aside', [[]]);
  block.classList.add('block');
  block.setAttribute('data-block-name', 'aside');
  // append the aside block to either newslist-container or first non hero-header-container section
  const container = main.querySelector('.newslist-container') || main.querySelector('.hero-header-container+div.section');
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
    buildTopAd(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Delayed Auto Blocking failed', error);
  }
}

buildDelayedAutoBlocks(document.querySelector('main'));

// Core Web Vitals RUM collection
sampleRUM('cwv');
