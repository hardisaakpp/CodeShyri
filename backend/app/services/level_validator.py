"""
Servicio para validar si un nivel ha sido completado
"""
from typing import Dict, Any, List, Tuple
from app.services.data_provider import DataProvider
from app.logger import setup_logger

logger = setup_logger(__name__)


class LevelValidator:
    """Servicio para validar si los objetivos de un nivel fueron completados"""
    
    @staticmethod
    def validate_level(level_id: str, player_position: Dict[str, float], 
                      player_angle: float, actions_executed: List[str],
                      steps_moved: int = 0, rotations_made: int = 0) -> Tuple[bool, str, List[str], List[str]]:
        """
        Valida si un nivel fue completado basado en los objetivos.
        
        Args:
            level_id: ID del nivel
            player_position: Posición final del jugador {"x": float, "y": float}
            player_angle: Ángulo final del jugador
            actions_executed: Lista de acciones ejecutadas
            steps_moved: Número de pasos movidos
            rotations_made: Número de rotaciones realizadas
            
        Returns:
            Tupla (completado, mensaje, objetivos_completados, objetivos_pendientes)
        """
        level = DataProvider.get_level(level_id)
        if not level:
            return False, "Nivel no encontrado", [], []
        
        validation_rules = level.get("validation", {})
        objectives = level.get("objectives", [])
        
        completed_objectives = []
        pending_objectives = []
        all_completed = True
        
        # Validar posición objetivo
        target_pos = validation_rules.get("targetPosition")
        if target_pos:
            target_x = target_pos.get("x", 0)
            target_y = target_pos.get("y", 0)
            tolerance = target_pos.get("tolerance", 50)
            
            player_x = player_position.get("x", 0)
            player_y = player_position.get("y", 0)
            
            distance = ((player_x - target_x) ** 2 + (player_y - target_y) ** 2) ** 0.5
            
            if distance <= tolerance:
                completed_objectives.append("Llegar al objetivo")
            else:
                pending_objectives.append("Llegar al objetivo")
                all_completed = False
        
        # Validar número mínimo de pasos
        min_steps = validation_rules.get("minSteps", 0)
        if min_steps > 0:
            if steps_moved >= min_steps:
                completed_objectives.append(f"Mover al menos {min_steps} pasos")
            else:
                pending_objectives.append(f"Mover al menos {min_steps} pasos (moviste {steps_moved})")
                all_completed = False
        
        # Validar rotaciones mínimas
        min_rotations = validation_rules.get("minRotations", 0)
        if min_rotations > 0:
            if rotations_made >= min_rotations:
                completed_objectives.append(f"Realizar al menos {min_rotations} rotaciones")
            else:
                pending_objectives.append(f"Realizar al menos {min_rotations} rotaciones (hiciste {rotations_made})")
                all_completed = False
        
        # Validar rotación requerida
        required_rotation = validation_rules.get("requiredRotation")
        if required_rotation is not None:
            # Verificar si el ángulo está cerca del requerido (módulo 360)
            angle_diff = abs((player_angle % 360) - (required_rotation % 360))
            if angle_diff < 10 or angle_diff > 350:  # Tolerancia de 10 grados
                completed_objectives.append(f"Girar {required_rotation} grados")
            else:
                pending_objectives.append(f"Girar {required_rotation} grados (estás en {player_angle:.0f}°)")
                all_completed = False
        
        # Validar acciones requeridas
        required_actions = validation_rules.get("requiredActions", [])
        if required_actions:
            missing_actions = [action for action in required_actions if action not in actions_executed]
            if not missing_actions:
                completed_objectives.append("Usar las acciones requeridas")
            else:
                pending_objectives.append(f"Usar las acciones requeridas: faltan {', '.join(missing_actions)}")
                all_completed = False
        
        # Validar uso de bucles (nivel 3)
        requires_loop = validation_rules.get("requiresLoop", False)
        if requires_loop:
            # Verificar si el código contiene palabras clave de bucles
            # Esto se validaría mejor en el código, pero por ahora verificamos si hay múltiples movimientos
            if steps_moved >= 8:  # Si movió mucho, probablemente usó un bucle
                completed_objectives.append("Usar un bucle para repetir acciones")
            else:
                pending_objectives.append("Usar un bucle para repetir acciones")
                all_completed = False
        
        # Mensaje final
        if all_completed:
            message = "¡Felicidades! Has completado todos los objetivos del nivel."
        elif completed_objectives:
            message = f"Buen progreso. Completaste {len(completed_objectives)} de {len(objectives)} objetivos."
        else:
            message = "Intenta nuevamente. Revisa los objetivos del nivel."
        
        return all_completed, message, completed_objectives, pending_objectives

