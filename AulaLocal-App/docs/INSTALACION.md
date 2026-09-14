# Instalación y estado de entrega

Esta entrega es AulaLocal 0.1.0, una implementación funcional en código fuente con pruebas en Linux. **No contiene un DMG/PKG compilado ni una aplicación certificada en Mac.** El entorno de construcción disponible en Work no tiene macOS, SDK de Apple ni credenciales de firma. No se ha ejecutado una compilación de macOS.

## Para el usuario del centro

El proyecto contiene `Preparar_AulaLocal.command`, que automatiza la compilación en un Mac compatible. Requiere que el Mac tenga Python 3.11, 3.12 o 3.13 ARM64 y las herramientas de línea de comandos de Apple. La primera compilación descarga dependencias. No es un sustituto de un instalador final listo para abrir.

Cuando exista el DMG compilado y validado:

1. Abrir `AulaLocal-0.1.0-arm64.dmg`.
2. Arrastrar AulaLocal a Aplicaciones y abrirla.
3. Escribir el nombre del centro, director, usuario y una contraseña de al menos 12 caracteres. No se preconfigura ningún centro real.
4. Crear el primer año escolar. Las fechas son configurables; 1 de agosto a 31 de julio es una propuesta, no una fecha oficial impuesta.
5. Registrar los datos. El uso habitual no necesita internet, Python instalado por separado ni un navegador.

El PKG generado ofrece instalación alternativa en Aplicaciones. El instalador nunca sustituye los datos del usuario. La desinstalación de la aplicación no borra expedientes.

## Para quien complete el empaquetado

En un Mac Apple Silicon con Python ARM64 y Command Line Tools instalados:

```bash
bash scripts/build_macos.sh
```

El script comprueba plataforma y arquitectura, crea un entorno aislado, instala las versiones fijadas, ejecuta las pruebas, genera `.app`, comprueba firma y arquitectura y produce DMG y PKG. Se detiene si falla una etapa. `dist/SHA256SUMS.txt` registra hashes de los paquetes generados. macOS 12 o posterior es el objetivo técnico, pendiente de validación real; un M1 con macOS anterior necesitará actualizarse.

Para distribución verificada, configure los certificados Developer ID y un perfil `notarytool` en el Llavero del Mac. El script acepta `AULALOCAL_SIGN_IDENTITY`, `AULALOCAL_INSTALLER_IDENTITY` y `AULALOCAL_NOTARY_PROFILE`. Nunca incluya claves o contraseñas en el repositorio. La notarización incluida se aplica a la aplicación; antes de distribución comercial también hay que verificar y, según el canal de entrega, notarizar los contenedores finales. Sin estas credenciales se genera una compilación de prueba con firma ad hoc y Gatekeeper puede impedir su apertura. No se recomienda desactivar Gatekeeper.

No se promete una compilación limpia hasta ejecutar este procedimiento en Mac y la lista `ACEPTACION_MAC.md`.

## Ejecución desde fuente para desarrollo

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e .
python -m aulalocal
```

Para una prueba aislada: `python -m aulalocal --data-dir /ruta/a/datos-de-prueba`.

## Ubicación y recuperación

Datos en Mac: `~/Library/Application Support/AulaLocal/`. La base y sus adjuntos permanecen locales. Los archivos exportados se guardan donde decida el usuario. Mantenga una copia cifrada en un disco externo; un respaldo en el mismo Mac no protege frente a pérdida del equipo.

En otro Mac, instalar AulaLocal, crear una cuenta administrativa temporal y usar Copias y restauración → Restaurar desde archivo. Después, iniciar sesión con una cuenta del respaldo. La cuenta temporal será sustituida. La copia anterior a la restauración queda en la carpeta de datos como `antes-de-restaurar.aulabackup`, protegida con la contraseña del archivo restaurado; una restauración posterior sustituye esa copia de recuperación.
