import { H as Hls } from './hls.js';

export const setupPlayer = (videoId, buttonId, sourceUrl) => {
  const video = document.getElementById(videoId);
  const cover = document.getElementById(buttonId);
  let attached = false;
  let hls = null;

  if (!video || !cover || !sourceUrl) {
    return;
  }

  const attachSource = () => {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  };

  const start = () => {
    attachSource();
    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        cover.classList.remove('is-hidden');
      });
    }
  };

  cover.addEventListener('click', start);

  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
};
