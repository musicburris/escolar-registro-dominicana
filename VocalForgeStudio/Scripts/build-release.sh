#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
VERSION="0.2.0"
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

ENGINE_BUILD="$PWD/.engine-build"
rm -rf "$ENGINE_BUILD"
mkdir -p "$ENGINE_BUILD" "$CONTENTS/Resources/tools"
curl -L --fail --silent --show-error -o "$ENGINE_BUILD/uv.tar.gz" "https://github.com/astral-sh/uv/releases/download/0.8.17/uv-aarch64-apple-darwin.tar.gz"
echo "e4d4859d7726298daa4c12e114f269ff282b2cfc2b415dc0b2ca44ae2dbd358e  $ENGINE_BUILD/uv.tar.gz" | shasum -a 256 -c -
tar -xzf "$ENGINE_BUILD/uv.tar.gz" -C "$ENGINE_BUILD"
cp "$ENGINE_BUILD/uv-aarch64-apple-darwin/uv" "$CONTENTS/Resources/tools/uv"
chmod 755 "$CONTENTS/Resources/tools/uv"
git clone --quiet https://github.com/Plachtaa/seed-vc.git "$ENGINE_BUILD/seed-vc"
git -C "$ENGINE_BUILD/seed-vc" checkout --quiet 51383efd921027683c89e5348211d93ff12ac2a8
rm -rf "$ENGINE_BUILD/seed-vc/.git"
ditto "$ENGINE_BUILD/seed-vc" "$CONTENTS/Resources/seed-vc"
cp Resources/engine-requirements.txt "$CONTENTS/Resources/engine-requirements.txt"

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
