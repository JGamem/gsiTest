#!/bin/bash
set -e

# Iniciar PostgreSQL
service postgresql start
echo "PostgreSQL iniciado"

# Ejecutar migraciones
alembic upgrade head
echo "Migraciones completadas"

# Iniciar la aplicación
uvicorn app.main:app --host 0.0.0.0 --port 8000