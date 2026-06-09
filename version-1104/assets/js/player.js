import { H as Hls } from './hls.js';

(function () {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var cover = shell.querySelector('[data-play-cover]');

  if (!video) {
    return;
  }

  var src = video.getAttribute('src');
  var hls = null;
  var attached = false;

  function attach() {
    if (attached || !src) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    }
  }

  function start() {
    attach();
    shell.classList.add('is-playing');
    video.controls = true;
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
