# CodeShyri Backend

API backend para CodeShyri construida con FastAPI.

## Instalación

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

## Ejecución

```bash
uvicorn main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

## Endpoints

- `GET /` - Información de la API
- `GET /api/health` - Estado de salud del servidor
- `POST /api/execute` - Ejecuta código JavaScript
- `GET /api/levels/{level_id}` - Obtiene información de un nivel
- `GET /api/characters` - Lista de personajes disponibles

## Documentación

Una vez que el servidor esté corriendo, puedes acceder a:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

