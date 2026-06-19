const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const initMenu = () => {
  const button = document.querySelector('[data-menu-button]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (!button || !panel) {
    return;
  }

  button.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
};

const initBackTop = () => {
  document.querySelectorAll('[data-back-top]').forEach((button) => {
    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
};

const initHeroSlider = () => {
  const slider = document.querySelector('[data-hero-slider]');

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-slide-dot]'));
  const previous = slider.querySelector('[data-slide-prev]');
  const next = slider.querySelector('[data-slide-next]');
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === active);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  };

  const play = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(active + 1), 5600);
  };

  if (slides.length <= 1) {
    return;
  }

  previous?.addEventListener('click', () => {
    show(active - 1);
    play();
  });

  next?.addEventListener('click', () => {
    show(active + 1);
    play();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.slideDot || 0));
      play();
    });
  });

  slider.addEventListener('mouseenter', () => window.clearInterval(timer));
  slider.addEventListener('mouseleave', play);
  play();
};

const initLocalFilter = () => {
  const input = document.querySelector('[data-filter-input]');
  const scope = document.querySelector('[data-filter-scope]');

  if (!input || !scope) {
    return;
  }

  const cards = Array.from(scope.querySelectorAll('[data-card]'));

  input.addEventListener('input', () => {
    const query = normalize(input.value);

    cards.forEach((card) => {
      const text = normalize(`${card.dataset.title || ''} ${card.dataset.meta || ''}`);
      card.classList.toggle('hidden-card', query.length > 0 && !text.includes(query));
    });
  });
};

const createResultCard = (movie) => {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
    <a class="movie-card" href="${movie.url}" data-card data-title="${escapeHtml(movie.title)}" data-meta="${escapeHtml(`${movie.year} ${movie.region} ${movie.type} ${movie.genre} ${movie.tags.join(' ')}`)}">
      <span class="cover-wrap">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="play-chip">播放</span>
      </span>
      <span class="card-body">
        <strong>${escapeHtml(movie.title)}</strong>
        <span class="card-meta">${escapeHtml(`${movie.year} · ${movie.region} · ${movie.type}`)}</span>
        <span class="card-line">${escapeHtml(movie.oneLine)}</span>
        <span class="tag-row">${tags}</span>
      </span>
    </a>
  `;
};

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const renderSearchPage = (movieIndex) => {
  const input = document.querySelector('#search-q');
  const status = document.querySelector('[data-search-status]');
  const resultsNode = document.querySelector('[data-search-results]');

  if (!input || !status || !resultsNode) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  input.value = query;

  const render = (value) => {
    const keyword = normalize(value);

    if (!keyword) {
      status.textContent = '输入关键词开始搜索';
      resultsNode.innerHTML = '';
      return;
    }

    const results = movieIndex.filter((movie) => {
      const text = normalize(`${movie.title} ${movie.year} ${movie.region} ${movie.type} ${movie.genre} ${movie.category} ${movie.oneLine} ${movie.tags.join(' ')}`);
      return text.includes(keyword);
    });

    status.textContent = results.length ? `找到 ${results.length} 部相关内容` : '没有找到相关内容';
    resultsNode.innerHTML = results.slice(0, 240).map(createResultCard).join('');
  };

  input.addEventListener('input', () => render(input.value));
  render(query);
};

ready(() => {
  initMenu();
  initBackTop();
  initHeroSlider();
  initLocalFilter();
});
