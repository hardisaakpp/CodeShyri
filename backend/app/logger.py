"""
Configuración de logging estructurado para la aplicación
"""
import logging
import sys
from typing import Optional
from app.config import LOG_LEVEL, ENVIRONMENT


def setup_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Configura y retorna un logger con formato estructurado.
    
    Args:
        name: Nombre del logger (opcional, por defecto usa el nombre del módulo)
        
    Returns:
        Logger configurado
    """
    logger = logging.getLogger(name or __name__)
    
    # Evitar duplicar handlers si ya está configurado
    if logger.handlers:
        return logger
    
    logger.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))
    
    # Handler para consola
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))
    
    # Formato estructurado
    if ENVIRONMENT == "development":
        # Formato más legible para desarrollo
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:
        # Formato JSON para producción (puede extenderse)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger


# Logger principal de la aplicación
app_logger = setup_logger("codeshyri")

