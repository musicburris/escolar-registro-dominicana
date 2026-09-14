"""Documentos y exportaciones generados localmente, sin plantillas remotas."""
import io, json, zipfile
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from xml.sax.saxutils import escape
import reportlab
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
from .catalog import MODULES
from .core import AppError
from .backup import atomic_write

FONT_DIR=Path(reportlab.__file__).parent/'fonts'
pdfmetrics.registerFont(TTFont('AulaSans',str(FONT_DIR/'Vera.ttf')))
pdfmetrics.registerFont(TTFont('AulaSans-Bold',str(FONT_DIR/'VeraBd.ttf')))
pdfmetrics.registerFontFamily('AulaSans',normal='AulaSans',bold='AulaSans-Bold',italic='AulaSans',boldItalic='AulaSans-Bold')
BLUE=colors.HexColor('#183849')
STYLES=getSampleStyleSheet()
for name in STYLES.byName:
    STYLES[name].fontName='AulaSans-Bold' if name.startswith('Heading') or name=='Title' else 'AulaSans'
STYLES.add(ParagraphStyle(name='CellAula',fontName='AulaSans',fontSize=8,leading=11,spaceAfter=0,wordWrap='CJK'))
STYLES.add(ParagraphStyle(name='LetterAula',fontName='AulaSans',fontSize=11,leading=18,spaceAfter=14))

def p(text,style='BodyText'): return Paragraph(escape(str(text)).replace('\n','<br/>'),STYLES[style])
def institution(store,year):
    y=store.year(year)
    frozen=json.loads(y.get('institution','{}'))
    return frozen or store.settings()

def title_block(store,year,title):
    s=institution(store,year); y=store.year(year)
    return [p(s.get('centro',''),'Title'),p(f"Código: {s.get('codigo','')} · Año escolar {y['label']} · {y['status']}",'Normal'),Spacer(1,16),p(title,'Heading1'),p(f'Fecha de emisión: {date.today().strftime("%d/%m/%Y")}','Normal'),Spacer(1,18)]
def footer(canvas,doc):
    canvas.saveState(); canvas.setStrokeColor(colors.HexColor('#d9e2e8')); canvas.line(36,34,doc.pagesize[0]-36,34)
    canvas.setFont('AulaSans',8); canvas.setFillColor(BLUE)
    canvas.drawString(36,22,'AulaLocal · Registro institucional'); canvas.drawRightString(doc.pagesize[0]-36,22,f'Página {doc.page}'); canvas.restoreState()
def pdf_bytes(story,wide=False):
    out=io.BytesIO(); doc=SimpleDocTemplate(out,pagesize=landscape(A4) if wide else A4,rightMargin=36,leftMargin=36,topMargin=36,bottomMargin=48,title='AulaLocal - documento institucional')
    doc.build(story,onFirstPage=footer,onLaterPages=footer); return out.getvalue()
