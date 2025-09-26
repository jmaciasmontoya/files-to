#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SERVER_URL="http://localhost:3000"
RESULTS_FILE="test-results-download-no-auth.txt"

# Limpiar archivo de resultados
echo "=== RESULTADOS DE PRUEBAS DE DESCARGA (SIN AUTENTICACIÓN) ===" > $RESULTS_FILE
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

# Función para probar descarga de archivo
test_download() {
    local uuid="$1"
    local test_name="$2"
    local expected_status="$3"
    
    echo -e "${BLUE}🧪 Probando: $test_name${NC}"
    
    # Realizar petición de descarga (SIN autenticación)
    response=$(curl -s -w "\n%{http_code}" -X GET "$SERVER_URL/files-test/$uuid")
    
    # Separar respuesta y código HTTP
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    # Verificar resultado
    if [ "$http_code" = "$expected_status" ]; then
        if [ "$expected_status" = "200" ]; then
            show_result "$test_name" "PASS" "Archivo descargado correctamente (HTTP $http_code)"
        else
            show_result "$test_name" "PASS" "Archivo no encontrado correctamente (HTTP $http_code)"
        fi
    else
        show_result "$test_name" "FAIL" "Código HTTP inesperado: $http_code (esperado: $expected_status)"
    fi
    
    echo ""
}

# Función para probar información de archivo
test_file_info() {
    local uuid="$1"
    local test_name="$2"
    
    echo -e "${BLUE}🧪 Probando: $test_name${NC}"
    
    # Realizar petición de información (SIN autenticación)
    response=$(curl -s -w "\n%{http_code}" -X GET "$SERVER_URL/files-test/$uuid/info")
    
    # Separar respuesta y código HTTP
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    # Verificar resultado
    if [ "$http_code" = "200" ]; then
        if echo "$response_body" | grep -q '"success":true'; then
            show_result "$test_name" "PASS" "Información obtenida correctamente (HTTP $http_code)"
            echo "Información del archivo: $response_body" >> $RESULTS_FILE
        else
            show_result "$test_name" "FAIL" "Respuesta no contiene success: true"
        fi
    else
        show_result "$test_name" "FAIL" "Código HTTP inesperado: $http_code"
    fi
    
    echo ""
}

echo -e "${BLUE}🚀 INICIANDO BATERÍA DE PRUEBAS DE DESCARGA (SIN AUTENTICACIÓN)${NC}"
echo "Servidor: $SERVER_URL"
echo ""

# Verificar que existan archivos subidos
if [ ! -f "uploaded_files_no_auth.txt" ] || [ ! -s "uploaded_files_no_auth.txt" ]; then
    show_result "Archivos subidos" "FAIL" "No se encontraron archivos subidos. Ejecuta test-upload-no-auth.sh primero."
    exit 1
fi

# Leer UUIDs de archivos subidos
echo -e "${YELLOW}📁 Archivos disponibles para descarga:${NC}"
cat uploaded_files_no_auth.txt
echo ""

# PRUEBAS DE DESCARGA

# Probar descarga de cada archivo subido
file_count=1
while IFS= read -r uuid; do
    if [ -n "$uuid" ]; then
        test_download "$uuid" "Descarga archivo $file_count" "200"
        test_file_info "$uuid" "Información archivo $file_count"
        ((file_count++))
    fi
done < uploaded_files_no_auth.txt

# Probar descarga de UUID inexistente
test_download "00000000-0000-0000-0000-000000000000" "UUID inexistente" "404"

echo ""

# Resumen final
echo -e "${BLUE}📊 RESUMEN DE PRUEBAS DE DESCARGA${NC}"
echo "Archivos probados: $((file_count-1))"
echo "Resultados guardados en: $RESULTS_FILE"
echo ""

echo -e "${GREEN}✅ Batería de pruebas de descarga completada${NC}"
