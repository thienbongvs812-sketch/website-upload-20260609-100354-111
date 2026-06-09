(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = index % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupGlobalSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "search.html";
                if (value) {
                    window.location.href = target + "?q=" + encodeURIComponent(value);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function setupCardFilter() {
        var list = document.querySelector("[data-card-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        var input = document.querySelector("[data-card-search]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var empty = document.querySelector("[data-no-results]");
        var activeFilter = "all";

        function apply() {
            var query = normalize(input ? input.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize((card.getAttribute("data-search") || "") + " " + card.textContent);
                var tags = normalize(card.getAttribute("data-tags"));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesFilter = activeFilter === "all" || tags.indexOf(normalize(activeFilter)) !== -1;
                var shouldShow = matchesQuery && matchesFilter;
                card.classList.toggle("is-hidden", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-hidden", visible !== 0);
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                apply();
            });
        });

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                input.value = query;
            }
            input.addEventListener("input", apply);
        }
        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupGlobalSearch();
        setupCardFilter();
    });
})();

window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var button = document.querySelector(config.buttonSelector);
    var message = document.querySelector(config.messageSelector || "[data-player-message]");
    var source = config.source;
    if (!video || !source) {
        return;
    }

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.classList.add("is-visible");
        }
    }

    function hideCover() {
        if (button) {
            button.classList.add("is-hidden");
        }
    }

    function bindSource() {
        if (video.getAttribute("data-bound") === "true") {
            return;
        }
        video.setAttribute("data-bound", "true");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showMessage("视频加载失败，请稍后再试");
                }
            });
            video.hlsController = hls;
        } else {
            video.src = source;
        }
    }

    function playVideo() {
        bindSource();
        hideCover();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    bindSource();

    if (button) {
        button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", hideCover);
    video.addEventListener("error", function () {
        showMessage("视频加载失败，请稍后再试");
    });
};
