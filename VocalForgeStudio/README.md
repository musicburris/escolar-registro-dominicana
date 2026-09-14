# VocalForge Studio

Aplicación nativa y exclusiva para macOS Apple Silicon. **VocalForge Studio 0.4.0** incorpora SoulX‑Singer‑SVC (2026) como motor Studio/Ultra, Seed‑VC 44.1 kHz para entrenamiento y conversión rápida, selección intercambiable de voces y limpieza neuronal DeepFilterNet3.

## Qué funciona en esta build

- Aplicación SwiftUI/AppKit nativa ARM64, sin Rosetta.
- Importación de WAV, AIFF, M4A y MP3 mediante diálogos de macOS.
- Proyectos persistentes en `Application Support/VocalForge Studio`.
- Preview DSP usando AVFoundation + Accelerate y clonación neuronal SVC mediante Metal/MPS.
- Perfiles automáticos desde M1 8 GB hasta equipos de alta memoria.
- Lectura del estado térmico público de macOS y reducción de ritmo sin cancelar el render.
- Modos Preview, High, Studio y Ultra siempre visibles.
- Importación segura de `.vfvoice` con manifiesto, consentimiento y SHA-256.
- Motor Automático: SoulX Ultra para Studio/Ultra y Seed‑VC para Preview/High.
- Cada voz nueva conserva pesos entrenados y una referencia autorizada para poder usarse indistintamente con ambos motores.
- Entrenamiento local real y selección directa del checkpoint entrenado en la pantalla de conversión.
- Selector por proyecto para alternar entre todas las voces entrenadas.
- Limpieza opcional Sin limpieza, Natural o Profunda; conserva también el render original.

La limpieza **Natural** limita la atenuación para proteger el carácter del canto. **Profunda** añade un postfiltro más intenso para fuentes contaminadas; ninguna modalidad sobrescribe el render neuronal original.
- Gestión de espacio; limpiar caché nunca borra voces ni proyectos.
- Pruebas automatizadas y empaquetado DMG.

## Instalación del motor profesional

La aplicación incluye ambos motores y un gestor ARM64. Pulsa **Instalar motor** una sola vez: VocalForge descarga Python, SoulX, Seed‑VC y sus modelos sin Terminal. Esta fase requiere internet, bastante espacio libre y puede tardar. Al terminar, conversión, proyectos, voces y entrenamiento se ejecutan localmente. SoulX usa Apache‑2.0; Seed‑VC se distribuye como módulo GPL‑3.0 separado y con su código fuente completo.

En equipos de 8 GB, el motor prioriza estabilidad mediante la ruta neuronal CPU ARM64 y procesamiento secuencial; en 16 GB o más activa MPS. La calidad del modelo no se reduce: el perfil de 8 GB tarda más.

`Lyrics Lock` guarda la letra de referencia y Seed-VC preserva el contenido de la interpretación fuente. Esta versión no afirma una alineación fonética rígida palabra por palabra; esa capacidad queda identificada como experimental en la interfaz.

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

La automatización oficial instala el runtime administrado, confirma MPS disponible y ejecuta una conversión neuronal y un paso real de entrenamiento en un runner Apple M1 ARM64.

## Privacidad y uso responsable

No hay telemetría ni APIs externas. Solo deben importarse o entrenarse voces propias o con autorización verificable. El formato `.vfvoice` requiere registrar consentimiento y procedencia.

Consulta [docs/APPLE_SILICON_RESEARCH.md](docs/APPLE_SILICON_RESEARCH.md) para la matriz técnica y [docs/RELEASE.md](docs/RELEASE.md) para distribución.
