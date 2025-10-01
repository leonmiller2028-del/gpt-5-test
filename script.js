// Utilities to store/retrieve JSON in localStorage
function setObj(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}
function getObj(key) {
  const raw = localStorage.getItem(key);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

// Defaults
const DEFAULT_PANIC_URL = 'https://classroom.google.com/h';

// About:blank launcher (cloaker)
function launchab() {
  const tab = window.open('about:blank', '_blank');
  if (!tab) {
    alert('Popup blocked. Please allow popups for this site.');
    return;
  }
  const iframe = tab.document.createElement('iframe');
  const style = iframe.style;
  style.border = 'none';
  style.outline = 'none';
  style.width = '100vw';
  style.height = '100vh';
  style.position = 'fixed';
  style.left = style.right = style.top = style.bottom = '0';
  iframe.src = self.location;
  tab.document.body.style.margin = '0';
  tab.document.body.appendChild(iframe);

  const panicUrl = localStorage.getItem('panicurl') || DEFAULT_PANIC_URL;
  try {
    window.parent.window.location.replace(panicUrl);
  } catch (e) {
    // If not framed, just navigate current tab
    window.location.replace(panicUrl);
  }
}

// Auto-hide launch button when already in about:blank context (naive guard)
try {
  if (window.self !== window.top) {
    const el = document.querySelector('#launchab');
    if (el) el.style.display = '';
  }
} catch {}

// Wire button
document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const btn = document.getElementById('launchab');
  if (btn) btn.addEventListener('click', launchab);

  // Auto-launch if embedded and setting enabled
  const autoLaunch = localStorage.getItem('launchblank');
  const isEmbedded = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  if (autoLaunch && isEmbedded) {
    launchab();
  }

  // Settings page population and save behavior
  const form = document.getElementById('settings-form');
  if (form) {
    const panicurlInput = document.getElementById('panicurl');
    const panickeyInput = document.getElementById('panickey');
    const launchblankInput = document.getElementById('launchblank');

    if (panicurlInput) panicurlInput.value = localStorage.getItem('panicurl') || DEFAULT_PANIC_URL;
    if (panickeyInput) panickeyInput.value = localStorage.getItem('panickey') || '';
    if (launchblankInput) launchblankInput.checked = Boolean(localStorage.getItem('launchblank'));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const panicUrl = panicurlInput && panicurlInput.value ? panicurlInput.value : DEFAULT_PANIC_URL;
      const panicKey = panickeyInput && panickeyInput.value ? panickeyInput.value : '';
      const auto = launchblankInput && launchblankInput.checked ? '1' : '';

      if (panicUrl) localStorage.setItem('panicurl', panicUrl);
      else localStorage.removeItem('panicurl');

      if (panicKey) localStorage.setItem('panickey', panicKey);
      else localStorage.removeItem('panickey');

      if (auto) localStorage.setItem('launchblank', auto);
      else localStorage.removeItem('launchblank');

      alert('Settings saved.');
    });

    const resetBtn = document.getElementById('reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem('panicurl');
        localStorage.removeItem('panickey');
        localStorage.removeItem('launchblank');
        if (panicurlInput) panicurlInput.value = DEFAULT_PANIC_URL;
        if (panickeyInput) panickeyInput.value = '';
        if (launchblankInput) launchblankInput.checked = false;
      });
    }
  }
});

// Panic key listener (works on any page)
document.addEventListener('keydown', (e) => {
  const key = localStorage.getItem('panickey');
  if (!key) return;
  // If user typed a single character in settings, compare by key
  if (e.key === key) {
    const panicUrl = localStorage.getItem('panicurl') || DEFAULT_PANIC_URL;
    try {
      window.parent.window.location.replace(panicUrl);
    } catch {
      window.location.replace(panicUrl);
    }
  }
});

// Expose for inline onclick compatibility if needed
window.launchab = launchab;

