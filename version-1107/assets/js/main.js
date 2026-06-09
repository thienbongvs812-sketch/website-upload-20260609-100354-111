
(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                stop();
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid'));
        grids.forEach(function (grid) {
            var scope = grid.parentElement;
            if (!scope) {
                return;
            }
            var input = scope.querySelector('[data-filter-input]');
            var region = scope.querySelector('[data-filter-region]');
            var type = scope.querySelector('[data-filter-type]');
            var empty = scope.querySelector('[data-empty-state]');
            var items = Array.prototype.slice.call(grid.querySelectorAll('.filter-item'));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                var query = valueOf(input);
                var regionValue = valueOf(region);
                var typeValue = valueOf(type);
                var shown = 0;
                items.forEach(function (item) {
                    var haystack = [
                        item.getAttribute('data-title'),
                        item.getAttribute('data-region'),
                        item.getAttribute('data-year'),
                        item.getAttribute('data-type'),
                        item.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !regionValue || (item.getAttribute('data-region') || '').toLowerCase().indexOf(regionValue) !== -1;
                    var matchesType = !typeValue || (item.getAttribute('data-type') || '').toLowerCase().indexOf(typeValue) !== -1;
                    var visible = matchesQuery && matchesRegion && matchesType;
                    item.style.display = visible ? '' : 'none';
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', shown === 0);
                }
            }

            [input, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var cover = player.querySelector('.player-cover');
            if (!video || !cover) {
                return;
            }

            function attach() {
                if (video.getAttribute('data-ready') === '1') {
                    return;
                }
                var stream = video.getAttribute('data-stream');
                if (!stream) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    player._hls = hls;
                } else {
                    video.src = stream;
                }
                video.setAttribute('data-ready', '1');
            }

            function start() {
                attach();
                player.classList.add('has-started');
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }

            cover.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('has-started');
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
    });
})();
