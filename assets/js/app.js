(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', mobileNav.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('[data-back-top]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    const slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        let index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.textContent
        ].join(' '));
    }

    document.querySelectorAll('.movie-section').forEach(function (section) {
        const input = section.querySelector('.movie-search-input');
        const grid = section.querySelector('[data-filter-grid]');
        const buttons = Array.from(section.querySelectorAll('[data-filter]'));
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        let activeFilter = 'all';

        if (!grid) {
            return;
        }

        if (input && initialQuery && !input.value) {
            input.value = initialQuery;
        }

        function applyFilter() {
            const query = normalize(input ? input.value : '');
            const filter = normalize(activeFilter);
            Array.from(grid.querySelectorAll('[data-movie-card]')).forEach(function (card) {
                const text = cardText(card);
                const queryMatch = !query || text.indexOf(query) !== -1;
                const filterMatch = filter === 'all' || text.indexOf(filter) !== -1;
                card.classList.toggle('is-hidden', !(queryMatch && filterMatch));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    });
}());
