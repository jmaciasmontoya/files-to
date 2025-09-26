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
RESULTS_FILE="complete-security-test-results.txt"

# Limpiar archivo de resultados
echo "=== PRUEBAS COMPLETAS DE SEGURIDAD ===" > $RESULTS_FILE
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

echo -e "${PURPLE}🛡️ INICIANDO PRUEBAS COMPLETAS DE SEGURIDAD${NC}"
echo "Servidor: $SERVER_URL"
echo ""

# 1. Verificar que el servidor esté funcionando
echo -e "${BLUE}🔍 Verificando servidor...${NC}"
server_response=$(curl -s -w "\n%{http_code}" http://localhost:3000/ 2>/dev/null)
server_http_code=$(echo "$server_response" | tail -n1)

if [ "$server_http_code" = "404" ]; then
    show_result "Servidor" "PASS" "Servidor funcionando correctamente"
else
    show_result "Servidor" "FAIL" "Servidor no responde correctamente"
    exit 1
fi

# 2. Probar rate limiting en endpoint seguro
echo -e "${BLUE}🚦 Probando rate limiting en endpoint seguro...${NC}"
echo "Enviando 5 requests rápidas a /files-test-secure/upload..."

rate_limited_count=0
for i in {1..5}; do
    response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/files-test-secure/upload -F "file=@test-files/small-real.pdf" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    echo "Request $i: HTTP $http_code"
    
    if [ "$http_code" = "429" ]; then
        ((rate_limited_count++))
    fi
    
    sleep 0.1
done

if [ $rate_limited_count -gt 0 ]; then
    show_result "Rate Limiting Seguro" "PASS" "Rate limiting funcionando en endpoint seguro ($rate_limited_count de 5 requests limitadas)"
else
    show_result "Rate Limiting Seguro" "FAIL" "Rate limiting no está funcionando en endpoint seguro"
fi

# 3. Probar headers de seguridad
echo -e "${BLUE}🔒 Probando headers de seguridad...${NC}"
security_headers=$(curl -s -I http://localhost:3000/ 2>/dev/null)

if echo "$security_headers" | grep -q "X-Content-Type-Options"; then
    show_result "Headers de Seguridad" "PASS" "Headers de seguridad presentes"
else
    show_result "Headers de Seguridad" "FAIL" "Headers de seguridad faltantes"
fi

# 4. Probar sanitización de nombres de archivo
echo -e "${BLUE}🧹 Probando sanitización de nombres...${NC}"
# Crear archivo con nombre peligroso
echo "test content" > "test-files/../../../malicious.txt"

response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/files-test/upload -F "file=@test-files/../../../malicious.txt" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "400" ]; then
    show_result "Sanitización de Nombres" "PASS" "Nombres peligrosos rechazados correctamente"
else
    show_result "Sanitización de Nombres" "FAIL" "Nombres peligrosos no fueron rechazados"
fi

# 5. Probar validación de archivos maliciosos
echo -e "${BLUE}🛡️ Probando validación de archivos maliciosos...${NC}"
# Crear archivo ejecutable disfrazado como PDF
echo '#!/bin/bash' > "test-files/malicious.pdf"
echo 'echo "Hacked!"' >> "test-files/malicious.pdf"

response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/files-test/upload -F "file=@test-files/malicious.pdf" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "400" ]; then
    show_result "Validación de Archivos Maliciosos" "PASS" "Archivos maliciosos rechazados correctamente"
else
    show_result "Validación de Archivos Maliciosos" "FAIL" "Archivos maliciosos no fueron rechazados"
fi

# 6. Probar logging estructurado
echo -e "${BLUE}📝 Verificando logging estructurado...${NC}"
if [ -f "logs/security.log" ]; then
    show_result "Logging Estructurado" "PASS" "Archivo de logs de seguridad creado"
else
    show_result "Logging Estructurado" "FAIL" "Archivo de logs de seguridad no encontrado"
fi

# 7. Probar endpoint de monitoreo de seguridad
echo -e "${BLUE}📊 Probando endpoint de monitoreo...${NC}"
# Obtener token JWT primero
jwt_response=$(curl -s -X POST http://localhost:3000/auth/test-token 2>/dev/null)
jwt_token=$(echo "$jwt_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$jwt_token" ]; then
    security_response=$(curl -s -w "\n%{http_code}" -X GET http://localhost:3000/security/stats -H "Authorization: Bearer $jwt_token" 2>/dev/null)
    security_http_code=$(echo "$security_response" | tail -n1)
    
    if [ "$security_http_code" = "200" ]; then
        show_result "Endpoint de Monitoreo" "PASS" "Endpoint de seguridad funcionando"
    else
        show_result "Endpoint de Monitoreo" "FAIL" "Endpoint de seguridad no responde correctamente"
    fi
else
    show_result "Endpoint de Monitoreo" "SKIP" "No se pudo obtener token JWT"
fi

# 8. Probar upload exitoso
echo -e "${BLUE}📤 Probando upload exitoso...${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/files-test/upload -F "file=@test-files/small-real.pdf" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "201" ]; then
    show_result "Upload Exitoso" "PASS" "Upload de archivo válido funcionando"
else
    show_result "Upload Exitoso" "FAIL" "Upload de archivo válido falló (HTTP $http_code)"
fi

# Resumen final
echo ""
echo -e "${PURPLE}📊 RESUMEN DE PRUEBAS COMPLETAS DE SEGURIDAD${NC}"
echo "====================================================="

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
echo -e "${BLUE}�� Resultados guardados en: $RESULTS_FILE${NC}"
echo ""

echo -e "${GREEN}✅ Pruebas completas de seguridad finalizadas${NC}"
