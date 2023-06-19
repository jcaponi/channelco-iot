export default function decorate(block) {
  // add info graphic
  const infoGraphicHTML = `
  <div class="aside-block-infographic">
    <div class="aside-block-infographic-video-container"><video-js
      data-account="1596741612"
      data-player="L9X28Zj7Z"
      data-embed="default"
      controls=""
      data-application-id=""
      data-playlist-id="1650672311752128719"
      class="vjs-fluid"></video-js>
    </div>
    <script
    src="//players.brightcove.net/1596741612/L9X28Zj7Z_default/index.min.js">
    </script>
    <div class="vjs-playlist"></div>
  </div>
  `;
  const range = document.createRange();
  const infoGraphicEl = range.createContextualFragment(infoGraphicHTML);
  block.append(infoGraphicEl);

  // add podcast playlist
  const podCastPlaylistHTML = `
  <div class="aside-block-sponsor">
    <header class="aside-header">
      <h3 class="aside-title">Tune in to our Podcast</h3>
    </header>
    <div id="" class="aside-block">
      <iframe height="700px" width="350px" frameborder="no" scrolling="no" seamless src="https://player.simplecast.com/23077a53-b41d-4595-9e62-cba9188ac2a9?dark=false&show=true"></iframe>
    </div>
  </div>
  `;
  const podCastEl = range.createContextualFragment(podCastPlaylistHTML);
  block.append(podCastEl);
}
