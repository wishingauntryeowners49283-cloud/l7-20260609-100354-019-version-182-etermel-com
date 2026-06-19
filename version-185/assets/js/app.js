(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var navToggle = qs('[data-nav-toggle]');
    var mainNav = qs('[data-main-nav]');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
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
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function uniqueValues(cards, attr) {
        var values = cards.map(function (card) {
            return card.getAttribute(attr) || '';
        }).filter(Boolean);
        return Array.from(new Set(values)).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var root = qs('[data-filter-root]');
        var list = qs('[data-card-list]');
        if (!root || !list) {
            return;
        }

        var input = qs('[data-filter-input]', root);
        var region = qs('[data-filter-region]', root);
        var year = qs('[data-filter-year]', root);
        var reset = qs('[data-filter-reset]', root);
        var result = qs('[data-filter-result]', root);
        var cards = qsa('[data-card]', list);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        fillSelect(region, uniqueValues(cards, 'data-region'));
        fillSelect(year, uniqueValues(cards, 'data-year'));

        if (input && query) {
            input.value = query;
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function apply() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var selectedRegion = region ? region.value : '';
            var selectedYear = year ? year.value : '';
            var shown = 0;

            cards.forEach(function (card) {
                var ok = true;
                if (q && cardText(card).indexOf(q) === -1) {
                    ok = false;
                }
                if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
                    ok = false;
                }
                if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    shown += 1;
                }
            });

            if (result) {
                result.textContent = '当前显示 ' + shown + ' / ' + cards.length + ' 部影片';
            }
        }

        [input, region, year].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (region) {
                    region.value = '';
                }
                if (year) {
                    year.value = '';
                }
                apply();
            });
        }

        apply();
    }

    function initImageFallback() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.style.opacity = '0';
                var parent = img.parentElement;
                if (parent) {
                    parent.setAttribute('data-image-missing', 'true');
                }
            }, { once: true });
        });
    }

    initHero();
    initFilters();
    initImageFallback();
}());
