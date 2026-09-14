import io,zipfile,socket
from pathlib import Path
import pytest
from openpyxl import load_workbook
from pypdf import PdfReader
from aulalocal.core import AppError
from aulalocal.backup import create_backup,restore_backup
from aulalocal import reports
from conftest import PASSWORD,student,staff,expense

def test_backup_round_trip_with_attachments(store,tmp_path):
    rid=store.save_record('students',1,student());pdf=tmp_path/'expediente.pdf';reports.record_pdf(store,'students',1,rid,pdf);aid=store.attach('students',1,rid,pdf)
    backup=tmp_path/'copia.aulabackup';create_backup(store,backup,PASSWORD)
    assert not backup.read_bytes().startswith(b'SQLite')
    assert b'Mar' not in backup.read_bytes()[:32]
    store.save_record('students',1,student('E002'))
    recovery=restore_backup(store,backup,PASSWORD,PASSWORD)
    assert recovery.exists() and store.user is None
    store.login('director',PASSWORD);assert len(store.list_records('students',1))==1
    assert store.attachment_bytes('students',1,rid,aid)==pdf.read_bytes()

def test_wrong_password_and_tamper_leave_current_data(store,tmp_path):
    store.save_record('students',1,student());backup=tmp_path/'copia.aulabackup';create_backup(store,backup,PASSWORD)
    with pytest.raises(AppError):restore_backup(store,backup,'contraseña-falsa',PASSWORD)
    raw=bytearray(backup.read_bytes());raw[-1]^=1;backup.write_bytes(raw)
    with pytest.raises(AppError):restore_backup(store,backup,PASSWORD,PASSWORD)
    assert len(store.list_records('students',1))==1

def test_backup_permission(store,tmp_path):
    store.save_user('lector','Lector','consulta',PASSWORD);store.login('lector',PASSWORD)
    with pytest.raises(AppError):create_backup(store,tmp_path/'copy',PASSWORD)

def test_pdf_xlsx_and_formula_injection_offline(store,tmp_path,monkeypatch):
    def no_network(*a,**kw):raise AssertionError('La aplicación intentó usar internet')
    monkeypatch.setattr(socket,'socket',no_network)
    rid=store.save_record('students',1,student(name='=HYPERLINK("https://ejemplo.test")'))
    path=tmp_path/'reporte.xlsx';reports.report_xlsx(store,'students',1,path)
    wb=load_workbook(path);assert wb.active['B4'].data_type=='s';assert wb.active['B4'].value.startswith('=HYPERLINK')
    pdf=tmp_path/'reporte.pdf';reports.report_pdf(store,'students',1,pdf)
    assert len(PdfReader(pdf).pages)>=1 and '2026-2027' in PdfReader(pdf).pages[0].extract_text()
    letter=tmp_path/'constancia.pdf';reports.letter_pdf(store,'students',1,rid,letter)
    assert 'CERTIFICACI' in PdfReader(letter).pages[0].extract_text()

def test_excel_money_and_filter(store,tmp_path):
    store.save_record('expenses',1,expense('10.25'));store.save_record('expenses',1,{**expense('99.00'),'concepto':'Otro'})
    path=tmp_path/'gastos.xlsx';reports.report_xlsx(store,'expenses',1,path,'Materiales de prueba')
    ws=load_workbook(path).active
    assert ws.max_row==4;assert ws['F4'].value==10.25;assert ws['F4'].data_type=='n'

def test_frozen_institution_preserved(store,tmp_path):
    store.save_record('students',1,student());store.transition(1,'congelado','Cierre autorizado del año',PASSWORD)
    store.save_settings({'centro':'Nombre nuevo','director':'Director nuevo'})
    assert reports.institution(store,1)['centro']=='Centro de prueba'

def test_year_archive_contains_only_selected_year(store,tmp_path):
    store.save_record('students',1,student());y=store.create_year('2027-2028','2027-08-01','2028-07-31');store.copy_people(1,y,'students')
    z=tmp_path/'año.zip';reports.export_year(store,1,z)
    with zipfile.ZipFile(z) as archive:
        assert 'students.xlsx' in archive.namelist()
        assert '2027-2028' not in archive.read('año.json').decode()
        assert '2027-08-01' not in archive.read('students.json').decode()

def test_long_text_pdf_paginates(store,tmp_path):
    d=expense();d['concepto']='Observación extensa. '*400;store.save_record('expenses',1,d)
    path=tmp_path/'largo.pdf';reports.report_pdf(store,'expenses',1,path)
    assert len(PdfReader(path).pages)>1

def test_export_cannot_overwrite_active_database(store):
    store.save_record('students',1,student())
    with pytest.raises(AppError):reports.report_pdf(store,'students',1,store.path)
    assert len(store.list_records('students',1))==1
