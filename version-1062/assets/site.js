(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("open");
    });
  }

  function setupHero() {
    var stage = document.querySelector(".hero-stage");
    if (!stage) {
      return;
    }
    var slides = Array.prototype.slice.call(stage.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(stage.querySelectorAll(".hero-dot"));
    var prev = stage.querySelector(".hero-prev");
    var next = stage.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector("input[type='search']");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector(".empty-state");
      var activeFilter = "all";

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function cardText(card) {
        return normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var filterValue = normalize(activeFilter);
        var visibleCount = 0;
        cards.forEach(function (card) {
          var text = cardText(card);
          var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
          var filterMatch = filterValue === "all" || text.indexOf(filterValue) !== -1;
          var visible = keywordMatch && filterMatch;
          card.style.display = visible ? "" : "none";
          if (visible) {
            visibleCount += 1;
          }
        });
        if (empty) {
          empty.style.display = visibleCount ? "none" : "block";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });
      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
