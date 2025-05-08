#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}     Reiniciando GSITest Kanban App      ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Detener la aplicación si está en ejecución
if [ -f "./stop.sh" ]; then
    echo -e "${YELLOW}Deteniendo la aplicación...${NC}"
    ./stop.sh
fi

# Instalar pydantic-settings
echo -e "${YELLOW}Instalando dependencias adicionales...${NC}"
cd backend
source venv/bin/activate
pip install pydantic-settings
cd ..

# Iniciar la aplicación nuevamente
echo -e "${YELLOW}Iniciando la aplicación...${NC}"
./run-direct.sh