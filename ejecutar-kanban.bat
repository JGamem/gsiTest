@echo off
echo ==========================================
echo        GSITest Kanban Launcher           
echo ==========================================
echo.

:: Verificar si Docker está instalado
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está instalado o no está en el PATH.
    echo Por favor instala Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo Después de instalar Docker Desktop, reinicia tu computadora
    echo y ejecuta este script nuevamente.
    pause
    exit /b
)

:: Verificar si Docker está en ejecución
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está en ejecución.
    echo Por favor inicia Docker Desktop y espera a que esté listo.
    echo.
    echo Después de iniciar Docker Desktop, ejecuta este script nuevamente.
    pause
    exit /b
)

echo Docker está correctamente instalado y en ejecución.
echo.
echo Iniciando GSITest Kanban App...
echo.
echo Este proceso puede tardar unos minutos la primera vez
echo mientras se construye la imagen.
echo.

:: Construir y ejecutar el contenedor Docker
docker-compose up -d

echo.
echo ==========================================
echo  ¡GSITest Kanban App está en ejecución!  
echo ==========================================
echo.
echo Abriendo la aplicación en el navegador...
echo.
echo - Para detener la aplicación, cierra esta ventana o
echo   ejecuta el script "detener-kanban.bat"
echo.
echo ==========================================

:: Esperar a que la aplicación esté lista
timeout /t 10 /nobreak >nul

:: Abrir el navegador
start http://localhost:8000

:: Esperar a que el usuario cierre la ventana
echo Presiona Ctrl+C para detener la aplicación
timeout /t 86400 /nobreak >nul

:: Detener la aplicación al cerrar
docker-compose down