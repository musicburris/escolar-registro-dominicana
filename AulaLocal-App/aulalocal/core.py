"""Capa de aplicación local. La UI no escribe SQL; todas las operaciones pasan aquí."""
import hashlib, hmac, json, os, re, sqlite3, tempfile, time
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from .catalog import MODULES, ACCESS, ROLES

class AppError(Exception): pass

def now(): return datetime.now(timezone.utc).isoformat(timespec='seconds')
def password_hash(password, salt):
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 600_000)
def check_password(password):
    if len(password)<12 or len(password)>256:
        raise AppError('La contraseña debe tener entre 12 y 256 caracteres.')
def app_directory():
    import sys
    base=Path.home()/('Library/Application Support' if sys.platform=='darwin' else '.local/share')
    return base/'AulaLocal'

class Store:
    def __init__(self, root=None):
        self.root=Path(root or app_directory()); self.root.mkdir(parents=True,exist_ok=True)
        os.chmod(self.root,0o700)
        self.path=self.root/'aulalocal.sqlite3'
        self.db=sqlite3.connect(self.path,timeout=10)
        self.db.row_factory=sqlite3.Row
        self.db.execute('PRAGMA foreign_keys=ON')
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.execute('PRAGMA synchronous=FULL')
        self.db.execute('PRAGMA busy_timeout=10000')
        schema=Path(__file__).with_name('schema.sql').read_text()
        # No abrir silenciosamente una base de una versión futura.
        if self.db.execute("SELECT 1 FROM sqlite_master WHERE name='meta'").fetchone():
            v=self.db.execute("SELECT value FROM meta WHERE key='schema_version'").fetchone()
            if not v or v[0]!='1': raise AppError('Versión de datos no compatible.')
        self.db.executescript(schema); self.db.commit(); os.chmod(self.path,0o600)
        self.user=None; self.last_active=0
    def close(self): self.db.close()
    def initialized(self): return bool(self.db.execute('SELECT 1 FROM users LIMIT 1').fetchone())
    def _audit(self,action,year=None,detail=''):
        self.db.execute('INSERT INTO audit(at,user_id,action,year_id,detail) VALUES(?,?,?,?,?)',
            (now(),self.user['id'] if self.user else None,action,year,str(detail)))
    def bootstrap(self,username,password,name,school):
        if self.initialized(): raise AppError('La aplicación ya está configurada.')
        check_password(password)
        if not re.fullmatch(r'[a-zA-Z0-9_.-]{3,64}',username.strip()): raise AppError('El usuario debe tener de 3 a 64 letras, números, puntos o guiones.')
        if not all(str(x).strip() for x in [username,name,school]): raise AppError('Complete todos los datos.')
        salt=os.urandom(16)
        with self.db:
            self.db.execute('INSERT INTO users(username,name,role,salt,password_hash) VALUES(?,?,?,?,?)',
                (username.strip().lower(),name.strip(),'admin',salt,password_hash(password,salt)))
            self.db.executemany('INSERT INTO settings VALUES(?,?)',[('centro',school.strip()),('director',name.strip()),('codigo',''),('direccion',''),('telefono','')])
            self._audit('configuracion_inicial')
        self.login(username,password)
    def login(self,username,password):
        self.user=None
        row=self.db.execute('SELECT * FROM users WHERE username=?',(username.strip().lower(),)).fetchone()
        if row and row['locked_until']>time.time(): raise AppError('Cuenta bloqueada temporalmente. Espere 5 minutos.')
        salt=row['salt'] if row else b'0'*16
        valid=hmac.compare_digest(password_hash(password,salt),row['password_hash'] if row else b'0'*32)
        if not row or not valid or not row['active']:
            with self.db:
                if row:
                    fails=row['failures']+1
                    self.db.execute('UPDATE users SET failures=?,locked_until=? WHERE id=?',(fails,time.time()+300 if fails>=5 else 0,row['id']))
                self._audit('acceso_fallido')
            raise AppError('Usuario o contraseña incorrectos.')
        self.user={'id':row['id'],'name':row['name'],'role':row['role'],'username':row['username']}; self.last_active=time.monotonic()
        with self.db:
            self.db.execute('UPDATE users SET failures=0,locked_until=0 WHERE id=?',(row['id'],)); self._audit('inicio_sesion')
        return self.user
    def logout(self):
        if self.user:
            with self.db: self._audit('cierre_sesion')
        self.user=None
    def require(self,kind=None,write=False,admin=False):
        if not self.user or time.monotonic()-self.last_active>900:
            self.user=None; raise AppError('La sesión está bloqueada. Inicie sesión de nuevo.')
        current=self.db.execute('SELECT role,active FROM users WHERE id=?',(self.user['id'],)).fetchone()
        if not current or not current['active']:
            self.user=None; raise AppError('La cuenta está desactivada.')
        self.user['role']=current['role']; role=current['role']
        if admin and role!='admin': raise AppError('Esta acción requiere una cuenta administradora.')
        if kind and kind not in ACCESS[role]: raise AppError('No tiene acceso a este módulo.')
        if write and role=='consulta': raise AppError('Esta cuenta solo permite consultar.')
        self.last_active=time.monotonic()
    def verify_password(self,password):
        self.require()
        u=self.db.execute('SELECT * FROM users WHERE id=?',(self.user['id'],)).fetchone()
        if not hmac.compare_digest(password_hash(password,u['salt']),u['password_hash']): raise AppError('Contraseña incorrecta.')
    def users(self):
        self.require(admin=True)
        return [dict(x) for x in self.db.execute('SELECT id,username,name,role,active FROM users ORDER BY name')]
    def save_user(self,username,name,role,password='',active=True,user_id=None):
        self.require(admin=True)
        if role not in ROLES or not name.strip() or not re.fullmatch(r'[a-zA-Z0-9_.-]{3,64}',username): raise AppError('Datos de usuario no válidos. Usuario: 3–64 letras, números, punto o guion.')
        if user_id==self.user['id'] and (role!='admin' or not active): raise AppError('No puede desactivar o degradar su propia cuenta.')
        if password: check_password(password)
        if not user_id and not password: raise AppError('Defina una contraseña.')
        try:
            with self.db:
                if user_id:
                    if not self.db.execute('SELECT 1 FROM users WHERE id=?',(user_id,)).fetchone(): raise AppError('Usuario inexistente.')
                    self.db.execute('UPDATE users SET username=?,name=?,role=?,active=? WHERE id=?',(username.lower(),name.strip(),role,int(active),user_id))
                else:
                    salt=os.urandom(16)
                    user_id=self.db.execute('INSERT INTO users(username,name,role,salt,password_hash) VALUES(?,?,?,?,?)',(username.lower(),name.strip(),role,salt,password_hash(password,salt))).lastrowid
                if password:
                    salt=os.urandom(16)
                    self.db.execute('UPDATE users SET salt=?,password_hash=?,failures=0,locked_until=0 WHERE id=?',(salt,password_hash(password,salt),user_id))
                self._audit('guardar_usuario',detail=f'id={user_id}; rol={role}; activo={active}')
        except sqlite3.IntegrityError as e: raise AppError('El nombre de usuario ya existe.') from e
    def settings(self):
        self.require(); return dict(self.db.execute('SELECT key,value FROM settings'))
    def save_settings(self,values):
        self.require(admin=True)
        if not values.get('centro','').strip() or not values.get('director','').strip(): raise AppError('Centro y director son obligatorios.')
        with self.db:
            for key,value in values.items():
                if key not in {'centro','director','codigo','direccion','telefono','template_staff','template_students'}: raise AppError('Configuración desconocida.')
                self.db.execute('INSERT OR REPLACE INTO settings VALUES(?,?)',(key,str(value).strip()[:10000]))
            self._audit('actualizar_configuracion')
    def years(self):
        self.require(); return [dict(x) for x in self.db.execute('SELECT * FROM years ORDER BY label DESC')]
    def year(self,year):
        self.require(); row=self.db.execute('SELECT * FROM years WHERE id=?',(year,)).fetchone()
        if not row: raise AppError('Seleccione un año escolar válido.')
        return dict(row)
    def create_year(self,label,start,end):
        self.require(admin=True)
        match=re.fullmatch(r'(20\d{2})-(20\d{2})',label)
        if not match or int(match[2])!=int(match[1])+1: raise AppError('Use un año como 2026-2027.')
        try:
            a,b=date.fromisoformat(start),date.fromisoformat(end)
            if a>=b or a.year!=int(match[1]) or b.year!=int(match[2]): raise ValueError()
        except ValueError: raise AppError('Las fechas deben corresponder al año escolar indicado.')
        try:
            with self.db:
                y=self.db.execute('INSERT INTO years(label,start_date,end_date) VALUES(?,?,?)',(label,start,end)).lastrowid
                self._audit('crear_año',y,label)
            return y
        except sqlite3.IntegrityError as e: raise AppError('Ese año ya existe.') from e
    def transition(self,year,status,reason,password):
        self.require(admin=True); self.verify_password(password); old=self.year(year)
        allowed={'abierto':{'congelado'},'congelado':{'abierto','archivado'},'archivado':{'congelado'}}
        if status not in allowed[old['status']]: raise AppError('Transición no permitida; el archivo histórico se descongela en dos etapas.')
        if len(reason.strip())<10: raise AppError('Escriba un motivo de al menos 10 caracteres.')
        with self.db:
            self.db.execute('UPDATE years SET status=?,institution=? WHERE id=?',(status,json.dumps(self.settings(),ensure_ascii=False) if old['status']=='abierto' else old['institution'],year)); self._audit('estado_año',year,f"{old['status']} → {status}: {reason.strip()}")
    def _open(self,year):
        if self.year(year)['status']!='abierto': raise AppError('El año está congelado o archivado; solo permite consultas.')
    def list_records(self,kind,year,search=''):
        self.require(kind); self.year(year)
        rows=[dict(x) for x in self.db.execute('SELECT * FROM records WHERE kind=? AND year_id=? ORDER BY id DESC',(kind,year))]
        for r in rows: r['data']=json.loads(r['data'])
        if search: rows=[r for r in rows if search.casefold() in ' '.join(map(str,r['data'].values())).casefold()]
        return rows
    def record(self,kind,year,rid):
        self.require(kind); self.year(year)
        r=self.db.execute('SELECT * FROM records WHERE id=? AND year_id=? AND kind=?',(rid,year,kind)).fetchone()
        if not r: raise AppError('No se encontró el registro en este año.')
        out=dict(r); out['data']=json.loads(out['data']); return out
    def _validate(self,kind,year,data):
        if kind not in MODULES: raise AppError('Módulo desconocido.')
        y=self.year(year); out={}
        known={f.key for f in MODULES[kind][1]}
        if set(data)-known: raise AppError('El registro contiene campos desconocidos.')
        for f in MODULES[kind][1]:
            v=str(data.get(f.key,'')).strip()
            if f.required and not v: raise AppError(f'Complete: {f.label}.')
            if len(v)>10000: raise AppError(f'{f.label}: texto demasiado largo.')
            if not v: out[f.key]=''; continue
            if f.type=='choice' and v not in f.options: raise AppError(f'{f.label}: opción no válida.')
            if f.type=='date':
                try: d=date.fromisoformat(v)
                except ValueError: raise AppError(f'{f.label}: use AAAA-MM-DD.')
                if f.key=='fecha' and not (y['start_date']<=v<=y['end_date']): raise AppError('La fecha debe estar dentro del año escolar seleccionado.')
                if f.key=='nacimiento' and v>y['end_date']: raise AppError('Fecha de nacimiento no válida.')
            if f.type=='time' and not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d',v): raise AppError(f'{f.label}: use HH:MM.')
            if f.type=='integer':
                if not v.isascii() or not v.isdigit() or int(v)>1_000_000: raise AppError(f'{f.label}: use un entero de 0 a 1000000.')
                v=int(v)
            if f.type=='money':
                try:
                    amount=Decimal(v)
                    if not amount.is_finite() or amount<0 or amount>Decimal('999999999') or amount.as_tuple().exponent < -2: raise InvalidOperation()
                    v=format(amount.quantize(Decimal('.01')),'f')
                except (InvalidOperation,ValueError): raise AppError(f'{f.label}: use un monto positivo con hasta dos decimales, sin comas.')
            if f.type.endswith('_ref'):
                target='staff' if f.type=='staff_ref' else 'menus'
                try: v=int(v)
                except ValueError: raise AppError(f'Seleccione: {f.label}.')
                ref=self.db.execute('SELECT data FROM records WHERE id=? AND year_id=? AND kind=?',(v,year,target)).fetchone()
                if not ref: raise AppError('La referencia no pertenece a este año escolar.')
                rd=json.loads(ref['data'])
                if target=='menus' and rd['servicio']!=data.get('servicio'): raise AppError('El menú debe corresponder al servicio recibido.')
            out[f.key]=v
        if kind=='students' and out['nacimiento']>out['fecha']: raise AppError('El nacimiento debe ser anterior a la matrícula.')
        if kind=='attendance' and out['entrada'] and out['salida'] and out['salida']<out['entrada']: raise AppError('La salida no puede ser anterior a la entrada.')
        if kind=='receipts' and (out['cantidad']<=0 or out['rechazadas']>out['cantidad']): raise AppError('La cantidad debe ser mayor a cero y cubrir las unidades rechazadas.')
        if kind=='expenses' and Decimal(out['monto'])<=0: raise AppError('El gasto debe ser mayor a cero.')
        return out
    def save_record(self,kind,year,data,rid=None,version=None):
        self.require(kind,write=True); self._open(year); clean=self._validate(kind,year,data)
        try:
            with self.db:
                if rid:
                    old=self.record(kind,year,rid)
                    if version!=old['version']: raise AppError('El registro cambió; cierre y vuelva a abrir el formulario.')
                    # Menús referenciados conservan servicio e identidad; detalles pueden corregirse auditadamente.
                    if kind=='menus' and clean['servicio']!=old['data']['servicio'] and self.db.execute("SELECT 1 FROM records WHERE year_id=? AND kind='receipts' AND json_extract(data,'$.menu')=?",(year,rid)).fetchone(): raise AppError('El servicio de un menú utilizado no se puede cambiar.')
                    cur=self.db.execute('UPDATE records SET data=?,updated_at=?,version=version+1 WHERE id=? AND version=?',(json.dumps(clean,ensure_ascii=False),now(),rid,version))
                    if cur.rowcount!=1: raise AppError('El registro fue modificado por otra sesión.')
                    self._audit('editar_'+kind,year,json.dumps({'id':rid,'antes':old['data'],'despues':clean},ensure_ascii=False))
                else:
                    rid=self.db.execute('INSERT INTO records(year_id,kind,data,created_at,updated_at) VALUES(?,?,?,?,?)',(year,kind,json.dumps(clean,ensure_ascii=False),now(),now())).lastrowid
                    self._audit('crear_'+kind,year,f'id={rid}')
            return rid
        except sqlite3.IntegrityError as e: raise AppError('No se guardó: código duplicado, asistencia ya registrada o año bloqueado.') from e
    def copy_people(self,source,target,kind):
        self.require(admin=True)
        if kind not in ('students','staff'): raise AppError('Solo se trasladan matrículas o personal.')
        if source==target: raise AppError('Elija años diferentes.')
        self._open(target); target_year=self.year(target); source_year=self.year(source)
        if target_year['label']<=source_year['label']: raise AppError('El año de destino debe ser posterior.')
        items=self.list_records(kind,source)
        codes={r['data']['codigo'] for r in self.list_records(kind,target)}; count=0
        # Una sola transacción; no reutiliza IDs, asistencias ni movimientos.
        with self.db:
            for r in items:
                d=dict(r['data'])
                if d['estado']!='Activo' or d['codigo'] in codes: continue
                if kind=='students': d['fecha']=target_year['start_date']
                d=self._validate(kind,target,d)
                self.db.execute('INSERT INTO records(year_id,kind,data,created_at,updated_at) VALUES(?,?,?,?,?)',(target,kind,json.dumps(d,ensure_ascii=False),now(),now())); count+=1
            self._audit('copiar_'+kind,target,f'origen={source}; cantidad={count}; grado sin promoción automática')
        return count
    def attach(self,kind,year,rid,path):
        self.require(kind,write=True); self._open(year); self.record(kind,year,rid)
        p=Path(path)
        if p.suffix.lower() not in {'.pdf','.jpg','.jpeg','.png'}: raise AppError('Adjunte PDF, JPG o PNG.')
        if p.stat().st_size>15*1024*1024: raise AppError('El adjunto debe ser menor a 15 MB.')
        content=p.read_bytes()
        if len(content)>15*1024*1024 or not content: raise AppError('Adjunto vacío o demasiado grande.')
        mime='application/pdf' if content.startswith(b'%PDF-') else 'image/png' if content.startswith(b'\x89PNG\r\n\x1a\n') else 'image/jpeg' if content.startswith(b'\xff\xd8\xff') else None
        if not mime: raise AppError('El contenido no es PDF, JPG ni PNG.')
        with self.db:
            aid=self.db.execute('INSERT INTO attachments(record_id,year_id,name,mime,sha256,content) VALUES(?,?,?,?,?,?)',(rid,year,p.name,mime,hashlib.sha256(content).hexdigest(),content)).lastrowid
            self._audit('adjuntar_evidencia',year,f'registro={rid}; adjunto={aid}')
        return aid
    def attachments(self,kind,year,rid):
        self.record(kind,year,rid)
        return [dict(r) for r in self.db.execute('SELECT id,name,mime,length(content) AS size FROM attachments WHERE record_id=? AND year_id=?',(rid,year))]
    def attachment_bytes(self,kind,year,rid,aid):
        self.record(kind,year,rid)
        r=self.db.execute('SELECT content,sha256 FROM attachments WHERE id=? AND record_id=? AND year_id=?',(aid,rid,year)).fetchone()
        if not r or hashlib.sha256(r['content']).hexdigest()!=r['sha256']: raise AppError('Adjunto no encontrado o dañado.')
        with self.db: self._audit('exportar_adjunto',year,f'adjunto={aid}')
        return r['content']
    def dashboard(self,year):
        self.require(); self.year(year); result={}
        role=self.user['role']
        if 'students' in ACCESS[role]: result['Estudiantes activos']=sum(r['data']['estado']=='Activo' for r in self.list_records('students',year))
        if 'staff' in ACCESS[role]: result['Personal activo']=sum(r['data']['estado']=='Activo' for r in self.list_records('staff',year))
        if 'attendance' in ACCESS[role]:
            rows=self.list_records('attendance',year); today=date.today().isoformat()
            result['Presentes hoy']=sum(r['data']['fecha']==today and r['data']['estado'] in ('Presente','Tardanza') for r in rows)
        if 'receipts' in ACCESS[role]:
            rows=[r['data'] for r in self.list_records('receipts',year) if r['data']['estado']!='Anulado']
            for service in ('Leche','Pan','Almuerzo'): result[f'{service} · unidades aceptadas']=sum(r['cantidad']-r['rechazadas'] for r in rows if r['servicio']==service)
            result['Recepciones con incidencias']=sum(bool(r['incidencias']) or r['rechazadas']>0 for r in rows)
        if 'expenses' in ACCESS[role]:
            total=sum((Decimal(r['data']['monto']) for r in self.list_records('expenses',year) if r['data']['estado']!='Anulado'),Decimal(0))
            result['Gastos RD$']=f'{total:,.2f}'
        return result
    def audit(self,year=None):
        self.require()
        if self.user['role'] not in ('admin','direccion'): raise AppError('Auditoría reservada a Dirección y Administración.')
        sql='SELECT a.*,COALESCE(u.username,\'sistema\') AS usuario FROM audit a LEFT JOIN users u ON u.id=a.user_id'
        args=()
        if year is not None: sql+=' WHERE a.year_id=?'; args=(year,)
        return [dict(x) for x in self.db.execute(sql+' ORDER BY a.id DESC',args)]
    def log_export(self,kind,year):
        self.require(kind)
        with self.db: self._audit('exportar_'+kind,year)
