#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}Deteniendo GSITest Kanban App...${NC}"

if [ -f "frontend/frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    rm frontend/frontend.pid
    echo -e "${GREEN}Frontend detenido.${NC}"
else
    echo -e "${RED}No se encontró el archivo PID del frontend.${NC}"
fi

if [ -f "backend/backend.pid" ]; then
    BACKEND_PID=$(cat backend/backend.pid)
    kill $BACKEND_PID 2>/dev/null
    rm backend/backend.pid
    echo -e "${GREEN}Backend detenido.${NC}"
else
    echo -e "${RED}No se encontró el archivo PID del backend.${NC}"
fi

echo -e "${GREEN}La aplicación se ha detenido correctamente.${NC}"
