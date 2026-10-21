#!/usr/bin/env bash
# Installs WhatsApp Desktop for the current user (no root needed).
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
APPDIR="$HOME/.local/share/whatsapp-desktop"
BIN="$HOME/.local/bin/whatsapp-desktop"
DESKTOP="$HOME/.local/share/applications/whatsapp-desktop.desktop"
ICONDIR="$HOME/.local/share/icons/hicolor"

command -v npm >/dev/null || { echo "npm is required"; exit 1; }

mkdir -p "$APPDIR" "$(dirname "$BIN")" "$(dirname "$DESKTOP")" \
         "$ICONDIR/scalable/apps" "$ICONDIR/512x512/apps"

cp -r "$SRC/src" "$SRC/assets" "$SRC/package.json" "$APPDIR/"
(cd "$APPDIR" && npm install --no-audit --no-fund && node node_modules/electron/install.js)

cat > "$BIN" <<LAUNCH
#!/usr/bin/env bash
exec "$APPDIR/node_modules/electron/dist/electron" "$APPDIR" --ozone-platform-hint=auto "\$@"
LAUNCH
chmod +x "$BIN"

cp "$SRC/assets/icon.svg" "$ICONDIR/scalable/apps/whatsapp-desktop.svg"
cp "$SRC/assets/icon.png" "$ICONDIR/512x512/apps/whatsapp-desktop.png"

cat > "$DESKTOP" <<ENTRY
[Desktop Entry]
Type=Application
Name=WhatsApp
GenericName=Messenger
Comment=WhatsApp Web desktop client
Exec=$BIN %U
Icon=whatsapp-desktop
Terminal=false
Categories=Network;InstantMessaging;Chat;
Keywords=whatsapp;chat;message;
StartupWMClass=whatsapp-desktop
StartupNotify=true
ENTRY

update-desktop-database "$(dirname "$DESKTOP")" 2>/dev/null || true
gtk-update-icon-cache -f -t "$ICONDIR" 2>/dev/null || true

echo "Installed. Launch 'WhatsApp' from the app menu, or run: $BIN"
