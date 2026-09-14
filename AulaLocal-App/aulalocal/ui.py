import sys, time, traceback
from datetime import date
from pathlib import Path
from PySide6.QtCore import Qt, QTimer, QLockFile, QEvent, QUrl
from PySide6.QtGui import QDesktopServices, QAction, QFont
from PySide6.QtWidgets import (QApplication,QMainWindow,QWidget,QVBoxLayout,QHBoxLayout,QGridLayout,QLabel,QPushButton,QLineEdit,QTextEdit,QComboBox,QTableWidget,QTableWidgetItem,QHeaderView,QAbstractItemView,QDialog,QDialogButtonBox,QFormLayout,QScrollArea,QMessageBox,QFileDialog,QInputDialog,QListWidget,QFrame)
from .core import Store,AppError,app_directory
from .catalog import MODULES,ACCESS,ROLES
from . import reports
from .backup import create_backup,restore_backup,atomic_write

STYLE='''
QMainWindow,QDialog {background:#f3f6f8;color:#172f40;}
QWidget {font-size:13px;}
QLabel#brand {font-size:24px;font-weight:700;color:#133847;}
QLabel#title {font-size:28px;font-weight:700;color:#143648;}
QLabel#muted {color:#596e7b;font-size:12px;}
QFrame#card {background:white;border:1px solid #dce5e9;border-radius:12px;}
QPushButton {background:white;border:1px solid #c9d6de;border-radius:7px;padding:9px 14px;color:#173b4b;}
QPushButton:hover {background:#e7f1f4;}
QPushButton#primary {background:#176c77;color:white;border:1px solid #176c77;font-weight:600;}
QPushButton:disabled {color:#8797a0;background:#eef1f3;}
QLineEdit,QTextEdit,QComboBox {background:white;border:1px solid #c7d5dc;border-radius:6px;padding:7px;color:#152f40;selection-background-color:#176c77;}
QListWidget {background:#173b4b;color:#dce9ed;border:0;border-radius:10px;padding:10px;outline:0;}
QListWidget::item {padding:13px 10px;border-radius:6px;}
QListWidget::item:selected {background:#2b6272;color:white;}
QTableWidget {background:white;alternate-background-color:#f4f8fa;border:1px solid #dce5e9;gridline-color:#ecf0f3;selection-background-color:#dceef2;selection-color:#173b4b;}
QHeaderView::section {background:#e7eef2;color:#274957;padding:10px;border:0;font-weight:600;}
'''

def label(text,name=None):
    w=QLabel(text); w.setTextFormat(Qt.PlainText); w.setWordWrap(True)
    if name: w.setObjectName(name)
    return w

def button(text,fn,primary=False):
    b=QPushButton(text); b.clicked.connect(fn)
    if primary:b.setObjectName('primary')
    return b

def clear_layout(layout):
    while layout.count():
        item=layout.takeAt(0)
        if item.widget():
            item.widget().hide(); item.widget().deleteLater()
        elif item.layout(): clear_layout(item.layout())

def error(parent,e): QMessageBox.warning(parent,'No se pudo completar',str(e))

def ask_password(parent,prompt):
    text,ok=QInputDialog.getText(parent,'Confirmación',prompt,QLineEdit.Password)
    return text if ok else None

def table_widget(headers,rows):
    t=QTableWidget(len(rows),len(headers)); t.setHorizontalHeaderLabels(headers)
    for i,row in enumerate(rows):
        for j,value in enumerate(row):
            item=QTableWidgetItem(str(value)); item.setToolTip(str(value)); t.setItem(i,j,item)
    t.setSelectionBehavior(QAbstractItemView.SelectRows); t.setSelectionMode(QAbstractItemView.SingleSelection)
    t.setEditTriggers(QAbstractItemView.NoEditTriggers); t.setAlternatingRowColors(True); t.verticalHeader().setVisible(False)
    t.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeToContents); t.horizontalHeader().setStretchLastSection(True)
    t.verticalHeader().setDefaultSectionSize(40)
    return t

