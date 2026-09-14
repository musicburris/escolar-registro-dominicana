# Distribución de VocalForge Studio

## Build reproducible ARM64

`Scripts/build-release.sh` compila solo `arm64`, ejecuta pruebas, construye `VocalForge Studio.app`, firma con Hardened Runtime y crea el DMG. Si `DEVELOPER_ID_APPLICATION` no está definido usa firma ad-hoc para pruebas.

## Release oficial sin Terminal para el cliente final

La cuenta propietaria debe aportar una vez, en el entorno de CI protegido:

- Certificado `Developer ID Application` y su contraseña.
- Credenciales de notarización guardadas para `notarytool` (issuer, key ID y clave privada de App Store Connect, o perfil de Keychain).

El orden obligatorio es: compilar → firmar todos los ejecutables internos → firmar `.app` con `--options runtime --timestamp` → verificar con `codesign` → crear y firmar DMG → enviar con `notarytool` → adjuntar ticket con `stapler` → validar con `spctl`.

Sin esas credenciales Apple rechaza la notarización; una firma ad-hoc no se puede convertir legítimamente en Developer ID. No se almacenan secretos en el repositorio.
