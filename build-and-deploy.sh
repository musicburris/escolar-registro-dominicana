
#!/bin/bash

# Script para generar build y preparar para despliegue
echo "🚀 Iniciando proceso de build para producción..."

# Limpiar instalación anterior
echo "📦 Instalando dependencias..."
npm ci

# Generar build de producción
echo "🔨 Generando build de producción..."
npm run build

# Verificar que el build fue exitoso
if [ -d "dist" ]; then
    echo "✅ Build generado exitosamente en la carpeta 'dist/'"
    echo "📁 Archivos generados:"
    ls -la dist/
    echo ""
    echo "🌐 Para desplegar:"
    echo "1. Sube TODO el contenido de la carpeta 'dist/' a tu servidor"
    echo "2. Configura las reglas de reescritura (ver DEPLOYMENT.md)"
    echo "3. Visita tu sitio web"
else
    echo "❌ Error: No se pudo generar el build"
    exit 1
fi
