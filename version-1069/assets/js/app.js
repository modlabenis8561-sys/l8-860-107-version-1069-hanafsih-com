(function () {
  function each(selector, callback) {
    document.querySelectorAll(selector).forEach(callback);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    each('[data-site-search]', function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          input.focus();
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupPageFilter() {
    var input = document.getElementById('pageSearch');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card, [data-filter-list] .ranking-row'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    if (!cards.length) {
      return;
    }
    var activeFilter = '';

    function apply() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var type = normalize(card.getAttribute('data-type'));
        var showByQuery = !query || text.indexOf(query) !== -1;
        var showByFilter = !activeFilter || type === normalize(activeFilter) || text.indexOf(normalize(activeFilter)) !== -1;
        card.classList.toggle('is-hidden', !(showByQuery && showByFilter));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter') || '';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });
  }

  function createCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.join(' ') : '';
    return [
      '<article class="movie-card default" data-search="',
      escapeHtml([movie.title, movie.region, movie.type, movie.year, movie.genre, tags, movie.oneLine].join(' ')),
      '">',
      '<a class="movie-card-link" href="', escapeHtml(movie.url), '">',
      '<div class="card-poster">',
      '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy">',
      '<div class="card-shade"></div>',
      '<span class="card-type">', escapeHtml(movie.type), '</span>',
      '<span class="card-play">▶</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>', escapeHtml(movie.title), '</h3>',
      '<p>', escapeHtml(movie.oneLine), '</p>',
      '<div class="card-meta"><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.year), '</span></div>',
      '<div class="card-genre">', escapeHtml(movie.genre), '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    var summary = document.getElementById('searchSummary');
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!results || !input || !data.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var query = normalize(input.value);
      var list;
      if (!query) {
        list = data.slice(0, 60);
        if (summary) {
          summary.textContent = '可输入片名、地区、年份、类型或标签继续筛选。';
        }
      } else {
        list = data.filter(function (movie) {
          var haystack = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' '));
          return haystack.indexOf(query) !== -1;
        });
        if (summary) {
          summary.textContent = list.length ? '已匹配到相关内容。' : '没有匹配结果。';
        }
      }
      results.innerHTML = list.slice(0, 120).map(createCard).join('');
    }

    input.addEventListener('input', render);
    render();
  }

  window.initMoviePlayer = function (url) {
    var stage = document.querySelector('[data-player-stage]');
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('.player-overlay');
    var started = false;
    var hlsInstance = null;

    if (!stage || !video || !url) {
      return;
    }

    function start() {
      if (started) {
        return;
      }
      started = true;
      stage.classList.add('is-playing');
      if (overlay) {
        overlay.hidden = true;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
      video.controls = true;
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    stage.addEventListener('click', start);
    stage.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        start();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupSearchForms();
    setupHero();
    setupPageFilter();
    setupSearchPage();
  });
})();
