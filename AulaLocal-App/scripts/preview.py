"""Evidencia visual con datos ficticios; nunca se ejecuta al iniciar la app."""
import sys,tempfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from PySide6.QtWidgets import QApplication
from aulalocal.core import Store
from aulalocal.ui import MainWindow,Form,STYLE
from aulalocal.catalog import MODULES
from aulalocal import reports

def main():
    out=Path(sys.argv[1] if len(sys.argv)>1 else 'docs/evidencias');out.mkdir(parents=True,exist_ok=True)
    app=QApplication([]);app.setStyle('Fusion');app.setStyleSheet(STYLE)
    with tempfile.TemporaryDirectory() as tmp:
        s=Store(tmp);s.bootstrap('direccion','Demostracion-2026','Dirección de muestra','Centro Educativo de Demostración');s.create_year('2026-2027','2026-08-01','2027-07-31');s.save_settings({'centro':'Centro Educativo de Demostración','director':'Dirección de muestra','codigo':'00000'})
        for i,name in enumerate(['María Pérez de Prueba','José Ramírez de Prueba','Lucía Martínez de Prueba','Andrés Familia de Prueba']):
            s.save_record('students',1,dict(codigo=f'E00{i+1}',nombre=name,nacimiento='2013-02-10',sexo='Femenino' if i%2==0 else 'Masculino',tutor='Tutor de muestra',telefono='809-000-0000',nivel='Nivel Secundario',grado='1.º de Secundaria',seccion='A',fecha='2026-09-01',estado='Activo'))
        for i,name in enumerate(['Ana de Prueba','Carlos de Prueba']):
            sid=s.save_record('staff',1,dict(codigo=f'P00{i+1}',nombre=name,cargo='Docente',ingreso='2020-08-01',vinculo='Fijo',salario='30000.00',estado='Activo'))
            s.save_record('attendance',1,dict(personal=sid,fecha='2026-09-14',estado='Presente',entrada='07:45',salida='16:00'))
        for service in ['Leche','Pan','Almuerzo']:
            mid=s.save_record('menus',1,dict(nombre='Menú de muestra',ciclo='Semana 1',dia='Lunes',servicio=service,descripcion='Registro ficticio para probar la aplicación.',estado='Activo'))
            s.save_record('receipts',1,dict(fecha='2026-09-14',hora='11:30',servicio=service,menu=mid,suplidor='Suplidor de muestra',cantidad='120',rechazadas='2' if service=='Pan' else '0',responsable='Encargado de muestra',incidencias='Dos unidades rechazadas' if service=='Pan' else '',estado='Registrado'))
        s.save_record('expenses',1,dict(fecha='2026-09-14',concepto='Materiales para las aulas',categoria='Materiales',suplidor='Proveedor de muestra',monto='12741.30',pago='Efectivo',estado='Registrado'))
        s.save_record('facilities',1,dict(fecha='2026-09-14',area='Aula 1',condicion='Buena',hallazgo='Revisión preventiva',estado='Resuelto'))
        s.save_record('visits',1,dict(fecha='2026-09-14',hora_entrada='09:00',nombre='Supervisión distrital',institucion='Distrito educativo',motivo='Visita de acompañamiento',recibido_por='Dirección'))
        w=MainWindow(s);w.show();app.processEvents();w.grab().save(str(out/'01-direccion.png'))
        w.nav.setCurrentRow(w.keys.index('students'));app.processEvents();w.grab().save(str(out/'02-estudiantes.png'))
        w.nav.setCurrentRow(w.keys.index('settings'));app.processEvents();w.grab().save(str(out/'03-mi-centro.png'))
        w.nav.setCurrentRow(w.keys.index('receipts'));app.processEvents();w.grab().save(str(out/'04-alimentacion.png'))
        receipt_form=Form(w,'Registrar entrega diaria',MODULES['receipts'][1],{'fecha':'2026-09-14','hora':'11:30','servicio':'Almuerzo','menu':mid,'suplidor':'Suplidor de muestra','cantidad':'120','rechazadas':'0','responsable':'Encargado de muestra','incidencias':'','observaciones':'Entrega conforme','estado':'Registrado'},s,1);receipt_form.show();app.processEvents();receipt_form.grab().save(str(out/'05-entrega-diaria.png'));receipt_form.close()
        reports.report_pdf(s,'receipts',1,out/'reporte-alimentacion-muestra.pdf');reports.letter_pdf(s,'students',1,1,out/'certificacion-muestra.pdf')
        w.timer.stop();w.close();s.close()

if __name__=='__main__':main()