class Form(QDialog):
    def __init__(self,parent,title,fields,values=None,store=None,year=None):
        super().__init__(parent); self.setWindowTitle(title); self.resize(650,620); self.inputs={}; self.fields=fields
        outer=QVBoxLayout(self); outer.addWidget(label(title,'brand')); outer.addWidget(label('Los campos con * son obligatorios. Fechas: AAAA-MM-DD.','muted'))
        scroll=QScrollArea(); scroll.setWidgetResizable(True); content=QWidget(); form=QFormLayout(content); form.setVerticalSpacing(12); values=values or {}
        for f in fields:
            value=values.get(f.key,'')
            if f.type=='choice':
                w=QComboBox(); w.addItems(f.options)
                if value: w.setCurrentText(str(value))
            elif f.type.endswith('_ref'):
                w=QComboBox(); w.addItem('Seleccione…','')
                target='staff' if f.type=='staff_ref' else 'menus'
                for r in store.list_records(target,year):
                    d=r['data']; text=d['nombre']
                    if target=='menus': text+=f" · {d['servicio']} · {d['ciclo']} · {d['dia']}"
                    w.addItem(text,r['id'])
                idx=w.findData(value); w.setCurrentIndex(max(0,idx))
            elif f.type=='long': w=QTextEdit(); w.setPlainText(str(value)); w.setMinimumHeight(85); w.setMaximumHeight(120)
            else:
                w=QLineEdit(str(value))
                if f.type=='password': w.setEchoMode(QLineEdit.Password)
                if f.type=='date': w.setPlaceholderText('AAAA-MM-DD')
                if f.type=='time': w.setPlaceholderText('HH:MM')
                if f.type=='money': w.setPlaceholderText('0.00')
            self.inputs[f.key]=w; form.addRow(f.label+(' *' if f.required else ''),w)
        scroll.setWidget(content); outer.addWidget(scroll)
        self.buttons=QDialogButtonBox(QDialogButtonBox.Save|QDialogButtonBox.Cancel); self.buttons.button(QDialogButtonBox.Save).setText('Guardar'); self.buttons.button(QDialogButtonBox.Cancel).setText('Cancelar')
        self.buttons.accepted.connect(self.accept); self.buttons.rejected.connect(self.reject); outer.addWidget(self.buttons)
    def values(self):
        out={}
        for f in self.fields:
            w=self.inputs[f.key]
            out[f.key]=w.currentData() if f.type.endswith('_ref') else w.currentText() if isinstance(w,QComboBox) else w.toPlainText() if isinstance(w,QTextEdit) else w.text()
        return out

class Login(QDialog):
    def __init__(self,store):
        super().__init__(); self.store=store; self.setWindowTitle('AulaLocal · Acceso'); self.setFixedWidth(450)
        l=QVBoxLayout(self); l.setContentsMargins(32,32,32,32); l.setSpacing(16); l.addWidget(label('AulaLocal','title')); l.addWidget(label('Gestión escolar, en tu Mac.','muted'))
        self.setup=not store.initialized(); self.inputs={}; f=QFormLayout()
        fields=[('username','Usuario'),('password','Contraseña')]
        if self.setup: fields=[('school','Nombre del centro'),('name','Nombre del director'),*fields,('repeat','Repita la contraseña')]
        for key,title in fields:
            w=QLineEdit()
            if key in ('password','repeat'):w.setEchoMode(QLineEdit.Password)
            self.inputs[key]=w; f.addRow(title,w)
        l.addLayout(f)
        if self.setup:l.addWidget(label('La contraseña debe tener al menos 12 caracteres. Guárdela en un lugar seguro: no existe recuperación por internet.','muted'))
        self.message=label(''); self.message.setStyleSheet('color:#a12d3a;'); l.addWidget(self.message)
        l.addWidget(button('Configurar mi centro' if self.setup else 'Entrar',self.submit,True))
        self.inputs['password'].returnPressed.connect(self.submit)
    def submit(self):
        d={k:w.text() for k,w in self.inputs.items()}
        try:
            if self.setup:
                if d['password']!=d['repeat']:raise AppError('Las contraseñas no coinciden.')
                self.store.bootstrap(d['username'],d['password'],d['name'],d['school'])
            else:self.store.login(d['username'],d['password'])
            self.accept()
        except AppError as e:self.message.setText(str(e))

