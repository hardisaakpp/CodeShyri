"""
Constantes y datos estáticos de la aplicación
"""
from typing import Dict, List, Any

# Patrones peligrosos que no se permiten en el código del usuario
DANGEROUS_PATTERNS: List[str] = [
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

# Template para código de validación JavaScript
JS_VALIDATION_TEMPLATE = """
// Funciones stub para validación (no se ejecutan realmente)
// Estas funciones coinciden con las disponibles en el frontend

// === MOVIMIENTO BÁSICO ===
function moveForward(steps = 1) {{}}
function moveBackward(steps = 1) {{}}
function moveUp(steps = 1) {{}}
function moveDown(steps = 1) {{}}
function moveLeft(steps = 1) {{}}
function moveRight(steps = 1) {{}}

// === ROTACIÓN ===
function turnRight(degrees = 90) {{}}
function turnLeft(degrees = 90) {{}}
function turn(degrees) {{}}
function faceDirection(direction) {{}}

// === MOVIMIENTO AVANZADO ===
function moveTo(x, y) {{}}
function moveDistance(distance) {{}}
function sprint(steps = 1) {{}}

// === ACCIONES ===
function jump() {{}}
function attack() {{}}
function wait(milliseconds) {{}}
function teleport(x, y) {{}}
function spin() {{}}

// Console object para logging
const console = {{ 
  log: function() {{}} 
}};

// Código del usuario
{user_code}
"""

# Personajes disponibles
CHARACTERS: List[Dict[str, Any]] = [
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

# Niveles disponibles
LEVELS: Dict[str, Dict[str, Any]] = {
    "1": {
        "id": "1",
        "title": "Primeros Pasos en Azeroth",
        "description": "Aprende los comandos básicos de movimiento",
        "character": "human-paladin",
        "objectives": [
            "Mueve el personaje 3 casillas hacia adelante",
            "Gira a la derecha",
            "Llega al objetivo"
        ],
        "availableFunctions": {
            "movement": [
                "moveForward(steps=1)",
                "moveBackward(steps=1)",
                "moveUp(steps=1)",
                "moveDown(steps=1)",
                "moveLeft(steps=1)",
                "moveRight(steps=1)"
            ],
            "rotation": [
                "turnRight(degrees=90)",
                "turnLeft(degrees=90)",
                "turn(degrees)",
                "faceDirection(direction)"
            ],
            "advanced": [
                "moveTo(x, y)",
                "moveDistance(distance)",
                "sprint(steps=1)"
            ],
            "actions": [
                "jump()",
                "attack()",
                "wait(milliseconds)",
                "teleport(x, y)",
                "spin()"
            ]
        }
    }
}

# Definición completa de funciones disponibles
FUNCTIONS_DEFINITION: Dict[str, Any] = {
    "movement": {
        "category": "Movimiento Básico",
        "description": "Funciones para mover el personaje en diferentes direcciones",
        "list": [
            {
                "name": "moveForward",
                "signature": "moveForward(steps = 1)",
                "description": "Avanza el personaje en la dirección actual",
                "parameters": [
                    {"name": "steps", "type": "number", "default": 1, "description": "Número de pasos a avanzar"}
                ]
            },
            {
                "name": "moveBackward",
                "signature": "moveBackward(steps = 1)",
                "description": "Retrocede el personaje",
                "parameters": [
                    {"name": "steps", "type": "number", "default": 1, "description": "Número de pasos a retroceder"}
                ]
            },
            {
                "name": "moveUp",
                "signature": "moveUp(steps = 1)",
                "description": "Mueve el personaje hacia arriba",
                "parameters": [
                    {"name": "steps", "type": "number", "default": 1, "description": "Número de pasos hacia arriba"}
                ]
            },
            {
                "name": "moveDown",
                "signature": "moveDown(steps = 1)",
                "description": "Mueve el personaje hacia abajo",
                "parameters": [
                    {"name": "steps", "type": "number", "default": 1, "description": "Número de pasos hacia abajo"}
                ]
            },
            {
                "name": "moveLeft",
                "signature": "moveLeft(steps = 1)",
                "description": "Mueve el personaje hacia la izquierda",
                "parameters": [
                    {"name": "steps", "type": "number", "default": 1, "description": "Número de pasos hacia la izquierda"}
                ]
            },
            {
                "name": "moveRight",
                "signature": "moveRight(steps = 1)",
                "description": "Mueve el personaje hacia la derecha",
                "parameters": [
                    {"name": "steps", "type": "number", "default": 1, "description": "Número de pasos hacia la derecha"}
                ]
            }
        ]
    },
    "rotation": {
        "category": "Rotación",
        "description": "Funciones para rotar y cambiar la dirección del personaje",
        "list": [
            {
                "name": "turnRight",
                "signature": "turnRight(degrees = 90)",
                "description": "Gira el personaje a la derecha",
                "parameters": [
                    {"name": "degrees", "type": "number", "default": 90, "description": "Grados a girar"}
                ]
            },
            {
                "name": "turnLeft",
                "signature": "turnLeft(degrees = 90)",
                "description": "Gira el personaje a la izquierda",
                "parameters": [
                    {"name": "degrees", "type": "number", "default": 90, "description": "Grados a girar"}
                ]
            },
            {
                "name": "turn",
                "signature": "turn(degrees)",
                "description": "Gira el personaje grados específicos (positivo = derecha, negativo = izquierda)",
                "parameters": [
                    {"name": "degrees", "type": "number", "description": "Grados a girar (positivo o negativo)"}
                ]
            },
            {
                "name": "faceDirection",
                "signature": "faceDirection(direction)",
                "description": "Hace que el personaje mire hacia una dirección específica",
                "parameters": [
                    {"name": "direction", "type": "string", "description": "Dirección: 'north', 'south', 'east', 'west' (o en español)"}
                ]
            }
        ]
    },
    "advanced": {
        "category": "Movimiento Avanzado",
        "description": "Funciones avanzadas de movimiento",
        "list": [
            {
                "name": "moveTo",
                "signature": "moveTo(x, y)",
                "description": "Mueve el personaje a una posición específica",
                "parameters": [
                    {"name": "x", "type": "number", "description": "Coordenada X de destino"},
                    {"name": "y", "type": "number", "description": "Coordenada Y de destino"}
                ]
            },
            {
                "name": "moveDistance",
                "signature": "moveDistance(distance)",
                "description": "Mueve el personaje una distancia específica en la dirección actual",
                "parameters": [
                    {"name": "distance", "type": "number", "description": "Distancia en píxeles a mover"}
                ]
            },
            {
                "name": "sprint",
                "signature": "sprint(steps = 1)",
                "description": "Corre más rápido que moveForward",
                "parameters": [
                    {"name": "steps", "type": "number", "default": 1, "description": "Número de pasos a correr"}
                ]
            }
        ]
    },
    "actions": {
        "category": "Acciones",
        "description": "Acciones especiales que puede realizar el personaje",
        "list": [
            {
                "name": "jump",
                "signature": "jump()",
                "description": "Hace que el personaje salte",
                "parameters": []
            },
            {
                "name": "attack",
                "signature": "attack()",
                "description": "Realiza un ataque",
                "parameters": []
            },
            {
                "name": "wait",
                "signature": "wait(milliseconds)",
                "description": "Espera un tiempo específico antes de continuar",
                "parameters": [
                    {"name": "milliseconds", "type": "number", "description": "Tiempo de espera en milisegundos"}
                ]
            },
            {
                "name": "teleport",
                "signature": "teleport(x, y)",
                "description": "Teletransporta el personaje a una posición",
                "parameters": [
                    {"name": "x", "type": "number", "description": "Coordenada X de destino"},
                    {"name": "y", "type": "number", "description": "Coordenada Y de destino"}
                ]
            },
            {
                "name": "spin",
                "signature": "spin()",
                "description": "Hace que el personaje gire 360 grados",
                "parameters": []
            }
        ]
    }
}

