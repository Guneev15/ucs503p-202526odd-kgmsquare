chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // Read stored userId if set, otherwise use default placeholder
    chrome.storage.sync.get(["userId"], (items) => {
      const uid = items.userId || "9a1b9e1d-1234-45e7-a987-0abcde123456";
      fetch("http://127.0.0.1:8000/api/activity/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: uid,
          source: "browser",
          content: `Visited: ${tab.title}`,
          metadata: { url: tab.url }
        })
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => console.log("Log sent:", data))
        .catch(err => console.error("Error sending log:", err));
    });
  }
});

// --- Notification & Alarm feature ---
const DEFAULT_SETTINGS = {
  enabled: true,
  intervalMinutes: 120, // default every 2 hours
  quietHours: { start: 22, end: 7 } // 10pm - 7am
};

// Initialize settings if not present
chrome.storage.sync.get(["notifySettings"], (items) => {
  if (!items.notifySettings) {
    chrome.storage.sync.set({ notifySettings: DEFAULT_SETTINGS });
    scheduleAlarm(DEFAULT_SETTINGS.intervalMinutes);
  } else {
    const s = items.notifySettings;
    if (s.enabled) scheduleAlarm(s.intervalMinutes);
  }
});

function scheduleAlarm(minutes) {
  chrome.alarms.clearAll(() => {
    chrome.alarms.create("recall-notify", { periodInMinutes: minutes });
    console.log("Alarm scheduled every", minutes, "minutes");
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== "recall-notify") return;

  chrome.storage.sync.get(["notifySettings"], (items) => {
    const s = items.notifySettings || DEFAULT_SETTINGS;
    if (!s.enabled) return;

    const now = new Date();
    const hour = now.getHours();
    // handle quiet hours across midnight
    const inQuiet = s.quietHours.start < s.quietHours.end
      ? (hour >= s.quietHours.start && hour < s.quietHours.end)
      : (hour >= s.quietHours.start || hour < s.quietHours.end);
    if (inQuiet) return;

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Recall AI',
  message: 'Time to check your activity summaries.',
      priority: 2
    }, () => {});
  });
});

// Listen for settings changes from options page
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'updateNotifySettings') {
    chrome.storage.sync.set({ notifySettings: msg.settings }, () => {
      if (msg.settings.enabled) scheduleAlarm(msg.settings.intervalMinutes);
      else chrome.alarms.clearAll();
      sendResponse({ status: 'ok' });
    });
    // indicate async response
    return true;
  }
});

// When user clicks the notification, open the summary page (include userId if available)
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.storage.sync.get(["userId"], (items) => {
    const uid = items.userId ? `?user_id=${encodeURIComponent(items.userId)}` : '';
    const url = `http://127.0.0.1:5173/summary${uid}`; // assumes local client dev server port
    chrome.tabs.create({ url });
  });
});
