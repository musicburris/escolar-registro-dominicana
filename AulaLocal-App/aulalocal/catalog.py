"""Definiciones compartidas por validación, formularios y reportes."""
from dataclasses import dataclass

@dataclass(frozen=True)
class Field:
    key: str
    label: str
    type: str = 'text'
    required: bool = False
    options: tuple = ()

F = Field
MODULES = {
 'students': ('Estudiantes', [
 F('codigo','Código del estudiante',required=True),F('nombre','Nombres y apellidos',required=True),
 F('nacimiento','Fecha de nacimiento','date',True),F('sexo','Sexo','choice',True,('Femenino','Masculino','No especificado')),
 F('documento','Documento de identidad'),F('nacionalidad','Nacionalidad'),F('direccion','Dirección'),
 F('tutor','Padre, madre o tutor',required=True),F('parentesco','Parentesco'),F('telefono','Teléfono del tutor',required=True),
 F('emergencia','Contacto de emergencia'),F('salud','Alergias y condiciones de salud','long'),F('apoyos','Necesidades de apoyo','long'),
 F('nivel','Nivel educativo','level_ref',True),F('grado','Grado','grade_ref',True),F('seccion','Sección','section_ref',True),F('fecha','Fecha de matrícula','date',True),
 F('estado','Estado','choice',True,('Activo','Retirado','Trasladado','Egresado')),F('notas','Observaciones del expediente','long')]),
 'staff': ('Personal', [F('codigo','Código del personal',required=True),F('reloj_id','ID del ponchador'),F('nombre','Nombres y apellidos',required=True),
 F('documento','Cédula / documento'),F('cargo','Cargo',required=True),F('telefono','Teléfono'),F('direccion','Dirección'),
 F('ingreso','Fecha de ingreso','date',True),F('vinculo','Vínculo laboral','choice',True,('Fijo','Contratado','Temporal')),
 F('salario','Salario mensual RD$','money',True),F('estado','Estado','choice',True,('Activo','Inactivo')),F('notas','Observaciones','long')]),
 'attendance': ('Asistencia', [F('personal','Personal','staff_ref',True),F('fecha','Fecha','date',True),
 F('estado','Asistencia','choice',True,('Presente','Ausente','Permiso','Licencia','Tardanza')),
 F('entrada','Hora de entrada','time'),F('salida','Hora de salida','time'),F('notas','Justificación','long')]),
 'menus': ('Menús por ciclo', [F('nombre','Nombre del menú',required=True),F('ciclo','Ciclo / semana',required=True),
 F('dia','Día del ciclo',required=True),F('servicio','Tipo de alimentación','food_service_ref',True),
 F('descripcion','Alimentos del menú','long',True),F('estado','Estado','choice',True,('Activo','Inactivo'))]),
 'receipts': ('Alimentación escolar', [F('fecha','Fecha de recepción','date',True),F('hora','Hora de recepción','time',True),
 F('servicio','Tipo de alimentación','food_service_ref',True),F('menu','Menú del ciclo','menu_ref',True),
 F('suplidor','Suplidor',required=True),F('cantidad','Cantidad recibida','integer',True),F('rechazadas','Unidades rechazadas','integer',True),
 F('responsable','Recibido por',required=True),F('incidencias','Incidencia, diferencia o producto incorrecto','long'),
 F('observaciones','Observaciones adicionales','long'),
 F('estado','Estado','choice',True,('Registrado','Anulado'))]),
 'expenses': ('Gastos y facturas', [F('fecha','Fecha del gasto','date',True),F('concepto','Concepto',required=True),
 F('categoria','Categoría','choice',True,('Materiales','Servicios','Mantenimiento','Transporte','Alimentación','Otros')),
 F('suplidor','Suplidor / beneficiario',required=True),F('factura','Número de factura'),F('monto','Monto RD$','money',True),
 F('pago','Forma de pago','choice',True,('Efectivo','Transferencia','Cheque')),F('referencia','Referencia del pago'),
 F('estado','Estado','choice',True,('Registrado','Anulado')),F('notas','Observaciones','long')])
 ,'facilities': ('Planta física', [F('fecha','Fecha de inspección','date',True),F('area','Área o espacio',required=True),
 F('condicion','Condición','choice',True,('Excelente','Buena','Regular','Mala','Crítica')),F('hallazgo','Hallazgos','long',True),
 F('accion','Acción requerida','long'),F('responsable','Responsable del seguimiento'),F('fecha_limite','Fecha límite','date'),
 F('estado','Estado','choice',True,('Pendiente','En proceso','Resuelto'))])
 ,'visits': ('Visitas', [F('fecha','Fecha','date',True),F('hora_entrada','Hora de entrada','time',True),F('hora_salida','Hora de salida','time'),
 F('nombre','Nombre del visitante',required=True),F('institucion','Institución / procedencia'),F('documento','Documento de identidad'),
 F('motivo','Motivo de la visita','long',True),F('recibido_por','Recibido por',required=True),F('observaciones','Observaciones','long')])
}
ROLES={'admin':'Administrador','direccion':'Dirección','secretaria':'Secretaría','alimentacion':'Alimentación','contabilidad':'Contabilidad','consulta':'Consulta general'}
ACCESS={
 'admin':set(MODULES),'direccion':set(MODULES),'secretaria':{'students','staff','attendance','visits'},
 'alimentacion':{'menus','receipts'},'contabilidad':{'expenses'},'consulta':set(MODULES)
}
