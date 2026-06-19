
import { H as Hls } from './video-vendor-dru42stk.js';

function initMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', nav.classList.contains('is-open'));
  });
}

function initImages() {
  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-error');
      image.setAttribute('aria-hidden', 'true');
    }, { once: true });
  });
}

function initLocalFilter() {
  const input = document.querySelector('[data-filter-input]');
  const list = document.querySelector('[data-filter-list]');
  const count = document.querySelector('[data-filter-count]');
  if (!input || !list) {
    return;
  }

  const cards = Array.from(list.children);

  function applyFilter() {
    const keyword = input.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const match = !keyword || card.textContent.toLowerCase().includes(keyword);
      card.classList.toggle('hidden-by-filter', !match);
      if (match) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = visible + ' 部';
    }
  }

  input.addEventListener('input', applyFilter);
}

function initPlayer() {
  const shell = document.querySelector('[data-video-shell]');
  const video = document.querySelector('.video-player');
  const playButton = document.querySelector('[data-video-play]');
  const message = document.querySelector('[data-video-message]');

  if (!shell || !video || !playButton) {
    return;
  }

  let hlsInstance = null;
  let initialized = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function initializeSource() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    const source = video.dataset.src;

    if (!source) {
      setMessage('当前影片暂无播放源。');
      return Promise.reject(new Error('Missing video source'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        setMessage('播放源加载完成。');
      });

      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setMessage('网络加载异常，正在重试。');
          hlsInstance.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setMessage('媒体解码异常，正在恢复。');
          hlsInstance.recoverMediaError();
          return;
        }

        setMessage('播放源暂时无法加载，请稍后重试。');
      });

      return Promise.resolve();
    }

    setMessage('当前浏览器不支持 HLS 播放。');
    return Promise.reject(new Error('HLS is not supported'));
  }

  function playVideo() {
    initializeSource()
      .then(() => video.play())
      .then(() => {
        shell.classList.add('is-playing');
      })
      .catch(() => {
        shell.classList.remove('is-playing');
      });
  }

  playButton.addEventListener('click', playVideo);
  video.addEventListener('play', () => shell.classList.add('is-playing'));
  video.addEventListener('pause', () => shell.classList.remove('is-playing'));

  window.addEventListener('beforeunload', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

function initSearchPage() {
  const data = window.MOVIE_SEARCH_DATA;
  const input = document.querySelector('[data-search-input]');
  const genre = document.querySelector('[data-filter-genre]');
  const region = document.querySelector('[data-filter-region]');
  const year = document.querySelector('[data-filter-year]');
  const button = document.querySelector('[data-search-button]');
  const resetButton = document.querySelector('[data-reset-button]');
  const results = document.querySelector('[data-search-results]');
  const summary = document.querySelector('[data-search-summary]');

  if (!Array.isArray(data) || !input || !results) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialKeyword = params.get('q') || '';
  input.value = initialKeyword;

  function movieMatches(movie, keyword, selectedGenre, selectedRegion, selectedYear) {
    const haystack = [
      movie.title,
      movie.category,
      movie.genre,
      movie.region,
      movie.type,
      movie.year,
      movie.one_line,
      Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
    ].join(' ').toLowerCase();

    const keywordMatch = !keyword || haystack.includes(keyword);
    const genreMatch = !selectedGenre || movie.genre.includes(selectedGenre) || movie.category === selectedGenre;
    const regionMatch = !selectedRegion || movie.region === selectedRegion;
    const yearMatch = !selectedYear || movie.year === selectedYear;

    return keywordMatch && genreMatch && regionMatch && yearMatch;
  }

  function renderCard(movie) {
    return `
      <article class="movie-card">
        <a class="poster-frame" href="${movie.url}">
          <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span class="poster-overlay"><span class="play-circle">▶</span></span>
          <span class="category-badge">${escapeHtml(movie.category)}</span>
          <span class="duration-badge">${escapeHtml(movie.duration)}</span>
        </a>
        <div class="movie-card-body">
          <a href="${movie.url}" class="movie-card-title">${escapeHtml(movie.title)}</a>
          <p class="movie-card-desc">${escapeHtml(movie.one_line || '')}</p>
          <div class="movie-meta-row">
            <span>${escapeHtml(movie.type)}</span>
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.year)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function applySearch() {
    const keyword = input.value.trim().toLowerCase();
    const selectedGenre = genre ? genre.value : '';
    const selectedRegion = region ? region.value : '';
    const selectedYear = year ? year.value : '';
    const matched = data
      .filter((movie) => movieMatches(movie, keyword, selectedGenre, selectedRegion, selectedYear))
      .slice(0, 120);

    results.innerHTML = matched.map(renderCard).join('');
    initImages();

    if (summary) {
      if (matched.length === 0) {
        summary.textContent = '没有找到相关内容，请尝试其他关键词或筛选条件。';
      } else {
        summary.textContent = `找到 ${matched.length} 条结果，最多显示前 120 条。`;
      }
    }
  }

  if (button) {
    button.addEventListener('click', applySearch);
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      input.value = '';
      if (genre) genre.value = '';
      if (region) region.value = '';
      if (year) year.value = '';
      applySearch();
    });
  }

  [input, genre, region, year].forEach((element) => {
    if (!element) {
      return;
    }
    element.addEventListener('change', applySearch);
    element.addEventListener('input', () => {
      if (element === input) {
        applySearch();
      }
    });
  });

  if (initialKeyword) {
    applySearch();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initImages();
  initLocalFilter();
  initPlayer();
  initSearchPage();
});
