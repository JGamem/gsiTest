#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}     Configuración de GSITest Kanban     ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Detectar el sistema operativo
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
elif [ -f /etc/lsb-release ]; then
    . /etc/lsb-release
    OS=$DISTRIB_ID
elif [ "$(uname)" == "Darwin" ]; then
    OS="macOS"
else
    OS="Unknown"
fi

echo -e "${YELLOW}Sistema operativo detectado: $OS${NC}"

# Verificar requisitos previos
echo -e "${YELLOW}Verificando requisitos previos...${NC}"

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 no está instalado.${NC}"
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        echo -e "${YELLOW}Instalando Python 3...${NC}"
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv
    elif [[ "$OS" == *"Fedora"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        echo -e "${YELLOW}Instalando Python 3...${NC}"
        sudo dnf install -y python3 python3-pip
    elif [[ "$OS" == "macOS" ]]; then
        echo -e "${YELLOW}Por favor instala Python 3 desde: https://www.python.org/downloads/mac-osx/${NC}"
        exit 1
    else
        echo -e "${RED}No se pudo instalar Python 3 automáticamente. Por favor instálalo manualmente.${NC}"
        exit 1
    fi
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js no está instalado.${NC}"
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        echo -e "${YELLOW}Instalando Node.js...${NC}"
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
        sudo apt-get update
        sudo apt-get install -y nodejs
    elif [[ "$OS" == *"Fedora"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        echo -e "${YELLOW}Instalando Node.js...${NC}"
        sudo dnf install -y nodejs
    elif [[ "$OS" == "macOS" ]]; then
        echo -e "${YELLOW}Por favor instala Node.js desde: https://nodejs.org/en/download/${NC}"
        exit 1
    else
        echo -e "${RED}No se pudo instalar Node.js automáticamente. Por favor instálalo manualmente.${NC}"
        exit 1
    fi
fi

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL no está instalado.${NC}"
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        echo -e "${YELLOW}Instalando PostgreSQL...${NC}"
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
        sudo systemctl enable postgresql
        sudo systemctl start postgresql
    elif [[ "$OS" == *"Fedora"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        echo -e "${YELLOW}Instalando PostgreSQL...${NC}"
        sudo dnf install -y postgresql-server postgresql-contrib
        sudo postgresql-setup --initdb
        sudo systemctl enable postgresql
        sudo systemctl start postgresql
    elif [[ "$OS" == "macOS" ]]; then
        echo -e "${YELLOW}Por favor instala PostgreSQL desde: https://www.postgresql.org/download/macosx/${NC}"
        exit 1
    else
        echo -e "${RED}No se pudo instalar PostgreSQL automáticamente. Por favor instálalo manualmente.${NC}"
        exit 1
    fi
fi

# Configurar la base de datos PostgreSQL
echo -e "${YELLOW}Configurando la base de datos PostgreSQL...${NC}"

# Verificar si PostgreSQL está en ejecución
if ! pg_isready &> /dev/null; then
    echo -e "${YELLOW}Iniciando servicio PostgreSQL...${NC}"
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]] || [[ "$OS" == *"Fedora"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        sudo systemctl start postgresql
    fi
fi

# Crear usuario y base de datos
echo -e "${YELLOW}Creando usuario y base de datos...${NC}"
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='gsitest'" | grep -q 1
if [ $? -ne 0 ]; then
    sudo -u postgres psql -c "CREATE USER gsitest WITH PASSWORD 'test123';"
fi

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='gsitest'" | grep -q 1
if [ $? -ne 0 ]; then
    sudo -u postgres psql -c "CREATE DATABASE gsitest;"
fi

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gsitest TO gsitest;"

# Configurar el backend
echo -e "${YELLOW}Configurando el backend...${NC}"
cd backend

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
pip install pydantic-settings

# Actualizar el archivo de configuración
CONFIG_FILE="app/core/config.py"
if grep -q "from pydantic import BaseSettings" "$CONFIG_FILE"; then
    echo -e "${YELLOW}Actualizando archivo de configuración...${NC}"
    sed -i 's/from pydantic import BaseSettings/from pydantic_settings import BaseSettings/' "$CONFIG_FILE"
fi

# Ejecutar migraciones de base de datos
echo -e "${YELLOW}Ejecutando migraciones de base de datos...${NC}"
alembic upgrade head

# Volver al directorio raíz
cd ..

# Configurar el frontend
echo -e "${YELLOW}Configurando el frontend...${NC}"
cd frontend

# Instalar dependencias
npm install

# Volver al directorio raíz
cd ..

# Crear script de inicio y detención
echo -e "${YELLOW}Creando scripts de inicio y detención...${NC}"

# Script de inicio
cat > start.sh << 'EOL'
#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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
EOL

# Script de detención
cat > stop.sh << 'EOL'
#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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
EOL

# Dar permisos de ejecución a los scripts
chmod +x start.sh
chmod +x stop.sh

echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}¡Configuración completada con éxito!${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${YELLOW}Para iniciar la aplicación, ejecuta:${NC} ./start.sh"
echo -e "${YELLOW}Para detener la aplicación, ejecuta:${NC} ./stop.sh"
echo -e "${BLUE}==========================================${NC}"