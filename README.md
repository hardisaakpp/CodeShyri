# CodeShyri

Una plataforma educativa de programación inspirada en CodeCombat, con temática de mitología andina.

## 🎮 Características

- Aprende programación jugando con personajes mitológicos andinos
- Editor de código integrado con resaltado de sintaxis
- Sistema de niveles progresivos
- Ejecución segura de código
- Personajes: Viracocha, Inti, Pachamama, Apus, Amaru, y más

## 🏗️ Estructura del Proyecto

```
CodeShyri/
├── frontend/          # Aplicación Vue.js + TypeScript
├── backend/           # API Python con FastAPI
├── game-engine/       # Motor de juego
└── shared/            # Código compartido
```

## 🚀 Tecnologías

- **Frontend**: Vue.js 3 + TypeScript + Vite
- **Backend**: Python 3.11+ + FastAPI
- **Editor**: Monaco Editor
- **Motor de Juego**: Phaser.js

## 📦 Instalación

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🎯 Desarrollo

Este proyecto está en desarrollo activo. Próximas características:
- Sistema de niveles
- Personajes mitológicos interactivos
- Ejecución de código en sandbox
- Sistema de logros

