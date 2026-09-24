"""Respaldo cifrado autenticado: incluye SQLite y sus adjuntos BLOB."""
import hashlib, os, sqlite3, tempfile
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
from .core import AppError, check_password

MAGIC=b'AULALOCAL-BACKUP-1\n'
MAX_SIZE=512*1024*1024

def key(password,salt):
    return hashlib.scrypt(password.encode(),salt=salt,n=2**15,r=8,p=1,maxmem=128*1024*1024,dklen=32)

def atomic_write(path,content):
    path=Path(path)
    if path.name.endswith(('.sqlite3','.sqlite3-wal','.sqlite3-shm')) or path.name=='application.lock':
        raise AppError('Elija un archivo de exportación distinto de los archivos internos de datos.')
    if not path.parent.is_dir(): raise AppError('La carpeta de destino no existe.')
    fd,tmp=tempfile.mkstemp(prefix='.aula-',dir=path.parent)
    try:
        with os.fdopen(fd,'wb') as f:
            f.write(content); f.flush(); os.fsync(f.fileno())
        os.replace(tmp,path)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)

def snapshot(store):
    memory=sqlite3.connect(':memory:')
    try:
        store.db.backup(memory)
        # La copia en memoria no tiene WAL asociado; normalizar el encabezado
        # evita que deserialize intente abrir archivos WAL inexistentes.
        raw=bytearray(memory.serialize())
        raw[18:20]=b'\x01\x01'
        return bytes(raw)
    finally: memory.close()

def create_backup(store,path,password):
    store.require(admin=True); check_password(password)
    if Path(path).resolve()==store.path.resolve(): raise AppError('Elija un archivo diferente a la base de datos.')
    if store.path.stat().st_size>MAX_SIZE: raise AppError('La copia supera 512 MB; requiere un respaldo de volumen externo.')
    content=snapshot(store)
    if len(content)>MAX_SIZE: raise AppError('La copia supera el límite de 512 MB.')
    salt,nonce=os.urandom(16),os.urandom(12)
    encrypted=AESGCM(key(password,salt)).encrypt(nonce,content,MAGIC)
    atomic_write(path,MAGIC+salt+nonce+encrypted)
    with store.db: store._audit('crear_respaldo')

def validate_database(raw):
    if not raw.startswith(b'SQLite format 3\x00'): raise AppError('Contenido de respaldo inválido.')
    db=sqlite3.connect(':memory:')
    try:
        db.deserialize(raw)
        db.execute('PRAGMA trusted_schema=OFF')
        if db.execute('PRAGMA integrity_check').fetchone()[0]!='ok': raise AppError('El respaldo está dañado.')
        if db.execute('PRAGMA foreign_key_check').fetchone(): raise AppError('El respaldo tiene relaciones inconsistentes.')
        expected=sqlite3.connect(':memory:')
        try:
            expected.executescript(Path(__file__).with_name('schema.sql').read_text())
            query="SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name"
            if db.execute(query).fetchall()!=expected.execute(query).fetchall(): raise AppError('La estructura del respaldo no corresponde a esta versión.')
        finally: expected.close()
        if db.execute("SELECT value FROM meta WHERE key='schema_version'").fetchone()!=('2',): raise AppError('Versión de respaldo incompatible.')
        if not db.execute("SELECT 1 FROM users WHERE active=1 AND role='admin'").fetchone(): raise AppError('El respaldo no contiene un administrador activo.')
        for content,digest in db.execute('SELECT content,sha256 FROM attachments'):
            if hashlib.sha256(content).hexdigest()!=digest: raise AppError('Un adjunto del respaldo está dañado.')
        return db
    except Exception:
        db.close(); raise

def restore_backup(store,path,password,current_password):
    store.require(admin=True); store.verify_password(current_password)
    p=Path(path)
    if p.stat().st_size>MAX_SIZE+128: raise AppError('El respaldo supera 512 MB.')
    data=p.read_bytes()
    if not data.startswith(MAGIC) or len(data)<len(MAGIC)+44: raise AppError('No es un respaldo AulaLocal compatible.')
    offset=len(MAGIC)
    try: raw=AESGCM(key(password,data[offset:offset+16])).decrypt(data[offset+16:offset+28],data[offset+28:],MAGIC)
    except (InvalidTag,ValueError) as e: raise AppError('Contraseña de respaldo incorrecta o archivo alterado.') from e
    try: source=validate_database(raw)
    except sqlite3.DatabaseError as e: raise AppError('Base de respaldo inválida.') from e
    # Antes de sustituir, preservar el estado actual en un archivo cifrado recuperable.
    recovery=store.root/'antes-de-restaurar.aulabackup'
    try:
        create_backup(store,recovery,password)
        source.backup(store.db)
        store.user=None;store.session_hash=None;store.session_file.unlink(missing_ok=True)
        with store.db: store._audit('restaurar_respaldo',detail='Copia previa: antes-de-restaurar.aulabackup; inicie sesión con una cuenta del respaldo.')
    finally: source.close()
    return recovery
