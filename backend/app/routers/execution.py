"""
Router para ejecución y validación de código
"""
from fastapi import APIRouter
from app.models import CodeExecutionRequest, CodeExecutionResponse
from app.services.code_validator import CodeValidator
from app.exceptions import ValidationError, ServiceError
from app.logger import setup_logger

router = APIRouter(prefix="/api", tags=["execution"])
logger = setup_logger(__name__)


@router.post("/execute", response_model=CodeExecutionResponse)
async def execute_code(request: CodeExecutionRequest):
    """
    Valida código JavaScript de forma segura.
    El código se ejecuta en el frontend, aquí solo validamos sintaxis y seguridad.
    
    Funciones disponibles para el usuario:
    - Movimiento básico: moveForward(steps=1), moveBackward(steps=1), moveUp(steps=1), 
      moveDown(steps=1), moveLeft(steps=1), moveRight(steps=1)
    - Rotación: turnRight(degrees=90), turnLeft(degrees=90), turn(degrees), 
      faceDirection(direction)
    - Movimiento avanzado: moveTo(x, y), moveDistance(distance), sprint(steps=1)
    - Acciones: jump(), attack(), wait(milliseconds), teleport(x, y), spin()
    - Console: console.log(message)
    """
    try:
        logger.info(
            f"Validando código para nivel: {request.levelId}",
            extra={"level_id": request.levelId, "code_length": len(request.code)}
        )
        
        is_valid, success_msg, error_msg = CodeValidator.validate(request.code)
        
        if not is_valid:
            logger.warning(
                f"Validación fallida: {error_msg}",
                extra={"level_id": request.levelId}
            )
            # Devolver respuesta de error en lugar de lanzar excepción
            return CodeExecutionResponse(
                success=False,
                output=None,
                error=error_msg or "Código inválido"
            )
        
        logger.info(
            f"Código validado exitosamente para nivel: {request.levelId}",
            extra={"level_id": request.levelId}
        )
        
        return CodeExecutionResponse(
            success=True,
            output=success_msg,
            error=None
        )
        
    except Exception as e:
        logger.error(
            f"Error inesperado durante validación: {str(e)}",
            exc_info=True,
            extra={"level_id": request.levelId}
        )
        # Devolver respuesta de error en lugar de lanzar excepción
        return CodeExecutionResponse(
            success=False,
            output=None,
            error=f"Error al validar código: {str(e)}"
        )

