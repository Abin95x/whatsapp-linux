const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const APP_ID = 'whatsapp-desktop';
const APP_URL = 'https://web.whatsapp.com/';
const ICON = path.join(__dirname, '..', 'assets', 'icon.png');

// WhatsApp Web rejects Electron's user agent, so present as plain Chrome
// of the same version Electron ships with.
const CHROME_UA =
  `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ` +
  `Chrome/${process.versions.chrome.split('.')[0]}.0.0.0 Safari/537.36`;

app.setName('WhatsApp');
app.setDesktopName(`${APP_ID}.desktop`);
app.userAgentFallback = CHROME_UA;

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win;
const stateFile = path.join(app.getPath('userData'), 'window-state.json');

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    return { width: 1200, height: 800 };
  }
}

let saveTimer;

function saveState() {
  clearTimeout(saveTimer);
  if (!win || win.isDestroyed()) return;
  const state = { ...win.getNormalBounds(), maximized: win.isMaximized() };
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } catch {}
}

// resize/move fire many times per second while dragging; write once it settles.
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 500);
}

function showWindow() {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function isWhatsAppUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === 'web.whatsapp.com';
  } catch {
    return false;
  }
}

function buildMenu() {
  const template = [
    {
      label: 'App',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => win.webContents.reload() },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => win.webContents.reloadIgnoringCache() },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  const state = loadState();
  win = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 400,
    minHeight: 500,
    title: 'WhatsApp',
    icon: ICON,
    autoHideMenuBar: true,
    backgroundColor: '#111b21',
    show: false,
    webPreferences: {
      partition: 'persist:whatsapp',
      spellcheck: true,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (state.maximized) win.maximize();
  win.once('ready-to-show', () => win.show());

  const ses = win.webContents.session;
  ses.setUserAgent(CHROME_UA);

  // Notifications, mic (voice notes), camera, clipboard, fullscreen.
  const allowed = new Set([
    'notifications', 'media', 'clipboard-read', 'clipboard-sanitized-write',
    'fullscreen', 'mediaKeySystem',
  ]);
  ses.setPermissionRequestHandler((_wc, permission, cb) => cb(allowed.has(permission)));
  ses.setPermissionCheckHandler((_wc, permission) => allowed.has(permission));

  // Open links outside WhatsApp in the default browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!isWhatsAppUrl(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!isWhatsAppUrl(url)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  // Unread count comes through the page title as "(N) WhatsApp".
  let badge = -1;
  win.webContents.on('page-title-updated', (_e, title) => {
    const m = title.match(/^\((\d+)\)/);
    const count = m ? parseInt(m[1], 10) : 0;
    if (count !== badge) app.setBadgeCount((badge = count));
  });

  // Recover from renderer crashes.
  win.webContents.on('render-process-gone', () => win.webContents.reload());

  win.on('resize', scheduleSave);
  win.on('move', scheduleSave);
  win.on('close', saveState);
  win.on('closed', () => { win = null; });

  win.loadURL(APP_URL);
}

app.on('second-instance', showWindow);

app.whenReady().then(() => {
  buildMenu();
  createWindow();
});

app.on('window-all-closed', () => app.quit());
