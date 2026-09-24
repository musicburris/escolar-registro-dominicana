# Manual de AulaLocal

## Primer uso y acceso

Escriba el nombre del centro, nombre del director, usuario y una contraseña de al menos 12 caracteres. AulaLocal mostrará un código de recuperación: guárdelo impreso o en un lugar seguro fuera del Mac. No existen cuentas predeterminadas.

La opción **Mantener mi sesión iniciada** queda seleccionada por defecto. Cerrar la ventana no cierra la sesión; al abrir AulaLocal continuará donde estaba. Use **Cerrar sesión** cuando no quiera mantener el acceso. Si olvida el usuario o la contraseña, pulse **Olvidé mi usuario o contraseña**, escriba su código y defina datos nuevos. Tras recuperarse recibirá un código nuevo. Otra cuenta administradora también puede restablecer contraseñas.

El reloj mostrado corresponde a la fecha, hora y zona horaria configuradas en macOS. El Mac conserva su reloj mientras está apagado; AulaLocal vuelve a consultarlo al abrir. Si alguien cambia manualmente la hora del sistema, la aplicación reflejará ese cambio.

## Años escolares

El selector superior determina el año de todos los módulos. **Abierto** permite guardar; **Congelado** permite consultar y exportar; **Archivado** conserva el histórico. Solo Administración crea períodos, congela, archiva y reabre. Las transiciones exigen contraseña y motivo y quedan auditadas.

Para el año siguiente, créelo y use **Copiar matrículas o personal**. No se copian asistencias, gastos, alimentación ni adjuntos. El expediente anterior permanece intacto.

## Niveles, grados, secciones y edades

En **Niveles, grados y secciones**, Administración puede crear su propia estructura. Se incluyen inicialmente:

- Nivel Inicial: Kínder y Preprimario.
- Nivel Primario: 1.º a 6.º.
- Nivel Secundario: 1.º a 6.º.

Cada grado admite una edad mínima y máxima. Cada sección pertenece a un grado y año escolar y puede tener capacidad. Al registrar un estudiante, los selectores muestran únicamente combinaciones válidas. La ficha muestra edad actual, edad al inicio del año y el rango del grado; una edad fuera del rango se señala como información para revisión, sin impedir la matrícula.

## Importar estudiantes o personal desde Excel

Abra **Estudiantes** o **Personal**, pulse **Descargar plantilla**, complete las filas en Excel y luego pulse **Importar Excel**. También se admite CSV. AulaLocal reconoce encabezados comunes en español, fechas de Excel y variantes como `kinder`, `preprimario`, `primaria` o `secundaria`. Si la hoja no contiene nivel, grado o sección, el programa permite elegir un destino una sola vez para todas las filas.

La importación es completa o nula: si alguna fila contiene un error, no se guarda ninguna y se muestra qué debe corregirse. Los códigos vacíos se crean automáticamente. La plantilla evita tener que digitar estudiantes o empleados uno por uno.

## Estudiantes y personal

Estudiantes conserva identidad, nacimiento, tutor, contacto, salud, apoyos, nivel, grado, sección y matrícula anual. Personal registra identidad, cargo, vínculo, ingreso, salario, contacto e **ID del ponchador**. Este último debe coincidir con el número que genera el reloj biométrico. **Ver ficha** muestra el detalle y **Adjuntos** acepta PDF, JPG, PNG, Excel, Word o TXT de hasta 25 MB.

Asistencia usa personal del mismo año y permite presencia, ausencia, permiso, licencia o tardanza con horas de entrada y salida.

### Importar el ponchador

En **Asistencia**, pulse **Importar ponchador** y elija el Excel o CSV que exportó el reloj. AulaLocal reconoce reportes con una columna de fecha y hora o con fecha, entrada y salida separadas. Primero presenta una vista previa: número de marcaciones, días identificados, coincidencias y personas no reconocidas. Confirme únicamente después de revisarla.

