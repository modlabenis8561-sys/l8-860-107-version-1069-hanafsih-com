function setupHlsPlayer(videoId, coverId, streamUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var loaded = false;
  var instance = null;

  if (!video || !cover || !streamUrl) {
    return;
  }

  function loadStream() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      instance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      instance.loadSource(streamUrl);
      instance.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  }

  function playVideo() {
    loadStream();
    cover.classList.add("hidden");
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        cover.classList.remove("hidden");
      });
    }
  }

  cover.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener("play", function () {
    cover.classList.add("hidden");
  });
  video.addEventListener("ended", function () {
    cover.classList.remove("hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  });
}
