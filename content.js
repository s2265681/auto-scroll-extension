(() => {
  if (window.__autoScrollReader) return;
  window.__autoScrollReader = true;

  let isScrolling = false;
  let speed = 3;
  let scrollTimer = null;
  let masterEnabled = true;

  // 从 storage 读取总开关状态
  chrome.storage.sync.get({ masterEnabled: true }, (data) => {
    masterEnabled = data.masterEnabled;
  });

  // 监听 storage 变化（跨 tab 同步）
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.masterEnabled) {
      masterEnabled = changes.masterEnabled.newValue;
      if (!masterEnabled && isScrolling) {
        fullStop();
      }
    }
  });

  // 速度配置
  function getScrollConfig(level) {
    const interval = Math.max(16, 60 - (level - 1) * 5);
    const pixels = 1 + (level - 1) * 0.5;
    return { interval, pixels };
  }

  // 执行滚动
  function doScroll(px) {
    const before = window.pageYOffset || document.documentElement.scrollTop;
    window.scrollBy({ top: px, behavior: 'instant' });
    const after = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(after - before) < 0.5) {
      const container = findScrollContainer();
      if (container) {
        container.scrollTop += px;
      }
    }
  }

  // 查找滚动容器
  function findScrollContainer() {
    let best = null;
    let bestScrollable = 0;

    const allElements = document.querySelectorAll(
      'main, article, [role="main"], [class*="content"], [class*="article"], ' +
      '[class*="book"], [class*="reader"], [class*="post"], [class*="body"], ' +
      '[class*="scroll"], [class*="wrapper"], [class*="container"], div'
    );

    for (const el of allElements) {
      if (el.clientHeight < 100) continue;
      const scrollable = el.scrollHeight - el.clientHeight;
      if (scrollable <= 1) continue;

      const style = getComputedStyle(el);
      const overflowY = style.overflowY;

      if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
        if (scrollable > bestScrollable) {
          bestScrollable = scrollable;
          best = el;
        }
      }

      if (overflowY === 'hidden' && scrollable > 10 && scrollable > bestScrollable) {
        bestScrollable = scrollable;
        best = el;
        el.style.setProperty('overflow-y', 'auto', 'important');
      }
    }

    return best;
  }

  function startScroll() {
    if (isScrolling) return;
    isScrolling = true;

    const config = getScrollConfig(speed);
    scrollTimer = setInterval(() => {
      doScroll(config.pixels);
    }, config.interval);

    notifyPopup({ action: 'scrollStateChanged', isScrolling: true });
  }

  // 暂停滚动（用户滚轮/点击触发，空格可恢复）
  function pauseScroll() {
    isScrolling = false;
    if (scrollTimer) {
      clearInterval(scrollTimer);
      scrollTimer = null;
    }
    notifyPopup({ action: 'scrollStateChanged', isScrolling: false });
  }

  // 完全停止（popup 停止按钮触发）
  function fullStop() {
    pauseScroll();
  }

  // 重启（速度变化时）
  function restartIfScrolling() {
    if (isScrolling) {
      isScrolling = false;
      if (scrollTimer) {
        clearInterval(scrollTimer);
        scrollTimer = null;
      }
      startScroll();
    }
  }

  function toggleScroll() {
    if (isScrolling) {
      pauseScroll();
    } else {
      startScroll();
    }
  }

  function notifyPopup(msg) {
    try {
      chrome.runtime.sendMessage(msg).catch(() => {});
    } catch (e) {}
  }

  // 页面内 Toast
  let toastEl = null;
  let pageToastTimer = null;

  function showPageToast(text, isWarn) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      Object.assign(toastEl.style, {
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '8px 20px',
        borderRadius: '6px', fontSize: '14px', zIndex: '2147483647',
        pointerEvents: 'none', opacity: '0', transition: 'opacity 0.2s',
        fontFamily: 'system-ui, sans-serif'
      });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.style.border = isWarn ? '1px solid #e94560' : 'none';
    toastEl.style.color = isWarn ? '#e94560' : '#fff';
    toastEl.style.opacity = '1';
    clearTimeout(pageToastTimer);
    pageToastTimer = setTimeout(() => { toastEl.style.opacity = '0'; }, 1200);
  }

  const MIN_SPEED = 1;
  const MAX_SPEED = 10;

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (!masterEnabled) return;

    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      e.stopPropagation();
      toggleScroll();
      return;
    }

    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      e.preventDefault();
      const next = e.code === 'ArrowRight' ? speed + 1 : speed - 1;

      if (next < MIN_SPEED) {
        showPageToast('已是最低速度', true);
        return;
      }
      if (next > MAX_SPEED) {
        showPageToast('已是最高速度', true);
        return;
      }

      speed = next;
      restartIfScrolling();
      showPageToast('速度: ' + speed, false);
      notifyPopup({ action: 'speedChanged', speed });
    }
  }, true);

  // 单击暂停
  document.addEventListener('click', (e) => {
    if (!masterEnabled || !isScrolling) return;

    const tag = e.target.tagName;
    if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' ||
        tag === 'TEXTAREA' || e.target.closest('a, button')) {
      return;
    }

    pauseScroll();
  });

  // 用户滚轮 → 暂停自动滚动（空格可恢复）
  let userScrolling = false;
  let userScrollTimer = null;

  document.addEventListener('wheel', () => {
    if (!masterEnabled || !isScrolling) return;

    // 第一次触发时暂停
    if (!userScrolling) {
      userScrolling = true;
      pauseScroll();
    }

    // 持续滚动时重置计时器
    clearTimeout(userScrollTimer);
    userScrollTimer = setTimeout(() => {
      userScrolling = false;
    }, 300);
  }, { passive: true });

  document.addEventListener('touchmove', () => {
    if (!masterEnabled || !isScrolling) return;
    pauseScroll();
  }, { passive: true });

  // 接收 popup 消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'start':
        speed = message.speed || speed;
        startScroll();
        break;
      case 'stop':
        fullStop();
        break;
      case 'setSpeed':
        speed = message.speed;
        restartIfScrolling();
        break;
      case 'setMasterEnabled':
        masterEnabled = message.enabled;
        if (!masterEnabled && isScrolling) {
          fullStop();
        }
        break;
      case 'getState':
        sendResponse({ isScrolling, speed });
        return true;
    }
  });
})();
