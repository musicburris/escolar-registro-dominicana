#!/bin/bash
set -e

echo "🎓 SISTEMA DE REGISTRO ESCOLAR - EMPAQUETAR TODO"
echo "================================================"
echo ""

# 1) Instalar dependencias de forma limpia
if command -v npm &> /dev/null; then
  echo "📦 Instalando dependencias (npm ci si es posible)..."
  if npm ci; then
    echo "✅ Dependencias instaladas con npm ci"
  else
    echo "⚠️ npm ci falló, intentando con npm install"
    npm install
  fi
else
  echo "❌ ERROR: npm no está instalado"
  exit 1
fi

# 2) Generar build de producción
echo "🔨 Generando build de producción..."
npm run build

# 3) Verificar carpeta dist
if [ ! -d "dist" ]; then
  echo "❌ ERROR: No se generó la carpeta dist"
  exit 1
fi

# 4) Confirmar que .htaccess fue copiado desde public/
if [ -f "dist/.htaccess" ]; then
  echo "✅ .htaccess presente en dist/"
else
  echo "⚠️ .htaccess no encontrado en dist/. Copiando manualmente..."
  cp public/.htaccess dist/.htaccess || true
fi

# 5) Crear ZIP listo para subir (solo archivos del build)
DIST_ZIP="dist-upload.zip"
if command -v zip &> /dev/null; then
  echo "📦 Creando $DIST_ZIP (contenido de dist/)..."
  (cd dist && zip -qr ../$DIST_ZIP .)
  echo "✅ Archivo generado: $DIST_ZIP"
else
  echo "⚠️ 'zip' no está instalado; omitiendo compresión del build."
fi

# 6) Crear ZIP con TODO el código fuente del proyecto (excluyendo node_modules y dist)
SRC_ZIP="app-source.zip"
if command -v zip &> /dev/null; then
  echo "📦 Creando $SRC_ZIP (código fuente completo)..."
  zip -qr $SRC_ZIP . \
    -x "node_modules/*" "dist/*" \
       ".git/*" "*.zip" "bun.lockb" "**/.DS_Store" \
       "package-lock.json" # (se omitirá para aligerar, si lo necesitas bórralo de esta línea)
  echo "✅ Archivo generado: $SRC_ZIP"
else
  echo "⚠️ 'zip' no está instalado; omitiendo compresión del código fuente."
fi

# 7) Resumen
echo ""
echo "🎉 Preparación completada"
echo "-------------------------"
if [ -f "$DIST_ZIP" ]; then
  echo "➡️  Build para subir: $DIST_ZIP"
  echo "   Contiene: index.html, assets/, .htaccess"
fi
if [ -f "$SRC_ZIP" ]; then
  echo "➡️  Código fuente completo: $SRC_ZIP"
fi

echo ""
echo "📋 Cómo desplegar (vía cPanel/DirectAdmin)"
echo "1) Sube $DIST_ZIP a tu servidor y descomprímelo dentro de public_html/"
echo "2) Asegúrate de que .htaccess esté en la raíz (public_html/.htaccess)"
echo "3) Visita tu dominio"
