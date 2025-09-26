#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER_URL="http://localhost:3000"

echo -e "${BLUE}🔑 Obteniendo token de prueba...${NC}"

# Obtener token de prueba
response=$(curl -s -X POST "$SERVER_URL/auth/test-token")

# Verificar si la respuesta contiene un token
if echo "$response" | grep -q "access_token"; then
    # Extraer el token
    token=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$token" ]; then
        echo -e "${GREEN}✅ Token obtenido exitosamente${NC}"
        echo "Token: $token"
        
        # Guardar token en archivo para uso en pruebas
        echo "$token" > test-token.txt
        echo "Token guardado en: test-token.txt"
        
        # Actualizar scripts de prueba con el token real
        echo "Actualizando scripts de prueba..."
        
        # Reemplazar 'test-token' con el token real en todos los scripts
        sed -i "s/Bearer test-token/Bearer $token/g" test-upload.sh
        sed -i "s/Bearer test-token/Bearer $token/g" test-download.sh
        sed -i "s/Bearer test-token/Bearer $token/g" test-delete.sh
        
        echo -e "${GREEN}✅ Scripts de prueba actualizados${NC}"
    else
        echo "❌ No se pudo extraer el token de la respuesta"
        echo "Respuesta: $response"
    fi
else
    echo "❌ Error al obtener token"
    echo "Respuesta: $response"
fi
