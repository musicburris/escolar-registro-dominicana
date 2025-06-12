
# 📤 QUÉ SUBIR AL SERVIDOR

## Después de ejecutar `npm run build`

Se creará una carpeta llamada **dist/** que contendrá algo así:

```
dist/
├── index.html          ← Archivo principal
├── .htaccess          ← Configuración del servidor (ya incluido)
├── assets/
│   ├── index-abc123.js    ← JavaScript principal
│   ├── index-def456.css   ← Estilos principales  
│   └── [otros archivos]   ← Imágenes, fuentes, etc.
└── [otros archivos]
```

## ⚠️ IMPORTANTE: Subir TODO el contenido de dist/

### ✅ CORRECTO:
- Subir **TODO** lo que está DENTRO de la carpeta `dist/`
- Mantener la estructura de carpetas exacta
- El archivo `.htaccess` ya está incluido automáticamente

### ❌ INCORRECTO:
- Subir solo el `index.html`
- Subir la carpeta `dist/` completa (sube el contenido, no la carpeta)
- Cambiar nombres de archivos o carpetas
- Olvidar el archivo `.htaccess`

## 🎯 Pasos específicos en cPanel:

1. **Entrar a File Manager / Administrador de archivos**
2. **Navegar a `public_html`** (carpeta raíz de tu sitio)
3. **SELECCIONAR TODO** lo que esté ahí y **ELIMINAR**
4. **SUBIR** todo el contenido de la carpeta `dist/`
5. **VERIFICAR** que el archivo `.htaccess` esté en la raíz

## 🔍 Cómo verificar que funcionó:

- Ve a tu dominio: `http://tudominio.com`
- Deberías ver la pantalla de login del sistema escolar
- Prueba navegar a: `http://tudominio.com/calificaciones`
- Debería cargar sin problemas (no error 404)

## 🆘 Si no funciona:

1. **Página en blanco**: Faltan archivos, revisa que subiste TODO
2. **Error 404 en rutas**: El `.htaccess` no está funcionando
3. **Estilos rotos**: La carpeta `assets/` no se subió correctamente

**Contacta a tu hosting** y diles: *"Necesito configurar mi servidor para una aplicación React SPA con archivos estáticos"*
