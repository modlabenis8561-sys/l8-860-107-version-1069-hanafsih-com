(function () {
  function initMoviePlayer(source, videoId, overlayId) {
    var video = document.getElementById(videoId || 'moviePlayer');
    var overlay = document.getElementById(overlayId || 'playerOverlay');
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
