#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SERVER_URL="http://localhost:3000"
RESULTS_FILE="test-results-delete.txt"

# Limpiar archivo de resultados
echo "=== RESULTADOS DE PRUEBAS DE ELIMINACIÓN ===" > $RESULTS_FILE
echo "Fecha: $(date)" >> $RESULTS_FILE
echo ""

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

# Función para probar eliminación de archivo
test_delete() {
    local uuid="$1"
    local test_name="$2"
    local expected_status="$3"
    
    echo -e "${BLUE}🧪 Probando: $test_name${NC}"
    
    # Realizar petición de eliminación
    response=$(curl -s -w "\n%{http_code}" -X DELETE \
        -H "Authorization: Bearer test-token" \
        "$SERVER_URL/files/$uuid")
    
    # Separar respuesta y código HTTP
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    # Verificar resultado
    if [ "$http_code" = "$expected_status" ]; then
        if [ "$expected_status" = "200" ]; then
            if echo "$response_body" | grep -q '"success":true'; then
                show_result "$test_name" "PASS" "Archivo eliminado correctamente (HTTP $http_code)"
            else
                show_result "$test_name" "FAIL" "Respuesta no contiene success: true"
            fi
        else
            show_result "$test_name" "PASS" "Archivo no encontrado correctamente (HTTP $http_code)"
        fi
    else
        show_result "$test_name" "FAIL" "Código HTTP inesperado: $http_code (esperado: $expected_status)"
    fi
    
    echo ""
}

echo -e "${BLUE}🚀 INICIANDO BATERÍA DE PRUEBAS DE ELIMINACIÓN${NC}"
echo "Servidor: $SERVER_URL"
echo ""

# Verificar que existan archivos subidos
if [ ! -f "uploaded_files.txt" ] || [ ! -s "uploaded_files.txt" ]; then
    show_result "Archivos subidos" "FAIL" "No se encontraron archivos subidos. Ejecuta test-upload.sh primero."
    exit 1
fi

# Leer UUIDs de archivos subidos
echo -e "${YELLOW}📁 Archivos disponibles para eliminación:${NC}"
cat uploaded_files.txt
echo ""

# PRUEBAS DE ELIMINACIÓN

# Eliminar algunos archivos (no todos para mantener algunos para otras pruebas)
file_count=1
files_to_delete=2  # Solo eliminar los primeros 2 archivos
while IFS= read -r uuid && [ $file_count -le $files_to_delete ]; do
    if [ -n "$uuid" ]; then
        test_delete "$uuid" "Eliminar archivo $file_count" "200"
        
        # Verificar que el archivo ya no existe
        echo -e "${BLUE}🧪 Verificando eliminación: Archivo $file_count${NC}"
        verify_response=$(curl -s -w "\n%{http_code}" -X GET \
            -H "Authorization: Bearer test-token" \
            "$SERVER_URL/files/$uuid")
        verify_http_code=$(echo "$verify_response" | tail -n1)
        
        if [ "$verify_http_code" = "404" ]; then
            show_result "Verificación eliminación $file_count" "PASS" "Archivo correctamente eliminado"
        else
            show_result "Verificación eliminación $file_count" "FAIL" "Archivo aún existe (HTTP $verify_http_code)"
        fi
        
        ((file_count++))
    fi
done < uploaded_files.txt

# Probar eliminación de UUID inexistente
test_delete "00000000-0000-0000-0000-000000000000" "UUID inexistente" "404"

# Probar eliminación sin autenticación
echo -e "${BLUE}🧪 Probando: Sin autenticación${NC}"
response=$(curl -s -w "\n%{http_code}" -X DELETE "$SERVER_URL/files/$(head -n1 uploaded_files.txt)")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ]; then
    show_result "Sin autenticación" "PASS" "Correctamente rechazado (HTTP $http_code)"
else
    show_result "Sin autenticación" "FAIL" "Código HTTP inesperado: $http_code"
fi

echo ""

# Resumen final
echo -e "${BLUE}📊 RESUMEN DE PRUEBAS DE ELIMINACIÓN${NC}"
echo "Archivos eliminados: $files_to_delete"
echo "Resultados guardados en: $RESULTS_FILE"
echo ""

echo -e "${GREEN}✅ Batería de pruebas de eliminación completada${NC}"
