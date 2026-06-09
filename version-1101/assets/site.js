(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
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
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var root = panel.parentElement;
            var keyword = panel.querySelector("input[name='keyword']");
            var year = panel.querySelector("select[name='year']");
            var type = panel.querySelector("select[name='type']");
            var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var initialKeyword = params.get("q");
            if (initialKeyword && keyword) {
                keyword.value = initialKeyword;
            }

            function apply() {
                var word = keyword ? keyword.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var yearMatch = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var typeMatch = !selectedType || card.getAttribute("data-type") === selectedType;
                    var wordMatch = !word || text.indexOf(word) !== -1;
                    card.classList.toggle("hidden-card", !(yearMatch && typeMatch && wordMatch));
                });
            }

            [keyword, year, type].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", apply);
                    field.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        var covers = Array.prototype.slice.call(document.querySelectorAll(".player-cover"));
        covers.forEach(function (cover) {
            var wrap = cover.closest(".player-wrap");
            var video = wrap ? wrap.querySelector("video") : null;
            var stream = cover.getAttribute("data-stream");
            var hls = null;

            function attach() {
                if (!video || !stream || video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.setAttribute("data-ready", "1");
            }

            function play() {
                attach();
                cover.classList.add("is-hidden");
                if (video) {
                    video.controls = true;
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {
                            cover.classList.remove("is-hidden");
                        });
                    }
                }
            }

            cover.addEventListener("click", play);
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    cover.classList.add("is-hidden");
                });
            }
            window.addEventListener("pagehide", function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
