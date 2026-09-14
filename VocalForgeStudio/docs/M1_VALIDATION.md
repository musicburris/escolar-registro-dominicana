# VocalForge Studio 0.2.0 — Validación Apple M1

## Entorno

- Runner nativo `macos-14-arm64`
- Chip: Apple M1 (virtualizado)
- Memoria disponible: aproximadamente 8 GB
- macOS 14.8.9
- Python ARM64 3.10.16 administrado por VocalForge
- PyTorch 2.4.0; `mps_built = true`; `mps_available = true`

## Resultado

| Prueba | Resultado |
|---|---|
| Compilación Swift Release ARM64 | Aprobada |
| Pruebas automatizadas | 4/4 aprobadas |
| Firma ad-hoc Hardened Runtime | Aprobada |
| Verificación de DMG | Aprobada |
| Instalación automática del runtime | 106 paquetes instalados |
| Inferencia neuronal Seed-VC F0 44.1 kHz | WAV generado y validado |
| Entrenamiento local | Paso real completado |
| Checkpoint | `ft_model.pth` generado y validado |
| Pérdida registrada | 1.6305292844772339 |

## Hallazgo de memoria

La primera ejecución MPS completa agotó el límite de memoria unificada durante la carga de RMVPE en el perfil cercano a 8 GB. No se desactivó el límite de protección de PyTorch. Se implementó enrutamiento automático: hasta 8 GB usa CPU ARM64 secuencial y desde 16 GB utiliza MPS. La repetición en el perfil seguro completó inferencia y entrenamiento sin agotar memoria.

En la prueba corta, el factor de tiempo real de inferencia fue aproximadamente 53.6. En el equipo mínimo la operación funciona, pero es lenta. Studio y Ultra requieren paciencia; no se reduce la arquitectura del modelo para publicar una cifra artificialmente rápida.

## Alcance de la validación acústica

La prueba automática demuestra ejecución neuronal, modificación real del audio y creación de pesos. No demuestra por sí sola calidad artística profesional en una canción: eso requiere grabaciones cantadas autorizadas, comparación auditiva y métricas de F0, inteligibilidad y similitud.
