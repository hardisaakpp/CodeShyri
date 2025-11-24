"""
Configuración de la aplicación
"""
import os
from typing import List
from dotenv import load_dotenv

# Cargar variables de entorno desde archivo .env
load_dotenv()

# Configuración de CORS
CORS_ORIGINS: List[str] = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
).split(",")

# Configuración de la aplicación
APP_TITLE = os.getenv("APP_TITLE", "CodeShyri API")
APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Configuración de validación
VALIDATION_TIMEOUT = int(os.getenv("VALIDATION_TIMEOUT", "5"))  # segundos
NODE_CHECK_COMMAND = os.getenv("NODE_CHECK_COMMAND", "node,--check").split(",")

# Configuración de logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

