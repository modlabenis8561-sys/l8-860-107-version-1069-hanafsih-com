(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroCarousel() {
        var hero = document.querySelector('[data-hero-carousel]');

        if (!hero) {
            return;
        }

        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 6500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                activate(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                activate(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    function initFilters() {
        var panels = selectAll('[data-filter-panel]');

        panels.forEach(function (panel) {
            var scopeSelector = panel.getAttribute('data-filter-panel');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            var cards = selectAll('[data-movie-card]', scope || document);
            var input = panel.querySelector('[data-filter-input]');
            var selects = selectAll('[data-filter-select]', panel);
            var params = new URLSearchParams(window.location.search);

            if (input && params.get('q')) {
                input.value = params.get('q');
            }
            var empty = document.querySelector('[data-empty-state]');

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function applyFilter() {
                var query = normalize(input ? input.value : '');
                var activeFilters = {};
                var visible = 0;

                selects.forEach(function (select) {
                    if (select.value) {
                        activeFilters[select.name] = normalize(select.value);
                    }
                });

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' '));
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesSelects = Object.keys(activeFilters).every(function (name) {
                        return normalize(card.dataset[name]).indexOf(activeFilters[name]) !== -1;
                    });
                    var shouldShow = matchesQuery && matchesSelects;

                    card.hidden = !shouldShow;

                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }

            selects.forEach(function (select) {
                select.addEventListener('change', applyFilter);
            });

            applyFilter();
        });
    }

    function initBackToTop() {
        var button = document.querySelector('[data-back-to-top]');

        if (!button) {
            return;
        }

        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 480);
        }, { passive: true });

        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroCarousel();
        initFilters();
        initBackToTop();
    });
}());
