import os
os.environ.setdefault('QT_QPA_PLATFORM','offscreen')
import pytest
from aulalocal.core import Store

PASSWORD='Prueba-segura-2026'
@pytest.fixture
def store(tmp_path):
    s=Store(tmp_path/'data');s.bootstrap('director',PASSWORD,'Directora de prueba','Centro de prueba')
    s.create_year('2026-2027','2026-08-01','2027-07-31')
    yield s
    s.close()

def student(code='E001',name='María de Prueba'):
    return dict(codigo=code,nombre=name,nacimiento='2013-02-10',sexo='Femenino',tutor='Tutor de prueba',telefono='809-000-0000',nivel='Nivel Secundario',grado='1.º de Secundaria',seccion='A',fecha='2026-09-01',estado='Activo')
def staff():
    return dict(codigo='P001',nombre='Ana de Prueba',cargo='Docente',ingreso='2020-08-01',vinculo='Fijo',salario='30000.00',estado='Activo')
def menu(service='Almuerzo'):
    return dict(nombre='Arroz, habichuelas y pollo',ciclo='Semana 1',dia='Lunes',servicio=service,descripcion='Menú de prueba. No es una prescripción de INABIE.',estado='Activo')
def receipt(mid):
    return dict(fecha='2026-09-01',hora='11:30',servicio='Almuerzo',menu=mid,suplidor='Suplidor de prueba',cantidad='120',rechazadas='2',responsable='Encargado de prueba',incidencias='Dos raciones rechazadas',estado='Registrado')
def expense(amount='100.25'):
    return dict(fecha='2026-09-01',concepto='Materiales de prueba',categoria='Materiales',suplidor='Proveedor de prueba',monto=amount,pago='Efectivo',estado='Registrado')
