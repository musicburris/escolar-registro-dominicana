# Instalar AulaLocal en Mac

Este instalador fue construido y probado en un Mac Apple Silicon M1 con macOS 14. Funciona en M1 y generaciones posteriores. La aplicación guarda sus datos localmente y su uso habitual no necesita internet.

## Instalación recomendada con el DMG

1. Abra `AulaLocal-0.1.0-arm64.dmg`.
2. Arrastre **AulaLocal** sobre la carpeta **Applications** que aparece en esa ventana.
3. Abra la carpeta Aplicaciones de su Mac.
4. La primera vez, haga clic secundario sobre AulaLocal y elija **Abrir**. Luego pulse **Abrir** en el aviso. Las siguientes veces se abre normalmente con doble clic.

Si no aparece la opción Abrir, entre en Ajustes del Sistema → Privacidad y seguridad. Al final de esa pantalla, pulse **Abrir de todos modos** junto al aviso de AulaLocal.

Al iniciar, escriba el nombre del centro, nombre del director, usuario y una contraseña de al menos 12 caracteres. Después cree el primer año escolar. No existen usuario ni contraseña predeterminados.

## Instalación alternativa

El archivo `AulaLocal-0.1.0-arm64.pkg` instala la misma aplicación directamente en Aplicaciones. Si macOS bloquea el PKG por no identificar al desarrollador, use el DMG mediante los pasos anteriores.

## Firma

La aplicación tiene firma técnica local y su integridad se verificó durante la construcción. No está notarizada con un certificado Developer ID de Apple. Apple solo permite crear ese certificado al titular de un equipo inscrito en Apple Developer Program. Por eso macOS puede mostrar el aviso de desarrollador no identificado en el primer inicio.

## Datos y copias

Los datos quedan en `~/Library/Application Support/AulaLocal/`. No borre esa carpeta. Desde Copias y restauración puede guardar un archivo cifrado en una memoria USB o disco externo. Conserve la contraseña del respaldo; no existe recuperación por internet.
