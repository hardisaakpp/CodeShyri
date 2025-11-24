"""
Router para datos del juego (niveles, personajes, funciones)
"""
from fastapi import APIRouter
from app.services.data_provider import DataProvider
from app.exceptions import LevelNotFoundError, ServiceError
from app.logger import setup_logger

router = APIRouter(prefix="/api", tags=["game-data"])
logger = setup_logger(__name__)


@router.get("/levels/{level_id}")
async def get_level(level_id: str):
    """
    Obtiene información de un nivel específico.
    Incluye objetivos, personaje y funciones disponibles.
    """
    try:
        logger.info(f"Solicitando nivel: {level_id}")
        level = DataProvider.get_level(level_id)
        
        if not level:
            logger.warning(f"Nivel no encontrado: {level_id}")
            raise LevelNotFoundError(level_id)
        
        logger.info(f"Nivel encontrado: {level_id}")
        return level
        
    except LevelNotFoundError:
        raise
    except Exception as e:
        logger.error(
            f"Error al obtener nivel {level_id}: {str(e)}",
            exc_info=True
        )
        raise ServiceError(f"Error al obtener nivel: {str(e)}")


@router.get("/characters")
async def get_characters():
    """Obtiene la lista de personajes disponibles"""
    try:
        logger.debug("Solicitando lista de personajes")
        return DataProvider.get_characters()
    except Exception as e:
        logger.error(
            f"Error al obtener personajes: {str(e)}",
            exc_info=True
        )
        raise ServiceError(f"Error al obtener personajes: {str(e)}")


@router.get("/functions")
async def get_available_functions():
    """
    Obtiene la lista completa de funciones disponibles para el usuario.
    Útil para autocompletado y documentación en el editor.
    """
    try:
        logger.debug("Solicitando lista de funciones")
        return DataProvider.get_functions()
    except Exception as e:
        logger.error(
            f"Error al obtener funciones: {str(e)}",
            exc_info=True
        )
        raise ServiceError(f"Error al obtener funciones: {str(e)}")

