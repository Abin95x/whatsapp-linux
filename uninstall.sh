#!/usr/bin/env bash
# Removes WhatsApp Desktop. Pass --purge to also delete your login session/data.
set -euo pipefail
rm -rf "$HOME/.local/share/whatsapp-desktop"
rm -f  "$HOME/.local/bin/whatsapp-desktop" \
       "$HOME/.local/share/applications/whatsapp-desktop.desktop" \
       "$HOME/.local/share/icons/hicolor/scalable/apps/whatsapp-desktop.svg" \
       "$HOME/.local/share/icons/hicolor/512x512/apps/whatsapp-desktop.png"
[[ "${1:-}" == "--purge" ]] && rm -rf "$HOME/.config/WhatsApp"
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
echo "Uninstalled."
