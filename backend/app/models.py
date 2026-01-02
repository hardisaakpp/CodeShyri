"""
Modelos Pydantic para la API
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class CodeExecutionRequest(BaseModel):
    """Request model para ejecución de código"""
    code: str
    levelId: str


class CodeExecutionResponse(BaseModel):
    """Response model para ejecución de código"""
    success: bool
    output: Optional[str] = None
    error: Optional[str] = None


class LevelValidationRequest(BaseModel):
    """Request model para validación de nivel completado"""
    levelId: str
    playerPosition: Dict[str, float]  # {"x": float, "y": float}
    playerAngle: float
    actionsExecuted: List[str] = []  # Lista de acciones ejecutadas
    stepsMoved: int = 0
    rotationsMade: int = 0


class LevelValidationResponse(BaseModel):
    """Response model para validación de nivel"""
    completed: bool
    message: str
    objectivesCompleted: List[str] = []
    objectivesPending: List[str] = []

