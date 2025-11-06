// ==================== THEME MANAGEMENT ====================
function initTheme() {
  const html = document.documentElement;
  chrome.storage.sync.get(['theme'], (items) => {
    const theme = items.theme || 'light';
    if (theme === 'dark') {
      html.classList.add('dark');
      document.getElementById('themeToggle').textContent = '☀️';
    }
  });
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
  chrome.storage.sync.set({ theme: isDark ? 'dark' : 'light' });
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// ==================== SIDEBAR MANAGEMENT ====================
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  let isCollapsed = false;

  toggle.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    sidebar.classList.toggle('collapsed', isCollapsed);
    toggle.textContent = isCollapsed ? '←' : '→';
    chrome.storage.sync.set({ sidebarCollapsed: isCollapsed });
  });

  // Restore sidebar state
  chrome.storage.sync.get(['sidebarCollapsed'], (items) => {
    if (items.sidebarCollapsed) {
      sidebar.classList.add('collapsed');
      toggle.textContent = '←';
    }
  });

  // Add smooth navigation between sections
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}

// ==================== FORM MANAGEMENT ====================
function populateHourSelect(select) {
  for (let h = 0; h < 24; h++) {
    const opt = document.createElement('option');
    opt.value = h;
    opt.textContent = `${h}:00 ${h < 12 ? 'AM' : 'PM'}`;
    select.appendChild(opt);
  }
}

const enabledEl = document.getElementById('enabled');
const intervalEl = document.getElementById('interval');
const quietStartEl = document.getElementById('quietStart');
const quietEndEl = document.getElementById('quietEnd');
const saveBtn = document.getElementById('save');
const statusEl = document.getElementById('status');
const userIdEl = document.getElementById('userId');
const clearBtn = document.getElementById('clear');
const clearStatus = document.getElementById('clearStatus');

populateHourSelect(quietStartEl);
populateHourSelect(quietEndEl);

// Load notification settings
chrome.storage.sync.get(['notifySettings'], (items) => {
  const s = items.notifySettings || { enabled: true, intervalMinutes: 120, quietHours: { start: 22, end: 7 } };
  enabledEl.checked = s.enabled;
  intervalEl.value = s.intervalMinutes;
  quietStartEl.value = s.quietHours.start;
  quietEndEl.value = s.quietHours.end;
});

// Load user ID
chrome.storage.sync.get(['userId'], (it) => {
  if (it.userId) userIdEl.value = it.userId;
});

// Save settings with visual feedback
saveBtn.addEventListener('click', () => {
  const settings = {
    enabled: enabledEl.checked,
    intervalMinutes: Math.max(15, parseInt(intervalEl.value || '120', 10)),
    quietHours: { start: parseInt(quietStartEl.value, 10), end: parseInt(quietEndEl.value, 10) }
  };

  chrome.runtime.sendMessage({ type: 'updateNotifySettings', settings }, (resp) => {
    if (resp && resp.status === 'ok') {
      statusEl.textContent = '✅ Settings saved successfully!';
      statusEl.className = 'status success';
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = '';
      }, 3000);
    } else {
      statusEl.textContent = '❌ Error saving settings.';
      statusEl.className = 'status error';
    }
  });
  // store userId too
  chrome.storage.sync.set({ userId: userIdEl.value });
});

// Clear all summaries with confirmation
clearBtn.addEventListener('click', () => {
  if (!confirm('🗑️ Are you sure? This will permanently delete ALL your activity summaries. This action cannot be undone.')) return;
  
  clearStatus.textContent = '⏳ Clearing...';
  clearStatus.className = '';
  
  const userId = userIdEl.value || '9a1b9e1d-1234-45e7-a987-0abcde123456';
  fetch(`http://127.0.0.1:8000/api/summary/clear?user_id=${encodeURIComponent(userId)}&mode=soft`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      clearStatus.textContent = '✅ All summaries cleared!';
      clearStatus.className = 'status success';
      setTimeout(() => {
        clearStatus.textContent = '';
        clearStatus.className = '';
      }, 3000);
    })
    .catch(err => {
      clearStatus.textContent = '❌ Error clearing summaries.';
      clearStatus.className = 'status error';
      console.error(err);
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
});
