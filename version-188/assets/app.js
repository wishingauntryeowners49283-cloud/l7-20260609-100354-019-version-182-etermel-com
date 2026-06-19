(function () {
    function selectAll(root, selector) {
        return Array.prototype.slice.call(root.querySelectorAll(selector));
    }

    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    selectAll(document, '[data-hero-slider]').forEach(function (slider) {
        const slides = selectAll(slider, '.hero-slide');
        const dots = selectAll(slider, '[data-hero-dot]');
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function applyListState(area, query, category) {
        if (!area) {
            return;
        }
        const cards = selectAll(area, '[data-movie-card]');
        const empty = document.querySelector('[data-empty-state]');
        const normalizedQuery = (query || '').trim().toLowerCase();
        const normalizedCategory = category || 'all';
        let visible = 0;

        cards.forEach(function (card) {
            const text = (card.getAttribute('data-search-text') || '').toLowerCase();
            const cardCategory = card.getAttribute('data-category') || '';
            const matchedText = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
            const matchedCategory = normalizedCategory === 'all' || cardCategory === normalizedCategory;
            const matched = matchedText && matchedCategory;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    selectAll(document, '[data-movie-search]').forEach(function (input) {
        const area = document.getElementById(input.getAttribute('data-movie-search'));
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');
        let activeCategory = 'all';

        if (initialQuery && !input.value) {
            input.value = initialQuery;
        }

        applyListState(area, input.value, activeCategory);

        input.addEventListener('input', function () {
            applyListState(area, input.value, activeCategory);
        });

        selectAll(document, '[data-filter-group] [data-filter-value]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.getAttribute('data-filter-value') || 'all';
                selectAll(document, '[data-filter-group] [data-filter-value]').forEach(function (other) {
                    other.classList.toggle('is-active', other === button);
                });
                applyListState(area, input.value, activeCategory);
            });
        });
    });
})();
