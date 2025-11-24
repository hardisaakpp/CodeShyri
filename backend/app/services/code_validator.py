"""
Servicio para validación de código JavaScript
"""
import subprocess
import tempfile
import os
from typing import Tuple, Optional
from app.constants import DANGEROUS_PATTERNS, JS_VALIDATION_TEMPLATE
from app.config import VALIDATION_TIMEOUT, NODE_CHECK_COMMAND
from app.logger import setup_logger

logger = setup_logger(__name__)


class CodeValidator:
    """Servicio para validar código JavaScript de forma segura"""
    
    @staticmethod
    def validate_dangerous_patterns(code: str) -> Optional[str]:
        """
        Valida que el código no contenga patrones peligrosos.
        
        Returns:
            None si es seguro, mensaje de error si encuentra un patrón peligroso
        """
        code_lower = code.lower()
        for pattern in DANGEROUS_PATTERNS:
            if pattern.lower() in code_lower:
                logger.warning(f"Patrón peligroso detectado: {pattern}")
                return f"Patrón no permitido: {pattern}"
        return None
    
    @staticmethod
    def create_validation_code(user_code: str) -> str:
        """
        Crea el código de validación con stubs de funciones.
        
        Args:
            user_code: Código del usuario a validar
            
        Returns:
            Código JavaScript completo para validación
        """
        return JS_VALIDATION_TEMPLATE.format(user_code=user_code)
    
    @staticmethod
    def validate_syntax(validation_code: str) -> Tuple[bool, Optional[str]]:
        """
        Valida la sintaxis del código JavaScript usando Node.js.
        
        Args:
            validation_code: Código JavaScript completo para validar
            
        Returns:
            Tupla (es_válido, mensaje_error)
        """
        temp_file = None
        try:
            # Crear archivo temporal
            with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                f.write(validation_code)
                temp_file = f.name
            
            # Validar sintaxis con Node.js
            result = subprocess.run(
                NODE_CHECK_COMMAND + [temp_file],
                capture_output=True,
                text=True,
                timeout=VALIDATION_TIMEOUT
            )
            
            if result.returncode == 0:
                logger.debug("Validación de sintaxis exitosa")
                return True, None
            else:
                error_msg = result.stderr or "Error de sintaxis desconocido"
                # Limpiar rutas de archivos temporales del mensaje de error
                error_msg = error_msg.replace(temp_file, "tu código")
                logger.warning(f"Error de sintaxis: {error_msg}")
                return False, error_msg
                
        except subprocess.TimeoutExpired:
            logger.warning("Tiempo de validación excedido")
            return False, "Tiempo de validación excedido"
        except FileNotFoundError:
            # Node.js no está instalado
            logger.warning("Node.js no está disponible para validación de sintaxis")
            return True, "Validación básica completada (Node.js no disponible para validación de sintaxis)"
        except Exception as e:
            logger.error(f"Error durante validación de sintaxis: {str(e)}", exc_info=True)
            return False, f"Error del servidor: {str(e)}"
        finally:
            # Limpiar archivo temporal
            if temp_file and os.path.exists(temp_file):
                os.unlink(temp_file)
    
    @classmethod
    def validate(cls, code: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Valida código JavaScript completo (patrones peligrosos + sintaxis).
        
        Args:
            code: Código del usuario a validar
            
        Returns:
            Tupla (es_válido, mensaje_éxito, mensaje_error)
        """
        # Validar patrones peligrosos primero
        dangerous_error = cls.validate_dangerous_patterns(code)
        if dangerous_error:
            return False, None, dangerous_error
        
        # Crear código de validación
        validation_code = cls.create_validation_code(code)
        
        # Validar sintaxis
        is_valid, error_msg = cls.validate_syntax(validation_code)
        
        if is_valid:
            return True, "Código válido", None
        else:
            return False, None, error_msg

