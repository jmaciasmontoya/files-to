#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuración
FINAL_RESULTS="FINAL_TEST_RESULTS.txt"

echo -e "${PURPLE}🧪 BATERÍA COMPLETA DE PRUEBAS DEL SISTEMA DE ARCHIVOS${NC}"
echo "================================================================"
echo "Fecha: $(date)"
echo "Servidor: http://localhost:3000"
echo ""

# Limpiar archivo de resultados finales
echo "=== BATERÍA COMPLETA DE PRUEBAS ===" > $FINAL_RESULTS
echo "Fecha: $(date)" >> $FINAL_RESULTS
echo "Servidor: http://localhost:3000" >> $FINAL_RESULTS
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
server_check=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/files/test")
if [ "$server_check" = "401" ]; then
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
if [ -f "test-upload.sh" ]; then
    chmod +x test-upload.sh
    ./test-upload.sh
    if [ $? -eq 0 ]; then
        show_result "Pruebas de subida" "PASS" "Completadas exitosamente"
    else
        show_result "Pruebas de subida" "FAIL" "Algunas pruebas fallaron"
    fi
else
    show_result "Pruebas de subida" "FAIL" "Script test-upload.sh no encontrado"
fi

echo ""

# Ejecutar pruebas de descarga
echo -e "${PURPLE}📥 EJECUTANDO PRUEBAS DE DESCARGA${NC}"
echo "===================================="
if [ -f "test-download.sh" ]; then
    chmod +x test-download.sh
    ./test-download.sh
    if [ $? -eq 0 ]; then
        show_result "Pruebas de descarga" "PASS" "Completadas exitosamente"
    else
        show_result "Pruebas de descarga" "FAIL" "Algunas pruebas fallaron"
    fi
else
    show_result "Pruebas de descarga" "FAIL" "Script test-download.sh no encontrado"
fi

echo ""

# Ejecutar pruebas de eliminación
echo -e "${PURPLE}🗑️  EJECUTANDO PRUEBAS DE ELIMINACIÓN${NC}"
echo "====================================="
if [ -f "test-delete.sh" ]; then
    chmod +x test-delete.sh
    ./test-delete.sh
    if [ $? -eq 0 ]; then
        show_result "Pruebas de eliminación" "PASS" "Completadas exitosamente"
    else
        show_result "Pruebas de eliminación" "FAIL" "Algunas pruebas fallaron"
    fi
else
    show_result "Pruebas de eliminación" "FAIL" "Script test-delete.sh no encontrado"
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
echo "- Pruebas de subida: test-results.txt"
echo "- Pruebas de descarga: test-results-download.txt"
echo "- Pruebas de eliminación: test-results-delete.txt"
echo "- Archivos subidos: uploaded_files.txt"

echo ""
echo -e "${GREEN}✅ Batería completa de pruebas finalizada${NC}"
