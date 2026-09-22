(function() {
  const modal = document.getElementById('age-gate-modal');
  if (!modal) return;

  // 檢查當前瀏覽器分頁是否已驗證過
  //const isVerified = sessionStorage.getItem('is_adult_verified') === 'true';
  var isVerified;

  function lockScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  if (isVerified) {
    modal.style.display = 'none';
    unlockScroll();
    return;
  }

  // 進入頁面後，強制鎖住捲動
  lockScroll();
  modal.style.display = 'flex';

  // 綁定按鈕事件
  const enterBtn = document.getElementById('age-gate-enter-btn');
  const leaveBtn = document.getElementById('age-gate-leave-btn');

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      //sessionStorage.setItem('is_adult_verified', 'true');
      isVerified = true;
	  modal.style.display = 'none';
      unlockScroll();
    });
  }

  if (leaveBtn) {
    leaveBtn.addEventListener('click', () => {
      // 未成年離開後，直接返回首頁
      window.location.href = '/';
    });
  }
})();
