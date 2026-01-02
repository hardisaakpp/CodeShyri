"""
Tests unitarios para el servicio DataProvider
"""
from app.services.data_provider import DataProvider


class TestDataProvider:
    """Tests para DataProvider"""
    
    def test_get_characters(self):
        """Test que get_characters retorna un diccionario con personajes"""
        result = DataProvider.get_characters()
        
        assert isinstance(result, dict)
        assert "characters" in result
        assert isinstance(result["characters"], list)
    
    def test_get_level_existing(self):
        """Test obtener un nivel existente"""
        # Asumiendo que hay al menos un nivel en constants
        all_levels = DataProvider.get_all_levels()
        
        if all_levels:
            first_level_id = list(all_levels.keys())[0]
            level = DataProvider.get_level(first_level_id)
            
            assert level is not None
            assert isinstance(level, dict)
    
    def test_get_level_nonexistent(self):
        """Test obtener un nivel que no existe"""
        level = DataProvider.get_level("nonexistent_level_12345")
        
        assert level is None
    
    def test_get_all_levels(self):
        """Test obtener todos los niveles"""
        levels = DataProvider.get_all_levels()
        
        assert isinstance(levels, dict)
    
    def test_get_functions(self):
        """Test obtener funciones disponibles"""
        result = DataProvider.get_functions()
        
        assert isinstance(result, dict)
        assert "functions" in result

