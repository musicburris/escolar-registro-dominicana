import sys, time, traceback
from datetime import date
from pathlib import Path
from PySide6.QtCore import Qt, QTimer, QLockFile, QEvent, QUrl, QDate, QTime, QSize
from PySide6.QtGui import QDesktopServices, QAction, QFont, QIcon, QPixmap
from PySide6.QtWidgets import (QApplication,QMainWindow,QWidget,QVBoxLayout,QHBoxLayout,QGridLayout,QLabel,QPushButton,QLineEdit,QTextEdit,QComboBox,QTableWidget,QTableWidgetItem,QHeaderView,QAbstractItemView,QDialog,QDialogButtonBox,QFormLayout,QScrollArea,QMessageBox,QFileDialog,QInputDialog,QListWidget,QListWidgetItem,QFrame,QCheckBox,QGroupBox,QDateEdit,QTimeEdit,QSizePolicy)
from .core import Store,AppError,app_directory,local_now,timezone_label
from .catalog import MODULES,ACCESS,ROLES
from . import reports
from .backup import create_backup,restore_backup,atomic_write

STYLE='''
QMainWindow,QDialog {background:#F4F7FA;color:#142B3A;}
QWidget {font-size:14px;}
QLabel#brand {font-size:25px;font-weight:700;color:#102F3E;}
QLabel#title {font-size:30px;font-weight:700;color:#102F3E;}
QLabel#schoolHeader {font-size:23px;font-weight:700;color:#102F3E;padding:3px 0;}
QLabel#centerName {font-size:28px;font-weight:700;color:#102F3E;padding:4px 0;}
QLabel#fieldValue {font-size:16px;font-weight:600;color:#173B4B;}
QLabel#muted {color:#607482;font-size:12px;}
QLabel#clock {color:#315465;font-size:12px;font-weight:600;}
QFrame#card,QGroupBox {background:#FFFFFF;border:1px solid #DDE7EC;border-radius:14px;margin-top:7px;}
QGroupBox::title {subcontrol-origin:margin;left:14px;padding:0 5px;color:#47616F;font-weight:650;}
QPushButton {background:#FFFFFF;border:1px solid #C9D8E0;border-radius:9px;padding:9px 14px;color:#173B4B;font-weight:550;}
QPushButton:hover {background:#EAF4F6;border-color:#9FC3CB;}
QPushButton#primary {background:#087F8C;color:white;border:1px solid #087F8C;font-weight:700;}
QPushButton#primary:hover {background:#076D78;}
QPushButton:disabled {color:#91A0A9;background:#EDF1F3;}
QLineEdit,QTextEdit,QComboBox,QDateEdit,QTimeEdit {background:#FFFFFF;border:1px solid #C8D7DF;border-radius:8px;padding:9px;color:#142F40;selection-background-color:#087F8C;min-height:24px;}
QLineEdit:focus,QTextEdit:focus,QComboBox:focus,QDateEdit:focus,QTimeEdit:focus {border:2px solid #2F98A2;}
QDateEdit,QTimeEdit {font-size:15px;font-weight:600;min-height:28px;}
QCalendarWidget {background:#FFFFFF;color:#142F40;}
QListWidget {background:#123847;color:#DFEDF1;border:0;border-radius:14px;padding:10px;outline:0;}
QListWidget::item {padding:13px 11px;border-radius:8px;margin:2px 0;}
QListWidget::item:hover {background:#1D4C5C;}
QListWidget::item:selected {background:#087F8C;color:white;font-weight:650;}
QTableWidget {background:#FFFFFF;alternate-background-color:#F5F9FA;border:1px solid #DDE7EC;border-radius:10px;gridline-color:#EDF2F4;selection-background-color:#D9F0F2;selection-color:#173B4B;}
QHeaderView::section {background:#E8F0F3;color:#274957;padding:11px;border:0;border-right:1px solid #D9E4E9;font-weight:650;}
QStatusBar {background:#FFFFFF;border-top:1px solid #DDE7EC;color:#54707E;}
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
        super().__init__(parent); self.setWindowTitle(title); self.resize(760,700); self.inputs={}; self.fields=fields
        outer=QVBoxLayout(self); outer.addWidget(label(title,'brand')); outer.addWidget(label('Los campos con * son obligatorios. Usa el calendario y el selector de hora.','muted'))
        if any(f.key=='fecha' and f.type=='date' for f in fields) and any(f.key=='hora' and f.type=='time' for f in fields):
            notice=QFrame();notice.setObjectName('card');notice_layout=QVBoxLayout(notice);notice_layout.setContentsMargins(16,12,16,12)
            notice_layout.addWidget(label('Registro diario: selecciona la fecha en el calendario y confirma la hora exacta de llegada. Las fotografías se agregan después de guardar.'))
            outer.addWidget(notice)
        scroll=QScrollArea(); scroll.setWidgetResizable(True);scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff); content=QWidget(); form=QFormLayout(content); form.setVerticalSpacing(12); values=values or {}
        for f in fields:
            value=values.get(f.key,'')
            if f.type=='choice':
                w=QComboBox(); w.addItems(f.options)
                if value: w.setCurrentText(str(value))
            elif f.type=='food_service_ref':
                w=QComboBox();w.addItem('Seleccione…','')
                services=store.food_services() if store else []
                names=[item['name'] for item in services]
                if value and str(value) not in names:w.addItem(str(value),str(value))
                for item in services:w.addItem(item['name'],item['name'])
                w.setCurrentIndex(max(0,w.findData(str(value))))
            elif f.type in ('staff_ref','menu_ref'):
                w=QComboBox(); w.addItem('Seleccione…','')
                target='staff' if f.type=='staff_ref' else 'menus'
                records=store.list_records(target,year,include_deleted=True) if target=='menus' else store.list_records(target,year)
                for r in records:
                    if target=='menus' and r['data'].get('_deleted') and r['id']!=value:continue
                    d=r['data']; text=d['nombre']
                    if target=='menus': text+=f" · {d['servicio']} · {d['ciclo']} · {d['dia']}"
                    if target=='menus' and d.get('_deleted'):text+=' · Eliminado (histórico)'
                    w.addItem(text,r['id'])
                w.setProperty('initialValue',value)
                idx=w.findData(value); w.setCurrentIndex(max(0,idx))
            elif f.type=='level_ref':
                w=QComboBox();w.addItem('Seleccione…','')
                for item in store.academic_levels():w.addItem(item['name'],item['id'])
                idx=w.findText(str(value));w.setCurrentIndex(max(0,idx))
            elif f.type=='grade_ref':
                w=QComboBox();w.setProperty('initialValue',str(value))
            elif f.type=='section_ref':
                w=QComboBox();w.setProperty('initialValue',str(value))
            elif f.type=='long': w=QTextEdit(); w.setPlainText(str(value)); w.setMinimumHeight(85); w.setMaximumHeight(120)
            elif f.type=='date':
                w=QDateEdit();w.setCalendarPopup(True);w.setDisplayFormat('dd/MM/yyyy');w.setMinimumDate(QDate(1900,1,1));w.setProperty('optionalEmpty',not f.required)
                w.setMinimumHeight(44);w.setToolTip('Pulsa el botón de calendario para elegir la fecha.')
                parsed=QDate.fromString(str(value),'yyyy-MM-dd') if value else QDate()
                if parsed.isValid():w.setDate(parsed)
                elif f.required:
                    fallback=QDate.fromString(store.year(year)['start_date'],'yyyy-MM-dd') if store and year else QDate.currentDate();w.setDate(fallback if fallback.isValid() else QDate.currentDate())
                else:w.setSpecialValueText('Sin fecha');w.setDate(w.minimumDate())
                if f.key=='fecha' and store and year:
                    y=store.year(year);w.setMinimumDate(QDate.fromString(y['start_date'],'yyyy-MM-dd'));w.setMaximumDate(QDate.fromString(y['end_date'],'yyyy-MM-dd'))
            elif f.type=='time':
                w=QTimeEdit();w.setDisplayFormat('hh:mm AP');w.setProperty('optionalEmpty',not f.required);parsed=QTime.fromString(str(value),'HH:mm') if value else QTime()
                w.setMinimumHeight(44);w.setToolTip('Selecciona la hora y los minutos de la recepción.')
                if parsed.isValid():w.setTime(parsed)
                elif f.required:w.setTime(QTime.currentTime())
                else:w.setSpecialValueText('Sin hora');w.setTime(QTime(0,0))
            else:
                w=QLineEdit(str(value))
                if f.type=='password': w.setEchoMode(QLineEdit.Password)
                if f.type=='money': w.setPlaceholderText('0.00')
            self.inputs[f.key]=w
            if f.type in ('date','time'):
                row=QWidget();row_layout=QHBoxLayout(row);row_layout.setContentsMargins(0,0,0,0);row_layout.setSpacing(8);row_layout.addWidget(w,1)
                if f.type=='date':
                    def show_calendar(checked=False,target=w):
                        calendar=target.calendarWidget();calendar.setSelectedDate(target.date());calendar.setWindowFlags(Qt.Popup);calendar.move(target.mapToGlobal(target.rect().bottomLeft()));calendar.show();calendar.raise_();calendar.activateWindow()
                    open_calendar=button('Abrir calendario',show_calendar);open_calendar.setMinimumHeight(42);row_layout.addWidget(open_calendar)
                else:
                    current_time=button('Usar hora actual',lambda checked=False,target=w:target.setTime(QTime.currentTime()));current_time.setMinimumHeight(42);row_layout.addWidget(current_time)
                form.addRow(f.label+(' *' if f.required else ''),row)
            else:form.addRow(f.label+(' *' if f.required else ''),w)
        if all(k in self.inputs for k in ('nivel','grado','seccion')):
            def grades():
                level=self.inputs['nivel'].currentData();current=self.inputs['grado'].currentText() or self.inputs['grado'].property('initialValue')
                self.inputs['grado'].clear();self.inputs['grado'].addItem('Seleccione…','')
                for item in store.grades(level):self.inputs['grado'].addItem(item['name'],item['id'])
                self.inputs['grado'].setCurrentIndex(max(0,self.inputs['grado'].findText(str(current))));sections()
            def sections():
                grade=self.inputs['grado'].currentData();current=self.inputs['seccion'].currentText() or self.inputs['seccion'].property('initialValue')
                self.inputs['seccion'].clear();self.inputs['seccion'].addItem('Seleccione…','')
                for item in store.sections(year,grade):self.inputs['seccion'].addItem(item['name'],item['id'])
                self.inputs['seccion'].setCurrentIndex(max(0,self.inputs['seccion'].findText(str(current))))
            self.inputs['nivel'].currentIndexChanged.connect(grades);self.inputs['grado'].currentIndexChanged.connect(sections);grades()
        if all(k in self.inputs for k in ('servicio','menu')):
            menus=store.list_records('menus',year,include_deleted=True);selected=self.inputs['menu'].property('initialValue')
            def load_menus():
                service=self.inputs['servicio'].currentData() or self.inputs['servicio'].currentText();current=self.inputs['menu'].currentData() or selected
                self.inputs['menu'].blockSignals(True);self.inputs['menu'].clear();self.inputs['menu'].addItem('Seleccione…','')
                for item in menus:
                    data=item['data']
                    if data.get('servicio')!=service:continue
                    if data.get('_deleted') and item['id']!=selected:continue
                    text=f"{data.get('nombre','')} · {data.get('ciclo','')} · {data.get('dia','')}"
                    if data.get('_deleted'):text+=' · Eliminado (histórico)'
                    self.inputs['menu'].addItem(text,item['id'])
                self.inputs['menu'].setCurrentIndex(max(0,self.inputs['menu'].findData(current)));self.inputs['menu'].blockSignals(False)
            self.inputs['servicio'].currentIndexChanged.connect(load_menus);load_menus()
        scroll.setWidget(content); outer.addWidget(scroll)
        self.buttons=QDialogButtonBox(QDialogButtonBox.Save|QDialogButtonBox.Cancel); self.buttons.button(QDialogButtonBox.Save).setText('Guardar'); self.buttons.button(QDialogButtonBox.Cancel).setText('Cancelar')
        self.buttons.accepted.connect(self.accept); self.buttons.rejected.connect(self.reject); outer.addWidget(self.buttons)
    def values(self):
        out={}
        for f in self.fields:
            w=self.inputs[f.key]
            if isinstance(w,QDateEdit):out[f.key]='' if w.property('optionalEmpty') and w.date()==w.minimumDate() else w.date().toString('yyyy-MM-dd')
            elif isinstance(w,QTimeEdit):out[f.key]='' if w.property('optionalEmpty') and w.time()==QTime(0,0) else w.time().toString('HH:mm')
            else:out[f.key]=w.currentData() if f.type in ('staff_ref','menu_ref') else w.currentText() if isinstance(w,QComboBox) else w.toPlainText() if isinstance(w,QTextEdit) else w.text()
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
        if self.setup:l.addWidget(label('La contraseña debe tener al menos 12 caracteres. Al terminar recibirás un código de recuperación para guardarlo en un lugar seguro.','muted'))
        else:
            self.remember=QCheckBox('Mantener mi sesión iniciada en este Mac');self.remember.setChecked(True);l.addWidget(self.remember)
        self.message=label(''); self.message.setStyleSheet('color:#a12d3a;'); l.addWidget(self.message)
        l.addWidget(button('Configurar mi centro' if self.setup else 'Entrar',self.submit,True))
        if not self.setup:l.addWidget(button('Olvidé mi usuario o contraseña',self.recover))
        self.inputs['password'].returnPressed.connect(self.submit)
    def submit(self):
        d={k:w.text() for k,w in self.inputs.items()}
        try:
            if self.setup:
                if d['password']!=d['repeat']:raise AppError('Las contraseñas no coinciden.')
                recovery=self.store.bootstrap(d['username'],d['password'],d['name'],d['school'])
                QMessageBox.information(self,'Guarda tu código de recuperación',f'Este código permite recuperar el acceso sin internet. Guárdalo fuera del Mac y no lo compartas.\n\n{recovery}\n\nPor seguridad solo se muestra ahora; podrás generar otro desde Usuarios y permisos.')
            else:self.store.login(d['username'],d['password'],self.remember.isChecked())
            self.accept()
        except AppError as e:self.message.setText(str(e))
    def recover(self):
        d=QDialog(self);d.setWindowTitle('Recuperar acceso');d.resize(520,300);layout=QVBoxLayout(d)
        layout.addWidget(label('Recuperar usuario y contraseña','brand'));layout.addWidget(label('Escribe el código de recuperación guardado al configurar la cuenta. Este proceso funciona completamente sin internet.','muted'))
        form=QFormLayout();code=QLineEdit();username=QLineEdit();password=QLineEdit();repeat=QLineEdit();password.setEchoMode(QLineEdit.Password);repeat.setEchoMode(QLineEdit.Password)
        form.addRow('Código de recuperación',code);form.addRow('Nuevo usuario',username);form.addRow('Nueva contraseña',password);form.addRow('Repita la contraseña',repeat);layout.addLayout(form)
        buttons=QDialogButtonBox(QDialogButtonBox.Save|QDialogButtonBox.Cancel);buttons.button(QDialogButtonBox.Save).setText('Recuperar acceso');buttons.accepted.connect(d.accept);buttons.rejected.connect(d.reject);layout.addWidget(buttons)
        while d.exec()==QDialog.Accepted:
            try:
                if password.text()!=repeat.text():raise AppError('Las contraseñas no coinciden.')
                new_code=self.store.recover_access(code.text(),username.text(),password.text());self.inputs['username'].setText(username.text());QMessageBox.information(self,'Acceso recuperado',f'Tu usuario y contraseña fueron actualizados. Entra con los datos nuevos.\n\nGuarda este nuevo código de recuperación; el anterior ya no funciona:\n\n{new_code}');return
            except AppError as e:error(d,e)

class MainWindow(QMainWindow):
    def __init__(self,store):
        super().__init__(); self.store=store; self.setWindowTitle('AulaLocal'); self.resize(1380,880); self.setMinimumSize(1100,720); self.current='dashboard'; self.rows=[]
        root=QWidget(); self.setCentralWidget(root); layout=QHBoxLayout(root); layout.setContentsMargins(22,22,22,22); layout.setSpacing(24)
        sidebar=QVBoxLayout(); brand=label('AulaLocal','brand'); sidebar.addWidget(brand); sidebar.addWidget(label('GESTIÓN DEL CENTRO','muted'))
        self.nav=QListWidget(); self.nav.setFixedWidth(248);self.nav.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff); self.keys=['dashboard']+list(ACCESS[store.user['role']]); self.keys=['dashboard']+[k for k in MODULES if k in ACCESS[store.user['role']]]
        if store.user['role'] in ('admin','direccion'):self.keys+=['audit']
        if store.user['role']=='admin':self.keys+=['academic','years','settings','users','backup']
        names={'dashboard':'Dirección','audit':'Auditoría','academic':'Estructura académica','years':'Años escolares','settings':'Mi centro','users':'Usuarios y permisos','backup':'Copias y restauración'}
        symbols={'dashboard':'◆','students':'●','staff':'●','attendance':'✓','menus':'◫','receipts':'▣','expenses':'$','facilities':'⌂','visits':'↪','audit':'◎','academic':'▦','years':'◷','settings':'⚙','users':'♙','backup':'⇩'}
        for k in self.keys:self.nav.addItem(f"{symbols.get(k,'•')}  {MODULES[k][0] if k in MODULES else names[k]}")
        sidebar.addWidget(self.nav,1); sidebar.addWidget(label('100 % local · Sin telemetría','muted')); sidebar.addWidget(button('Cerrar sesión',self.lock))
        layout.addLayout(sidebar)
        right=QVBoxLayout(); layout.addLayout(right,1)
        top=QHBoxLayout(); self.school=label(store.settings()['centro'],'schoolHeader');self.school.setTextInteractionFlags(Qt.TextSelectableByMouse);self.school.setSizePolicy(QSizePolicy.Expanding,QSizePolicy.Preferred);self.school.setMinimumHeight(44);self.school.setToolTip(store.settings()['centro']);top.addWidget(self.school,1)
        top.addWidget(label('Año escolar')); self.year_combo=QComboBox(); self.year_combo.setMinimumWidth(200); top.addWidget(self.year_combo); right.addLayout(top)
        identity=QHBoxLayout();self.identity=label(f"{store.user['name']} · {ROLES[store.user['role']]}",'muted');self.identity.setWordWrap(False);identity.addWidget(self.identity);identity.addStretch();self.clock=label('','clock');self.clock.setWordWrap(False);identity.addWidget(self.clock);right.addLayout(identity)
        self.body=QVBoxLayout(); self.body.setSpacing(15); right.addLayout(self.body,1)
        self.statusBar().showMessage('Listo. Los cambios se guardan localmente.')
        self.refresh_years(); self.nav.currentRowChanged.connect(self.navigate); self.year_combo.currentIndexChanged.connect(self.render); self.nav.setCurrentRow(0)
        self.timer=QTimer(self); self.timer.timeout.connect(self.check_session); self.timer.start(1000);self.check_session()
        QApplication.instance().installEventFilter(self)
    def eventFilter(self,obj,event):
        if self.store.user and event.type() in (QEvent.KeyPress,QEvent.MouseButtonPress,QEvent.Wheel):
            self.store.last_active=time.monotonic()
        return super().eventFilter(obj,event)
    def check_session(self):
        if not self.store.user:self.lock();return
        self.clock.setText(local_now().strftime('%d/%m/%Y · %I:%M:%S %p')+' · '+timezone_label())
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
        if kind in ('menus','receipts'):
            toolbar.addWidget(button('Tipos de alimentación',lambda:self.safe(self.food_services_dialog)))
        self.body.addLayout(toolbar)
        if kind=='students':
            filters=QHBoxLayout();filters.addWidget(label('Organizar por:'))
            self.level_filter=QComboBox();self.level_filter.addItem('Todos los niveles','')
            for level in self.store.academic_levels():self.level_filter.addItem(level['name'],level['id'])
            self.grade_filter=QComboBox();self.grade_filter.addItem('Todos los grados','');self.section_filter=QComboBox();self.section_filter.addItem('Todas las secciones','')
            def update_grades():
                self.grade_filter.blockSignals(True);self.grade_filter.clear();self.grade_filter.addItem('Todos los grados','')
                for grade in self.store.grades(self.level_filter.currentData() or None):self.grade_filter.addItem(grade['name'],grade['id'])
                self.grade_filter.blockSignals(False);update_sections()
            def update_sections():
                self.section_filter.blockSignals(True);self.section_filter.clear();self.section_filter.addItem('Todas las secciones','')
                for section in self.store.sections(self.year_id(),self.grade_filter.currentData() or None):
                    if not self.level_filter.currentText().startswith('Todos') and section['level']!=self.level_filter.currentText():continue
                    self.section_filter.addItem(f"{section['name']} · {section['grade']}",(section['level'],section['grade'],section['name']))
                self.section_filter.blockSignals(False)
                if getattr(self,'table',None) is not None and self.table.isVisible():self.fill_table()
            self.level_filter.currentIndexChanged.connect(update_grades);self.grade_filter.currentIndexChanged.connect(update_sections);self.section_filter.currentIndexChanged.connect(self.fill_table)
            for w in (self.level_filter,self.grade_filter,self.section_filter):filters.addWidget(w)
            filters.addStretch();self.body.addLayout(filters);update_grades()
        self.table=table_widget([],[]); self.body.addWidget(self.table,1); self.search.textChanged.connect(self.fill_table); self.table.doubleClicked.connect(lambda _:self.safe(self.edit_record))
        self.fill_table()
        evidence_label='Fotos y evidencias' if kind in ('menus','receipts') else 'Adjuntos'
        actions=[]
        if kind=='menus':actions.extend([('Registrar entrega',self.delivery_from_menu),('Eliminar menú',self.remove_menu)])
        actions.extend([('Ver ficha',self.view_detail),('Detalle PDF',self.detail_pdf),('Reporte PDF',lambda:self.export('pdf')),('Excel',lambda:self.export('xlsx')),(evidence_label,self.attachments_dialog)])
        if kind in ('students','staff'):
            actions.extend([('Importar Excel',self.import_excel),('Descargar plantilla',self.import_template)])
        if kind=='attendance':actions.append(('Importar ponchador',self.import_puncher))
        if kind in ('staff','students') and self.store.user['role'] in ('admin','direccion','secretaria'):actions.append(('Emitir constancia',self.letter))
        action_grid=QGridLayout();action_grid.setHorizontalSpacing(10);action_grid.setVerticalSpacing(8)
        for i,(text,fn) in enumerate(actions):
            b=button(text,lambda checked=False,f=fn:self.safe(f),text in ('Importar Excel','Importar ponchador'))
            if text in ('Importar Excel','Importar ponchador'):b.setEnabled(editable)
            if text in ('Registrar entrega','Eliminar menú'):b.setEnabled(editable)
            action_grid.addWidget(b,i//4,i%4)
        self.body.addLayout(action_grid)
        note='Doble clic para editar. Los reportes respetan la búsqueda y los filtros visibles.'
        if kind=='menus':note+=' «Registrar entrega» abre el calendario y la hora para el menú seleccionado. «Eliminar menú» lo retira de las opciones nuevas sin borrar las entregas históricas.'
        if kind=='attendance':note+=' El informe incluye un resumen por persona y el detalle diario, listo para supervisión.'
        if kind=='receipts':note+=' El reporte permite elegir período, servicio, formato y si deseas imprimir las fotografías.'
        self.body.addWidget(label(note,'muted'))
    def active_report_filters(self):
        if self.current!='students' or not hasattr(self,'level_filter'):return {}
        filters={}
        if self.level_filter.currentData():filters['nivel']=self.level_filter.currentText()
        if self.grade_filter.currentData():filters['grado']=self.grade_filter.currentText()
        selected=self.section_filter.currentData()
        if selected:
            level,grade,section=selected;filters.update({'nivel':level,'grado':grade,'seccion':section})
        return filters
    def fill_table(self,*_):
        kind=self.current; self.rows=self.store.list_records(kind,self.year_id(),self.search.text()); data=reports.readable_rows(self.store,kind,self.year_id(),self.search.text()); cols=reports.COLUMNS[kind]; fields={f.key:f.label for f in MODULES[kind][1]}
        fields['edad']='Edad actual'
        if kind=='students' and hasattr(self,'level_filter'):
            filters=self.active_report_filters();self.rows=[r for r in self.rows if all(str(r['data'].get(key,''))==str(value) for key,value in filters.items())];data=reports.readable_rows(self.store,kind,self.year_id(),self.search.text(),filters)
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
    def record_form(self,record=None,kind=None,preset=None):
        kind=kind or self.current; self.store.require(kind,write=True); self.store._open(self.year_id())
        values=record['data'] if record else {}
        if not record:
            y=self.store.year(self.year_id()); today=date.today().isoformat(); values={'fecha':today if y['start_date']<=today<=y['end_date'] else y['start_date']}
            if kind=='receipts':values.update({'rechazadas':'0','hora':local_now().strftime('%H:%M')})
            values.update(preset or {})
        f=Form(self,MODULES[kind][0],MODULES[kind][1],values,self.store,self.year_id())
        while f.exec()==QDialog.Accepted:
            try:
                saved=f.values();rid=self.store.save_record(kind,self.year_id(),saved,record['id'] if record else None,record['version'] if record else None)
                if not record and kind=='receipts' and QMessageBox.question(self,'Agregar fotografías','¿Deseas agregar ahora una o varias fotos de la entrega recibida?')==QMessageBox.Yes:self.add_food_photos(kind,self.year_id(),rid)
                if not record and kind=='menus' and QMessageBox.question(self,'Menú guardado','El menú quedó disponible. ¿Deseas registrar ahora la entrega de este día con fecha, hora, cantidad y fotografías?')==QMessageBox.Yes:
                    self.record_form(kind='receipts',preset={'servicio':saved['servicio'],'menu':rid})
                self.render();return
            except AppError as e:error(f,e)
    def delivery_from_menu(self):
        menu=self.selected();data=menu['data']
        if data.get('estado')!='Activo':raise AppError('Active el menú antes de registrar una entrega nueva.')
        self.record_form(kind='receipts',preset={'servicio':data['servicio'],'menu':menu['id']})
    def remove_menu(self):
        menu=self.selected();name=menu['data'].get('nombre','este menú')
        if QMessageBox.question(self,'Eliminar menú',f'¿Eliminar «{name}» de las opciones disponibles?\n\nLas entregas, fotografías e informes históricos se conservarán.')!=QMessageBox.Yes:return
        reason,ok=QInputDialog.getText(self,'Motivo de eliminación','Escriba brevemente el motivo:')
        if not ok:return
        self.store.delete_menu(self.year_id(),menu['id'],reason);self.render();self.statusBar().showMessage('Menú eliminado. El historial permanece intacto.')
    def food_services_dialog(self):
        self.store.require('menus');d=QDialog(self);d.setWindowTitle('Tipos de alimentación');d.resize(620,500);layout=QVBoxLayout(d)
        layout.addWidget(label('Tipos de alimentación','brand'));layout.addWidget(label('Agrega aquí cualquier tipo adicional. Los tipos activos aparecerán automáticamente en Menús y Alimentación escolar.','muted'))
        listing=QListWidget();layout.addWidget(listing,1);items=[]
        def refresh():
            items[:]=self.store.food_services(False);listing.clear()
            for item in items:listing.addItem(f"{item['name']}  ·  {'Activo' if item['active'] else 'Oculto'}")
        def add():
            name,ok=QInputDialog.getText(d,'Nuevo tipo','Nombre del tipo de alimentación:')
            if ok:self.store.save_food_service(name);refresh()
        def toggle():
            index=listing.currentRow()
            if index<0:raise AppError('Seleccione un tipo de alimentación.')
            item=items[index];self.store.set_food_service_active(item['id'],not item['active']);refresh()
        refresh();bar=QHBoxLayout();editable=self.store.user['role']!='consulta';add_button=button('Agregar nuevo tipo',lambda:self.safe(add),True);add_button.setEnabled(editable);bar.addWidget(add_button);toggle_button=button('Mostrar u ocultar seleccionado',lambda:self.safe(toggle));toggle_button.setEnabled(editable);bar.addWidget(toggle_button);bar.addStretch();layout.addLayout(bar)
        close=QDialogButtonBox(QDialogButtonBox.Close);close.rejected.connect(d.reject);layout.addWidget(close);d.exec();self.render()
    def add_food_photos(self,kind,year,rid):
        paths,_=QFileDialog.getOpenFileNames(self,'Seleccionar fotografías','','Fotografías (*.jpg *.jpeg *.png)')
        if paths:
            ids=self.store.attach_many(kind,year,rid,paths);self.statusBar().showMessage(f'{len(ids)} fotografía(s) guardada(s) en el registro.')
    def export(self,fmt):
        period=None
        if self.current=='attendance':
            period=self.attendance_period()
            if period is None:return
        food_options=None
        if self.current=='receipts':
            food_options=self.food_report_options(fmt)
            if food_options is None:return
        path,_=QFileDialog.getSaveFileName(self,'Guardar reporte',f"{self.current}-{self.store.year(self.year_id())['label']}.{fmt}",f'{fmt.upper()} (*.{fmt})')
        if path:
            if self.current=='attendance':
                fn=reports.report_attendance_pdf if fmt=='pdf' else reports.report_attendance_xlsx;fn(self.store,self.year_id(),path,period[0],period[1],self.search.text())
            elif self.current=='receipts':
                if fmt=='pdf':reports.report_food_pdf(self.store,self.year_id(),path,food_options['start'],food_options['end'],food_options['service'],self.search.text(),food_options['photos'],food_options['layout'])
                else:reports.report_food_xlsx(self.store,self.year_id(),path,food_options['start'],food_options['end'],food_options['service'],self.search.text())
            else:(reports.report_pdf if fmt=='pdf' else reports.report_xlsx)(self.store,self.current,self.year_id(),path,self.search.text(),self.active_report_filters())
            self.statusBar().showMessage('Reporte guardado y listo para imprimir.')
    def food_report_options(self,fmt):
        y=self.store.year(self.year_id());d=QDialog(self);d.setWindowTitle('Informe de alimentación escolar');d.resize(560,390);layout=QVBoxLayout(d);layout.addWidget(label('Preparar informe de alimentación','brand'));layout.addWidget(label('Selecciona el período, el servicio y el estilo del documento.','muted'));form=QFormLayout()
        start=QDateEdit();end=QDateEdit();minimum=QDate.fromString(y['start_date'],'yyyy-MM-dd');maximum=QDate.fromString(y['end_date'],'yyyy-MM-dd');today=QDate.currentDate();initial_start=QDate(today.year(),today.month(),1) if minimum<=today<=maximum else minimum;initial_end=today if minimum<=today<=maximum else maximum
        for widget,value in ((start,initial_start),(end,initial_end)):widget.setCalendarPopup(True);widget.setDisplayFormat('dd/MM/yyyy');widget.setMinimumDate(minimum);widget.setMaximumDate(maximum);widget.setDate(value)
        service=QComboBox();service.addItem('Todos los tipos','')
        configured=[item['name'] for item in self.store.food_services(False)];used={row['data'].get('servicio','') for row in self.store.list_records('receipts',self.year_id())}
        for name in configured+sorted(used-set(configured)-{''}):service.addItem(name,name)
        form.addRow('Desde',start);form.addRow('Hasta',end);form.addRow('Tipo de alimentación',service)
        style=QComboBox();style.addItem('Resumen institucional','summary');style.addItem('Fichas por cada entrega','delivery');photos=QCheckBox('Incluir las fotografías de cada entrega');photos.setChecked(False)
        if fmt=='pdf':form.addRow('Formato',style);form.addRow('',photos)
        else:form.addRow('Contenido',label('Resumen y detalle en dos hojas de Excel'))
        layout.addLayout(form)
        if fmt=='pdf':layout.addWidget(label('Resumen institucional: tabla compacta para archivo. Fichas por entrega: una presentación detallada por recepción. Puedes generar cualquiera con fotos o sin fotos.','muted'))
        else:layout.addWidget(label('Las fotografías no se incrustan en Excel; la cantidad de evidencias se indica por entrega. Para imprimir fotografías usa Reporte PDF.','muted'))
        buttons=QDialogButtonBox(QDialogButtonBox.Ok|QDialogButtonBox.Cancel);buttons.button(QDialogButtonBox.Ok).setText('Crear informe');buttons.accepted.connect(d.accept);buttons.rejected.connect(d.reject);layout.addWidget(buttons)
        if d.exec()!=QDialog.Accepted:return None
        result={'start':start.date().toString('yyyy-MM-dd'),'end':end.date().toString('yyyy-MM-dd'),'service':service.currentData() or '','photos':photos.isChecked(),'layout':style.currentData()};reports.food_report_data(self.store,self.year_id(),result['start'],result['end'],result['service'],self.search.text());return result
    def attendance_period(self):
        y=self.store.year(self.year_id());d=QDialog(self);d.setWindowTitle('Período del informe');layout=QVBoxLayout(d);layout.addWidget(label('Informe de asistencia para supervisión','brand'));layout.addWidget(label('Elige el período que aparecerá en el resumen y en el detalle diario.','muted'))
        form=QFormLayout();start=QDateEdit();end=QDateEdit();minimum=QDate.fromString(y['start_date'],'yyyy-MM-dd');maximum=QDate.fromString(y['end_date'],'yyyy-MM-dd');today=QDate.currentDate();initial_start=QDate(today.year(),today.month(),1) if minimum<=today<=maximum else minimum;initial_end=today if minimum<=today<=maximum else maximum
        for widget,value in ((start,initial_start),(end,initial_end)):widget.setCalendarPopup(True);widget.setDisplayFormat('dd/MM/yyyy');widget.setMinimumDate(minimum);widget.setMaximumDate(maximum);widget.setDate(value)
        form.addRow('Desde',start);form.addRow('Hasta',end);layout.addLayout(form);buttons=QDialogButtonBox(QDialogButtonBox.Ok|QDialogButtonBox.Cancel);buttons.button(QDialogButtonBox.Ok).setText('Continuar');buttons.accepted.connect(d.accept);buttons.rejected.connect(d.reject);layout.addWidget(buttons)
        if d.exec()!=QDialog.Accepted:return None
        start_text=start.date().toString('yyyy-MM-dd');end_text=end.date().toString('yyyy-MM-dd');reports.attendance_report_data(self.store,self.year_id(),start_text,end_text,self.search.text());return start_text,end_text
    def detail_pdf(self):
        r=self.selected(); path,_=QFileDialog.getSaveFileName(self,'Guardar expediente',f"expediente-{r['id']}.pdf",'PDF (*.pdf)')
        if path:reports.record_pdf(self.store,self.current,self.year_id(),r['id'],path);self.statusBar().showMessage('Expediente PDF guardado.')
    def view_detail(self):
        r=self.selected();d=QDialog(self);d.setWindowTitle('Ficha del registro');d.resize(720,680);outer=QVBoxLayout(d);outer.addWidget(label(r['data'].get('nombre',MODULES[self.current][0]),'brand'))
        if self.current=='students':
            profile=self.store.student_profile(self.year_id(),r['data']);color='#19734A' if profile['edad_en_rango'] is True else '#A05A00' if profile['edad_en_rango'] is False else '#607482'
            age=label(f"Edad actual: {profile['edad']}  ·  Al iniciar el año: {profile['edad_inicio_año']}  ·  Rango configurado: {profile['rango_esperado']}");age.setStyleSheet(f'color:{color};font-size:15px;font-weight:700;padding:10px;background:#FFFFFF;border-radius:8px;');outer.addWidget(age)
            if profile['edad_en_rango'] is False:outer.addWidget(label('La edad está fuera del rango configurado. Es una alerta informativa: el registro no se modifica automáticamente.','muted'))
        scroll=QScrollArea();scroll.setWidgetResizable(True);content=QWidget();form=QFormLayout(content)
        for field in MODULES[self.current][1]:form.addRow(field.label,label(str(r['data'].get(field.key,'') or 'No registrado')))
        scroll.setWidget(content);outer.addWidget(scroll);close=QDialogButtonBox(QDialogButtonBox.Close);close.rejected.connect(d.reject);outer.addWidget(close);d.exec()
    def import_template(self):
        path,_=QFileDialog.getSaveFileName(self,'Guardar plantilla',f'plantilla-{self.current}.xlsx','Excel (*.xlsx)')
        if path:self.store.create_import_template(self.current,path);QMessageBox.information(self,'Plantilla creada','La plantilla está lista. Puedes completarla en Excel y luego importarla.')
    def import_excel(self):
        path,_=QFileDialog.getOpenFileName(self,'Importar datos','','Excel o CSV (*.xlsx *.csv)')
        if not path:return
        defaults={}
        if self.current=='students':
            dialog=QDialog(self);dialog.setWindowTitle('Destino de los estudiantes');layout=QVBoxLayout(dialog);layout.addWidget(label('Clasificar estudiantes importados','brand'));layout.addWidget(label('Estas opciones se aplican cuando la hoja no trae nivel, grado o sección.','muted'));form=QFormLayout()
            level=QComboBox();grade=QComboBox();section=QComboBox()
            for item in self.store.academic_levels():level.addItem(item['name'],item['id'])
            def load_grades():
                grade.clear()
                for item in self.store.grades(level.currentData()):grade.addItem(item['name'],item['id'])
                load_sections()
            def load_sections():
                section.clear()
                for item in self.store.sections(self.year_id(),grade.currentData()):section.addItem(item['name'],item['id'])
            level.currentIndexChanged.connect(load_grades);grade.currentIndexChanged.connect(load_sections);form.addRow('Nivel',level);form.addRow('Grado',grade);form.addRow('Sección',section);layout.addLayout(form);load_grades()
            buttons=QDialogButtonBox(QDialogButtonBox.Ok|QDialogButtonBox.Cancel);buttons.button(QDialogButtonBox.Ok).setText('Importar');buttons.accepted.connect(dialog.accept);buttons.rejected.connect(dialog.reject);layout.addWidget(buttons)
            if dialog.exec()!=QDialog.Accepted:return
            defaults={'nivel':level.currentText(),'grado':grade.currentText(),'seccion':section.currentText()}
        count=self.store.import_records(self.current,self.year_id(),path,defaults);QMessageBox.information(self,'Importación completada',f'Se importaron {count} registros correctamente.');self.render()
    def import_puncher(self):
        path,_=QFileDialog.getOpenFileName(self,'Seleccionar archivo del ponchador','','Excel o CSV (*.xlsx *.csv)')
        if not path:return
        result=self.store.analyze_attendance_file(self.year_id(),path);issues=[]
        if result['unmatched']:issues.append(f"Sin coincidencia con el personal: {len(result['unmatched'])}")
        if result['errors']:issues.append(f"Filas que se omitirán: {len(result['errors'])}")
        detail=(f"Marcaciones reconocidas: {result['source_marks']}\nJornadas vinculadas al personal: {result['matched_sessions']}\nFila de encabezados detectada: {result['header_row']}\n"+('\n'.join(issues) if issues else 'No se detectaron problemas.'))
        if result['unmatched']:detail+='\n\nPrimeras coincidencias pendientes:\n'+'\n'.join(result['unmatched'][:8])
        if result['errors']:detail+='\n\nPrimeras filas omitidas:\n'+'\n'.join(result['errors'][:6])
        if QMessageBox.question(self,'Revisión del archivo',detail+'\n\n¿Importar las jornadas reconocidas?')!=QMessageBox.Yes:return
        imported=self.store.import_attendance_file(self.year_id(),path);message=(f"Jornadas nuevas: {imported['created']}\nJornadas actualizadas: {imported['updated']}\nSin cambios: {imported['unchanged']}\nPersonas o filas por revisar: {len(imported['unmatched'])+len(imported['errors'])}")
        QMessageBox.information(self,'Importación del ponchador completada',message);self.render()
    def letter(self):
        r=self.selected(); d=QDialog(self); d.setWindowTitle('Revisar constancia antes de imprimir'); d.resize(720,650); l=QVBoxLayout(d)
        l.addWidget(label('Revisa el texto y genera el PDF','brand')); text=QTextEdit();text.setPlainText(reports.document_text(self.store,self.current,self.year_id(),r['id']));l.addWidget(text)
        buttons=QDialogButtonBox(QDialogButtonBox.Save|QDialogButtonBox.Cancel);buttons.accepted.connect(d.accept);buttons.rejected.connect(d.reject);l.addWidget(buttons)
        if d.exec()==QDialog.Accepted:
            path,_=QFileDialog.getSaveFileName(self,'Guardar constancia','constancia.pdf','PDF (*.pdf)')
            if path:reports.letter_pdf(self.store,self.current,self.year_id(),r['id'],path,text.toPlainText());self.statusBar().showMessage('Constancia guardada. Abra el PDF para imprimirlo.')
    def attachments_dialog(self):
        r=self.selected(); kind=self.current; year=self.year_id(); food=kind in ('menus','receipts');d=QDialog(self);d.setWindowTitle('Fotos y evidencias' if food else 'Adjuntos y evidencias');d.resize(820,560);l=QVBoxLayout(d);l.addWidget(label('Galería de la entrega' if kind=='receipts' else 'Galería del menú' if kind=='menus' else 'Archivos del registro','brand'));listing=QListWidget();items=[]
        if food:listing.setViewMode(QListWidget.IconMode);listing.setResizeMode(QListWidget.Adjust);listing.setIconSize(QSize(150,105));listing.setGridSize(QSize(180,145));listing.setWrapping(True);listing.setWordWrap(True)
        l.addWidget(listing,1)
        def refresh():
            items[:]=self.store.attachments(kind,year,r['id']);listing.clear()
            for a in items:
                item=QListWidgetItem(f"{a['name']}\n{a['size']//1024} KB")
                if a['mime'].startswith('image/'):
                    pixmap=QPixmap();pixmap.loadFromData(self.store.attachment_bytes(kind,year,r['id'],a['id'],False));item.setIcon(QIcon(pixmap))
                listing.addItem(item)
        def add():
            paths,_=QFileDialog.getOpenFileNames(d,'Agregar fotos o archivos','','Fotos y archivos (*.png *.jpg *.jpeg *.pdf *.xlsx *.docx *.txt)')
            if paths:self.store.attach_many(kind,year,r['id'],paths);refresh()
        def save():
            i=listing.currentRow()
            if i<0:raise AppError('Seleccione un adjunto.')
            a=items[i];path,_=QFileDialog.getSaveFileName(d,'Guardar copia',a['name'])
            if path:atomic_write(path,self.store.attachment_bytes(kind,year,r['id'],a['id']))
        def preview():
            i=listing.currentRow()
            if i<0:raise AppError('Seleccione una fotografía.')
            a=items[i]
            if not a['mime'].startswith('image/'):raise AppError('La vista previa está disponible para fotografías.')
            pixmap=QPixmap();pixmap.loadFromData(self.store.attachment_bytes(kind,year,r['id'],a['id'],False));view=QDialog(d);view.setWindowTitle(a['name']);view.resize(960,720);outer=QVBoxLayout(view);photo=QLabel();photo.setAlignment(Qt.AlignCenter);photo.setPixmap(pixmap.scaled(900,650,Qt.KeepAspectRatio,Qt.SmoothTransformation));outer.addWidget(photo,1);close=QDialogButtonBox(QDialogButtonBox.Close);close.rejected.connect(view.reject);outer.addWidget(close);view.exec()
        refresh();bar=QHBoxLayout();editable=self.store.year(year)['status']=='abierto' and self.store.user['role']!='consulta';b=button('Agregar varias fotos o archivos',lambda:self.safe(add),True);b.setEnabled(editable);bar.addWidget(b)
        if food:bar.addWidget(button('Vista previa',lambda:self.safe(preview)))
        bar.addWidget(button('Guardar copia',lambda:self.safe(save)));l.addLayout(bar);l.addWidget(label('Puedes seleccionar varias fotografías a la vez. Cada archivo puede pesar hasta 25 MB y se conserva íntegro dentro de la aplicación para proteger la evidencia y la auditoría.','muted'));d.exec()
    def new_year(self):
        from .catalog import F
        f=Form(self,'Crear año escolar',[F('label','Año escolar',required=True),F('start','Inicio','date',True),F('end','Fin','date',True)],{'label':'2026-2027','start':'2026-08-01','end':'2027-07-31'})
        while f.exec()==QDialog.Accepted:
            try:
                d=f.values();new=self.store.create_year(d['label'],d['start'],d['end']);self.refresh_years();self.year_combo.setCurrentIndex(self.year_combo.findData(new));self.render();return
            except AppError as e:error(f,e)
    def academic_page(self):
        self.body.addWidget(label('Niveles, grados y secciones','title'));self.body.addWidget(label('Estructura académica configurable. Los rangos de edad generan alertas informativas y aparecen en la ficha del estudiante.','muted'))
        tabs=QGridLayout();levels=self.store.academic_levels(False);grades=self.store.grades(active_only=False);sections=self.store.academic_summary(self.year_id()) if self.year_id() else []
        level_box=QGroupBox('Niveles educativos');ll=QVBoxLayout(level_box);ll.addWidget(table_widget(['Nivel','Orden'],[[x['name'],x['sort_order']] for x in levels]));
        grade_box=QGroupBox('Grados y rangos de edad');gl=QVBoxLayout(grade_box);gl.addWidget(table_widget(['Nivel','Grado','Edad mínima','Edad máxima'],[[x['level'],x['name'],x['min_age'] if x['min_age'] is not None else '',x['max_age'] if x['max_age'] is not None else ''] for x in grades]));
        section_box=QGroupBox('Secciones del año seleccionado');sl=QVBoxLayout(section_box);sl.addWidget(table_widget(['Nivel','Grado','Sección','Capacidad','Estudiantes'],[[x['level'],x['grade'],x['name'],x['capacity'] or '',x['students']] for x in sections]));
        tabs.addWidget(level_box,0,0);tabs.addWidget(grade_box,0,1);tabs.addWidget(section_box,1,0,1,2);self.body.addLayout(tabs,1)
        def new_level():
            from .catalog import F
            f=Form(self,'Crear nivel educativo',[F('name','Nombre',required=True),F('order','Orden','integer',True)],{'order':'40'})
            if f.exec()==QDialog.Accepted:self.store.save_level(f.values()['name'],f.values()['order']);self.render()
        def new_grade():
            d=QDialog(self);d.setWindowTitle('Crear grado');l=QFormLayout(d);level=QComboBox()
            for x in levels:level.addItem(x['name'],x['id'])
            name=QLineEdit();minimum=QLineEdit();maximum=QLineEdit();order=QLineEdit('10');l.addRow('Nivel',level);l.addRow('Nombre',name);l.addRow('Edad mínima',minimum);l.addRow('Edad máxima',maximum);l.addRow('Orden',order);buttons=QDialogButtonBox(QDialogButtonBox.Save|QDialogButtonBox.Cancel);buttons.accepted.connect(d.accept);buttons.rejected.connect(d.reject);l.addRow(buttons)
            if d.exec()==QDialog.Accepted:self.store.save_grade(level.currentData(),name.text(),minimum.text(),maximum.text(),order.text());self.render()
        def new_section():
            d=QDialog(self);d.setWindowTitle('Crear sección');l=QFormLayout(d);grade=QComboBox()
            for x in grades:grade.addItem(f"{x['level']} · {x['name']}",x['id'])
            name=QLineEdit();capacity=QLineEdit();l.addRow('Grado',grade);l.addRow('Sección',name);l.addRow('Capacidad (opcional)',capacity);buttons=QDialogButtonBox(QDialogButtonBox.Save|QDialogButtonBox.Cancel);buttons.accepted.connect(d.accept);buttons.rejected.connect(d.reject);l.addRow(buttons)
            if d.exec()==QDialog.Accepted:self.store.save_section(self.year_id(),grade.currentData(),name.text(),capacity.text());self.render()
        bar=QHBoxLayout();bar.addWidget(button('Crear nivel',lambda:self.safe(new_level)));bar.addWidget(button('Crear grado',lambda:self.safe(new_grade)));bar.addWidget(button('Crear sección',lambda:self.safe(new_section),True));bar.addStretch();self.body.addLayout(bar)
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
        s=self.store.settings();scroll=QScrollArea();scroll.setWidgetResizable(True);scroll.setFrameShape(QFrame.NoFrame);scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff);page=QWidget();content=QVBoxLayout(page);content.setSpacing(18);content.setContentsMargins(4,4,14,18);inputs={}
        content.addWidget(label('Mi centro','title'));content.addWidget(label('Información institucional completa. Estos datos aparecerán en los encabezados de informes, certificaciones y cartas.','muted'))
        summary=QFrame();summary.setObjectName('card');summary_layout=QVBoxLayout(summary);summary_layout.setContentsMargins(24,20,24,20);summary_layout.setSpacing(10)
        center_name=label(s.get('centro','Centro educativo'),'centerName');center_name.setTextInteractionFlags(Qt.TextSelectableByMouse);summary_layout.addWidget(center_name)
        summary_grid=QGridLayout();summary_grid.setHorizontalSpacing(32);summary_grid.setVerticalSpacing(8);summary_values={}
        for index,(key,title) in enumerate([('codigo','Código del centro'),('director','Director/a'),('direccion','Dirección'),('telefono','Teléfono')]):
            summary_grid.addWidget(label(title,'muted'),index//2*2,index%2);value=label(s.get(key,'') or 'No registrado','fieldValue');value.setTextInteractionFlags(Qt.TextSelectableByMouse);summary_values[key]=value;summary_grid.addWidget(value,index//2*2+1,index%2)
        summary_layout.addLayout(summary_grid);content.addWidget(summary)
        editor=QGroupBox('Editar datos institucionales');editor_layout=QFormLayout(editor);editor_layout.setContentsMargins(22,26,22,20);editor_layout.setVerticalSpacing(14);editor_layout.setLabelAlignment(Qt.AlignLeft|Qt.AlignVCenter)
        for key,title in [('centro','Nombre completo del centro'),('codigo','Código del centro'),('director','Director/a'),('direccion','Dirección completa'),('telefono','Teléfono')]:
            w=QLineEdit(s.get(key,''));w.setMinimumHeight(44);w.setMinimumWidth(520);w.setClearButtonEnabled(True)
            if key=='centro':w.setStyleSheet('font-size:17px;font-weight:650;')
            inputs[key]=w;editor_layout.addRow(title,w)
        content.addWidget(editor)
        attendance=QGroupBox('Horario del personal y ponchador');attendance_form=QFormLayout(attendance);attendance_form.setContentsMargins(22,26,22,20);attendance_form.setVerticalSpacing(12)
        for key,title in [('attendance_start','Hora esperada de entrada'),('attendance_end','Hora esperada de salida'),('attendance_grace','Minutos de gracia')]:
            w=QLineEdit(s.get(key,''));inputs[key]=w;w.setMinimumHeight(42);w.setPlaceholderText('HH:MM' if key!='attendance_grace' else '0');attendance_form.addRow(title,w)
        attendance_form.addRow('',label('Estos valores permiten clasificar las marcaciones como Presente o Tardanza. El archivo original nunca sale del Mac.','muted'));content.addWidget(attendance)
        def save():
            self.store.save_settings({k:w.text() for k,w in inputs.items()});saved=self.store.settings();self.school.setText(saved['centro']);self.school.setToolTip(saved['centro']);center_name.setText(saved['centro'])
            for key,target in summary_values.items():target.setText(saved.get(key,'') or 'No registrado')
            self.statusBar().showMessage('Datos del centro guardados y actualizados en los documentos.')
        save_button=button('Guardar todos los cambios',lambda:self.safe(save),True);save_button.setMinimumHeight(46);content.addWidget(save_button)
        time_box=QGroupBox('Fecha, hora y sesión');time_layout=QVBoxLayout(time_box);time_layout.setContentsMargins(22,26,22,18);time_layout.addWidget(label(f'Reloj actual del Mac: {local_now().strftime("%d/%m/%Y %I:%M:%S %p")} · {timezone_label()}','clock'));time_layout.addWidget(label('AulaLocal usa el reloj y la zona horaria del sistema. macOS conserva la fecha aunque el equipo permanezca apagado. La sesión seguirá activa hasta que pulses Cerrar sesión.','muted'));content.addWidget(time_box)
        templates=QGroupBox('Plantillas de documentos');templates_layout=QVBoxLayout(templates);templates_layout.setContentsMargins(22,26,22,18)
        for kind,title in [('staff','Carta de trabajo'),('students','Certificación de matrícula')]:templates_layout.addWidget(button('Editar plantilla: '+title,lambda checked=False,k=kind:self.safe(lambda:self.edit_template(k))))
        content.addWidget(templates);content.addStretch();scroll.setWidget(page);self.body.addWidget(scroll,1)
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
        def reset_password():
            if t.currentRow()<0:raise AppError('Seleccione una cuenta.')
            u=users[t.currentRow()];pw=ask_password(self,f"Nueva contraseña para {u['username']}:")
            if pw:self.store.reset_user_password(u['id'],pw);QMessageBox.information(self,'Contraseña actualizada','La cuenta deberá entrar con la contraseña nueva.')
        def recovery_key():
            pw=ask_password(self,'Confirma tu contraseña actual:')
            if pw:
                code=self.store.create_recovery_key(pw);QMessageBox.information(self,'Nuevo código de recuperación',f'Guárdalo fuera del Mac. El código anterior deja de funcionar.\n\n{code}')
        bar=QHBoxLayout();bar.addWidget(button('Nueva cuenta',lambda:self.safe(lambda:edit(False)),True));bar.addWidget(button('Editar cuenta',lambda:self.safe(lambda:edit(True))));bar.addWidget(button('Restablecer contraseña',lambda:self.safe(reset_password)));bar.addWidget(button('Generar código de recuperación',lambda:self.safe(recovery_key)));self.body.addLayout(bar)
        self.body.addWidget(label('Consulta general puede leer todos los módulos, incluidos expedientes y gastos. Asigna ese rol solo a personas autorizadas. Secretaría, Alimentación y Contabilidad tienen acceso limitado a sus módulos.','muted'))
    def audit_page(self):
        self.body.addWidget(label('Auditoría del año','title'));rows=self.store.audit(self.year_id());self.body.addWidget(table_widget(['Fecha local','Usuario','Acción','Detalle'],[[r['at_local'],r['usuario'],r['action'],r['detail']] for r in rows]),1)
        self.body.addWidget(label('Los cambios de datos conservan los valores anteriores y nuevos. Los eventos generales de acceso se incluyen al consultar toda la auditoría.','muted'))
        def all_audit():
            d=QDialog(self);d.setWindowTitle('Auditoría completa');d.resize(1000,600);l=QVBoxLayout(d);l.addWidget(table_widget(['Fecha local','Usuario','Acción','Año','Detalle'],[[r['at_local'],r['usuario'],r['action'],r['year_id'],r['detail']] for r in self.store.audit()]));d.exec()
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
    app=QApplication(sys.argv);app.setApplicationName('AulaLocal');app.setOrganizationName('AulaLocal');app.setStyle('Fusion');app.setStyleSheet(STYLE);system_font=app.font();system_font.setPointSize(13);app.setFont(system_font);app.setQuitOnLastWindowClosed(False)
    root=Path(data_dir or app_directory());root.mkdir(parents=True,exist_ok=True)
    lock=QLockFile(str(root/'application.lock'));lock.setStaleLockTime(0)
    if not lock.tryLock(100):QMessageBox.information(None,'AulaLocal','La aplicación ya está abierta con estos datos.');return 1
    try:
        store=Store(root)
        if not store.user:
            login=Login(store)
            if login.exec()!=QDialog.Accepted:store.close();return 0
        window=MainWindow(store);app.main_window=window;window.show();app.setQuitOnLastWindowClosed(True)
        result=app.exec();store.close();return result
    except Exception as e:QMessageBox.critical(None,'AulaLocal','No se pudo abrir la aplicación: '+str(e));return 1
    finally:lock.unlock()
