(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
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

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var noResults = document.querySelector('[data-no-results]');

    function queryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchRegion = !region || card.getAttribute('data-region') === region;
            var matchType = !type || card.getAttribute('data-type') === type;
            var matchYear = !year || card.getAttribute('data-year') === year;
            var matched = matchQuery && matchRegion && matchType && matchYear;

            card.style.display = matched ? '' : 'none';

            if (matched) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterInput) {
        var initialQuery = queryFromUrl();

        if (initialQuery) {
            filterInput.value = initialQuery;
        }

        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    [regionSelect, typeSelect, yearSelect].forEach(function (select) {
        if (select) {
            select.addEventListener('change', applyFilter);
        }
    });
})();

function initMoviePlayer(videoId, streamUrl, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var attached = false;
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function attachStream() {
        if (attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        attached = true;
    }

    function playVideo() {
        attachStream();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
