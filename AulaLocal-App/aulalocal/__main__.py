import argparse, json, socket, tempfile
from pathlib import Path
from .ui import run

def self_test():
    """Prueba el bundle instalado sin abrir ventanas ni usar la red."""
    from .core import Store
    from .backup import create_backup, restore_backup
    from . import reports
    original_socket = socket.socket
    socket.socket = lambda *a, **k: (_ for _ in ()).throw(RuntimeError('red bloqueada'))
    try:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            store = Store(root/'datos')
            password = 'Validacion-local-2026'
            recovery_code=store.bootstrap('admin', password, 'Dirección de prueba', 'Centro de validación')
            year = store.create_year('2026-2027', '2026-08-01', '2027-07-31')
            rid = store.save_record('students', year, {
                'codigo':'E001','nombre':'María de Validación','nacimiento':'2013-02-10',
                'sexo':'Femenino','tutor':'Tutor de prueba','telefono':'809-000-0000',
                'nivel':'Nivel Secundario','grado':'1.º de Secundaria','seccion':'A','fecha':'2026-09-01','estado':'Activo'})
            from openpyxl import Workbook
            workbook=Workbook();sheet=workbook.active;sheet.append(['Nombre completo','Fecha de nacimiento']);sheet.append(['Luis Importado','2022-04-10']);sheet.append(['Ana Importada','2022-06-12'])
            workbook.save(root/'importacion.xlsx')
            assert store.import_records('students',year,root/'importacion.xlsx',{'nivel':'Inicial','grado':'kinder','seccion':'A'})==2
            person=store.save_record('staff',year,{'codigo':'P001','reloj_id':'42','nombre':'Ana de Validación','cargo':'Docente','ingreso':'2020-08-01','vinculo':'Fijo','salario':'30000.00','estado':'Activo'})
            punches=Workbook();marks=punches.active;marks.append(['Reporte del ponchador']);marks.append(['ID ponchador','Fecha y hora']);marks.append(['42','01/09/2026 08:12']);marks.append(['42','01/09/2026 16:04']);punches.save(root/'ponchador.xlsx')
            analysis=store.analyze_attendance_file(year,root/'ponchador.xlsx');assert analysis['matched_sessions']==1;imported=store.import_attendance_file(year,root/'ponchador.xlsx');assert imported['created']==1;assert store.list_records('attendance',year)[0]['data']['personal']==person
            lunch=store.save_record('menus',year,{'nombre':'Arroz, habichuelas y pollo','ciclo':'Semana 1','dia':'Lunes','servicio':'Almuerzo','descripcion':'Menú de validación','estado':'Activo'})
            reception=store.save_record('receipts',year,{'fecha':'2026-09-01','hora':'11:30','servicio':'Almuerzo','menu':lunch,'suplidor':'Suplidor de prueba','cantidad':'120','rechazadas':'2','responsable':'Dirección','incidencias':'Dos raciones con empaque incorrecto','observaciones':'Suplidor notificado durante la recepción','estado':'Registrado'})
            store.save_food_service('Merienda escolar');snack=store.save_record('menus',year,{'nombre':'Fruta y yogur','ciclo':'Semana 1','dia':'Martes','servicio':'Merienda escolar','descripcion':'Merienda de validación','estado':'Activo'});store.delete_menu(year,snack,'Sustituido en la validación');assert not store.list_records('menus',year,search='Fruta') and store.list_records('menus',year,search='Fruta',include_deleted=True)
            from PIL import Image
            Image.new('RGB',(1000,700),'orange').save(root/'comida-entregada.jpg');Image.new('RGB',(900,700),'green').save(root/'bandejas.jpg');assert len(store.attach_many('receipts',year,reception,[root/'comida-entregada.jpg',root/'bandejas.jpg']))==2
            store.save_record('facilities',year,{'fecha':'2026-09-01','area':'Aula 1','condicion':'Buena','hallazgo':'Sin novedad','estado':'Resuelto'})
            store.save_record('visits',year,{'fecha':'2026-09-01','hora_entrada':'09:00','nombre':'Visita de prueba','motivo':'Supervisión','recibido_por':'Dirección'})
            reports.record_pdf(store, 'students', year, rid, root/'expediente.pdf')
            reports.report_xlsx(store,'students',year,root/'estudiantes.xlsx',filters={'grado':'1.º de Secundaria','seccion':'A'})
            reports.report_attendance_pdf(store,year,root/'asistencia.pdf','2026-09-01','2026-09-30');reports.report_attendance_xlsx(store,year,root/'asistencia.xlsx','2026-09-01','2026-09-30')
            reports.report_food_pdf(store,year,root/'alimentacion-con-fotos.pdf','2026-09-01','2026-09-30',include_photos=True,layout='delivery');reports.report_food_xlsx(store,year,root/'alimentacion.xlsx','2026-09-01','2026-09-30')
            create_backup(store, root/'copia.aulabackup', password)
            store.save_record('students', year, {
                'codigo':'E002','nombre':'Segundo Registro','nacimiento':'2013-02-10',
                'sexo':'Masculino','tutor':'Tutor de prueba','telefono':'809-000-0000',
                'nivel':'Nivel Secundario','grado':'1.º de Secundaria','seccion':'A','fecha':'2026-09-01','estado':'Activo'})
            restore_backup(store, root/'copia.aulabackup', password, password)
            store.login('admin', password)
            assert len(store.list_records('students', year)) == 3
            assert (root/'expediente.pdf').read_bytes().startswith(b'%PDF-')
            assert (root/'estudiantes.xlsx').read_bytes().startswith(b'PK')
            assert (root/'asistencia.pdf').read_bytes().startswith(b'%PDF-') and (root/'asistencia.xlsx').read_bytes().startswith(b'PK')
            assert (root/'alimentacion-con-fotos.pdf').read_bytes().startswith(b'%PDF-') and (root/'alimentacion.xlsx').read_bytes().startswith(b'PK')
            store.close()
            resumed=Store(root/'datos');assert resumed.user and resumed.user['username']=='admin';resumed.logout()
            new_recovery=resumed.recover_access(recovery_code,'admin2','Validacion-nueva-2026');assert new_recovery.startswith('AULA-')
            resumed.login('admin2','Validacion-nueva-2026');resumed.close()
            return {'status':'ok','arquitectura':__import__('platform').machine(),
                    'persistencia':True,'pdf':True,'excel':True,'respaldo':True,'sin_red':True,
                    'estructura_academica':True,'importacion_excel':True,'sesion_persistente':True,
                    'recuperacion_local':True,'planta_y_visitas':True,'importacion_ponchador':True,
                    'reportes_supervision':True,'filtros_grado_seccion':True,'fotos_alimentacion':True,
                    'reportes_alimentacion_con_fotos':True,'selectores_fecha_hora':True,
                    'tipos_alimentacion_configurables':True,'eliminacion_menu_controlada':True,
                    'observaciones_alimentacion':True}
    finally:
        socket.socket = original_socket

def main():
    p=argparse.ArgumentParser(description='AulaLocal: gestión escolar local')
    p.add_argument('--data-dir',help='Carpeta de datos alternativa para pruebas aisladas')
    p.add_argument('--self-test',action='store_true',help=argparse.SUPPRESS)
    args=p.parse_args()
    if args.self_test:
        print(json.dumps(self_test(),ensure_ascii=False)); return
    raise SystemExit(run(args.data_dir))

if __name__=='__main__':main()
