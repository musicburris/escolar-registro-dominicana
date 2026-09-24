#!/bin/bash
cd "$(dirname "$0")" || exit 1
echo 'AulaLocal — Preparación para Mac Apple Silicon'
echo 'Esto compila el proyecto; no es un instalador ya compilado.'
echo 'La primera preparación necesita internet y Python 3.11–3.13 ARM64.'
echo 'La aplicación compilada funciona sin internet.'
if bash scripts/build_macos.sh; then
  open dist
else
  echo 'No se completó la preparación. Consulte docs/INSTALACION.md.'
fi
read -r -p 'Pulse Enter para cerrar…' _aula_close
