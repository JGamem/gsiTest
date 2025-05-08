@echo off
echo ==========================================
echo     Deteniendo GSITest Kanban App        
echo ==========================================
echo.

:: Verificar si Docker está instalado
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está instalado o no está en el PATH.
    echo No se puede detener la aplicación.
    pause
    exit /b
)

:: Detener contenedores de la aplicación
echo Deteniendo contenedores...
docker-compose down

echo.
echo ==========================================
echo      GSITest Kanban App se detuvo!
echo ==========================================
echo.
pause