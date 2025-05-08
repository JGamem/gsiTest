# GSITest Kanban App

El Test de GSI para Backend Jr:

Es un sistema completo de gestión de tareas estilo Kanban desarrollado con FastAPI (Backend) y React (Frontend).

## 🚀 Ejecución en un solo paso

Para ejecutar esta aplicación de la forma más sencilla posible, sigue estos pasos:

### En Linux/macOS:
```bash
# 1. Dar permisos de ejecución al script de configuración
chmod +x setup.sh

# 2. Ejecutar el script de configuración (requiere permisos de administrador)
./setup.sh

# 3. Iniciar la aplicación
./start.sh

# En este caso ya esta creado el ./start.sh no necesitarás realizar el ./setup.sh
```

### 🚀 Ejecución con un solo clic en Windows
Esta versión del proyecto GSITest Kanban está configurada para ejecutarse fácilmente en Windows con un solo clic gracias a Docker.
Requisito previo (solo necesitas instalar esto una vez):

Docker Desktop para Windows: Descargar aquí

Para ejecutar la aplicación:

Instala Docker Desktop si aún no lo tienes (solo necesario la primera vez)
Asegúrate de que Docker Desktop esté iniciado (icono en la barra de tareas)
Haz doble clic en el archivo ejecutar-kanban.bat
Espera a que se complete la configuración (puede tardar unos minutos la primera vez)
El navegador se abrirá automáticamente con la aplicación

¡Eso es todo! No necesitas instalar Python, Node.js, PostgreSQL ni ninguna otra dependencia.

Para detener la aplicación:

Simplemente cierra la ventana de la terminal, o
Ejecuta el archivo detener-kanban.bat

## 📋 Funcionalidades

- **Tableros Kanban**: Crea y gestiona múltiples tableros para diferentes proyectos
- **Columnas personalizables**: Añade, edita y reorganiza columnas según tus necesidades
- **Tareas con arrastrar y soltar**: Mueve tareas entre columnas con interfaz intuitiva
- **Prioridades y estados**: Asigna prioridades (baja, media, alta, urgente) y estados
- **Etiquetas**: Añade etiquetas de colores a tus tareas para mejor organización
- **Interfaz responsive**: Diseñada con Tailwind CSS para experiencia fluida en cualquier dispositivo

## 🛠️ Tecnologías

### Backend
- **FastAPI**: Framework de Python rápido y moderno
- **SQLAlchemy**: ORM para interactuar con la base de datos
- **Alembic**: Sistema de migraciones para PostgreSQL
- **Pydantic**: Validación de datos y serialización
- **PostgreSQL**: Base de datos relacional

### Frontend
- **React**: Biblioteca para construir interfaces de usuario
- **React Router**: Navegación entre páginas
- **Tailwind CSS**: Framework de utilidades CSS para diseño
- **Axios**: Cliente HTTP para comunicarse con la API
- **DND Kit**: Biblioteca para funcionalidad de arrastrar y soltar

## 📝 Requisitos previos

El script de configuración instalará automáticamente los siguientes requisitos si no están presentes:

- Python 3.10+
- Node.js 21+
- PostgreSQL 16+

## 🔍 Estructura del proyecto

```
gsitest/
├── setup.sh           # Script de configuración inicial
├── start.sh           # Script para iniciar la aplicación
├── stop.sh            # Script para detener la aplicación
├── README.md          # Este archivo
├── GSITest_Kanban_API.postman_collection.json  # Colección Postman
│
├── backend/           # Proyecto FastAPI (Python)
│   ├── .env           # Variables de entorno
│   ├── alembic/       # Migraciones de base de datos
│   ├── app/           # Código principal
│   │   ├── api/       # Endpoints de la API
│   │   ├── core/      # Configuración principal
│   │   ├── db/        # Configuración de base de datos
│   │   ├── models/    # Modelos SQLAlchemy
│   │   ├── schemas/   # Esquemas Pydantic
│   │   ├── services/  # Lógica de negocio
│   │   └── main.py    # Punto de entrada
│   └── requirements.txt  # Dependencias Python
│
└── frontend/          # Proyecto React
    ├── public/        # Archivos estáticos
    ├── src/           # Código fuente
    │   ├── components/  # Componentes React
    │   ├── services/    # Servicios API
    │   └── App.jsx      # Componente principal
    ├── package.json   # Dependencias npm
    └── tailwind.config.js  # Configuración de Tailwind
```
### 🌐 Acceso a la aplicación

Interfaz principal: http://localhost:3000
Backend: http://localhost:8000
Documentación API: http://localhost:8000/api/v1/docs

## 🔧 Pruebas API con Postman

Puedes importar la colección de Postman incluida (`GSITest_API.postman_collection.json`) para probar todos los endpoints de la API manualmente.

## ⚠️ Solución de problemas

--- Docker Desktop no está instalado
Si ves un mensaje indicando que Docker no está instalado:

Descarga e instala Docker Desktop desde el enlace proporcionado
Reinicia tu computadora después de la instalación
Ejecuta nuevamente el script

--- Docker Desktop no está instalado
Si ves un mensaje indicando que Docker no está instalado:

Descarga e instala Docker Desktop desde el enlace proporcionado
Reinicia tu computadora después de la instalación
Ejecuta nuevamente el script

Si encuentras algún problema durante la instalación o ejecución:

1. **Revisa los logs**:
   ```bash
   # Log del backend
   cat backend/backend.log
   
   # Log del frontend
   cat frontend/frontend.log
   ```

2. **Problemas con PostgreSQL**:
   - Asegúrate de que PostgreSQL está en ejecución:
     ```bash
     sudo systemctl status postgresql
     ```
   - Si no está en ejecución, inícialo:
     ```bash
     sudo systemctl start postgresql
     ```

3. **Puertos ocupados**:
   - Si los puertos 3000 o 8000 están en uso por otras aplicaciones, deténlas antes de ejecutar esta aplicación.

4. **Permisos de usuario PostgreSQL**:
   - Si hay problemas con los permisos de PostgreSQL, puedes recrear el usuario manualmente:
     ```bash
     sudo -u postgres psql
     CREATE USER gsitest WITH PASSWORD 'test123';
     CREATE DATABASE gsitest;
     GRANT ALL PRIVILEGES ON DATABASE gsitest TO gsitest;
     \q
     ```

Desarrollado por Juan Gamez - 2025