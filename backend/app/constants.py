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
        "id": "kitu",
        "name": "Kitu",
        "icon": "🏔️",
        "description": "Un valiente aventurero andino, explorador de los misterios de los Andes",
        "color": "#8BC34A",
        "race": "andino",
        "faction": "pachamama"
    }
]

# Niveles disponibles
LEVELS: Dict[str, Dict[str, Any]] = {
    "1": {
        "id": "1",
        "title": "Primeros Pasos con Kitu",
        "description": "Aprende los comandos básicos de movimiento",
        "character": "kitu",
        "objectives": [
            "Mueve el personaje 3 pasos hacia adelante",
            "Gira a la derecha 90 grados",
            "Llega al objetivo"
        ],
        "initialCode": "// Nivel 1: Primeros Pasos\n// Mueve a Kitu 3 pasos hacia adelante y luego gira a la derecha\n\nmoveForward(3);\nturnRight();\n",
        "validation": {
            "targetPosition": {"x": 400, "y": 400, "tolerance": 50},
            "minSteps": 3,
            "requiredRotation": 90
        },
        "availableFunctions": {
            "movement": [
                "moveForward(steps=1)",
                "moveBackward(steps=1)"
            ],
            "rotation": [
                "turnRight(degrees=90)",
                "turnLeft(degrees=90)"
            ]
        }
    },
    "2": {
        "id": "2",
        "title": "Explorando el Camino",
        "description": "Combina movimiento y rotación para navegar",
        "character": "kitu",
        "objectives": [
            "Mueve hacia adelante 2 pasos",
            "Gira a la derecha",
            "Mueve hacia adelante 2 pasos más",
            "Gira a la izquierda",
            "Mueve hacia adelante 1 paso"
        ],
        "initialCode": "// Nivel 2: Explorando el Camino\n// Combina movimiento y rotación para crear un camino\n\nmoveForward(2);\nturnRight();\nmoveForward(2);\nturnLeft();\nmoveForward(1);\n",
        "validation": {
            "targetPosition": {"x": 400, "y": 300, "tolerance": 50},
            "minSteps": 5,
            "requiredActions": ["moveForward", "turnRight", "turnLeft"]
        },
        "availableFunctions": {
            "movement": [
                "moveForward(steps=1)",
                "moveBackward(steps=1)"
            ],
            "rotation": [
                "turnRight(degrees=90)",
                "turnLeft(degrees=90)",
                "turn(degrees)"
            ]
        }
    },
    "3": {
        "id": "3",
        "title": "Bucles con Kitu",
        "description": "Aprende a usar bucles para repetir acciones",
        "character": "kitu",
        "objectives": [
            "Usa un bucle for para mover 4 pasos",
            "Gira a la derecha después de cada movimiento",
            "Crea un patrón cuadrado"
        ],
        "initialCode": "// Nivel 3: Bucles con Kitu\n// Usa un bucle for para repetir acciones\n\nfor (let i = 0; i < 4; i++) {\n  moveForward(2);\n  turnRight();\n}\n",
        "validation": {
            "targetPosition": {"x": 100, "y": 400, "tolerance": 50},
            "minSteps": 8,
            "minRotations": 4,
            "requiresLoop": True
        },
        "availableFunctions": {
            "movement": [
                "moveForward(steps=1)",
                "moveBackward(steps=1)"
            ],
            "rotation": [
                "turnRight(degrees=90)",
                "turnLeft(degrees=90)",
                "turn(degrees)"
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

