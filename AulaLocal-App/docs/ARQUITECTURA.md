# Arquitectura y seguridad

AulaLocal 0.4.0 es una aplicación de escritorio Qt/PySide6 empaquetada como aplicación macOS ARM64. No contiene servidor web, telemetría, API externa, sincronización ni dependencia de servicios en línea. La aplicación empaquetada incluye su intérprete y bibliotecas.

## Componentes

- `ui.py`: interfaz, formularios, navegación y diálogos nativos de archivos.
- `catalog.py`: campos, módulos y permisos.
- `core.py`: reglas, autenticación, años, estructura académica, importación y auditoría.
- `punch.py`: lector local tolerante de Excel/CSV de ponchadores y normalización de marcaciones.
- `schema.sql`: esquema SQLite versión 2, índices, restricciones y bloqueos históricos.
- `backup.py`: respaldo cifrado, validación y restauración atómica.
- `reports.py`: PDF, Excel, constancias y archivo histórico.

## Datos y migración

SQLite es apropiado para una aplicación local de un centro: ofrece transacciones ACID, claves foráneas, WAL, `synchronous=FULL` y respaldo consistente sin administrar un servidor. Cada registro operativo lleva `year_id`; las consultas, secciones, adjuntos y reportes verifican el año para evitar mezcla entre ciclos.

La versión 2 agrega tablas normalizadas para niveles, grados, rangos de edad, secciones, sesiones y recuperación. Los expedientes operativos continúan como JSON validado para mantener formularios extensibles. Al abrir una base versión 1, una migración transaccional conserva registros y adjuntos, elimina la antigua limitación de tipos y normaliza los grados reconocibles. Las versiones futuras desconocidas se rechazan en vez de abrirse de forma insegura.

Los adjuntos se guardan dentro de SQLite con SHA-256, hasta 25 MB por archivo. Se admiten lotes de hasta 20 evidencias, validados antes de una inserción atómica. Las fotos de alimentación quedan asociadas a la recepción exacta y no se eliminan desde la interfaz para preservar la trazabilidad. Esto facilita copias completas, aunque no sustituye un gestor documental para archivos multimedia masivos. La base activa no debe colocarse en iCloud, Dropbox, red o volumen compartido.

El importador de ponchadores trabaja completamente en el equipo. Reconoce encabezados frecuentes, detecta fecha/hora combinada o columnas separadas, agrupa marcaciones por persona y día y enlaza por ID del reloj, código, documento o nombre. La vista previa informa las personas no reconocidas antes de confirmar; una importación repetida no duplica asistencias.

## Acceso y recuperación

Las contraseñas usan PBKDF2-HMAC-SHA256, sal aleatoria y 600 000 iteraciones. Una sesión persistente usa un token aleatorio: solo su hash queda en SQLite y el token se guarda con permisos privados en la carpeta del usuario. Cerrar sesión revoca y elimina ambos. Desactivar una cuenta invalida el acceso al comprobar cada operación.

La recuperación sin nube usa un código aleatorio de alta entropía mostrado al administrador. La base conserva únicamente su hash. Al usarlo se cambia usuario/contraseña, se revocan sesiones y se rota el código. No se implementa correo porque eso rompería el funcionamiento completamente offline y exigiría un servicio externo. Otra cuenta administradora puede restablecer la contraseña de un usuario.

Roles: Administración, Dirección, Secretaría, Alimentación, Contabilidad y Consulta. Las transiciones de año requieren reautenticación y motivo. La auditoría registra accesos, cambios, adjuntos, importaciones y exportaciones en UTC; la interfaz muestra la hora local del Mac.

## Respaldo y cifrado

Los `.aulabackup` usan AES-256-GCM y scrypt con sal y nonce aleatorios. La restauración valida estructura, integridad SQLite, relaciones y hashes antes de reemplazar la base, y conserva una copia previa. El formato completo admite hasta 512 MB.

La base activa no usa SQLCipher. Su confidencialidad en reposo depende de los permisos de macOS y FileVault. Esto evita distribuir una extensión criptográfica adicional, pero debe comunicarse claramente: un administrador del Mac conserva acceso físico a los datos.

## Empaquetado macOS

El build oficial tiene arquitectura ARM64 y objetivo mínimo macOS 12. PyInstaller crea el bundle; `lipo` verifica ARM64; `codesign` comprueba el sellado; el ejecutable realiza una prueba offline dentro del bundle. Sin credenciales privadas de Apple se usa firma local ad hoc y Gatekeeper puede pedir **Abrir** en el primer inicio. Con certificados del propietario, el mismo script admite Developer ID, hardened runtime, notarización y stapling.

## Límites conocidos

Las tablas se cargan por año y los respaldos/exportaciones grandes se ejecutan en el hilo de interfaz. Para cientos de miles de filas se necesitarían paginación y tareas en segundo plano. Los formatos desconocidos de ponchador pueden requerir ajustar los encabezados en Excel. No hay colaboración simultánea entre varios equipos, contabilidad fiscal de doble partida, nómina ni envío de correo. Estas exclusiones evitan prometer funciones que esta entrega no implementa.
