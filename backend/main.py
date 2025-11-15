from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import tempfile
import os
from typing import Optional

app = FastAPI(title="CodeShyri API", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeExecutionRequest(BaseModel):
    code: str
    levelId: str


class CodeExecutionResponse(BaseModel):
    success: bool
    output: Optional[str] = None
    error: Optional[str] = None


@app.get("/")
async def root():
    return {
        "message": "CodeShyri API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy"}


@app.post("/api/execute", response_model=CodeExecutionResponse)
async def execute_code(request: CodeExecutionRequest):
    """
    Valida código JavaScript de forma segura.
    El código se ejecuta en el frontend, aquí solo validamos sintaxis y seguridad.
    """
    try:
        # Validar código básico (prevenir imports peligrosos)
        dangerous_patterns = [
            "require(",
            "import(",
            "eval(",
            "Function(",
            "process.",
            "fs.",
            "child_process",
            "__dirname",
            "__filename",
            "XMLHttpRequest",
            "fetch(",
            "window.",
            "document.",
            "localStorage",
            "sessionStorage"
        ]
        
        code_lower = request.code.lower()
        for pattern in dangerous_patterns:
            if pattern.lower() in code_lower:
                return CodeExecutionResponse(
                    success=False,
                    error=f"Patrón no permitido: {pattern}"
                )
        
        # Validar sintaxis JavaScript usando Node.js en modo check-only
        # Creamos un wrapper que define las funciones del juego como stubs
        validation_code = f"""
// Funciones stub para validación (no se ejecutan realmente)
function moveForward() {{}}
function turnRight() {{}}
function turnLeft() {{}}
const console = {{ log: function() {{}} }};

// Código del usuario
{request.code}
"""
        
        # Crear archivo temporal
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            f.write(validation_code)
            temp_file = f.name
        
        try:
            # Validar sintaxis con Node.js usando --check (solo valida, no ejecuta)
            # Si --check no está disponible, usamos un enfoque diferente
            result = subprocess.run(
                ['node', '--check', temp_file],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                # Sintaxis válida
                return CodeExecutionResponse(
                    success=True,
                    output="Código válido"
                )
            else:
                # Error de sintaxis
                error_msg = result.stderr or "Error de sintaxis desconocido"
                # Limpiar rutas de archivos temporales del mensaje de error
                error_msg = error_msg.replace(temp_file, "tu código")
                return CodeExecutionResponse(
                    success=False,
                    error=error_msg
                )
        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_file):
                os.unlink(temp_file)
                
    except subprocess.TimeoutExpired:
        return CodeExecutionResponse(
            success=False,
            error="Tiempo de validación excedido"
        )
    except FileNotFoundError:
        # Node.js no está instalado, solo validamos patrones peligrosos
        return CodeExecutionResponse(
            success=True,
            output="Validación básica completada (Node.js no disponible para validación de sintaxis)"
        )
    except Exception as e:
        return CodeExecutionResponse(
            success=False,
            error=f"Error del servidor: {str(e)}"
        )


@app.get("/api/levels/{level_id}")
async def get_level(level_id: str):
    """Obtiene información de un nivel específico"""
    # Esto se puede expandir con una base de datos
    levels = {
        "1": {
            "id": "1",
            "title": "Primeros Pasos en Azeroth",
            "description": "Aprende los comandos básicos de movimiento",
            "character": "human-paladin",
            "objectives": [
                "Mueve el personaje 3 casillas hacia adelante",
                "Gira a la derecha",
                "Llega al objetivo"
            ]
        }
    }
    
    if level_id not in levels:
        raise HTTPException(status_code=404, detail="Nivel no encontrado")
    
    return levels[level_id]


@app.get("/api/characters")
async def get_characters():
    """Obtiene la lista de personajes disponibles"""
    return {
        "characters": [
            {
                "id": "human-paladin",
                "name": "Paladín Humano",
                "icon": "⚔️",
                "description": "Un noble paladín de la Alianza, maestro del honor y la justicia",
                "color": "#4A90E2",
                "race": "human",
                "faction": "alliance"
            },
            {
                "id": "orc-warrior",
                "name": "Guerrero Orco",
                "icon": "🪓",
                "description": "Un feroz guerrero de la Horda, forjado en batalla",
                "color": "#8B4513",
                "race": "orc",
                "faction": "horde"
            },
            {
                "id": "elf-mage",
                "name": "Mago Élfico",
                "icon": "🔮",
                "description": "Un sabio mago élfico, maestro de las artes arcanas",
                "color": "#9370DB",
                "race": "elf",
                "faction": "alliance"
            },
            {
                "id": "human-warrior",
                "name": "Guerrero Humano",
                "icon": "🛡️",
                "description": "Un valiente guerrero humano de la Alianza",
                "color": "#1E90FF",
                "race": "human",
                "faction": "alliance"
            }
        ]
    }

