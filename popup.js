const masterToggle = document.getElementById('masterToggle');
const panel = document.getElementById('panel');
const speedSlider = document.getElementById('speedSlider');
const speedDisplay = document.getElementById('speedDisplay');
const toggleBtn = document.getElementById('toggleBtn');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const toast = document.getElementById('toast');

let isScrolling = false;
let currentTabId = null;
let toastTimer = null;

function showToast(text, isWarn) {
  clearTimeout(toastTimer);
  toast.textContent = text;
  toast.className = isWarn ? 'toast show warn' : 'toast show';
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 1200);
}

function updateUI(scrolling, speed) {
  isScrolling = scrolling;
  speedSlider.value = speed;
  speedDisplay.textContent = speed;

  if (scrolling) {
    toggleBtn.className = 'toggle-btn stop';
    btnText.textContent = '停止滚动';
    btnIcon.innerHTML = '&#9632;';
    statusDot.className = 'status-dot active';
    statusText.textContent = '滚动中...';
  } else {
    toggleBtn.className = 'toggle-btn start';
    btnText.textContent = '开始滚动';
    btnIcon.innerHTML = '&#9654;';
    statusDot.className = 'status-dot inactive';
    statusText.textContent = '未启动';
  }
}

function updatePanelState(enabled) {
  panel.className = enabled ? 'panel' : 'panel disabled';
}

async function ensureContentScriptAndSend(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (e) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (err) {
      console.error('无法注入脚本:', err);
      return null;
    }
  }
}

// 初始化
chrome.storage.sync.get({ masterEnabled: true }, (data) => {
  masterToggle.checked = data.masterEnabled;
  updatePanelState(data.masterEnabled);
});

chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  if (!tabs[0]) return;
  currentTabId = tabs[0].id;
  const response = await ensureContentScriptAndSend(currentTabId, { action: 'getState' });
  if (response) {
    updateUI(response.isScrolling, response.speed);
  }
});

// 总开关
masterToggle.addEventListener('change', async () => {
  const enabled = masterToggle.checked;
  chrome.storage.sync.set({ masterEnabled: enabled });
  updatePanelState(enabled);

  if (currentTabId) {
    if (!enabled) {
      // 关闭时停止滚动
      await ensureContentScriptAndSend(currentTabId, { action: 'stop' });
      updateUI(false, parseInt(speedSlider.value));
    }
    ensureContentScriptAndSend(currentTabId, { action: 'setMasterEnabled', enabled });
  }
});

speedSlider.addEventListener('input', () => {
  const speed = parseInt(speedSlider.value);
  speedDisplay.textContent = speed;
  if (currentTabId) {
    ensureContentScriptAndSend(currentTabId, { action: 'setSpeed', speed });
  }
});

toggleBtn.addEventListener('click', toggleScrolling);

// 键盘控制
document.addEventListener('keydown', (e) => {
  if (!masterToggle.checked) return;

  if (e.code === 'Space') {
    e.preventDefault();
    toggleScrolling();
    return;
  }

  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
    e.preventDefault();
    const current = parseInt(speedSlider.value);
    const min = parseInt(speedSlider.min);
    const max = parseInt(speedSlider.max);
    const next = e.code === 'ArrowRight' ? current + 1 : current - 1;

    if (next < min) { showToast('已是最低速度', true); return; }
    if (next > max) { showToast('已是最高速度', true); return; }

    speedSlider.value = next;
    speedDisplay.textContent = next;
    showToast('速度: ' + next);
    if (currentTabId) {
      ensureContentScriptAndSend(currentTabId, { action: 'setSpeed', speed: next });
    }
  }
});

// 监听 content script 状态变化
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'scrollStateChanged') {
    updateUI(message.isScrolling, parseInt(speedSlider.value));
  }
  if (message.action === 'speedChanged') {
    speedSlider.value = message.speed;
    speedDisplay.textContent = message.speed;
  }
});

async function toggleScrolling() {
  if (!currentTabId) return;
  const speed = parseInt(speedSlider.value);
  if (isScrolling) {
    await ensureContentScriptAndSend(currentTabId, { action: 'stop' });
    updateUI(false, speed);
  } else {
    await ensureContentScriptAndSend(currentTabId, { action: 'start', speed });
    updateUI(true, speed);
  }
}
