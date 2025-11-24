"""
Excepciones personalizadas para la aplicación
"""
from fastapi import HTTPException, status


class CodeShyriException(HTTPException):
    """Excepción base personalizada para CodeShyri"""
    
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(status_code=status_code, detail=detail)


class ValidationError(CodeShyriException):
    """Excepción para errores de validación de código"""
    
    def __init__(self, detail: str):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LevelNotFoundError(CodeShyriException):
    """Excepción para cuando no se encuentra un nivel"""
    
    def __init__(self, level_id: str):
        super().__init__(
            detail=f"Nivel '{level_id}' no encontrado",
            status_code=status.HTTP_404_NOT_FOUND
        )


class ServiceError(CodeShyriException):
    """Excepción para errores en servicios"""
    
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(detail=detail, status_code=status_code)