La coincidencia se intenta por ID del ponchador, código de personal, documento y nombre. Si alguien aparece como no reconocido, abra su ficha de Personal, coloque el ID correcto y repita la importación. Volver a importar el mismo archivo actualiza o conserva el registro existente; no crea duplicados.

En **Configuración** se definen el horario de entrada, salida y minutos de gracia usados para determinar tardanzas. Al exportar Asistencia, seleccione el período. El PDF y el Excel incluyen resumen por empleado y detalle diario con llegada, salida, estado y horas trabajadas, listos para supervisión.

## Planta física y visitas

**Planta física** registra fecha, área, condición, hallazgo, acción correctiva, responsable, fecha límite y estado, con evidencia adjunta. **Visitas** registra persona, institución, documento, motivo, quién la recibió y horas de entrada/salida. Estos registros se incluyen en el año seleccionado y en sus exportaciones.

## Alimentación y gastos

Defina los menús por ciclo y luego registre cada recepción de **Leche**, **Pan** o **Almuerzo**. En **Tipos de alimentación** puede agregar otras categorías, como merienda, frutas o agua; aparecerán automáticamente en los menús, las recepciones, los filtros, el panel y los informes.

Desde un menú seleccionado puede pulsar **Registrar entrega**. Se abre un formulario diario con botones visibles para **Abrir calendario** y **Usar hora actual**. Complete suplidor, cantidad entregada, unidades rechazadas, responsable, incidencia o producto incorrecto y observaciones adicionales. **Eliminar menú** lo retira de las opciones nuevas, pero conserva las entregas, fotografías e informes históricos.

Al guardar una recepción, AulaLocal ofrece seleccionar una o varias fotos del alimento realmente entregado ese día. También puede abrir **Evidencias fotográficas**, añadir hasta 20 imágenes por lote, ver la galería ampliada y guardar una copia. Las fotos del menú son referencias; las fotos de la recepción constituyen la evidencia de esa fecha, servicio y suplidor. No se ofrece borrarlas desde la interfaz para proteger la auditoría.

Al exportar Alimentación, elija período, servicio y uno de estos formatos PDF:

- **Resumen y detalle**: tabla compacta por servicio y lista diaria.
- **Fichas por entrega**: una ficha legible por recepción, adecuada para expedientes de supervisión.

Puede incluir o excluir fotografías sin alterar los registros originales. Con fotos, el PDF crea una galería identificada por entrega; sin fotos, resulta más liviano para impresión rutinaria. El Excel incluye hojas **Resumen** y **Recepciones**, con cantidades aceptadas/rechazadas, incidencias y número de evidencias.

Gastos conserva concepto, categoría, suplidor, factura, monto y medio de pago. Un gasto anulado se conserva para auditoría y no suma en el panel. Es contabilidad interna básica, no contabilidad fiscal de doble partida.

## Reportes y documentos

Cada módulo exporta PDF y Excel. En Estudiantes puede seleccionar nivel, grado y sección antes de imprimir; así obtiene tanto el listado general como una lista exacta de una sección. **Detalle PDF** genera el expediente completo. Estudiantes y Personal permiten emitir certificaciones o constancias. Asistencia y Alimentación abren sus propios paneles de opciones para producir informes de supervisión. **Archivo histórico** produce un ZIP con JSON, Excel, estructura académica, auditoría y adjuntos del año. Ese ZIP no reemplaza una copia de seguridad.

## Copias y seguridad

Los respaldos `.aulabackup` se cifran con la contraseña elegida al crearlos. La restauración verifica el contenido antes de sustituir los datos y conserva una copia previa. El límite es 512 MB por respaldo completo.

Las contraseñas se guardan mediante derivación criptográfica; no se almacenan en texto. Cinco intentos fallidos bloquean la cuenta durante cinco minutos. La base activa se protege con los permisos del usuario de macOS; active FileVault para cifrado completo del disco. La auditoría registra accesos y cambios, pero el propietario administrador del Mac mantiene control físico sobre los archivos.
