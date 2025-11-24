"""
Modelos Pydantic para la API
"""
from pydantic import BaseModel
from typing import Optional


class CodeExecutionRequest(BaseModel):
    """Request model para ejecución de código"""
    code: str
    levelId: str


class CodeExecutionResponse(BaseModel):
    """Response model para ejecución de código"""
    success: bool
    output: Optional[str] = None
    error: Optional[str] = None

