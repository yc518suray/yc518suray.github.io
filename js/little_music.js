(function() {
  if (window.HasInitSpotifyPlayerLogic) return;
  window.HasInitSpotifyPlayerLogic = true;

  // 1. 動態獲取當前網域 (解決 postMessage 報錯的關鍵)
  const currentOrigin = window.location.origin;

  // 2. 載入 YouTube API
  if (!window.YT) {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  // 定義初始化所有播放器的主要函式
  function initAllPlayers() {
    const playerNodes = document.querySelectorAll('.little-music-player');
    
    playerNodes.forEach(node => {
      if (node.classList.contains('is-ready')) return;
      node.classList.add('is-ready');

      const vid = node.getAttribute('data-vid');
      const startTime = parseInt(node.getAttribute('data-start'), 10);
      const endTime = parseInt(node.getAttribute('data-end'), 10);
      const targetContainerId = node.getAttribute('data-player-id');
      
      const ytPlayer = new YT.Player(targetContainerId, {
        videoId: vid,
        playerVars: {
          'start': startTime,
          'end': endTime,
          'controls': 0,
          'disablekb': 1,
          'rel': 0,
          'origin': currentOrigin, // <-- 強制指定來源網域，解除安全性阻擋
          'enablejsapi': 1         // <-- 明確啟用 JavaScript API 控制
   		},
        events: {
          'onReady': (e) => initCustomPlayerUI(node, ytPlayer, startTime, endTime),
          'onStateChange': (e) => onCustomPlayerStateChange(e, node, ytPlayer, startTime, endTime)
        }
      });
    });
  }

  // 處理 YouTube API 載入完成的觸發點
  // 如果 YT 物件和它的 Player 構造函式已經存在，直接執行
  if (window.YT && window.YT.Player) {
    initAllPlayers();
  } else {
    // 否則，將其掛載到全域，等 YouTube 腳本下載完自動 callback
    window.onYouTubeIframeAPIReady = initAllPlayers;
  }

  function initCustomPlayerUI(node, ytPlayer, startTime, endTime) {
    const playBtn = node.querySelector('.play-btn');
    const totalTimeLabel = node.querySelector('.total-time');
    const progressBg = node.querySelector('.progress-bar-bg');
    
    totalTimeLabel.innerText = formatTime(endTime - startTime);

    playBtn.addEventListener('click', function() {
      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        const curr = ytPlayer.getCurrentTime();
        if (curr >= endTime || curr < startTime) {
          ytPlayer.seekTo(startTime, true);
        }
        ytPlayer.playVideo();
      }
    });
    
    progressBg.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const targetTime = startTime + (percentage * (endTime - startTime));
      ytPlayer.seekTo(targetTime, true);
    });
  }

  function onCustomPlayerStateChange(event, node, ytPlayer, startTime, endTime) {
    const playBtn = node.querySelector('.play-btn');
    
    if (event.data === YT.PlayerState.PLAYING) {
      playBtn.innerText = '⏸';
      clearInterval(node.progressInterval);
      node.progressInterval = setInterval(() => {
        const curr = ytPlayer.getCurrentTime();
        if (curr >= endTime) {
          resetPlayer(node, ytPlayer, startTime);
        } else {
          updateProgressUI(node, curr, startTime, endTime);
        }
      }, 250);
    } else {
      playBtn.innerText = '▶';
      clearInterval(node.progressInterval);
      if (ytPlayer.getCurrentTime() >= endTime || event.data === YT.PlayerState.ENDED) {
        resetPlayer(node, ytPlayer, startTime);
      }
    }
  }

  function resetPlayer(node, ytPlayer, startTime) {
    ytPlayer.pauseVideo();
    ytPlayer.seekTo(startTime, true);
    updateProgressUI(node, startTime, startTime, 1);
  }

  function updateProgressUI(node, currentTime, startTime, endTime) {
    const currentTimeLabel = node.querySelector('.current-time');
    const progressFill = node.querySelector('.progress-bar-fill');
    
    const elapsed = Math.max(0, currentTime - startTime);
    const duration = endTime - startTime;
    const pct = (elapsed / duration) * 100;
    
    progressFill.style.width = pct + '%';
    currentTimeLabel.innerText = formatTime(elapsed);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
})();
