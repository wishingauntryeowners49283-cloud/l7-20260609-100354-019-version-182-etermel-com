(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let currentIndex = 0;

        function activateSlide(index) {
            currentIndex = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activateSlide(Number(dot.dataset.heroDot));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                activateSlide((currentIndex + 1) % slides.length);
            }, 5600);
        }
    }

    const searchParams = new URLSearchParams(window.location.search);
    const queryFromUrl = searchParams.get('q') || '';
    const searchInput = document.getElementById('siteSearch');
    const yearFilter = document.getElementById('yearFilter');
    const typeFilter = document.getElementById('typeFilter');
    const regionFilter = document.getElementById('regionFilter');
    const resetButton = document.querySelector('[data-reset-filter]');
    const visibleCount = document.querySelector('[data-visible-count]');
    const emptyState = document.querySelector('[data-empty-state]');
    const cards = Array.from(document.querySelectorAll('.movie-card'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        const query = normalize(searchInput ? searchInput.value : '');
        const year = normalize(yearFilter ? yearFilter.value : '');
        const type = normalize(typeFilter ? typeFilter.value : '');
        const region = normalize(regionFilter ? regionFilter.value : '');
        let count = 0;

        cards.forEach(function (card) {
            const text = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.type,
                card.dataset.region,
                card.dataset.terms,
                card.textContent
            ].join(' '));
            const matchQuery = !query || text.includes(query);
            const matchYear = !year || normalize(card.dataset.year) === year;
            const matchType = !type || normalize(card.dataset.type) === type;
            const matchRegion = !region || normalize(card.dataset.region) === region;
            const visible = matchQuery && matchYear && matchType && matchRegion;

            card.hidden = !visible;
            if (visible) {
                count += 1;
            }
        });

        if (visibleCount) {
            visibleCount.textContent = String(count);
        }
        if (emptyState) {
            emptyState.hidden = count !== 0;
        }
    }

    if (searchInput) {
        if (queryFromUrl) {
            searchInput.value = queryFromUrl;
        }
        searchInput.addEventListener('input', applyFilters);
    }
    [yearFilter, typeFilter, regionFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('change', applyFilters);
        }
    });
    if (resetButton) {
        resetButton.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = '';
            }
            if (yearFilter) {
                yearFilter.value = '';
            }
            if (typeFilter) {
                typeFilter.value = '';
            }
            if (regionFilter) {
                regionFilter.value = '';
            }
            applyFilters();
        });
    }
    applyFilters();

    function startVideo(video, trigger) {
        const source = video.dataset.src;
        if (!source) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = source;
            video.play().catch(function () {});
        }

        if (trigger) {
            trigger.classList.add('hide');
        }
    }

    document.querySelectorAll('[data-player-box]').forEach(function (box) {
        const video = box.querySelector('video[data-src]');
        const trigger = box.querySelector('[data-play-trigger]');
        if (!video || !trigger) {
            return;
        }
        trigger.addEventListener('click', function () {
            startVideo(video, trigger);
        });
    });
})();
