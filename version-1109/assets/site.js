(function () {
  var menuButton = document.querySelector(".mobile-menu-btn");
  var mobileMenu = document.querySelector(".mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var active = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === active);
      dot.classList.toggle("w-8", dotIndex === active);
      dot.classList.toggle("bg-orange-500", dotIndex === active);
      dot.classList.toggle("w-4", dotIndex !== active);
      dot.classList.toggle("bg-white/50", dotIndex !== active);
    });
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        setHero(active + 1);
      }, 5600);
    }
  }

  if (slides.length) {
    setHero(0);
    restartHero();

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setHero(Number(dot.getAttribute("data-hero-dot")) || 0);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        setHero(active - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setHero(active + 1);
        restartHero();
      });
    }
  }

  var searchInput = document.getElementById("movieSearch");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-pill"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var currentFilter = "all";

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function cardText(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.getAttribute("data-type"),
      card.textContent
    ].join(" ").toLowerCase();
  }

  function applySearch() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : "");

    cards.forEach(function (card) {
      var text = cardText(card);
      var filterOk = currentFilter === "all" || text.indexOf(currentFilter.toLowerCase()) !== -1;
      var queryOk = !query || text.indexOf(query) !== -1;
      card.classList.toggle("is-hidden", !(filterOk && queryOk));
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.getAttribute("data-filter") || "all";

      filterButtons.forEach(function (item) {
        item.classList.remove("is-active", "bg-orange-500", "text-white");
        item.classList.add("bg-slate-700/50", "text-slate-300");
      });

      button.classList.add("is-active", "bg-orange-500", "text-white");
      button.classList.remove("bg-slate-700/50", "text-slate-300");
      applySearch();
    });
  });

  window.initMoviePlayer = function (playerId, streamUrl) {
    var root = document.getElementById(playerId);

    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var overlay = root.querySelector(".play-overlay");
    var playButtons = Array.prototype.slice.call(root.querySelectorAll("[data-play]"));
    var attached = false;
    var hls = null;

    if (!video) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }

      attachStream();
      hideOverlay();

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          showOverlay();
        });
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener("click", start);
    });

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("play", hideOverlay);

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
