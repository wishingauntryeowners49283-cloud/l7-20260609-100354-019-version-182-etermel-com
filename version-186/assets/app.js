(() => {
    const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function initMobileMenu() {
        const button = document.querySelector("[data-mobile-toggle]");
        const panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", () => {
            document.body.classList.toggle("menu-open");
        });
        selectAll("a", panel).forEach((link) => {
            link.addEventListener("click", () => {
                document.body.classList.remove("menu-open");
            });
        });
    }

    function initHero() {
        selectAll("[data-hero]").forEach((hero) => {
            const slides = selectAll(".hero-slide", hero);
            const dots = selectAll("[data-hero-dot]", hero);
            const prev = hero.querySelector("[data-hero-prev]");
            const next = hero.querySelector("[data-hero-next]");
            if (slides.length === 0) {
                return;
            }
            let current = 0;
            let timer = null;
            const setActive = (index) => {
                current = (index + slides.length) % slides.length;
                slides.forEach((slide, slideIndex) => {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach((dot, dotIndex) => {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            };
            const start = () => {
                stop();
                timer = window.setInterval(() => setActive(current + 1), 5000);
            };
            const stop = () => {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            };
            dots.forEach((dot, dotIndex) => {
                dot.addEventListener("click", () => {
                    setActive(dotIndex);
                    start();
                });
            });
            if (prev) {
                prev.addEventListener("click", () => {
                    setActive(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", () => {
                    setActive(current + 1);
                    start();
                });
            }
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            setActive(0);
            start();
        });
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        selectAll("[data-filter-panel]").forEach((panel) => {
            const scope = panel.closest("main") || document;
            const list = scope.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            const cards = selectAll(".movie-card", list);
            const emptyState = scope.querySelector("[data-empty-state]");
            const keyword = panel.querySelector("[data-filter-keyword]");
            const year = panel.querySelector("[data-filter-year]");
            const region = panel.querySelector("[data-filter-region]");
            const type = panel.querySelector("[data-filter-type]");
            const category = panel.querySelector("[data-filter-category]");
            const apply = () => {
                const q = normalize(keyword && keyword.value);
                const y = normalize(year && year.value);
                const r = normalize(region && region.value);
                const t = normalize(type && type.value);
                const c = normalize(category && category.value);
                let visible = 0;
                cards.forEach((card) => {
                    const search = normalize(card.dataset.search);
                    const matches = (!q || search.includes(q)) &&
                        (!y || normalize(card.dataset.year) === y) &&
                        (!r || normalize(card.dataset.region) === r) &&
                        (!t || normalize(card.dataset.type) === t) &&
                        (!c || normalize(card.dataset.category) === c);
                    card.hidden = !matches;
                    if (matches) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.classList.toggle("is-visible", visible === 0);
                }
            };
            [keyword, year, region, type, category].forEach((control) => {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        selectAll(".player-card").forEach((card) => {
            const video = card.querySelector("video");
            const overlay = card.querySelector(".player-overlay");
            const source = card.dataset.videoSource;
            let loaded = false;
            let hls = null;
            if (!video || !overlay || !source) {
                return;
            }
            const load = () => {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return new Promise((resolve) => {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                        window.setTimeout(resolve, 1600);
                    });
                }
                video.src = source;
                return Promise.resolve();
            };
            const play = () => {
                load().then(() => {
                    card.classList.add("is-playing");
                    const promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(() => {
                            card.classList.remove("is-playing");
                        });
                    }
                });
            };
            overlay.addEventListener("click", play);
            video.addEventListener("click", () => {
                if (!loaded) {
                    play();
                }
            });
            video.addEventListener("play", () => card.classList.add("is-playing"));
            video.addEventListener("pause", () => {
                if (!video.ended) {
                    card.classList.remove("is-playing");
                }
            });
            video.addEventListener("ended", () => card.classList.remove("is-playing"));
            window.addEventListener("pagehide", () => {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
