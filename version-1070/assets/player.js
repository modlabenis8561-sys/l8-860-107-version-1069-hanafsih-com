(function () {
    function initPlayer(shell) {
        var video = shell.querySelector('video[data-hls-source]');
        var button = shell.querySelector('[data-play-button]');
        var errorBox = shell.querySelector('[data-player-error]');
        var source = video ? video.getAttribute('data-hls-source') : '';
        var hls = null;

        function showError(message) {
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.classList.add('is-visible');
            }
        }

        function clearError() {
            if (errorBox) {
                errorBox.textContent = '';
                errorBox.classList.remove('is-visible');
            }
        }

        if (!video || !source) {
            showError('播放源未绑定');
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.attachMedia(video);
            hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                hls.loadSource(source);
            });
            hls.on(window.Hls.Events.MANIFEST_PARSED, clearError);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    showError('网络连接异常，正在尝试重新加载播放源');
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    showError('媒体解码异常，正在尝试恢复播放');
                    hls.recoverMediaError();
                } else {
                    showError('播放器初始化失败，请刷新页面后重试');
                    hls.destroy();
                }
            });
        } else {
            showError('当前浏览器暂不支持 HLS 播放');
        }

        function requestPlay() {
            clearError();
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    showError('浏览器阻止了自动播放，请再次点击播放按钮');
                });
            }
        }

        if (button) {
            button.addEventListener('click', requestPlay);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                requestPlay();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]')).forEach(initPlayer);
    });
}());
