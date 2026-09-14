# VocalForge Studio

Aplicación nativa y exclusiva para macOS Apple Silicon. Esta entrega es **VocalForge Studio Core 0.1.0**: una base instalable ARM64 con proyectos locales, análisis de hardware, guardado automático, procesamiento de audio por chunks, protección térmica, Storage Manager, formato `.vfvoice` verificable y arquitectura de motores sustituibles.

## Qué funciona en esta build

- Aplicación SwiftUI/AppKit nativa ARM64, sin Rosetta.
- Importación de WAV, AIFF, M4A y MP3 mediante diálogos de macOS.
- Proyectos persistentes en `Application Support/VocalForge Studio`.
- Preview de audio real, offline y por segmentos usando AVFoundation + Accelerate.
- Perfiles automáticos desde M1 8 GB hasta equipos de alta memoria.
- Lectura del estado térmico público de macOS y reducción de ritmo sin cancelar el render.
- Modos Preview, High, Studio y Ultra siempre visibles.
- Importación segura de `.vfvoice` con manifiesto, consentimiento y SHA-256.
- Gestión de espacio; limpiar caché nunca borra voces ni proyectos.
- Pruebas automatizadas y empaquetado DMG.

## Límite honesto

El preview DSP **no es clonación de voz**. El motor neuronal SVC y el entrenamiento están deliberadamente desacoplados y bloqueados en esta build hasta que una implementación MLX supere pruebas acústicas y de memoria en M1. Seed-VC no se integra como núcleo porque quedó archivado y su GPL-3.0 condiciona la distribución. La interfaz no finge conversiones ni entrenamientos inexistentes.

## Instalación para una persona usuaria

1. Abre `VocalForgeStudio.dmg`.
2. Arrastra VocalForge Studio a Aplicaciones.
3. Abre la aplicación.

La build de desarrollo está firmada de forma ad-hoc. macOS puede pedir usar clic secundario → Abrir la primera vez. La firma Developer ID y la notarización requieren un certificado emitido a la cuenta titular del producto; el flujo de release ya incluye los puntos de integración.

## Desarrollo

Requisitos: Mac Apple Silicon, macOS 14 o posterior, Xcode 15 o posterior.

```bash
swift test
./Scripts/build-release.sh
```

El producto no tiene código x86_64, Windows, Linux, CUDA ni NVIDIA.

## Privacidad y uso responsable

No hay telemetría ni APIs externas. Solo deben importarse o entrenarse voces propias o con autorización verificable. El formato `.vfvoice` requiere registrar consentimiento y procedencia.

Consulta [docs/APPLE_SILICON_RESEARCH.md](docs/APPLE_SILICON_RESEARCH.md) para la matriz técnica y [docs/RELEASE.md](docs/RELEASE.md) para distribución.
