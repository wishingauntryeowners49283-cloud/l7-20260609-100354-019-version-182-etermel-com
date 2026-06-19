
document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;
    function showSlide(index) {
        if (!slides.length) return;
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
            slide.classList.toggle("active", idx === active);
        });
        dots.forEach(function (dot, idx) {
            dot.classList.toggle("active", idx === active);
        });
    }
    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    var homeSearch = document.querySelector("[data-home-search]");
    if (homeSearch) {
        homeSearch.addEventListener("click", function () {
            var input = document.querySelector("#homeSearch");
            var query = input ? input.value.trim() : "";
            window.location.href = "./search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
        });
    }

    var keyword = document.querySelector("[data-filter-keyword]");
    var year = document.querySelector("[data-filter-year]");
    var type = document.querySelector("[data-filter-type]");
    var wrap = document.querySelector("[data-filter-wrap]");
    var empty = document.querySelector("[data-empty-state]");

    function applyFilter() {
        if (!wrap) return;
        var cards = Array.prototype.slice.call(wrap.querySelectorAll(".movie-card"));
        var key = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var shown = 0;
        cards.forEach(function (card) {
            var text = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();
            var ok = true;
            if (key && text.indexOf(key) === -1) ok = false;
            if (y && card.getAttribute("data-year") !== y) ok = false;
            if (t && card.getAttribute("data-type") !== t) ok = false;
            card.style.display = ok ? "" : "none";
            if (ok) shown += 1;
        });
        if (empty) {
            empty.classList.toggle("show", shown === 0);
        }
    }

    [keyword, year, type].forEach(function (el) {
        if (el) {
            el.addEventListener("input", applyFilter);
            el.addEventListener("change", applyFilter);
        }
    });

    var params = new URLSearchParams(window.location.search);
    if (keyword && params.get("q")) {
        keyword.value = params.get("q");
        applyFilter();
    }
});
