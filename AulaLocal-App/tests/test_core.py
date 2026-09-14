import sqlite3,time
from decimal import Decimal
import pytest
from aulalocal.core import Store,AppError
from conftest import PASSWORD,student,staff,menu,receipt,expense

def test_persistence_and_school_config(store):
    rid=store.save_record('students',1,student())
    store.save_settings({'centro':'Centro editable','director':'Director editable'})
    other=Store(store.root)
    try:
        other.login('director',PASSWORD)
        assert other.record('students',1,rid)['data']['nombre']=='María de Prueba'
        assert other.settings()['centro']=='Centro editable'
    finally:other.close()

def test_year_isolation_and_copies(store):
    rid=store.save_record('students',1,student());store.save_record('expenses',1,expense())
    y=store.create_year('2027-2028','2027-08-01','2028-07-31')
    assert store.list_records('students',y)==[]
    with pytest.raises(AppError):store.record('students',y,rid)
    assert store.copy_people(1,y,'students')==1
    assert store.copy_people(1,y,'students')==0
    assert store.list_records('expenses',y)==[]
    r=store.list_records('students',y)[0];d=r['data'];d['grado']='2.º secundaria'
    store.save_record('students',y,d,r['id'],r['version'])
    assert store.record('students',1,rid)['data']['grado']=='1.º secundaria'

def test_freeze_db_and_service_and_reopen(store):
    rid=store.save_record('students',1,student())
    store.transition(1,'congelado','Cierre del año escolar',PASSWORD)
    with pytest.raises(AppError):store.save_record('students',1,student('E002'))
    with pytest.raises(sqlite3.IntegrityError):
        with store.db:store.db.execute('UPDATE records SET updated_at=? WHERE id=?',('x',rid))
    with pytest.raises(AppError):store.transition(1,'abierto','Corrección autorizada','incorrecta')
    store.transition(1,'archivado','Archivo del año escolar',PASSWORD)
    with pytest.raises(AppError):store.transition(1,'abierto','Reapertura autorizada',PASSWORD)
    store.transition(1,'congelado','Revisión del archivo histórico',PASSWORD)
    store.transition(1,'abierto','Reapertura autorizada',PASSWORD)
    store.save_record('students',1,student('E002'))
    assert len(store.list_records('students',1))==2

def test_duplicate_and_optimistic_concurrency(store):
    rid=store.save_record('students',1,student())
    with pytest.raises(AppError):store.save_record('students',1,student())
    r=store.record('students',1,rid);d=r['data'];d['nombre']='Nombre corregido'
    store.save_record('students',1,d,rid,r['version'])
    with pytest.raises(AppError):store.save_record('students',1,d,rid,r['version'])
    assert any('María de Prueba' in a['detail'] for a in store.audit())

@pytest.mark.parametrize('role,allowed,denied',[('alimentacion','menus','students'),('contabilidad','expenses','staff'),('secretaria','students','expenses')])
def test_roles(store,role,allowed,denied):
    store.save_user(role,'Usuario prueba',role,PASSWORD);store.login(role,PASSWORD)
    assert store.list_records(allowed,1)==[]
    with pytest.raises(AppError):store.list_records(denied,1)
    with pytest.raises(AppError):store.create_year('2027-2028','2027-08-01','2028-07-31')

def test_read_only_and_expiry(store):
    store.save_user('consulta','Consulta','consulta',PASSWORD);store.login('consulta',PASSWORD)
    with pytest.raises(AppError):store.save_record('students',1,student())
    store.last_active=time.monotonic()-901
    with pytest.raises(AppError):store.years()

def test_lockout_and_no_plaintext_password(store):
    for _ in range(5):
        with pytest.raises(AppError):store.login('director','incorrecta')
    with pytest.raises(AppError,match='bloqueada'):store.login('director',PASSWORD)
    row=store.db.execute('SELECT password_hash,salt FROM users').fetchone()
    assert len(row['password_hash'])==32 and len(row['salt'])==16
    assert PASSWORD.encode() not in store.path.read_bytes()

def test_attendance_reference_and_duplicate(store):
    pid=store.save_record('staff',1,staff());a=dict(personal=pid,fecha='2026-09-01',estado='Presente',entrada='08:00',salida='16:00')
    store.save_record('attendance',1,a)
    with pytest.raises(AppError):store.save_record('attendance',1,a)
    y=store.create_year('2027-2028','2027-08-01','2028-07-31');a['fecha']='2027-09-01'
    with pytest.raises(AppError):store.save_record('attendance',y,a)

def test_food_menu_quantities_and_dashboard(store):
    mid=store.save_record('menus',1,menu());rid=store.save_record('receipts',1,receipt(mid))
    assert store.dashboard(1)['Almuerzo · unidades aceptadas']==118
    bad=receipt(mid);bad['rechazadas']='121'
    with pytest.raises(AppError):store.save_record('receipts',1,bad)
    bad=receipt(mid);bad['servicio']='Leche'
    with pytest.raises(AppError):store.save_record('receipts',1,bad)
    r=store.record('receipts',1,rid);r['data']['estado']='Anulado';store.save_record('receipts',1,r['data'],rid,r['version'])
    assert store.dashboard(1)['Almuerzo · unidades aceptadas']==0

def test_exact_money_and_no_invalid_amount(store):
    store.save_record('expenses',1,expense('0.10'));store.save_record('expenses',1,expense('0.20'))
    assert store.dashboard(1)['Gastos RD$']=='0.30'
    for amount in ['-1','NaN','Infinity','12.345','1,000','0']:
        with pytest.raises(AppError):store.save_record('expenses',1,expense(amount))

def test_dates_enforced(store):
    for d in ['2026-07-31','2027-08-01','2026-99-01']:
        s=student();s['fecha']=d
        with pytest.raises(AppError):store.save_record('students',1,s)

def test_attachments_and_frozen_files(store,tmp_path):
    from PIL import Image
    p=tmp_path/'evidencia.png';Image.new('RGB',(8,8),'blue').save(p)
    rid=store.save_record('students',1,student());aid=store.attach('students',1,rid,p)
    assert store.attachment_bytes('students',1,rid,aid)==p.read_bytes()
    bad=tmp_path/'falso.pdf';bad.write_text('no PDF')
    with pytest.raises(AppError):store.attach('students',1,rid,bad)
    store.transition(1,'congelado','Cierre de prueba formal',PASSWORD)
    with pytest.raises(AppError):store.attach('students',1,rid,p)
    assert store.attachments('students',1,rid)[0]['name']=='evidencia.png'

def test_audit_cannot_be_deleted(store):
    with pytest.raises(sqlite3.IntegrityError):
        with store.db:store.db.execute('DELETE FROM audit')

def test_last_admin_cannot_disable_self(store):
    with pytest.raises(AppError):store.save_user('director','Director','consulta',user_id=store.user['id'])
