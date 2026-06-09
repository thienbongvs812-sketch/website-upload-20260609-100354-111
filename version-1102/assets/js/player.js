import { H as Hls } from './hls.esm.js';

function startPlayer(shell) {
  var video = shell.querySelector('video');
  var source = shell.getAttribute('data-hls');

  if (!video || !source) {
    return;
  }

  if (video.getAttribute('data-ready') !== '1') {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.setAttribute('data-ready', '1');
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        maxBufferLength: 45,
        enableWorker: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.setAttribute('data-ready', '1');
    }
  }

  shell.classList.add('is-playing');
  var playResult = video.play();
  if (playResult && typeof playResult.catch === 'function') {
    playResult.catch(function () {});
  }
}

document.querySelectorAll('.player-shell').forEach(function (shell) {
  var overlay = shell.querySelector('.player-overlay');
  var video = shell.querySelector('video');

  if (overlay) {
    overlay.addEventListener('click', function () {
      startPlayer(shell);
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        startPlayer(shell);
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
  }
});
