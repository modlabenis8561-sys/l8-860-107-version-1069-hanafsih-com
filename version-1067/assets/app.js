(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setMobileMenu() {
    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setHeroSlider() {
    var root = qs('.hero-slider');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

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

    show(0);
    play();
  }

  function setCatalogFilter() {
    var input = qs('.catalog-filter');
    if (!input) {
      return;
    }
    var cards = qsa('[data-card]');
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-index') || '').toLowerCase();
        card.style.display = !value || text.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  }

  function createCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';

    var link = document.createElement('a');
    link.className = 'poster-link';
    link.href = movie.url;
    link.setAttribute('aria-label', '观看' + movie.title);

    var img = document.createElement('img');
    img.src = movie.cover;
    img.alt = movie.title;
    img.loading = 'lazy';
    link.appendChild(img);

    var badge = document.createElement('span');
    badge.className = 'play-badge';
    badge.textContent = '▶';
    link.appendChild(badge);

    var body = document.createElement('div');
    body.className = 'movie-card-body';

    var meta = document.createElement('div');
    meta.className = 'movie-meta';
    meta.textContent = movie.year + ' · ' + movie.region;

    var title = document.createElement('h3');
    var titleLink = document.createElement('a');
    titleLink.href = movie.url;
    titleLink.textContent = movie.title;
    title.appendChild(titleLink);

    var desc = document.createElement('p');
    desc.textContent = movie.oneLine;

    var tags = document.createElement('div');
    tags.className = 'tag-row';
    (movie.tags || []).slice(0, 4).forEach(function (tag) {
      var span = document.createElement('span');
      span.textContent = tag;
      tags.appendChild(span);
    });

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(tags);
    article.appendChild(link);
    article.appendChild(body);
    return article;
  }

  function setSearchPage() {
    var form = qs('#searchForm');
    var input = qs('#searchInput');
    var results = qs('#searchResults');
    if (!form || !input || !results || !window.siteMovies) {
      return;
    }

    function render(query) {
      var value = query.trim().toLowerCase();
      results.innerHTML = '';
      if (!value) {
        window.siteMovies.slice(0, 24).forEach(function (movie) {
          results.appendChild(createCard(movie));
        });
        return;
      }
      var matches = window.siteMovies.filter(function (movie) {
        var text = [
          movie.title,
          movie.year,
          movie.region,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return text.indexOf(value) !== -1;
      }).slice(0, 120);

      if (!matches.length) {
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到匹配内容，可以换一个片名、分类或标签继续搜索。';
        results.appendChild(empty);
        return;
      }

      matches.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    render(initial);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', url);
      render(query);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setMobileMenu();
    setHeroSlider();
    setCatalogFilter();
    setSearchPage();
  });
})();
