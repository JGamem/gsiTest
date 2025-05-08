#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}     Iniciando GSITest Kanban App        ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Verificar si PostgreSQL está en ejecución
if ! pg_isready &> /dev/null; then
    echo -e "${RED}PostgreSQL no está en ejecución. Iniciando...${NC}"
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$NAME" == *"Ubuntu"* ]] || [[ "$NAME" == *"Debian"* ]] || [[ "$NAME" == *"Fedora"* ]] || [[ "$NAME" == *"CentOS"* ]] || [[ "$NAME" == *"Red Hat"* ]]; then
            sudo systemctl start postgresql
        fi
    fi
    
    # Esperar a que PostgreSQL esté listo
    echo -e "${YELLOW}Esperando a que PostgreSQL esté listo...${NC}"
    sleep 5
fi

# Detener procesos existentes si están en ejecución
if [ -f "backend/backend.pid" ]; then
    echo -e "${YELLOW}Deteniendo backend anterior...${NC}"
    BACKEND_PID=$(cat backend/backend.pid)
    kill $BACKEND_PID 2>/dev/null
    rm backend/backend.pid
fi

if [ -f "frontend/frontend.pid" ]; then
    echo -e "${YELLOW}Deteniendo frontend anterior...${NC}"
    FRONTEND_PID=$(cat frontend/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    rm frontend/frontend.pid
fi

# Iniciar backend
echo -e "${GREEN}Iniciando backend...${NC}"
cd backend
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
cd ..

# Iniciar frontend
echo -e "${GREEN}Iniciando frontend...${NC}"
cd frontend
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
cd ..

echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}¡GSITest Kanban App está en ejecución!${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${YELLOW}Frontend:${NC} http://localhost:3000"
echo -e "${YELLOW}Backend API:${NC} http://localhost:8000"
echo -e "${YELLOW}Documentación API:${NC} http://localhost:8000/api/v1/docs"
echo -e "${BLUE}==========================================${NC}"
echo -e "${YELLOW}Para detener la aplicación, ejecuta:${NC} ./stop.sh"
echo -e "${BLUE}==========================================${NC}"

# Esperar a que los servicios inicien
sleep 5

# Abrir en el navegador
if command -v xdg-open &> /dev/null
then
    echo -e "${GREEN}Abriendo la aplicación en el navegador...${NC}"
    xdg-open http://localhost:3000
elif command -v open &> /dev/null
then
    # Para macOS
    echo -e "${GREEN}Abriendo la aplicación en el navegador...${NC}"
    open http://localhost:3000
elif command -v start &> /dev/null
then
    # Para Windows
    echo -e "${GREEN}Abriendo la aplicación en el navegador...${NC}"
    start http://localhost:3000
fi
