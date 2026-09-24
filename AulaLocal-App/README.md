# AulaLocal 0.4.0

AulaLocal es una aplicación de gestión integral para centros educativos que funciona localmente en Mac Apple Silicon. Los datos, adjuntos, reportes y copias permanecen en el equipo; el uso cotidiano no necesita internet.

## Funciones incluidas

- Panel de Dirección con indicadores calculados desde los registros reales.
- Estudiantes por año escolar, nivel, grado y sección; edad actual, edad al inicio del ciclo y rango esperado.
- Catálogo académico editable: Nivel Inicial, Primario y Secundario precargados, con capacidad para crear otros grados y secciones.
- Importación masiva desde Excel o CSV para estudiantes y personal, con plantillas listas para completar.
- Personal, asistencia y control de entrada/salida, incluida importación de reportes Excel/CSV de ponchadores biométricos.
- Informes de supervisión de asistencia por período con resumen de presencia, tardanza, ausencia y horas trabajadas.
- Alimentación escolar: catálogo configurable (leche, pan, almuerzo y tipos propios), menús por ciclo, calendario visible, hora, suplidor, cantidades, incidencias, observaciones y varias fotografías por recepción.
- Registro directo de una entrega desde el menú seleccionado y eliminación controlada de menús sin destruir entregas históricas.
- Reportes de alimentación en formato resumen o fichas por entrega, con o sin fotografías, además de Excel detallado.
- Planta física y registro de visitantes.
- Gastos, facturas y adjuntos.
- PDF, Excel, certificaciones, constancias y archivo histórico por año.
- Años abiertos, congelados o archivados, sin mezclar información.
- Usuarios por rol, auditoría, código de recuperación local y sesión persistente hasta cerrar sesión explícitamente.
- Copias de seguridad cifradas y restauración local.
- Reloj y zona horaria tomados del sistema macOS.

## Instalación

Use `AulaLocal-0.4.0-arm64.dmg` y arrastre AulaLocal a Aplicaciones. La guía completa está en [docs/INSTALACION.md](docs/INSTALACION.md).

Documentos del proyecto:

- [Manual de uso](docs/MANUAL.md)
- [Arquitectura y seguridad](docs/ARQUITECTURA.md)
- [Pruebas realizadas](docs/PRUEBAS.md)
- [Lista de aceptación Mac](docs/ACEPTACION_MAC.md)

## Desarrollo y pruebas

```bash
python -m pip install -r requirements-build.txt
QT_QPA_PLATFORM=offscreen python -m pytest -q
```

`scripts/build_macos.sh` ejecuta las pruebas, crea la aplicación ARM64, verifica su arquitectura y firma, ejecuta una validación offline del bundle y genera DMG y PKG. Si se proporcionan credenciales Apple, también admite Developer ID y notarización; sin ellas aplica una firma técnica local.

Las capturas y documentos de prueba contienen exclusivamente datos ficticios. No existe una cuenta predeterminada. Las dependencias y licencias se describen en `THIRD_PARTY.md`.
