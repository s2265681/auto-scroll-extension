// 安装或更新时，给所有已打开的 tab 注入 content script
chrome.runtime.onInstalled.addListener(async () => {
  const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
  for (const tab of tabs) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (e) { /* 某些页面无法注入，忽略 */ }
  }
});

// 转发 content script 的消息给 popup（如果 popup 打开的话）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 不做任何处理，仅保持 service worker 存活，避免 "Receiving end does not exist" 错误
});
