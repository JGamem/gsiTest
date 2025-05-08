import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Cargar variables de entorno
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "GSITest Kanban API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey2025")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://gsitest:test123@localhost/gsitest")
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000", "http://localhost:5173"]
    
    # Version
    VERSION: str = "0.1.0"
    
    class Config:
        env_file = ".env"

settings = Settings()