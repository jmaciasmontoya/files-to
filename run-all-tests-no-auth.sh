#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuración
FINAL_RESULTS="FINAL_TEST_RESULTS_NO_AUTH.txt"

echo -e "${PURPLE}🧪 BATERÍA COMPLETA DE PRUEBAS DEL SISTEMA DE ARCHIVOS (SIN AUTENTICACIÓN)${NC}"
echo "=================================================================================="
echo "Fecha: $(date)"
echo "Servidor: http://localhost:3000"
echo "Endpoints de prueba: /files-test/*"
echo ""

# Limpiar archivo de resultados finales
echo "=== BATERÍA COMPLETA DE PRUEBAS (SIN AUTENTICACIÓN) ===" > $FINAL_RESULTS
echo "Fecha: $(date)" >> $FINAL_RESULTS
echo "Servidor: http://localhost:3000" >> $FINAL_RESULTS
echo "Endpoints de prueba: /files-test/*" >> $FINAL_RESULTS
echo "" >> $FINAL_RESULTS

# Función para mostrar resultados
show_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name - $message"
        echo "✅ PASS: $test_name - $message" >> $FINAL_RESULTS
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $test_name - $message"
        echo "❌ FAIL: $test_name - $message" >> $FINAL_RESULTS
    else
        echo -e "${YELLOW}⚠️  INFO${NC}: $test_name - $message"
        echo "⚠️  INFO: $test_name - $message" >> $FINAL_RESULTS
    fi
}

# Verificar que el servidor esté funcionando
echo -e "${BLUE}🔍 Verificando servidor...${NC}"
server_check=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/files-test/upload")
if [ "$server_check" = "400" ]; then
    show_result "Servidor" "PASS" "Servidor funcionando correctamente"
else
    show_result "Servidor" "FAIL" "Servidor no responde correctamente (HTTP $server_check)"
    echo -e "${RED}❌ El servidor no está funcionando. Inicia el servidor con: npm run start:dev${NC}"
    exit 1
fi

echo ""

# Ejecutar pruebas de subida
echo -e "${PURPLE}📤 EJECUTANDO PRUEBAS DE SUBIDA${NC}"
echo "=================================="
if [ -f "test-upload-no-auth.sh" ]; then
    chmod +x test-upload-no-auth.sh
    ./test-upload-no-auth.sh
    if [ $? -eq 0 ]; then
        show_result "Pruebas de subida" "PASS" "Completadas exitosamente"
    else
        show_result "Pruebas de subida" "FAIL" "Algunas pruebas fallaron"
    fi
else
    show_result "Pruebas de subida" "FAIL" "Script test-upload-no-auth.sh no encontrado"
fi

echo ""

# Ejecutar pruebas de descarga
echo -e "${PURPLE}📥 EJECUTANDO PRUEBAS DE DESCARGA${NC}"
echo "===================================="
if [ -f "test-download-no-auth.sh" ]; then
    chmod +x test-download-no-auth.sh
    ./test-download-no-auth.sh
    if [ $? -eq 0 ]; then
        show_result "Pruebas de descarga" "PASS" "Completadas exitosamente"
    else
        show_result "Pruebas de descarga" "FAIL" "Algunas pruebas fallaron"
    fi
else
    show_result "Pruebas de descarga" "FAIL" "Script test-download-no-auth.sh no encontrado"
fi

echo ""

# Resumen final
echo -e "${PURPLE}📊 RESUMEN FINAL${NC}"
echo "==============="

# Contar resultados
total_tests=$(grep -c "✅ PASS\|❌ FAIL" $FINAL_RESULTS)
passed_tests=$(grep -c "✅ PASS" $FINAL_RESULTS)
failed_tests=$(grep -c "❌ FAIL" $FINAL_RESULTS)

echo -e "${BLUE}Total de pruebas: $total_tests${NC}"
echo -e "${GREEN}Pruebas exitosas: $passed_tests${NC}"
echo -e "${RED}Pruebas fallidas: $failed_tests${NC}"

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODAS LAS PRUEBAS PASARON!${NC}"
    echo "🎉 ¡TODAS LAS PRUEBAS PASARON!" >> $FINAL_RESULTS
else
    echo -e "${YELLOW}⚠️  Algunas pruebas fallaron. Revisa los logs para más detalles.${NC}"
    echo "⚠️  Algunas pruebas fallaron. Revisa los logs para más detalles." >> $FINAL_RESULTS
fi

echo ""
echo -e "${BLUE}📁 Archivos de resultados:${NC}"
echo "- Resultados finales: $FINAL_RESULTS"
echo "- Pruebas de subida: test-results-no-auth.txt"
echo "- Pruebas de descarga: test-results-download-no-auth.txt"
echo "- Archivos subidos: uploaded_files_no_auth.txt"

echo ""
echo -e "${GREEN}✅ Batería completa de pruebas finalizada${NC}"
