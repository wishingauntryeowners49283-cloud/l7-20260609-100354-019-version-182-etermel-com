(function () {
    var hlsLoaderPromise = null;

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoaderPromise) {
            return hlsLoaderPromise;
        }

        hlsLoaderPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('Hls.js 加载失败'));
                }
            };
            script.onerror = function () {
                reject(new Error('Hls.js 网络加载失败'));
            };
            document.head.appendChild(script);
        });

        return hlsLoaderPromise;
    }

    function setStatus(root, text) {
        var status = root.querySelector('[data-player-status]');
        if (status) {
            status.textContent = text;
        }
    }

    function startPlayer(root) {
        var video = root.querySelector('video');
        var source = root.getAttribute('data-m3u8');

        if (!video || !source) {
            setStatus(root, '未找到可用播放源。');
            return;
        }

        root.classList.add('is-playing');
        setStatus(root, '正在初始化 HLS 播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {
                setStatus(root, '播放已就绪，请再次点击播放器开始。');
            });
            return;
        }

        loadHlsScript().then(function (Hls) {
            if (!Hls.isSupported()) {
                video.src = source;
                setStatus(root, '当前浏览器将尝试使用原生播放能力。');
                return video.play();
            }

            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus(root, '播放源加载完成。');
                video.play().catch(function () {
                    setStatus(root, '播放已就绪，请点击播放器开始。');
                });
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus(root, '网络异常，正在重试播放源。');
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus(root, '媒体解码异常，正在恢复播放。');
                    hls.recoverMediaError();
                } else {
                    setStatus(root, '播放失败，请稍后重试。');
                    hls.destroy();
                }
            });
        }).catch(function () {
            video.src = source;
            setStatus(root, 'HLS 组件加载失败，已切换为浏览器原生播放尝试。');
            video.play().catch(function () {
                setStatus(root, '播放源已绑定，但当前浏览器无法自动播放。');
            });
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (root) {
        var button = root.querySelector('[data-play-button]');
        if (button) {
            button.addEventListener('click', function () {
                startPlayer(root);
            });
        }
    });
}());
