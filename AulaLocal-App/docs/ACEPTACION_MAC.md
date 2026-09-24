# Aceptación pendiente en Mac Apple Silicon

Estado de toda esta lista: PENDIENTE. Las pruebas Linux no sustituyen la aceptación macOS.

1. Compilar en Mac ARM64; comprobar `lipo`, firma y versión mínima. Verificar M1 con macOS 12 y una versión reciente de macOS en Apple Silicon posterior.
2. Instalar el DMG/PKG en un usuario limpio sin Python ni dependencias de desarrollo.
3. Desconectar Wi-Fi y cualquier conexión de red antes del primer inicio. Configurar el centro, acceder y cerrar.
4. Reabrir sin internet: verificar persistencia de centro, cuentas y registros.
5. Completar estudiante, personal, los tres servicios de alimentación (Leche, Pan y Almuerzo) y gasto con factura. En cada recepción, comprobar calendario, hora, cantidad y varias fotografías.
6. Importar un Excel real del ponchador; revisar la vista previa, personas no reconocidas, entradas, salidas, tardanzas e importación repetida sin duplicados.
7. Imprimir listados de estudiantes por nivel, grado y sección e informes del personal. Generar asistencia por período y abrir las hojas Resumen y Detalle en Excel/Numbers.
8. Generar alimentación en PDF resumen sin fotos, resumen con fotos y fichas por entrega con fotos; verificar además el Excel de dos hojas. Imprimir mediante Vista Previa y comprobar acentos, cantidades, fechas y saltos de página.
9. Crear segundo año, copiar matrículas, cambiar grado y verificar que el anterior permanece intacto.
10. Congelar y archivar; intentar guardar desde formularios ya abiertos; comprobar rechazo y auditoría. Reabrir con contraseña y motivo.
11. Crear respaldo en disco externo; alterar una copia y comprobar rechazo. Restaurar la válida y comparar campos y adjuntos; comprobar acceso con cuentas restauradas.
12. Comprobar roles, bloqueo tras cinco fallos, sesión persistente tras cerrar y abrir, cierre de sesión explícito y recuperación con código local.
13. Forzar cierre durante escritura y repetir con volumen de prueba; comprobar integridad al reiniciar. No usar datos reales en esta prueba.
14. Revisar rendimiento con el volumen esperado de un centro y medir tiempo/memoria de respaldos de 100–500 MB. La UI actual ejecuta respaldos sin hilo de fondo.
15. Validar firma Developer ID, notarización, instalación con Gatekeeper activo y ausencia de dependencias de Rosetta.
16. Actualizar el documento de resultados con modelo de Mac, macOS, versión de app, fecha y evidencias. Solo entonces promover la versión a distribución de producción.
