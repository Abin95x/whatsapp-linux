# WhatsApp Desktop for Linux

A minimal desktop client for Linux that wraps [WhatsApp Web](https://web.whatsapp.com/) in Electron.

> This is an unofficial project. It is not affiliated with, endorsed by, or connected to WhatsApp or Meta.

## Features

- Runs WhatsApp Web in its own window with an app menu entry and icon
- Keeps you logged in between launches
- Desktop notifications and an unread-count badge
- Microphone and camera access for voice notes and calls
- Spellcheck
- Opens external links in your default browser
- Remembers window size, position and maximized state
- Single instance: launching it again focuses the open window
- Native Wayland support (falls back to X11)
- Reloads automatically if the page crashes

## Requirements

- Node.js and npm

## Install

```bash
git clone https://github.com/Abin95x/whatsapp-linux.git
cd whatsapp-linux
./install.sh
```

This installs for the current user only, with no root needed:

| What | Where |
| --- | --- |
| App files | `~/.local/share/whatsapp-desktop` |
| Launcher | `~/.local/bin/whatsapp-desktop` |
| Desktop entry | `~/.local/share/applications/whatsapp-desktop.desktop` |
| Icons | `~/.local/share/icons/hicolor/` |

Launch **WhatsApp** from your app menu, or run `whatsapp-desktop` if `~/.local/bin` is on your `PATH`.

To update, pull the latest changes and run `./install.sh` again.

## Uninstall

```bash
./uninstall.sh          # remove the app, keep your login session
./uninstall.sh --purge  # also delete your session data (~/.config/WhatsApp)
```

## Usage

The menu bar is hidden by default. Press `Alt` to show it.

| Shortcut | Action |
| --- | --- |
| `Ctrl+R` | Reload |
| `Ctrl+Shift+R` | Force reload (ignores cache) |
| `Ctrl+Q` | Quit |
| `Ctrl+0` / `Ctrl++` / `Ctrl+-` | Reset zoom / zoom in / zoom out |
| `F11` | Toggle fullscreen |

## Development

```bash
npm install
npm start          # build and run
npm run build      # compile TypeScript to dist/
npm run typecheck  # type-check only
```

The whole app is in `src/main.ts`.

## Support

If you find this project useful, you can support it here:

<a href="https://buymeacoffee.com/abin95x"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee"></a>

## License

[MIT](LICENSE)
