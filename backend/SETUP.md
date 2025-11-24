# Configuración del Backend

## Instalación

1. **Crear entorno virtual**:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

## Variables de Entorno

El archivo `.env` debe contener:

- `APP_TITLE`: Título de la aplicación (default: "CodeShyri API")
- `APP_VERSION`: Versión de la aplicación (default: "0.1.0")
- `ENVIRONMENT`: Ambiente (development/production, default: "development")
- `CORS_ORIGINS`: Orígenes permitidos separados por comas
- `VALIDATION_TIMEOUT`: Timeout para validación en segundos (default: 5)
- `NODE_CHECK_COMMAND`: Comando para validar sintaxis (default: "node,--check")
- `LOG_LEVEL`: Nivel de logging (DEBUG/INFO/WARNING/ERROR, default: "INFO")

## Ejecutar

```bash
uvicorn main:app --reload
```

La API estará disponible en `http://localhost:8000`

## Tests

```bash
pytest
```

Para tests con más detalle:
```bash
pytest -v
```

## Logging

El sistema de logging está configurado automáticamente. Los logs se muestran en consola con formato estructurado.

En desarrollo, los logs incluyen:
- Timestamp
- Nombre del módulo
- Nivel de log
- Mensaje

En producción, los logs incluyen también:
- Archivo y línea donde ocurrió el log

