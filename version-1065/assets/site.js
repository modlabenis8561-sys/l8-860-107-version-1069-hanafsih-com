(function() {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
        restartHeroTimer();
      });
    });

    function restartHeroTimer() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      heroTimer = window.setInterval(function() {
        showSlide(activeSlide + 1);
      }, 5200);
    }

    restartHeroTimer();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".local-filter"));
  var sortSelects = Array.prototype.slice.call(document.querySelectorAll(".local-sort"));

  function filterCards(scope) {
    var list = scope.querySelector(".filter-list");
    var input = scope.querySelector(".local-filter");
    var select = scope.querySelector(".local-sort");

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var keyword = normalize(input ? input.value : "");

    cards.forEach(function(card) {
      var haystack = normalize(card.getAttribute("data-search"));
      card.classList.toggle("is-filtered-out", keyword && haystack.indexOf(keyword) === -1);
    });

    if (select) {
      var mode = select.value;
      var sorted = cards.slice();

      if (mode === "year-desc" || mode === "year-asc") {
        sorted.sort(function(a, b) {
          var ya = parseInt(a.getAttribute("data-year"), 10) || 0;
          var yb = parseInt(b.getAttribute("data-year"), 10) || 0;
          return mode === "year-desc" ? yb - ya : ya - yb;
        });
      }

      if (mode === "title") {
        sorted.sort(function(a, b) {
          var ta = normalize(a.querySelector("h3") ? a.querySelector("h3").innerText : "");
          var tb = normalize(b.querySelector("h3") ? b.querySelector("h3").innerText : "");
          return ta.localeCompare(tb, "zh-Hans-CN");
        });
      }

      sorted.forEach(function(card) {
        list.appendChild(card);
      });
    }
  }

  filterInputs.forEach(function(input) {
    input.addEventListener("input", function() {
      filterCards(input.closest("main") || document);
    });
  });

  sortSelects.forEach(function(select) {
    select.addEventListener("change", function() {
      filterCards(select.closest("main") || document);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");

  if (query) {
    var heroSearch = document.querySelector(".search-hero-form input[name='q']");
    var pageFilter = document.querySelector(".search-page-filter");

    if (heroSearch) {
      heroSearch.value = query;
    }

    if (pageFilter) {
      pageFilter.value = query;
      filterCards(pageFilter.closest("main") || document);
    }
  }
}());
