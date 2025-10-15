let activeTabId = null;
let activeDomain = null;
let lastActiveTime = Date.now();
let browsingData = {};
let userActions = {};

// Load existing data on startup
chrome.storage.local.get(['browsingData', 'userActions'], (data) => {
  if (data.browsingData) {
    browsingData = data.browsingData;
  }
  if (data.userActions) {
    userActions = data.userActions;
  }
  // Migration: normalize entries missing 'action'
  let changed = false;
  for (const domain in userActions) {
    userActions[domain] = userActions[domain].map(entry => {
      if (!entry.action) {
        changed = true;
        // If it at least has a title treat as page_view else mark unknown
        return { ...entry, action: entry.title ? 'page_view' : 'unknown' };
      }
      return entry;
    });
  }
  if (changed) {
    chrome.storage.local.set({ userActions });
  }
});

function getDomain(url) {
  try {
    const urlObj = new URL(url);
    // Return null for chrome:// URLs
    if (urlObj.protocol === 'chrome:') {
      return null;
    }
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return null;
  }
}

function updateTime() {
  if (!activeDomain) return;
  const now = Date.now();
  const timeSpent = now - lastActiveTime;
  
  browsingData[activeDomain] = (browsingData[activeDomain] || 0) + timeSpent;
  lastActiveTime = now;

  chrome.storage.local.set({ browsingData, userActions });
}

// Listen for messages from content scripts

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.action || !message.data || !message.data.url) return;
  console.log('[Tracker] Received', message.action, 'from', message.data.url);
  const domain = getDomain(message.data.url);
  if (!domain) return;
  if (!userActions[domain]) userActions[domain] = [];
  userActions[domain].push({ ...message.data, action: message.action });
  chrome.storage.local.set({ userActions });
});
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  updateTime();
  activeTabId = activeInfo.tabId;
  const tab = await chrome.tabs.get(activeTabId);
  activeDomain = getDomain(tab.url);
  lastActiveTime = Date.now();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    updateTime();
    activeDomain = getDomain(changeInfo.url);
    lastActiveTime = Date.now();
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  updateTime();
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    activeDomain = null;
  } else {
    lastActiveTime = Date.now();
  }
});

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    activeTabId = tab.id;
    activeDomain = getDomain(tab.url);
    lastActiveTime = Date.now();
  }
}
init();