class MainWindow(QMainWindow):
    def __init__(self,store):
        super().__init__(); self.store=store; self.setWindowTitle('AulaLocal'); self.resize(1260,830); self.setMinimumSize(1000,680); self.current='dashboard'; self.rows=[]
        root=QWidget(); self.setCentralWidget(root); layout=QHBoxLayout(root); layout.setContentsMargins(22,22,22,22); layout.setSpacing(24)
        sidebar=QVBoxLayout(); brand=label('AulaLocal','brand'); sidebar.addWidget(brand); sidebar.addWidget(label('GESTIÓN DEL CENTRO','muted'))
        self.nav=QListWidget(); self.nav.setFixedWidth(215); self.keys=['dashboard']+list(ACCESS[store.user['role']]); self.keys=['dashboard']+[k for k in MODULES if k in ACCESS[store.user['role']]]
        if store.user['role'] in ('admin','direccion'):self.keys+=['audit']
        if store.user['role']=='admin':self.keys+=['years','settings','users','backup']
        names={'dashboard':'Dirección','audit':'Auditoría','years':'Años escolares','settings':'Mi centro','users':'Usuarios y permisos','backup':'Copias y restauración'}
        for k in self.keys:self.nav.addItem(MODULES[k][0] if k in MODULES else names[k])
        sidebar.addWidget(self.nav,1); sidebar.addWidget(label('Sin conexión · Datos locales','muted')); sidebar.addWidget(button('Bloquear sesión',self.lock))
        layout.addLayout(sidebar)
        right=QVBoxLayout(); layout.addLayout(right,1)
        top=QHBoxLayout(); self.school=label(store.settings()['centro'],'brand'); top.addWidget(self.school,1)
        top.addWidget(label('Año escolar')); self.year_combo=QComboBox(); self.year_combo.setMinimumWidth(200); top.addWidget(self.year_combo); right.addLayout(top)
        self.identity=label(f"{store.user['name']} · {ROLES[store.user['role']]}",'muted'); right.addWidget(self.identity)
        self.body=QVBoxLayout(); self.body.setSpacing(15); right.addLayout(self.body,1)
        self.statusBar().showMessage('Listo. Los cambios se guardan localmente.')
        self.refresh_years(); self.nav.currentRowChanged.connect(self.navigate); self.year_combo.currentIndexChanged.connect(self.render); self.nav.setCurrentRow(0)
        self.timer=QTimer(self); self.timer.timeout.connect(self.check_session); self.timer.start(15000)
        QApplication.instance().installEventFilter(self)
    def eventFilter(self,obj,event):
        if self.store.user and event.type() in (QEvent.KeyPress,QEvent.MouseButtonPress,QEvent.Wheel):
            if time.monotonic()-self.store.last_active<900:self.store.last_active=time.monotonic()
        return super().eventFilter(obj,event)
    def check_session(self):
        if not self.store.user or time.monotonic()-self.store.last_active>900:self.lock()
    def lock(self):
        app=QApplication.instance(); app.setQuitOnLastWindowClosed(False)
        self.timer.stop(); self.store.logout()
        for child in self.findChildren(QDialog): child.reject()
        self.hide()
        login=Login(self.store)
        if login.exec()==QDialog.Accepted:
            replacement=MainWindow(self.store); app.main_window=replacement; replacement.show(); self.close(); self.deleteLater(); app.setQuitOnLastWindowClosed(True)
        else:self.close(); app.quit()
    def safe(self,fn):
        try:return fn()
        except AppError as e:error(self,e)
        except Exception:
            # No volcar registros personales en logs de fallos.
            error(self,'Se produjo un error inesperado. La operación no pudo completarse. Reinicie la aplicación y vuelva a intentarlo.')
            traceback.print_exc()
    def year_id(self):return self.year_combo.currentData()
    def refresh_years(self):
        old=self.year_id(); self.year_combo.blockSignals(True); self.year_combo.clear()
        for y in self.store.years():self.year_combo.addItem(f"{y['label']} · {y['status']}",y['id'])
        idx=self.year_combo.findData(old)
        if idx>=0:self.year_combo.setCurrentIndex(idx)
        self.year_combo.blockSignals(False)
    def navigate(self,index):
        if index>=0:self.current=self.keys[index]; self.render()
    def render(self,*_):self.safe(self._render)
    def _render(self):
        self.store.require(); clear_layout(self.body)
        if self.current in ('dashboard','audit') or self.current in MODULES:
            if not self.year_id():
                self.body.addWidget(label('Comienza con tu primer año escolar','title')); self.body.addWidget(label('Crea el período, por ejemplo 2026-2027, para registrar matrículas y movimientos.'))
                if self.store.user['role']=='admin':self.body.addWidget(button('Crear año escolar',lambda:self.safe(self.new_year),True))
                self.body.addStretch();return
        if self.current=='dashboard':self.dashboard()
        elif self.current in MODULES:self.module()
        else:getattr(self,self.current+'_page')()
    def dashboard(self):
        self.body.addWidget(label('Dirección','title')); self.body.addWidget(label('Resumen del año seleccionado. Los totales se calculan a partir de tus registros.','muted'))
        grid=QGridLayout()
        for i,(key,value) in enumerate(self.store.dashboard(self.year_id()).items()):
            card=QFrame(); card.setObjectName('card'); v=QVBoxLayout(card); v.setContentsMargins(20,18,20,18); v.addWidget(label(key,'muted')); v.addWidget(label(str(value),'title')); grid.addWidget(card,i//3,i%3)
        self.body.addLayout(grid); self.body.addWidget(label('Las cantidades de alimentación representan unidades aceptadas acumuladas; no equivalen a estudiantes atendidos. La asistencia de hoy cuenta los registros presentes y con tardanza.','muted'))
        self.body.addStretch(); self.body.addWidget(button('Actualizar indicadores',self.render))
    def module(self):
        kind=self.current; self.body.addWidget(label(MODULES[kind][0],'title'))
        toolbar=QHBoxLayout(); self.search=QLineEdit(); self.search.setPlaceholderText('Buscar en los registros de este año…'); toolbar.addWidget(self.search,1)
        editable=self.store.user['role']!='consulta' and self.store.year(self.year_id())['status']=='abierto'
        b=button('Nuevo registro',lambda:self.safe(self.new_record),True); b.setEnabled(editable); toolbar.addWidget(b)
        b=button('Editar',lambda:self.safe(self.edit_record)); b.setEnabled(editable); toolbar.addWidget(b)
        self.body.addLayout(toolbar)
        self.table=table_widget([],[]); self.body.addWidget(self.table,1); self.search.textChanged.connect(self.fill_table); self.table.doubleClicked.connect(lambda _:self.safe(self.edit_record))
        self.fill_table()
        bar=QHBoxLayout()
        for text,fn in [('Detalle PDF',self.detail_pdf),('Reporte PDF',lambda:self.export('pdf')),('Excel',lambda:self.export('xlsx')),('Adjuntos',self.attachments_dialog)]:bar.addWidget(button(text,lambda checked=False,f=fn:self.safe(f)))
        if kind in ('staff','students') and self.store.user['role'] in ('admin','direccion','secretaria'):bar.addWidget(button('Emitir constancia',lambda:self.safe(self.letter)))
        self.body.addLayout(bar)
        self.body.addWidget(label('Doble clic para editar. Para conservar el historial, utiliza el estado retirado, inactivo o anulado. Los reportes respetan la búsqueda visible.','muted'))
    def fill_table(self,*_):
        kind=self.current; self.rows=self.store.list_records(kind,self.year_id(),self.search.text()); data=reports.readable_rows(self.store,kind,self.year_id(),self.search.text()); cols=reports.COLUMNS[kind]; fields={f.key:f.label for f in MODULES[kind][1]}
        self.table.setColumnCount(len(cols)); self.table.setHorizontalHeaderLabels([fields[c] for c in cols]); self.table.setRowCount(len(data))
        for i,r in enumerate(data):
            for j,c in enumerate(cols):
                item=QTableWidgetItem(str(r.get(c,''))); item.setToolTip(str(r.get(c,''))); self.table.setItem(i,j,item)
        self.statusBar().showMessage(f'{len(data)} registros en el año seleccionado')
    def selected(self):
        i=self.table.currentRow()
        if i<0 or i>=len(self.rows):raise AppError('Seleccione un registro de la tabla.')
        return self.rows[i]
    def new_record(self):self.record_form()
    def edit_record(self):self.record_form(self.selected())
    def record_form(self,record=None):
        kind=self.current; self.store.require(kind,write=True); self.store._open(self.year_id())
        values=record['data'] if record else {}
        if not record:
            y=self.store.year(self.year_id()); today=date.today().isoformat(); values={'fecha':today if y['start_date']<=today<=y['end_date'] else y['start_date']}
            if kind=='receipts':values['rechazadas']='0'
        f=Form(self,MODULES[kind][0],MODULES[kind][1],values,self.store,self.year_id())
        while f.exec()==QDialog.Accepted:
            try:
                self.store.save_record(kind,self.year_id(),f.values(),record['id'] if record else None,record['version'] if record else None); self.render();return
            except AppError as e:error(f,e)
    def export(self,fmt):
        path,_=QFileDialog.getSaveFileName(self,'Guardar reporte',f"{self.current}-{self.store.year(self.year_id())['label']}.{fmt}",f'{fmt.upper()} (*.{fmt})')
        if path:
            (reports.report_pdf if fmt=='pdf' else reports.report_xlsx)(self.store,self.current,self.year_id(),path,self.search.text()); self.statusBar().showMessage('Reporte guardado.')
    def detail_pdf(self):
        r=self.selected(); path,_=QFileDialog.getSaveFileName(self,'Guardar expediente',f"expediente-{r['id']}.pdf",'PDF (*.pdf)')
        if path:reports.record_pdf(self.store,self.current,self.year_id(),r['id'],path);self.statusBar().showMessage('Expediente PDF guardado.')
    def letter(self):
        r=self.selected(); d=QDialog(self); d.setWindowTitle('Revisar constancia antes de imprimir'); d.resize(720,650); l=QVBoxLayout(d)
        l.addWidget(label('Revisa el texto y genera el PDF','brand')); text=QTextEdit();text.setPlainText(reports.document_text(self.store,self.current,self.year_id(),r['id']));l.addWidget(text)
        buttons=QDialogButtonBox(QDialogButtonBox.Save|QDialogButtonBox.Cancel);buttons.accepted.connect(d.accept);buttons.rejected.connect(d.reject);l.addWidget(buttons)
        if d.exec()==QDialog.Accepted:
            path,_=QFileDialog.getSaveFileName(self,'Guardar constancia','constancia.pdf','PDF (*.pdf)')
            if path:reports.letter_pdf(self.store,self.current,self.year_id(),r['id'],path,text.toPlainText());self.statusBar().showMessage('Constancia guardada. Abra el PDF para imprimirlo.')
    def attachments_dialog(self):
        r=self.selected(); kind=self.current; year=self.year_id(); d=QDialog(self);d.setWindowTitle('Adjuntos y evidencias');d.resize(650,400);l=QVBoxLayout(d); listing=QListWidget();l.addWidget(listing); items=[]
        def refresh():
            items[:]=self.store.attachments(kind,year,r['id']);listing.clear()
            for a in items:listing.addItem(f"{a['name']} · {a['size']//1024} KB")
        def add():
            path,_=QFileDialog.getOpenFileName(d,'Adjuntar evidencia','','Documentos e imágenes (*.pdf *.png *.jpg *.jpeg)')
            if path:self.store.attach(kind,year,r['id'],path);refresh()
        def save():
            i=listing.currentRow()
            if i<0:raise AppError('Seleccione un adjunto.')
            a=items[i];path,_=QFileDialog.getSaveFileName(d,'Guardar copia',a['name'])
            if path:atomic_write(path,self.store.attachment_bytes(kind,year,r['id'],a['id']))
        refresh();bar=QHBoxLayout();b=button('Adjuntar PDF o foto',lambda:self.safe(add),True);b.setEnabled(self.store.year(year)['status']=='abierto' and self.store.user['role']!='consulta');bar.addWidget(b);bar.addWidget(button('Guardar copia',lambda:self.safe(save)));l.addLayout(bar);l.addWidget(label('Máximo 15 MB por archivo. Se conserva una copia dentro de la aplicación.','muted'));d.exec()
    def new_year(self):
        from .catalog import F
        f=Form(self,'Crear año escolar',[F('label','Año escolar',required=True),F('start','Inicio','date',True),F('end','Fin','date',True)],{'label':'2026-2027','start':'2026-08-01','end':'2027-07-31'})
        while f.exec()==QDialog.Accepted:
            try:
                d=f.values();new=self.store.create_year(d['label'],d['start'],d['end']);self.refresh_years();self.year_combo.setCurrentIndex(self.year_combo.findData(new));self.render();return
            except AppError as e:error(f,e)
    def years_page(self):
        self.body.addWidget(label('Años escolares','title'));self.body.addWidget(label('Congelar bloquea los cambios. Archivar conserva el año para consultas. La reapertura requiere tu contraseña y un motivo.','muted'))
        years=self.store.years();self.body.addWidget(table_widget(['Año','Inicio','Fin','Estado'],[[y['label'],y['start_date'],y['end_date'],y['status']] for y in years]),1)
        self.body.addWidget(label('Las acciones siguientes se aplican al año seleccionado arriba.','muted'))
        bar=QHBoxLayout();bar.addWidget(button('Crear año',lambda:self.safe(self.new_year),True))
        for text,state in [('Congelar','congelado'),('Reabrir','abierto'),('Archivar','archivado')]:bar.addWidget(button(text,lambda checked=False,s=state:self.safe(lambda:self.change_year_state(s))))
        self.body.addLayout(bar);self.body.addWidget(button('Copiar matrículas o personal al año seleccionado',lambda:self.safe(self.copy_people)));self.body.addWidget(button('Exportar archivo histórico del año',lambda:self.safe(self.archive)))
    def change_year_state(self,state):
        y=self.store.year(self.year_id());reason,ok=QInputDialog.getMultiLineText(self,'Motivo de la acción',f"{y['label']}: {y['status']} → {state}\nExplique el motivo:")
        if not ok:return
        pw=ask_password(self,'Confirme su contraseña de administrador:')
        if pw is None:return
        self.store.transition(y['id'],state,reason,pw);self.refresh_years();self.render()
    def copy_people(self):
        target=self.store.year(self.year_id());sources=[y for y in self.store.years() if y['label']<target['label']]
        if not sources:raise AppError('Primero cree un año posterior y selecciónelo como destino.')
        source,ok=QInputDialog.getItem(self,'Copiar desde otro año','Año de origen:',[y['label'] for y in sources],0,False)
        if not ok:return
        kind,ok=QInputDialog.getItem(self,'Registros a copiar','Tipo:',['Estudiantes','Personal'],0,False)
        if not ok:return
        if QMessageBox.question(self,'Confirmar copia',f"Se copiarán los registros activos de {source} a {target['label']}. Los códigos existentes se omiten. Revise grado y sección después: no se promueven automáticamente.")!=QMessageBox.Yes:return
        count=self.store.copy_people(next(y['id'] for y in sources if y['label']==source),target['id'],'students' if kind=='Estudiantes' else 'staff');QMessageBox.information(self,'Copia completa',f'{count} registros copiados.');self.render()
    def archive(self):
        y=self.store.year(self.year_id());path,_=QFileDialog.getSaveFileName(self,'Guardar archivo histórico',f"archivo-{y['label']}.zip",'ZIP (*.zip)')
        if path:reports.export_year(self.store,y['id'],path);QMessageBox.information(self,'Archivo exportado','Se guardaron los registros, hojas Excel, auditoría y adjuntos de este año. Este ZIP no está cifrado; guárdelo en un lugar protegido.')
    def settings_page(self):
        self.body.addWidget(label('Mi centro','title'));s=self.store.settings();form=QFormLayout();inputs={}
        for key,title in [('centro','Nombre del centro'),('codigo','Código del centro'),('director','Director/a'),('direccion','Dirección'),('telefono','Teléfono')]:
            w=QLineEdit(s.get(key,''));inputs[key]=w;form.addRow(title,w)
        self.body.addLayout(form)
        def save():self.store.save_settings({k:w.text() for k,w in inputs.items()});self.school.setText(self.store.settings()['centro']);self.statusBar().showMessage('Configuración guardada.')
        self.body.addWidget(button('Guardar configuración',lambda:self.safe(save),True))
        self.body.addWidget(label('Plantillas de documentos','brand'))
        for kind,title in [('staff','Carta de trabajo'),('students','Certificación de matrícula')]:self.body.addWidget(button('Editar plantilla: '+title,lambda checked=False,k=kind:self.safe(lambda:self.edit_template(k))))
        self.body.addStretch()
    def edit_template(self,kind):
        s=self.store.settings();d=QDialog(self);d.setWindowTitle('Plantilla');d.resize(720,560);l=QVBoxLayout(d);l.addWidget(label('Conserva los nombres entre llaves para completar los datos automáticamente.','muted'));text=QTextEdit();text.setPlainText(s.get('template_'+kind,reports.DEFAULT_TEMPLATES[kind]));l.addWidget(text)
        l.addWidget(button('Restablecer texto original',lambda:text.setPlainText(reports.DEFAULT_TEMPLATES[kind])))
        buttons=QDialogButtonBox(QDialogButtonBox.Save|QDialogButtonBox.Cancel);buttons.accepted.connect(d.accept);buttons.rejected.connect(d.reject);l.addWidget(buttons)
        if d.exec()==QDialog.Accepted:
            from string import Formatter
            valid={'centro','director','direccion','telefono','año','codigo_estudiante','fecha_emision'}|{f.key for f in MODULES[kind][1]}
            try:
                for _,field,spec,conv in Formatter().parse(text.toPlainText()):
                    if field is not None and (field not in valid or spec or conv):raise ValueError()
            except ValueError:raise AppError('La plantilla contiene un campo no permitido.')
            self.store.save_settings({**s,'template_'+kind:text.toPlainText()})
    def users_page(self):
        self.body.addWidget(label('Usuarios y permisos','title'));users=self.store.users();t=table_widget(['Usuario','Nombre','Rol','Estado'],[[u['username'],u['name'],ROLES[u['role']],'Activo' if u['active'] else 'Inactivo'] for u in users]);self.body.addWidget(t,1)
        def edit(existing=False):
            from .catalog import F
            u=None
            if existing:
                if t.currentRow()<0:raise AppError('Seleccione una cuenta.')
                u=users[t.currentRow()]
            values={} if not u else {**u,'role':ROLES[u['role']],'active':'Activo' if u['active'] else 'Inactivo'}
            f=Form(self,'Cuenta de usuario',[F('username','Usuario',required=True),F('name','Nombre',required=True),F('role','Rol','choice',True,tuple(ROLES.values())),F('password','Nueva contraseña (vacío = conservar)','password'),F('active','Estado','choice',True,('Activo','Inactivo'))],values)
            while f.exec()==QDialog.Accepted:
                try:
                    d=f.values();role=next(k for k,v in ROLES.items() if v==d['role']);self.store.save_user(d['username'],d['name'],role,d['password'],d['active']=='Activo',u['id'] if u else None);self.render();return
                except AppError as e:error(f,e)
        bar=QHBoxLayout();bar.addWidget(button('Nueva cuenta',lambda:self.safe(lambda:edit(False)),True));bar.addWidget(button('Editar cuenta',lambda:self.safe(lambda:edit(True))));self.body.addLayout(bar)
        self.body.addWidget(label('Consulta general puede leer todos los módulos, incluidos expedientes y gastos. Asigna ese rol solo a personas autorizadas. Secretaría, Alimentación y Contabilidad tienen acceso limitado a sus módulos.','muted'))
    def audit_page(self):
        self.body.addWidget(label('Auditoría del año','title'));rows=self.store.audit(self.year_id());self.body.addWidget(table_widget(['Fecha UTC','Usuario','Acción','Detalle'],[[r['at'],r['usuario'],r['action'],r['detail']] for r in rows]),1)
        self.body.addWidget(label('Los cambios de datos conservan los valores anteriores y nuevos. Los eventos generales de acceso se incluyen al consultar toda la auditoría.','muted'))
        def all_audit():
            d=QDialog(self);d.setWindowTitle('Auditoría completa');d.resize(1000,600);l=QVBoxLayout(d);l.addWidget(table_widget(['Fecha UTC','Usuario','Acción','Año','Detalle'],[[r['at'],r['usuario'],r['action'],r['year_id'],r['detail']] for r in self.store.audit()]));d.exec()
        self.body.addWidget(button('Ver todos los eventos',lambda:self.safe(all_audit)))
    def backup_page(self):
        self.body.addWidget(label('Copias de seguridad','title'));self.body.addWidget(label('Guarda una copia cifrada en un archivo local o en un disco externo. Incluye todos los años, usuarios, configuraciones y adjuntos.','muted'))
        self.body.addWidget(button('Crear copia cifrada',lambda:self.safe(self.backup),True));self.body.addWidget(button('Restaurar desde archivo',lambda:self.safe(self.restore)))
        self.body.addWidget(label('La contraseña de la copia puede ser diferente a la de acceso. Sin ella no se puede recuperar el archivo. Antes de restaurar se conserva una copia del estado actual con esa misma contraseña.','muted'));self.body.addStretch()
        self.body.addWidget(label('Ubicación de datos: '+str(self.store.root),'muted'));self.body.addWidget(label('Los datos de trabajo no están cifrados por la aplicación. Protege el Mac con FileVault y una cuenta individual. Las copias .aulabackup sí están cifradas.','muted'))
    def backup(self):
        path,_=QFileDialog.getSaveFileName(self,'Guardar copia cifrada',f"AulaLocal-{date.today()}.aulabackup",'Respaldo AulaLocal (*.aulabackup)')
        if not path:return
        pw=ask_password(self,'Contraseña para proteger esta copia (mínimo 12 caracteres):')
        if pw is None:return
        again=ask_password(self,'Repita la contraseña de la copia:')
        if again is None:return
        if pw!=again:raise AppError('Las contraseñas no coinciden.')
        create_backup(self.store,path,pw);QMessageBox.information(self,'Respaldo completo','Copia cifrada guardada correctamente.')
    def restore(self):
        path,_=QFileDialog.getOpenFileName(self,'Abrir respaldo','','Respaldo AulaLocal (*.aulabackup)')
        if not path:return
        if QMessageBox.question(self,'Restaurar datos','Se sustituirán TODOS los años y cuentas por los del respaldo. Se conservará una copia previa. ¿Desea continuar?')!=QMessageBox.Yes:return
        current=ask_password(self,'Contraseña actual de administrador:')
        if current is None:return
        pw=ask_password(self,'Contraseña del archivo de respaldo:')
        if pw is None:return
        recovery=restore_backup(self.store,path,pw,current);QMessageBox.information(self,'Restauración completa',f'Inicie sesión con una cuenta del respaldo.\nCopia previa: {recovery.name}');self.lock()

def run(data_dir=None):
    app=QApplication(sys.argv);app.setApplicationName('AulaLocal');app.setOrganizationName('AulaLocal');app.setStyle('Fusion');app.setStyleSheet(STYLE);app.setFont(QFont('Arial',13));app.setQuitOnLastWindowClosed(False)
    root=Path(data_dir or app_directory());root.mkdir(parents=True,exist_ok=True)
    lock=QLockFile(str(root/'application.lock'));lock.setStaleLockTime(0)
    if not lock.tryLock(100):QMessageBox.information(None,'AulaLocal','La aplicación ya está abierta con estos datos.');return 1
    try:
        store=Store(root)
        login=Login(store)
        if login.exec()!=QDialog.Accepted:store.close();return 0
        window=MainWindow(store);app.main_window=window;window.show();app.setQuitOnLastWindowClosed(True)
        result=app.exec();store.close();return result
    except Exception as e:QMessageBox.critical(None,'AulaLocal','No se pudo abrir la aplicación: '+str(e));return 1
    finally:lock.unlock()
