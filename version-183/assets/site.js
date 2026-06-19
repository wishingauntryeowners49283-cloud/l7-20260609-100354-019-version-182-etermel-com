(function () {
    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function collectCardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.category,
            card.textContent
        ].join(' '));
    }

    function updateResultCount(scope, visibleCount, totalCount) {
        var countBox = scope.querySelector('[data-result-count]');
        if (countBox) {
            countBox.textContent = '当前显示 ' + visibleCount + ' / ' + totalCount + ' 部影片';
        }
    }

    function applyFilters(scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope="#' + scope.id + '"][data-filter-input]'));
        var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope="#' + scope.id + '"][data-filter-select]'));
        var keyword = inputs.map(function (input) {
            return normalize(input.value);
        }).join(' ');
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = collectCardText(card);
            var matched = true;

            if (keyword && !text.includes(keyword)) {
                matched = false;
            }

            selects.forEach(function (select) {
                var key = select.dataset.filterKey;
                var wanted = normalize(select.value);
                if (wanted && normalize(card.dataset[key]) !== wanted) {
                    matched = false;
                }
            });

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });

        updateResultCount(scope, visibleCount, cards.length);
    }

    function initFilters() {
        var controls = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        var scopeIds = [];

        controls.forEach(function (control) {
            var selector = control.dataset.filterScope;
            var scope = document.querySelector(selector);
            if (!scope || !scope.id) {
                return;
            }
            if (!scopeIds.includes(scope.id)) {
                scopeIds.push(scope.id);
            }
            control.addEventListener('input', function () {
                applyFilters(scope);
            });
            control.addEventListener('change', function () {
                applyFilters(scope);
            });
        });

        scopeIds.forEach(function (id) {
            var scope = document.getElementById(id);
            if (scope) {
                applyFilters(scope);
            }
        });
    }

    function initNavigation() {
        var button = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initCarousel() {
        var carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
        var nextButton = carousel.querySelector('[data-slide-next]');
        var prevButton = carousel.querySelector('[data-slide-prev]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle('active', currentIndex === activeIndex);
            });
            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle('active', currentIndex === activeIndex);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startAutoPlay();
            });
        });

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startAutoPlay();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startAutoPlay();
            });
        }

        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
        showSlide(0);
        startAutoPlay();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var status = player.querySelector('[data-player-status]');
            var source = player.dataset.video;
            var loaded = false;
            var hlsInstance = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function startPlayback() {
                if (!video || !source) {
                    setStatus('播放源暂不可用。');
                    return;
                }

                player.classList.add('is-playing');

                if (loaded) {
                    video.play().catch(function () {
                        setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
                    });
                    return;
                }

                loaded = true;
                setStatus('正在加载视频源...');

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源加载完成。');
                        video.play().catch(function () {
                            setStatus('请点击播放器继续播放。');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function () {
                        setStatus('视频加载遇到网络问题，可刷新后重试。');
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setStatus('播放源加载完成。');
                        video.play().catch(function () {
                            setStatus('请点击播放器继续播放。');
                        });
                    }, { once: true });
                } else {
                    video.src = source;
                    video.play().catch(function () {
                        setStatus('当前浏览器需要 HLS 支持组件，请更换浏览器或刷新页面。');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', startPlayback);
            }

            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    if (!video.ended) {
                        player.classList.remove('is-playing');
                    }
                });
                video.addEventListener('ended', function () {
                    player.classList.remove('is-playing');
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initCarousel();
        initFilters();
        initPlayers();
    });
})();
