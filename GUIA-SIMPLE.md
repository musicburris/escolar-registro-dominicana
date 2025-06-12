
# 📋 GUÍA SÚPER SIMPLE - Sistema de Registro Escolar

## ¿Qué tienes que hacer?

### 1️⃣ Generar los archivos para tu servidor
```bash
# Abrir terminal/consola y escribir:
npm install
npm run build
```

### 2️⃣ Subir al servidor
1. Ve a tu panel de hosting (cPanel, DirectAdmin, etc.)
2. Busca "Administrador de archivos" o "File Manager"
3. Ve a la carpeta `public_html` (o la carpeta principal de tu sitio)
4. **BORRA TODO** lo que esté ahí
5. Sube **TODO** el contenido de la carpeta `dist/` que se creó
6. Crea un archivo llamado `.htaccess` y pega este contenido:

```
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 3️⃣ ¡Listo!
Visita tu dominio y ya debería funcionar.

---

## 🆘 ¿Tienes problemas?

### Página en blanco
- Verifica que copiaste **TODOS** los archivos de `dist/`
- Revisa que el archivo `.htaccess` esté en la raíz

### No cargan las páginas internas
- El archivo `.htaccess` no está bien configurado
- Cópialo exactamente como está arriba

### Archivos no cargan (CSS/JS)
- Asegúrate de mantener la estructura de carpetas intacta
- No muevas archivos de la carpeta `assets/`

---

## 📞 Contacto
Si nada funciona, contacta a tu proveedor de hosting y diles:
"Necesito configurar mi servidor para una aplicación React SPA"

## 🔑 Credenciales del sistema
- **Administrador:** director@ejemplo.edu.do / demo123
- **Docente:** profesor@ejemplo.edu.do / demo123  
- **Auxiliar:** auxiliar@ejemplo.edu.do / demo123
- **Padre:** padre@ejemplo.com / demo123
- **Estudiante:** 202300001 / demo123
