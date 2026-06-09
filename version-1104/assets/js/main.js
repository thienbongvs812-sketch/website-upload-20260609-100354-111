(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
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

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  var input = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-empty-result]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(input && input.value);
    var year = normalize(yearFilter && yearFilter.value);
    var type = normalize(typeFilter && typeFilter.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
      var matchType = !type || normalize(card.getAttribute('data-type')) === type;
      var matched = matchKeyword && matchYear && matchType;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  if (input || yearFilter || typeFilter) {
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var preset = params.get('q');

      if (preset) {
        input.value = preset;
      }

      input.addEventListener('input', applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }

    applyFilter();
  }
})();
