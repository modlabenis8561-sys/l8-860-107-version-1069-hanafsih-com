(function () {
  function getText(value) {
    return String(value || "").toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
      var prev = carousel.querySelector("[data-carousel-prev]");
      var next = carousel.querySelector("[data-carousel-next]");
      var index = 0;
      var timer = null;
      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === index);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === index);
        });
      }
      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }
      dots.forEach(function (dot, itemIndex) {
        dot.addEventListener("click", function () {
          show(itemIndex);
          play();
        });
      });
      show(0);
      play();
    });
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var clearButton = document.querySelector("[data-clear-search]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var filter = "all";
    function update() {
      var query = getText(input ? input.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var searchable = getText(card.getAttribute("data-search"));
        var type = getText(card.getAttribute("data-type"));
        var filterValue = getText(filter);
        var matchesQuery = !query || searchable.indexOf(query) !== -1;
        var matchesFilter = filter === "all" || searchable.indexOf(filterValue) !== -1 || type === filterValue;
        var shouldShow = matchesQuery && matchesFilter;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    if (input) {
      input.addEventListener("input", update);
    }
    if (clearButton && input) {
      clearButton.addEventListener("click", function () {
        input.value = "";
        update();
        input.focus();
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        filter = button.getAttribute("data-filter-button") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        update();
      });
    });
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupCarousel();
    setupSearch();
  });
}());

window.initHlsPlayer = function (playerId, streamUrl) {
  var video = document.getElementById(playerId);
  if (!video) {
    return;
  }
  var frame = video.closest(".video-frame");
  var overlay = frame ? frame.querySelector(".play-overlay") : null;
  var started = false;
  var hls = null;
  function markPlaying() {
    if (frame) {
      frame.classList.add("is-playing");
    }
  }
  function safePlay() {
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {});
    }
  }
  function prepare() {
    if (started) {
      safePlay();
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", safePlay, { once: true });
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, safePlay);
    } else {
      video.src = streamUrl;
      safePlay();
    }
  }
  if (overlay) {
    overlay.addEventListener("click", function () {
      prepare();
    });
  }
  video.addEventListener("play", markPlaying);
  video.addEventListener("click", function () {
    if (video.paused) {
      prepare();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
};
