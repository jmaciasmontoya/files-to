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
RESULTS_FILE="test-security-results.txt"

# Limpiar archivo de resultados
echo "=== PRUEBAS DE SEGURIDAD - VALIDACIÓN ROBUSTA DE ARCHIVOS ===" > $RESULTS_FILE
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
    echo "Archivo: $file_path"
    
    # Realizar petición de subida
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -F "file=@$file_path" \
        "$SERVER_URL/files-test/upload")
    
    # Separar respuesta y código HTTP
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    echo "Respuesta: $response_body"
    echo "Código HTTP: $http_code"
    
    # Verificar resultado
    if [ "$http_code" = "$expected_status" ]; then
        if [ "$expected_status" = "201" ] || [ "$expected_status" = "200" ]; then
            if echo "$response_body" | grep -q '"success":true'; then
                show_result "$test_name" "PASS" "Archivo subido correctamente (HTTP $http_code)"
            else
                show_result "$test_name" "FAIL" "Respuesta no contiene success: true"
            fi
        else
            show_result "$test_name" "PASS" "Archivo rechazado correctamente (HTTP $http_code)"
        fi
    else
        show_result "$test_name" "FAIL" "Código HTTP inesperado: $http_code (esperado: $expected_status)"
    fi
    
    echo ""
}

echo -e "${PURPLE}🛡️ INICIANDO PRUEBAS DE SEGURIDAD - VALIDACIÓN ROBUSTA${NC}"
echo "Servidor: $SERVER_URL"
echo ""

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

# PRUEBAS DE SEGURIDAD

echo -e "${PURPLE}🔒 PRUEBAS DE ARCHIVOS VÁLIDOS${NC}"
echo "================================"

# 1. PDF real válido (debería pasar)
test_upload "test-files/real-test.pdf" "201" "PDF real válido"

# 2. Imagen real válida (debería pasar)
test_upload "test-files/real-test.jpg" "201" "Imagen real válida"

echo ""

echo -e "${PURPLE}🚨 PRUEBAS DE ARCHIVOS MALICIOSOS${NC}"
echo "=================================="

# 3. Archivo ejecutable renombrado como PDF (debería ser rechazado)
test_upload "test-files/malicious.pdf" "400" "Archivo ejecutable renombrado como PDF"

# 4. Archivo de texto renombrado como PDF (debería ser rechazado)
test_upload "test-files/real-test.txt" "400" "Archivo de texto renombrado como PDF"

# 5. Archivo de texto renombrado como imagen (debería ser rechazado)
cp test-files/real-test.txt test-files/fake-image.jpg
test_upload "test-files/fake-image.jpg" "400" "Archivo de texto renombrado como imagen"

echo ""

echo -e "${PURPLE}📊 RESUMEN DE PRUEBAS DE SEGURIDAD${NC}"
echo "====================================="

# Contar resultados
total_tests=$(grep -c "✅ PASS\|❌ FAIL" $RESULTS_FILE)
passed_tests=$(grep -c "✅ PASS" $RESULTS_FILE)
failed_tests=$(grep -c "❌ FAIL" $RESULTS_FILE)

echo -e "${BLUE}Total de pruebas: $total_tests${NC}"
echo -e "${GREEN}Pruebas exitosas: $passed_tests${NC}"
echo -e "${RED}Pruebas fallidas: $failed_tests${NC}"

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🛡️ ¡TODAS LAS PRUEBAS DE SEGURIDAD PASARON!${NC}"
    echo "🛡️ ¡TODAS LAS PRUEBAS DE SEGURIDAD PASARON!" >> $RESULTS_FILE
else
    echo -e "${YELLOW}⚠️  Algunas pruebas de seguridad fallaron. Revisa los logs.${NC}"
    echo "⚠️  Algunas pruebas de seguridad fallaron. Revisa los logs." >> $RESULTS_FILE
fi

echo ""
echo -e "${BLUE}📁 Resultados guardados en: $RESULTS_FILE${NC}"
echo ""

echo -e "${GREEN}✅ Pruebas de seguridad completadas${NC}"
