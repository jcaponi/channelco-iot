import { readBlockConfig } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div class="footer-logo">
        <img src="/icons/logo-thechannelco.png" alt="The Channel Company">
      </div>
      ${html}
    `;
    footer.classList.add('footer-logolinks');
    const footerLogo = footer.querySelector('.footer-logo');
    const footerLinks = footerLogo.nextElementSibling;
    let footerAbout;
    if (footerLinks) {
      footerLinks.classList.add('footer-links');
      footerAbout = footerLinks.nextElementSibling;
      if (footerAbout) {
        footerAbout.classList.add('footer-about');
        footerAbout.firstElementChild.classList.add('footer-about-title');
        footerAbout.lastElementChild.classList.add('footer-about-content');
        block.append(footerAbout);
      }
    }
    block.append(footer);
    if (footerAbout) {
      block.append(footerAbout);
    }
  }
}
