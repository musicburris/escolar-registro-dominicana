
# Guía Rápida de Despliegue

## Pasos para subir al servidor

### 1. Preparar archivos
```bash
# En tu computadora local
npm install
npm run build
```

### 2. Subir al servidor
- Conecta por FTP/SFTP a tu servidor
- Ve a la carpeta raíz de tu sitio web (ejemplo: `public_html/`)
- Sube TODO el contenido de la carpeta `dist/`

### 3. Configurar servidor
Crea un archivo `.htaccess` en la raíz con este contenido:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 4. Verificar
- Visita tu dominio
- Navega entre las diferentes secciones
- Verifica que todas las rutas funcionen

## Estructura después del despliegue
```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── .htaccess
└── [otros archivos del dist]
```

## ¿Problemas?
1. Verifica que copiaste TODOS los archivos de `dist/`
2. Revisa que el archivo `.htaccess` esté en la raíz
3. Consulta los logs de error de tu servidor
