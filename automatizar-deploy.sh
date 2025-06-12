
#!/bin/bash

echo "🎓 SISTEMA DE REGISTRO ESCOLAR - AUTO DEPLOY"
echo "============================================"
echo ""

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js no está instalado"
    echo "📥 Descarga Node.js desde: https://nodejs.org/"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm no está instalado"
    exit 1
fi

echo "✅ Node.js y npm detectados"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló la instalación de dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas correctamente"
echo ""

# Limpiar build anterior
if [ -d "dist" ]; then
    echo "🗑️ Limpiando build anterior..."
    rm -rf dist
fi

# Generar build de producción
echo "🔨 Generando archivos para producción..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló la generación del build"
    exit 1
fi

# Verificar que se creó la carpeta dist
if [ ! -d "dist" ]; then
    echo "❌ ERROR: No se generó la carpeta 'dist'"
    exit 1
fi

# Crear archivo .htaccess dentro de dist
echo "📄 Creando archivo .htaccess..."
cat > dist/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache para archivos estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
EOF

echo ""
echo "🎉 ¡BUILD COMPLETADO EXITOSAMENTE!"
echo "=================================="
echo ""
echo "📁 Archivos listos en la carpeta: dist/"
echo ""
echo "📋 SIGUIENTE PASO:"
echo "1. Ve a tu panel de hosting (cPanel, etc.)"
echo "2. Entra al administrador de archivos"
echo "3. Ve a la carpeta 'public_html'"
echo "4. BORRA todo lo que esté ahí"
echo "5. Sube TODO el contenido de la carpeta 'dist/'"
echo "6. ¡Visita tu sitio web!"
echo ""
echo "🔗 Archivos incluidos:"
ls -la dist/
echo ""
echo "✅ El archivo .htaccess ya está incluido"
echo "🎓 Sistema listo para usar con las credenciales demo"
echo ""
echo "📞 Si tienes problemas, contacta a tu proveedor de hosting"
echo "    y menciona: 'Aplicación React SPA'"
