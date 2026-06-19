(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var category = filterRoot.querySelector('[data-filter-category]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var button = filterRoot.querySelector('[data-filter-button]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
    var empty = filterRoot.querySelector('[data-empty-state]');

    if (filterRoot.hasAttribute('data-query-from-url') && input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var queryValue = normalize(input ? input.value : '');
      var categoryValue = category ? category.value : '';
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var matchQuery = !queryValue || searchText.indexOf(queryValue) !== -1;
        var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var match = matchQuery && matchCategory && matchRegion && matchYear;
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, category, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (button) {
      button.addEventListener('click', applyFilter);
    }

    applyFilter();
  }

  var video = document.querySelector('[data-video]');
  var playButton = document.querySelector('[data-play]');
  var overlay = document.querySelector('[data-overlay]');

  if (video && playButton) {
    var source = video.getAttribute('data-source');
    var hls;

    function attachSource() {
      if (video.getAttribute('data-ready') === '1' || !source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.setAttribute('data-ready', '1');
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.setAttribute('data-ready', '1');
        return;
      }

      video.src = source;
      video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
      attachSource();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    playButton.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }
})();
