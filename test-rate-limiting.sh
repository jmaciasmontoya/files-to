#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuración
SERVER_URL="http://localhost:3000"
SECURE_ENDPOINT="/files-test-secure/upload"

echo -e "${PURPLE}🚦 PROBANDO RATE LIMITING MEJORADO${NC}"
echo "======================================"
echo "Endpoint: $SERVER_URL$SECURE_ENDPOINT"
echo ""

# Función para hacer upload
upload_file() {
    local file="$1"
    curl -s -w "\n%{http_code}" -X POST "$SERVER_URL$SECURE_ENDPOINT" -F "file=@$file" 2>/dev/null
}

# Crear archivo de prueba si no existe
if [ ! -f "test-files/small-real.pdf" ]; then
    echo "Creando archivo de prueba..."
    mkdir -p test-files
    echo "Test PDF content" > test-files/small-real.pdf
fi

echo -e "${BLUE}🔍 Enviando 5 requests rápidas para probar rate limiting...${NC}"

success_count=0
rate_limited_count=0

for i in {1..5}; do
    echo -n "Request $i: "
    response=$(upload_file "test-files/small-real.pdf")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}HTTP $http_code (Success)${NC}"
        ((success_count++))
    elif [ "$http_code" = "429" ]; then
        echo -e "${YELLOW}HTTP $http_code (Rate Limited)${NC}"
        ((rate_limited_count++))
    else
        echo -e "${RED}HTTP $http_code (Unexpected)${NC}"
    fi
    
    # Pequeña pausa entre requests
    sleep 0.1
done

echo ""
echo -e "${BLUE}📊 RESULTADOS:${NC}"
echo "Requests exitosos: $success_count"
echo "Requests rate limited: $rate_limited_count"

if [ $rate_limited_count -gt 0 ]; then
    echo -e "${GREEN}✅ RATE LIMITING FUNCIONANDO CORRECTAMENTE${NC}"
    echo "✅ Rate limiting detectado en $rate_limited_count de 5 requests"
else
    echo -e "${RED}❌ RATE LIMITING NO FUNCIONA${NC}"
    echo "❌ No se detectó rate limiting en ninguna request"
fi

echo ""
echo -e "${BLUE}🔍 Probando con pausa de 2 segundos entre requests...${NC}"

# Probar con pausa de 2 segundos
for i in {1..3}; do
    echo -n "Request con pausa $i: "
    response=$(upload_file "test-files/small-real.pdf")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}HTTP $http_code (Success)${NC}"
    else
        echo -e "${RED}HTTP $http_code (Unexpected)${NC}"
    fi
    
    if [ $i -lt 3 ]; then
        sleep 2
    fi
done

echo ""
echo -e "${GREEN}✅ Prueba de rate limiting completada${NC}"
