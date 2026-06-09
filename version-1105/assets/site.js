(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function applyFilters(root, options) {
        var cards = Array.prototype.slice.call(root.querySelectorAll(".js-movie-card"));
        var empty = root.querySelector("[data-empty-state]");
        var keyword = normalize(options.keyword);
        var type = normalize(options.type);
        var year = normalize(options.year);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var cardType = normalize(card.getAttribute("data-type"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var matched = true;
            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
        return visible;
    }

    function initFilterBoards() {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-board]")).forEach(function (board) {
            var root = board.closest("main") || document;
            var input = board.querySelector("[data-filter-input]");
            var type = board.querySelector("[data-filter-type]");
            var year = board.querySelector("[data-filter-year]");

            function update() {
                applyFilters(root, {
                    keyword: input ? input.value : "",
                    type: type ? type.value : "",
                    year: year ? year.value : ""
                });
            }

            [input, type, year].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", update);
                    element.addEventListener("change", update);
                }
            });
            update();
        });
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page) {
            return;
        }
        var input = page.querySelector("[data-search-input]");
        var button = page.querySelector("[data-search-button]");
        var title = page.querySelector("[data-search-title]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        function update(pushState) {
            var value = input ? input.value : "";
            var count = applyFilters(page, { keyword: value });
            if (title) {
                title.textContent = value ? "搜索结果：" + value + " · " + count + " 部影片" : "精选片库";
            }
            if (pushState) {
                var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
                window.history.replaceState(null, "", url);
            }
        }

        if (input) {
            input.value = query;
            input.addEventListener("input", function () {
                update(true);
            });
            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    update(true);
                }
            });
        }
        if (button) {
            button.addEventListener("click", function () {
                update(true);
            });
        }
        update(false);
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(function (root) {
            var video = root.querySelector("video");
            var overlay = root.querySelector(".player-overlay");
            var message = root.querySelector(".player-message");
            var stream = root.getAttribute("data-stream");
            var hls = null;
            var loaded = false;

            function setMessage(value) {
                if (message) {
                    message.textContent = value || "";
                }
            }

            function bindStream() {
                if (loaded || !video || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    if (window.Hls.Events && window.Hls.Events.ERROR) {
                        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                            if (data && data.fatal) {
                                setMessage("视频加载失败，请稍后再试");
                            }
                        });
                    }
                } else {
                    video.src = stream;
                }
                loaded = true;
            }

            function play() {
                bindStream();
                if (!video) {
                    return;
                }
                video.controls = true;
                root.classList.add("is-playing");
                video.play().catch(function () {
                    root.classList.remove("is-playing");
                });
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!loaded || video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener("play", function () {
                    root.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (video.currentTime === 0) {
                        root.classList.remove("is-playing");
                    }
                });
                video.addEventListener("error", function () {
                    setMessage("视频加载失败，请稍后再试");
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilterBoards();
        initSearchPage();
        initPlayers();
    });
}());
