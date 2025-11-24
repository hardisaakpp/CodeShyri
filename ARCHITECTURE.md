# Arquitectura de CodeShyri

Este documento describe la arquitectura del proyecto CodeShyri, una plataforma educativa de programación con temática de mitología andina.

## 🏗️ Visión General

CodeShyri es una aplicación full-stack que permite a los usuarios aprender programación mediante la escritura de código JavaScript que controla personajes en un juego 2D.

### Stack Tecnológico

- **Backend**: Python 3.11+ con FastAPI
- **Frontend**: Vue.js 3 + TypeScript + Vite
- **Motor de Juego**: Phaser.js
- **Editor de Código**: Monaco Editor

## 📁 Estructura del Proyecto

```
CodeShyri/
├── backend/              # API REST con FastAPI
│   ├── app/
│   │   ├── config.py     # Configuración (variables de entorno)
│   │   ├── logger.py     # Sistema de logging
│   │   ├── exceptions.py # Excepciones personalizadas
│   │   ├── models.py     # Modelos Pydantic
│   │   ├── constants.py  # Constantes del juego
│   │   ├── routers/      # Endpoints de la API
│   │   └── services/     # Lógica de negocio
│   ├── tests/           # Tests unitarios
│   └── main.py          # Punto de entrada
│
└── frontend/            # Aplicación Vue.js
    └── src/
        ├── game/        # Motor de juego Phaser
        │   ├── GameEngine.ts
        │   ├── scenes/
        │   ├── commands/
        │   ├── player/
        │   └── background/
        ├── views/       # Vistas Vue
        └── router/      # Enrutamiento
```

## 🔧 Backend - Arquitectura

### Principios de Diseño

1. **Separación de Responsabilidades**
   - **Routers**: Manejan HTTP requests/responses
   - **Services**: Contienen lógica de negocio
   - **Models**: Definen estructuras de datos (Pydantic)

2. **Configuración**
   - Variables de entorno mediante `python-dotenv`
   - Configuración centralizada en `app/config.py`
   - Archivo `.env.example` como plantilla

3. **Manejo de Errores**
   - Excepciones personalizadas en `app/exceptions.py`
   - Exception handlers globales en `main.py`
   - Logging estructurado para debugging

4. **Logging**
   - Sistema de logging centralizado en `app/logger.py`
   - Diferentes niveles según ambiente (development/production)
   - Logs estructurados con contexto

### Flujo de Validación de Código

```
Usuario envía código
    ↓
Router (execution.py)
    ↓
CodeValidator.validate()
    ↓
1. Validar patrones peligrosos
    ↓
2. Validar sintaxis con Node.js
    ↓
Response (success/error)
```

### Endpoints Principales

- `POST /api/execute` - Valida código JavaScript
- `GET /api/levels/{level_id}` - Obtiene información de nivel
- `GET /api/characters` - Lista de personajes
- `GET /api/functions` - Funciones disponibles
- `GET /api/health` - Health check

## 🎮 Frontend - Arquitectura

### Principios de Diseño

1. **Separación de Concerns**
   - **GameEngine**: Orquesta el juego Phaser
   - **GameScene**: Escena principal del juego
   - **Commands**: Sistema de comandos (Command Pattern)
   - **Renderers**: Renderizado especializado (Strategy Pattern)

2. **Sistema de Comandos**
   - `CommandQueue`: Cola secuencial de comandos
   - `MovementCommands`: Comandos de movimiento
   - `RotationCommands`: Comandos de rotación
   - `ActionCommands`: Acciones del personaje

3. **Renderizado**
   - `BackgroundRenderer`: Orquestador principal
   - Renderers especializados por elemento (TreeRenderer, MountainRenderer, etc.)
   - Cada renderer es independiente y reutilizable

### Flujo de Ejecución de Código

```
Usuario escribe código
    ↓
Frontend valida con backend (/api/execute)
    ↓
Si válido → Ejecuta en GameScene.executeCode()
    ↓
Código se sanitiza y ejecuta con Function()
    ↓
Comandos se agregan a CommandQueue
    ↓
Comandos se ejecutan secuencialmente
    ↓
Animaciones y feedback visual
```

## 🔒 Seguridad

### Validación de Código

1. **Backend (Pre-ejecución)**
   - Validación de patrones peligrosos (eval, Function, import, etc.)
   - Validación de sintaxis con Node.js
   - Timeout en validación

2. **Frontend (Ejecución)**
   - Sanitización de código (remover redefiniciones de funciones)
   - Ejecución en contexto aislado
   - Solo funciones permitidas disponibles

### Buenas Prácticas Implementadas

- ✅ Variables de entorno para configuración sensible
- ✅ Logging estructurado para auditoría
- ✅ Manejo de errores robusto
- ✅ Validación en múltiples capas
- ✅ Timeouts para prevenir ejecución infinita

## 🧪 Testing

### Estructura de Tests

```
backend/tests/
├── test_code_validator.py  # Tests de validación
└── test_data_provider.py   # Tests de datos
```

### Ejecutar Tests

```bash
cd backend
pytest
```

## 📝 Decisiones de Arquitectura

### ¿Por qué FastAPI?
- Performance superior a Flask/Django
- Validación automática con Pydantic
- Documentación automática (OpenAPI)
- Soporte nativo para async/await

### ¿Por qué Phaser.js?
- Framework maduro para juegos 2D
- Buena documentación
- Sistema de escenas flexible
- Animaciones y físicas integradas

### ¿Por qué Command Pattern?
- Permite ejecución secuencial de comandos
- Fácil de extender con nuevos comandos
- Permite undo/redo (futuro)
- Separación clara entre intención y ejecución

## 🚀 Mejoras Futuras

1. **Backend**
   - [ ] Inyección de dependencias más robusta
   - [ ] Cache para datos estáticos
   - [ ] Rate limiting
   - [ ] Autenticación y autorización

2. **Frontend**
   - [ ] Store de estado (Pinia) para estado global
   - [ ] Mejor manejo de errores con retry
   - [ ] Tests unitarios con Vitest
   - [ ] Optimización de renderizado

3. **General**
   - [ ] CI/CD pipeline
   - [ ] Dockerización
   - [ ] Monitoreo y métricas
   - [ ] Documentación de API más completa

## 📚 Referencias

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Phaser.js Documentation](https://phaser.io/docs)
- [Vue.js Documentation](https://vuejs.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

