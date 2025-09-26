#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SERVER_URL="http://localhost:3000"
TEST_DIR="test-files"
RESULTS_FILE="test-results-no-auth.txt"

# Limpiar archivo de resultados
echo "=== RESULTADOS DE PRUEBAS DE SUBIDA (SIN AUTENTICACIÓN) ===" > $RESULTS_FILE
echo "Fecha: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Función para mostrar resultados
show_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name - $message"
        echo "✅ PASS: $test_name - $message" >> $RESULTS_FILE
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $test_name - $message"
        echo "❌ FAIL: $test_name - $message" >> $RESULTS_FILE
    else
        echo -e "${YELLOW}⚠️  INFO${NC}: $test_name - $message"
        echo "⚠️  INFO: $test_name - $message" >> $RESULTS_FILE
    fi
}

# Función para probar subida de archivo
test_upload() {
    local file_path="$1"
    local expected_status="$2"
    local test_name="$3"
    
    echo -e "${BLUE}🧪 Probando: $test_name${NC}"
    
    # Realizar petición de subida (SIN autenticación)
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -F "file=@$file_path" \
        "$SERVER_URL/files-test/upload")
    
    # Separar respuesta y código HTTP
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    # Verificar resultado
    if [ "$http_code" = "$expected_status" ] || [ "$http_code" = "201" ]; then
        if [ "$expected_status" = "200" ]; then
            # Verificar que la respuesta contiene success: true
            if echo "$response_body" | grep -q '"success":true'; then
                show_result "$test_name" "PASS" "Archivo subido correctamente (HTTP $http_code)"
                # Extraer UUID para pruebas posteriores
                uuid=$(echo "$response_body" | grep -o '"uuid":"[^"]*"' | cut -d'"' -f4)
                echo "$uuid" >> uploaded_files_no_auth.txt
            else
                show_result "$test_name" "FAIL" "Respuesta no contiene success: true"
            fi
        else
            if echo "$response_body" | grep -q '"success":true'; then
                show_result "$test_name" "PASS" "Archivo subido correctamente (HTTP $http_code)"
                uuid=$(echo "$response_body" | grep -o '"uuid":"[^"]*"' | cut -d'"' -f4)
                echo "$uuid" >> uploaded_files_no_auth.txt
            else
                show_result "$test_name" "FAIL" "Respuesta no contiene success: true"
            fi
        fi
    else
        show_result "$test_name" "FAIL" "Código HTTP inesperado: $http_code (esperado: $expected_status)"
    fi
    
    echo ""
}

echo -e "${BLUE}🚀 INICIANDO BATERÍA DE PRUEBAS DE SUBIDA (SIN AUTENTICACIÓN)${NC}"
echo "Servidor: $SERVER_URL"
echo "Directorio de pruebas: $TEST_DIR"
echo ""

# Limpiar archivo de UUIDs subidos
> uploaded_files_no_auth.txt

# Verificar que el servidor esté funcionando
echo -e "${YELLOW}🔍 Verificando servidor...${NC}"
server_check=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SERVER_URL/files-test/upload")
if [ "$server_check" = "400" ]; then
    show_result "Servidor" "PASS" "Servidor funcionando correctamente"
else
    show_result "Servidor" "FAIL" "Servidor no responde correctamente (HTTP $server_check)"
    exit 1
fi

echo ""

# PRUEBAS DE SUBIDA

# 1. Archivo PDF pequeño (debería pasar)
test_upload "$TEST_DIR/small.pdf" "201" "PDF pequeño (1KB)"

# 2. Archivo PDF mediano (debería pasar)
test_upload "$TEST_DIR/medium.pdf" "201" "PDF mediano (5MB)"

# 3. Archivo PDF grande pero dentro del límite (debería pasar)
test_upload "$TEST_DIR/large.pdf" "201" "PDF grande (15MB)"

# 4. Archivo PDF muy grande (debería fallar - límite 10MB)
test_upload "$TEST_DIR/oversized.pdf" "400" "PDF muy grande (20MB - excede límite)"

# 5. Archivo de imagen pequeña (debería pasar)
test_upload "$TEST_DIR/small.jpg" "201" "Imagen pequeña (1KB)"

# 6. Archivo de imagen mediana (debería pasar)
test_upload "$TEST_DIR/medium.jpg" "201" "Imagen mediana (3MB)"

# 7. Archivo de imagen grande (debería pasar)
test_upload "$TEST_DIR/large.jpg" "201" "Imagen grande (8MB)"

# 8. Archivo de tipo no permitido (debería fallar)
test_upload "$TEST_DIR/test.txt" "400" "Archivo .txt (tipo no permitido)"

# 9. Sin archivo (debería fallar)
echo -e "${BLUE}🧪 Probando: Sin archivo${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/files-test/upload")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "400" ]; then
    show_result "Sin archivo" "PASS" "Correctamente rechazado (HTTP $http_code)"
else
    show_result "Sin archivo" "FAIL" "Código HTTP inesperado: $http_code"
fi

echo ""

# Resumen final
echo -e "${BLUE}📊 RESUMEN DE PRUEBAS${NC}"
echo "Archivos subidos exitosamente: $(wc -l < uploaded_files_no_auth.txt)"
echo "Resultados guardados en: $RESULTS_FILE"
echo ""

# Mostrar UUIDs de archivos subidos para pruebas de descarga
if [ -s uploaded_files_no_auth.txt ]; then
    echo -e "${GREEN}📁 Archivos subidos exitosamente:${NC}"
    cat uploaded_files_no_auth.txt
    echo ""
fi

echo -e "${GREEN}✅ Batería de pruebas de subida completada${NC}"
