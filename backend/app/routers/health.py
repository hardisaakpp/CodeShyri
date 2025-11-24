"""
Router para endpoints de salud y estado
"""
from fastapi import APIRouter
from app.config import APP_TITLE, APP_VERSION
from app.logger import setup_logger

router = APIRouter(tags=["health"])
logger = setup_logger(__name__)


@router.get("/")
async def root():
    """Endpoint raíz con información básica de la API"""
    logger.debug("Root endpoint accessed")
    return {
        "message": APP_TITLE,
        "version": APP_VERSION,
        "status": "running"
    }


@router.get("/api/health")
async def health():
    """Endpoint de salud para verificar que la API está funcionando"""
    logger.debug("Health check endpoint accessed")
    return {"status": "healthy"}

