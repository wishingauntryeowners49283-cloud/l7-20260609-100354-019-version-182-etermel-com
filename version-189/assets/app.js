(function () {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const heroDots = Array.from(document.querySelectorAll('.hero-dot'));
  const prev = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');
  let currentHero = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }
    currentHero = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === currentHero);
    });
    heroDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentHero);
    });
  }

  function startHero() {
    if (heroSlides.length < 2) {
      return;
    }
    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      showHero(currentHero + 1);
    }, 5200);
  }

  heroDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.dataset.target || 0));
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(currentHero - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(currentHero + 1);
      startHero();
    });
  }

  startHero();

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(scope) {
    const search = scope.querySelector('.page-search');
    const year = scope.querySelector('.filter-year');
    const region = scope.querySelector('.filter-region');
    const cards = Array.from(scope.querySelectorAll('.filterable-card'));

    function apply() {
      const q = normalize(search ? search.value : '');
      const y = year ? year.value : '';
      const r = region ? region.value : '';

      cards.forEach(function (card) {
        const searchText = normalize(card.dataset.search || card.textContent);
        const matchedText = !q || searchText.indexOf(q) !== -1;
        const matchedYear = !y || card.dataset.year === y;
        const matchedRegion = !r || card.dataset.region === r;
        card.style.display = matchedText && matchedYear && matchedRegion ? '' : 'none';
      });
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (region) {
      region.addEventListener('change', apply);
    }
  }

  document.querySelectorAll('main').forEach(filterCards);

  const searchItems = Array.isArray(window.SEARCH_ITEMS) ? window.SEARCH_ITEMS : [];

  document.querySelectorAll('.header-search').forEach(function (form) {
    const input = form.querySelector('.global-search');
    const results = form.querySelector('.search-results');

    if (!input || !results) {
      return;
    }

    function closeResults() {
      results.classList.remove('show');
      results.innerHTML = '';
    }

    input.addEventListener('input', function () {
      const q = normalize(input.value);
      if (!q) {
        closeResults();
        return;
      }

      const matches = searchItems.filter(function (item) {
        return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.genre + ' ' + item.type).indexOf(q) !== -1;
      }).slice(0, 8);

      if (!matches.length) {
        closeResults();
        return;
      }

      results.innerHTML = matches.map(function (item) {
        return '<a href="./' + item.href + '"><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></a>';
      }).join('');
      results.classList.add('show');
    });

    form.addEventListener('submit', function (event) {
      const first = results.querySelector('a');
      if (first) {
        event.preventDefault();
        window.location.href = first.getAttribute('href');
      }
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        closeResults();
      }
    });
  });
})();

function initStaticPlayer(sourceUrl) {
  const video = document.getElementById('movie-player');
  const overlay = document.getElementById('player-overlay');
  let started = false;
  let hlsInstance = null;

  if (!video || !overlay || !sourceUrl) {
    return;
  }

  function playVideo() {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
        started = false;
      });
    }
  }

  function loadAndPlay() {
    overlay.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = sourceUrl;
      }
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
      } else {
        playVideo();
      }
      return;
    }

    if (!video.src) {
      video.src = sourceUrl;
    }
    playVideo();
  }

  function start() {
    if (!started) {
      started = true;
      loadAndPlay();
      return;
    }
    playVideo();
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!started) {
      start();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });
}
