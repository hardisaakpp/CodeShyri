"""
CodeShyri Backend - Punto de entrada principal
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.config import CORS_ORIGINS, APP_TITLE, APP_VERSION
from app.routers import execution, game_data, health
from app.exceptions import CodeShyriException
from app.logger import app_logger

# Crear aplicación FastAPI
app = FastAPI(title=APP_TITLE, version=APP_VERSION)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers globales
@app.exception_handler(CodeShyriException)
async def codeshyri_exception_handler(request: Request, exc: CodeShyriException):
    """Maneja excepciones personalizadas de CodeShyri"""
    app_logger.warning(
        f"CodeShyriException: {exc.detail}",
        extra={"path": request.url.path, "method": request.method}
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "type": exc.__class__.__name__}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Maneja errores de validación de Pydantic"""
    app_logger.warning(
        f"Validation error: {exc.errors()}",
        extra={"path": request.url.path, "method": request.method}
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Error de validación", "details": exc.errors()}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Maneja excepciones no esperadas"""
    app_logger.error(
        f"Unhandled exception: {str(exc)}",
        exc_info=True,
        extra={"path": request.url.path, "method": request.method}
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Error interno del servidor"}
    )


@app.on_event("startup")
async def startup_event():
    """Evento de inicio de la aplicación"""
    app_logger.info(f"🚀 {APP_TITLE} v{APP_VERSION} iniciado")


@app.on_event("shutdown")
async def shutdown_event():
    """Evento de cierre de la aplicación"""
    app_logger.info(f"👋 {APP_TITLE} cerrado")


# Registrar routers
app.include_router(health.router)
app.include_router(execution.router)
app.include_router(game_data.router)
