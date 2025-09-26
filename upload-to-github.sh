#!/bin/bash

echo "🚀 SCRIPT PARA SUBIR PROYECTO A GITHUB"
echo "======================================"
echo ""

# Verificar si ya existe un remote
if git remote -v | grep -q "origin"; then
    echo "✅ Remote 'origin' ya configurado:"
    git remote -v
    echo ""
    echo "¿Quieres subir el código ahora? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "📤 Subiendo código a GitHub..."
        git push -u origin main
        echo "✅ ¡Código subido exitosamente!"
    else
        echo "❌ Operación cancelada"
    fi
else
    echo "❌ No hay remote configurado"
    echo ""
    echo "Primero necesitas crear el repositorio en GitHub y luego ejecutar:"
    echo ""
    echo "git remote add origin https://github.com/TU_USUARIO/files-to.git"
    echo "git push -u origin main"
    echo ""
    echo "O si prefieres SSH:"
    echo "git remote add origin git@github.com:TU_USUARIO/files-to.git"
    echo "git push -u origin main"
    echo ""
    echo "Reemplaza 'TU_USUARIO' con tu nombre de usuario de GitHub"
fi
