#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ "$(uname -s)" != Darwin ] || [ "$(uname -m)" != arm64 ]; then
  echo 'Esta compilación requiere un Mac Apple Silicon ejecutándose sin Rosetta.' >&2
  exit 1
fi
BUILD_PYTHON="${AULALOCAL_BUILD_PYTHON:-python3}"
"$BUILD_PYTHON" -c 'import platform,sys; assert platform.machine()=="arm64", "Python debe ser ARM64"; assert (3,11)<=sys.version_info<(3,14), "Se requiere Python 3.11, 3.12 o 3.13"'
"$BUILD_PYTHON" -m venv .venv-build
.venv-build/bin/python -m pip install --disable-pip-version-check -r requirements-build.txt
.venv-build/bin/python -m pip install --no-deps -e .
mkdir -p docs/evidencias
QT_QPA_PLATFORM=offscreen .venv-build/bin/python -m pytest -q --junitxml=docs/evidencias/tests-macos.xml
export MACOSX_DEPLOYMENT_TARGET=12.0
SIGN_ARGS=()
if [ -n "${AULALOCAL_SIGN_IDENTITY:-}" ]; then
  SIGN_ARGS=(--codesign-identity "$AULALOCAL_SIGN_IDENTITY" --osx-entitlements-file scripts/entitlements.plist)
fi
.venv-build/bin/python -m PyInstaller --noconfirm --clean --windowed --onedir \
  --name AulaLocal --target-architecture arm64 \
  --osx-bundle-identifier com.aulalocal.desktop \
  --add-data 'aulalocal/schema.sql:aulalocal' \
  --collect-data reportlab --collect-data openpyxl \
  --exclude-module PySide6.QtWebEngineCore --exclude-module PySide6.QtWebEngineWidgets \
  "${SIGN_ARGS[@]}" launcher.py
/usr/libexec/PlistBuddy -c 'Set :LSMinimumSystemVersion 12.0' dist/AulaLocal.app/Contents/Info.plist
# El cambio del plist requiere volver a sellar el bundle; PyInstaller firma los binarios internos.
if [ -n "${AULALOCAL_SIGN_IDENTITY:-}" ]; then
  codesign --force --options runtime --entitlements scripts/entitlements.plist --sign "$AULALOCAL_SIGN_IDENTITY" dist/AulaLocal.app
else
  codesign --force --sign - dist/AulaLocal.app
fi
codesign --verify --deep --strict dist/AulaLocal.app
lipo -verify_arch arm64 dist/AulaLocal.app/Contents/MacOS/AulaLocal
QT_QPA_PLATFORM=offscreen dist/AulaLocal.app/Contents/MacOS/AulaLocal --self-test | tee docs/evidencias/validacion-m1.json
python3 - <<'PY'
import json
data=json.load(open('docs/evidencias/validacion-m1.json'))
assert data['status']=='ok' and data['arquitectura']=='arm64'
assert all(data[k] for k in ('persistencia','pdf','excel','respaldo','sin_red'))
PY
if [ -n "${AULALOCAL_NOTARY_PROFILE:-}" ]; then
  ditto -c -k --keepParent dist/AulaLocal.app dist/AulaLocal-notarizar.zip
  xcrun notarytool submit dist/AulaLocal-notarizar.zip --keychain-profile "$AULALOCAL_NOTARY_PROFILE" --wait
  xcrun stapler staple dist/AulaLocal.app
fi
STAGING_DIR="$(mktemp -d "${TMPDIR:-/tmp}/aulalocal-dmg.XXXXXX")"
trap 'rm -rf "$STAGING_DIR"' EXIT
cp -R dist/AulaLocal.app "$STAGING_DIR/"
ln -s /Applications "$STAGING_DIR/Applications"
cp docs/INSTALACION.md "$STAGING_DIR/LEEME.md"
hdiutil create -volname AulaLocal -srcfolder "$STAGING_DIR" -ov -format UDZO dist/AulaLocal-0.1.0-arm64.dmg
PKG_SIGN=()
if [ -n "${AULALOCAL_INSTALLER_IDENTITY:-}" ]; then PKG_SIGN=(--sign "$AULALOCAL_INSTALLER_IDENTITY"); fi
productbuild --component dist/AulaLocal.app /Applications "${PKG_SIGN[@]}" dist/AulaLocal-0.1.0-arm64.pkg
shasum -a 256 dist/*.dmg dist/*.pkg > dist/SHA256SUMS.txt
echo 'Paquetes creados en dist. La prueba manual de aceptación en Mac sigue siendo obligatoria.'
if [ -z "${AULALOCAL_NOTARY_PROFILE:-}" ]; then
  echo 'Compilación local sin notarización Apple. No está lista para distribución comercial.'
fi
