"""
Servicio para proveer datos estáticos (niveles, personajes, funciones)
"""
from typing import Dict, Any, List, Optional
from app.constants import CHARACTERS, LEVELS, FUNCTIONS_DEFINITION


class DataProvider:
    """Servicio para acceder a datos estáticos de la aplicación"""
    
    @staticmethod
    def get_characters() -> Dict[str, List[Dict[str, Any]]]:
        """
        Obtiene la lista de personajes disponibles.
        
        Returns:
            Diccionario con la lista de personajes
        """
        return {"characters": CHARACTERS}
    
    @staticmethod
    def get_level(level_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene información de un nivel específico.
        
        Args:
            level_id: ID del nivel
            
        Returns:
            Información del nivel o None si no existe
        """
        return LEVELS.get(level_id)
    
    @staticmethod
    def get_all_levels() -> Dict[str, Dict[str, Any]]:
        """
        Obtiene todos los niveles disponibles.
        
        Returns:
            Diccionario con todos los niveles
        """
        return LEVELS
    
    @staticmethod
    def get_functions() -> Dict[str, Dict[str, Any]]:
        """
        Obtiene la definición completa de funciones disponibles.
        
        Returns:
            Diccionario con la definición de funciones
        """
        return {"functions": FUNCTIONS_DEFINITION}

