function formatAction(action) {
  const time = new Date(action.timestamp || Date.now()).toLocaleTimeString();
  const type = action.action || (action.title ? 'page_view' : 'unknown');
  switch(type) {
    case 'page_view':
      return `${time}: Page view - ${action.title || action.url || ''}`;
    case 'title_change':
      return `${time}: Title changed to "${action.title}"`;
    case 'scroll':
      return `${time}: Scroll ${action.scrollPercent}%`;
    case 'media_play':
    case 'media_pause':
    case 'media_ended':
      return `${time}: ${type.replace('media_','media ')} (${action.currentTime || 0}s/${action.duration || 0}s)`;
    case 'click':
      return `${time}: Click ${action.tag || ''} ${action.id ? '#'+action.id : ''} ${(action.text||'').slice(0,40)}`;
    case 'keydown':
      return `${time}: Key "${action.key}"`;
    case 'unknown':
      return `${time}: (unknown event)`;
    default:
      return `${time}: ${type}`;
  }
}

function renderActions(userActions) {
  const actionsList = document.getElementById('actions-list');
  actionsList.innerHTML = '';
  if (!userActions || Object.keys(userActions).length === 0) {
    actionsList.innerHTML = '<li>No actions yet.</li>';
    return;
  }
  Object.entries(userActions).forEach(([domain, actions]) => {
    const domainHeader = document.createElement('h3');
    domainHeader.textContent = domain;
    actionsList.appendChild(domainHeader);
    const ul = document.createElement('ul');
    actions.slice(-100).forEach(action => {
      const li = document.createElement('li');
      li.textContent = formatAction(action);
      ul.appendChild(li);
    });
    actionsList.appendChild(ul);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const actionsList = document.getElementById('actions-list');
  actionsList.innerHTML = '<li>Loading...</li>';
  const exportButton = document.getElementById('exportButton');
  try {
    if (!window.chrome || !chrome.runtime || !chrome.storage) {
      actionsList.innerHTML = '<li>Chrome APIs unavailable. Open this via the extension icon. If you reloaded files, click Reload on the extension in chrome://extensions.</li>';
      return;
    }
    chrome.storage.local.get(['userActions'], (data) => {
      if (chrome.runtime.lastError) {
        actionsList.innerHTML = `<li>Error: ${chrome.runtime.lastError.message}</li>`;
        return;
      }
      renderActions(data.userActions);
    });
  } catch (e) {
    actionsList.innerHTML = `<li>Exception: ${e.message}</li>`;
  }

  exportButton.addEventListener('click', () => {
    chrome.storage.local.get(['userActions'], (data) => {
      const dataStr = JSON.stringify({ userActions: data.userActions }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'activity_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
});