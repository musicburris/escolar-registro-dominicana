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
            store.bootstrap('admin', password, 'Dirección de prueba', 'Centro de validación')
            year = store.create_year('2026-2027', '2026-08-01', '2027-07-31')
            rid = store.save_record('students', year, {
                'codigo':'E001','nombre':'María de Validación','nacimiento':'2013-02-10',
                'sexo':'Femenino','tutor':'Tutor de prueba','telefono':'809-000-0000',
                'grado':'1.º secundaria','seccion':'A','fecha':'2026-09-01','estado':'Activo'})
            reports.record_pdf(store, 'students', year, rid, root/'expediente.pdf')
            reports.report_xlsx(store, 'students', year, root/'estudiantes.xlsx')
            create_backup(store, root/'copia.aulabackup', password)
            store.save_record('students', year, {
                'codigo':'E002','nombre':'Segundo Registro','nacimiento':'2013-02-10',
                'sexo':'Masculino','tutor':'Tutor de prueba','telefono':'809-000-0000',
                'grado':'1.º secundaria','seccion':'A','fecha':'2026-09-01','estado':'Activo'})
            restore_backup(store, root/'copia.aulabackup', password, password)
            store.login('admin', password)
            assert len(store.list_records('students', year)) == 1
            assert (root/'expediente.pdf').read_bytes().startswith(b'%PDF-')
            assert (root/'estudiantes.xlsx').read_bytes().startswith(b'PK')
            store.close()
            return {'status':'ok','arquitectura':__import__('platform').machine(),
                    'persistencia':True,'pdf':True,'excel':True,'respaldo':True,'sin_red':True}
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
