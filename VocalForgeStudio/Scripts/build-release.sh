#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
VERSION="0.1.0"
DIST="$PWD/dist"
APP="$DIST/VocalForge Studio.app"
CONTENTS="$APP/Contents"

rm -rf "$DIST"
mkdir -p "$CONTENTS/MacOS" "$CONTENTS/Resources"

swift test --arch arm64
swift build -c release --arch arm64
BIN_PATH="$(swift build -c release --arch arm64 --show-bin-path)"
cp "$BIN_PATH/VocalForgeStudio" "$CONTENTS/MacOS/VocalForgeStudio"
cp Resources/Info.plist "$CONTENTS/Info.plist"

SIGN_IDENTITY="${DEVELOPER_ID_APPLICATION:--}"
if [[ "$SIGN_IDENTITY" == "-" ]]; then
  codesign --force --deep --options runtime --sign - "$APP"
else
  codesign --force --deep --options runtime --timestamp --entitlements Resources/VocalForge.entitlements --sign "$SIGN_IDENTITY" "$APP"
fi

codesign --verify --deep --strict --verbose=2 "$APP"
file "$CONTENTS/MacOS/VocalForgeStudio" | grep -q "arm64"

STAGE="$DIST/dmg-root"
mkdir -p "$STAGE"
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
hdiutil create -volname "VocalForge Studio" -srcfolder "$STAGE" -ov -format UDZO "$DIST/VocalForgeStudio-${VERSION}-arm64.dmg"
rm -rf "$STAGE"

ditto -c -k --sequesterRsrc --keepParent "$APP" "$DIST/VocalForgeStudio-${VERSION}-arm64.zip"
shasum -a 256 "$DIST/VocalForgeStudio-${VERSION}-arm64.dmg" "$DIST/VocalForgeStudio-${VERSION}-arm64.zip" > "$DIST/SHA256SUMS.txt"
echo "Build ARM64 completada en $DIST"
