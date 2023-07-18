import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  if (config.url) {
    const html = `
      <div class="video-container">
        <div>
            <iframe allow="encrypted-media" allowfullscreen="" src="${config.url}"></iframe>
        </div>
      </div>
    `;
    block.innerHTML = html;
  } else {
    block.remove();
  }
}