def table(headers,rows,width):
    values=[[p(h,'CellAula') for h in headers]]+[[p(v,'CellAula') for v in row] for row in rows]
    if not rows: values.append([p('Sin registros','CellAula')]+['']*(len(headers)-1))
    t=Table(values,colWidths=[width/len(headers)]*len(headers),repeatRows=1,hAlign='LEFT',splitInRow=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#dcebf0')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f3f6f8')]),('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('LINEBELOW',(0,0),(-1,0),1,BLUE)]))
    return t

def readable_rows(store,kind,year,search=''):
    records=store.list_records(kind,year,search); result=[]
    # Se consulta el mismo año; no resolver IDs en otros ciclos.
    refs={}
    if kind=='attendance': refs={r['id']:r['data']['nombre'] for r in store.list_records('staff',year)}
    if kind=='receipts': refs={r['id']:r['data']['nombre'] for r in store.list_records('menus',year)}
    for row in records:
        data=dict(row['data']); data['id']=row['id']
        for f in MODULES[kind][1]:
            if f.type.endswith('_ref'): data[f.key]=refs.get(data[f.key],str(data[f.key]))
        result.append(data)
    return result

COLUMNS={'students':['codigo','nombre','grado','seccion','estado'],'staff':['codigo','nombre','cargo','telefono','estado'],
'attendance':['personal','fecha','estado','entrada','salida'],'menus':['nombre','ciclo','dia','servicio','descripcion'],
'receipts':['fecha','hora','servicio','suplidor','cantidad','rechazadas','incidencias'],'expenses':['fecha','concepto','suplidor','factura','monto','estado']}

def report_pdf(store,kind,year,path,search=''):
    rows=readable_rows(store,kind,year,search); cols=COLUMNS[kind]; fields={f.key:f for f in MODULES[kind][1]}
    story=title_block(store,year,MODULES[kind][0]); story.append(p(f'Registros incluidos: {len(rows)}'+(f' · Filtro de búsqueda: {search}' if search else ''))); story.append(Spacer(1,12))
    if kind=='expenses':
        total=sum((Decimal(r['monto']) for r in rows if r['estado']!='Anulado'),Decimal(0)); story.append(p(f'Total no anulado: RD$ {total:,.2f}','Heading2'))
    story.append(table([fields[c].label for c in cols],[[r.get(c,'') for c in cols] for r in rows],landscape(A4)[0]-72))
    atomic_write(path,pdf_bytes(story,True)); store.log_export(kind,year)

def record_pdf(store,kind,year,rid,path):
    r=store.record(kind,year,rid); data=next(x for x in readable_rows(store,kind,year) if x['id']==rid)
    story=title_block(store,year,'Expediente / detalle del registro')
    story.append(p(f'{MODULES[kind][0]} · Registro {rid} · Versión {r["version"]}','Heading2'))
    for f in MODULES[kind][1]:
        story.extend([p(f.label,'Heading3'),p(data.get(f.key,'') or 'No registrado','LetterAula')])
    at=store.attachments(kind,year,rid)
    if at:
        story.append(p('Adjuntos asociados','Heading2'))
        for a in at: story.append(p(a['name']))
    atomic_write(path,pdf_bytes(story)); store.log_export(kind,year)

def xlsx_bytes(store,kind,year,search=''):
    rows=readable_rows(store,kind,year,search); fields=MODULES[kind][1]
    wb=Workbook(); ws=wb.active; ws.title=MODULES[kind][0][:31]
    ws.append([institution(store,year)['centro']]); ws.append([f"Año escolar {store.year(year)['label']} · {MODULES[kind][0]}"]); ws.append([f.label for f in fields])
    for row in rows:
        values=[]
        for f in fields:
            v=row.get(f.key,'')
            if v!='' and f.type=='money': v=Decimal(v)
            elif v!='' and f.type=='date': v=date.fromisoformat(v)
            values.append(v)
        ws.append(values)
    # Las entradas de usuario se guardan como texto, nunca como fórmulas Excel.
    for row in ws:
        for cell in row:
            if isinstance(cell.value,str): cell.data_type='s'
            cell.alignment=Alignment(vertical='top',wrap_text=True)
    for cell in ws[3]: cell.fill=PatternFill('solid',fgColor='183849'); cell.font=Font(color='FFFFFF',bold=True)
    ws['A1'].font=Font(size=16,bold=True,color='183849'); ws['A2'].font=Font(size=11,color='506674')
    for i,f in enumerate(fields,1):
        ws.column_dimensions[get_column_letter(i)].width=34 if f.type=='long' or f.key in ('nombre','concepto') else 22
        for row in range(4,len(rows)+4):
            c=ws.cell(row,i)
            if f.type=='money': c.number_format='"RD$ "#,##0.00'
            elif f.type=='integer': c.number_format='#,##0'
            elif f.type=='date': c.number_format='dd/mm/yyyy'
    ws.freeze_panes='C4'; ws.auto_filter.ref=f'A3:{get_column_letter(len(fields))}{max(3,len(rows)+3)}'
    ws.sheet_view.showGridLines=False; ws.print_title_rows='1:3'; ws.sheet_properties.pageSetUpPr.fitToPage=True
    ws.page_setup.orientation='landscape'; ws.page_setup.paperSize=ws.PAPERSIZE_A4; ws.page_setup.fitToWidth=1; ws.page_setup.fitToHeight=0
    out=io.BytesIO(); wb.save(out); return out.getvalue()
def report_xlsx(store,kind,year,path,search=''):
    atomic_write(path,xlsx_bytes(store,kind,year,search)); store.log_export(kind,year)

DEFAULT_TEMPLATES={
 'staff': 'A quien pueda interesar:\n\nPor medio de la presente, {centro} hace constar que {nombre}, documento {documento}, figura en los registros del año escolar {año} con el cargo de {cargo}, fecha de ingreso {ingreso}, vínculo {vinculo} y estado {estado}.\n\nEsta constancia se expide a solicitud de la persona interesada, en fecha {fecha_emision}.',
 'students': 'A quien pueda interesar:\n\nLa Dirección de {centro} certifica que {nombre}, código {codigo_estudiante}, figura en la matrícula del año escolar {año}, en {grado}, sección {seccion}, con estado {estado}.\n\nEsta certificación se expide a solicitud de la persona interesada, en fecha {fecha_emision}.'}

def document_text(store,kind,year,rid,template=None):
    if kind not in DEFAULT_TEMPLATES: raise AppError('Seleccione un estudiante o una persona del personal.')
    d=store.record(kind,year,rid)['data']; s=institution(store,year)
    values={**d,**s,'nombre':d['nombre'],'año':store.year(year)['label'],'codigo_estudiante':d.get('codigo',''),'fecha_emision':date.today().strftime('%d/%m/%Y')}
    text=template or store.settings().get('template_'+kind,DEFAULT_TEMPLATES[kind])
    try: return text.format_map(values)
    except (KeyError,ValueError,AttributeError,IndexError) as e: raise AppError('La plantilla contiene un campo no válido. Use los campos de la plantilla original.') from e

def letter_pdf(store,kind,year,rid,path,body=None):
    store.record(kind,year,rid)
    if store.user['role'] not in ('admin','direccion','secretaria'): raise AppError('No tiene permiso para emitir certificaciones.')
    title='CONSTANCIA DE TRABAJO' if kind=='staff' else 'CERTIFICACIÓN DE MATRÍCULA'
    story=title_block(store,year,title)
    for paragraph in (body or document_text(store,kind,year,rid)).split('\n\n'): story.append(p(paragraph,'LetterAula'))
    story.extend([Spacer(1,50),p('________________________________','Normal'),p(institution(store,year).get('director',''),'Normal'),p('Dirección del centro educativo','Normal'),Spacer(1,16),p('Firma y sello institucional','Normal')])
    atomic_write(path,pdf_bytes(story)); store.log_export(kind,year)

def export_year(store,year,path):
    store.require(admin=True); y=store.year(year)
    out=io.BytesIO()
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        z.writestr('LEEME.txt','Archivo histórico consultable. No restaura la aplicación. Para restaurar, use un respaldo .aulabackup.\nLos adjuntos contienen datos personales; proteja este archivo.\n')
        z.writestr('año.json',json.dumps(y,ensure_ascii=False,indent=2))
        z.writestr('centro.json',json.dumps(institution(store,year),ensure_ascii=False,indent=2))
        z.writestr('auditoria.json',json.dumps(store.audit(year),ensure_ascii=False,indent=2))
        for kind in MODULES:
            rows=store.list_records(kind,year)
            z.writestr(f'{kind}.json',json.dumps(rows,ensure_ascii=False,indent=2)); z.writestr(f'{kind}.xlsx',xlsx_bytes(store,kind,year))
            for r in rows:
                for a in store.attachments(kind,year,r['id']):
                    name=Path(a['name']).name
                    z.writestr(f"adjuntos/{kind}/{r['id']}/{a['id']}-{name}",store.attachment_bytes(kind,year,r['id'],a['id']))
    atomic_write(path,out.getvalue())
    with store.db: store._audit('exportar_año',year)
