# Resultado de verificación

Entrega: AulaLocal 0.4.0. Suite actual: **41 pruebas aprobadas, 0 fallos**. El XML está en `evidencias/tests-linux.xml`; el proceso de construcción Mac vuelve a ejecutar la misma suite y guarda `tests-macos.xml`.

## Cobertura automatizada

| Área | Comprobación |
|---|---|
| Persistencia | Datos y configuración sobreviven al cierre y reapertura |
| Actualización | Migración desde esquema 1 a 2 conserva estudiante y adjunto y normaliza el grado |
| Estructura académica | Niveles, grados, rangos y secciones válidas por año |
| Edad | Edad actual, edad al inicio del ciclo y rango configurado |
| Importación | Excel masivo de estudiantes, plantilla de personal y operación atómica |
| Ponchador | Detección de encabezado, formatos combinados/separados, enlace de personal, tardanza e idempotencia |
| Años | Aislamiento, copia explícita, congelación, archivo y reapertura controlada |
| Acceso | Hash de contraseña, cinco fallos, token persistente, cierre explícito y recuperación rotativa |
| Roles | Restricciones de Secretaría, Alimentación, Contabilidad y Consulta |
| Planta y visitas | Validación y persistencia de ambos módulos |
| Alimentación | Tipos configurables, menú/servicio, eliminación histórica controlada, cantidades, rechazos, observaciones, indicadores y varias fotos atómicas |
| Gastos | Decimales exactos, valores inválidos y totales |
| Adjuntos | PDF/imagen/ofimática, huella, tamaño y bloqueo histórico |
| Reportes | PDF, Excel, certificaciones, filtros por grado/sección, asistencia de supervisión y alimentación con/sin fotos |
| Respaldo | Cifrado, manipulación/contraseña errónea, recuperación y copia previa |
| Auditoría | Antes/después, zona horaria de presentación e inmutabilidad |
| Interfaz | Construcción de pantallas/formularios, navegación, reingreso y selectores visuales de fecha/hora |
| Offline | La auto-validación bloquea sockets mientras genera datos, PDF, Excel y respaldo |

## Validación del paquete

`scripts/build_macos.sh` exige un Mac ARM64, ejecuta pruebas, construye `AulaLocal.app`, confirma arquitectura con `lipo`, verifica la firma, ejecuta `--self-test` desde el bundle y crea DMG/PKG con hashes SHA-256. La evidencia del build queda en `docs/evidencias/validacion-m1.json` y `tests-macos.xml`.

Una firma Developer ID y notarización real solo son posibles con certificados y credenciales del propietario inscrito en Apple Developer Program. Cuando no están disponibles, el paquete queda firmado localmente y macOS puede mostrar el aviso de desarrollador no identificado.

## Aceptación manual recomendada

Antes de usar datos reales, conviene instalar en un usuario limpio, importar una hoja propia, abrir PDF/Excel en Vista Previa y Numbers/Excel, crear y restaurar un respaldo y comprobar el flujo de recuperación. La lista detallada está en `ACEPTACION_MAC.md`.
