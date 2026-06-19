(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
      const buttons = Array.from(carousel.querySelectorAll("[data-slide-button]"));
      if (!slides.length) {
        return;
      }
      let index = 0;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        buttons.forEach(function (button, buttonIndex) {
          button.classList.toggle("is-active", buttonIndex === index);
        });
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          show(Number(button.getAttribute("data-slide-button")) || 0);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    });
  }

  function findSearchScope(box) {
    const section = box.closest(".content-section");
    if (section && section.querySelector(".movie-card")) {
      return section;
    }
    const nextSection = document.querySelector(".searchable-grid") ? document.querySelector(".searchable-grid").closest(".content-section") : null;
    return nextSection || box.parentElement || document;
  }

  function initSearch() {
    document.querySelectorAll("[data-search-box]").forEach(function (box) {
      const input = box.querySelector("[data-search-input]");
      const clear = box.querySelector("[data-search-clear]");
      const scope = findSearchScope(box);
      const cards = Array.from(scope.querySelectorAll(".movie-card"));
      const empty = scope.querySelector(".empty-state");
      if (!input || !cards.length) {
        return;
      }
      function run() {
        const query = input.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach(function (card) {
          const key = (card.getAttribute("data-search-key") || "").toLowerCase();
          const matched = !query || key.indexOf(query) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      input.addEventListener("input", run);
      if (clear) {
        clear.addEventListener("click", function () {
          input.value = "";
          input.focus();
          run();
        });
      }
      run();
    });
  }

  onReady(function () {
    initMenu();
    initCarousel();
    initSearch();
  });
})();
