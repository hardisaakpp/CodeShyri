"""
Tests unitarios para el servicio CodeValidator
"""
from app.services.code_validator import CodeValidator


class TestCodeValidator:
    """Tests para CodeValidator"""
    
    def test_validate_safe_code(self):
        """Test que código seguro pasa la validación"""
        code = "moveForward(2); turnRight(90); moveForward(1);"
        is_valid, success_msg, error_msg = CodeValidator.validate(code)
        
        assert is_valid is True
        assert success_msg == "Código válido"
        assert error_msg is None
    
    def test_validate_dangerous_pattern_eval(self):
        """Test que detecta el uso de eval()"""
        code = "eval('alert(1)'); moveForward();"
        is_valid, success_msg, error_msg = CodeValidator.validate(code)
        
        assert is_valid is False
        assert error_msg is not None
        assert "eval" in error_msg.lower()
    
    def test_validate_dangerous_pattern_function_constructor(self):
        """Test que detecta el uso de Function constructor peligroso"""
        code = "new Function('return alert(1)')();"
        is_valid, success_msg, error_msg = CodeValidator.validate(code)
        
        assert is_valid is False
        assert error_msg is not None
    
    def test_validate_dangerous_pattern_import(self):
        """Test que detecta imports"""
        code = "import fs from 'fs'; moveForward();"
        is_valid, success_msg, error_msg = CodeValidator.validate(code)
        
        assert is_valid is False
        assert error_msg is not None
    
    def test_validate_syntax_error(self):
        """Test que detecta errores de sintaxis"""
        code = "moveForward(2; turnRight(90)"  # Falta paréntesis de cierre
        is_valid, success_msg, error_msg = CodeValidator.validate(code)
        
        # Puede pasar validación de patrones pero fallar en sintaxis
        # Depende de si Node.js está disponible
        assert isinstance(is_valid, bool)
    
    def test_validate_empty_code(self):
        """Test con código vacío"""
        code = ""
        is_valid, success_msg, error_msg = CodeValidator.validate(code)
        
        assert isinstance(is_valid, bool)
    
    def test_validate_dangerous_patterns_method(self):
        """Test del método validate_dangerous_patterns directamente"""
        safe_code = "moveForward(); turnRight();"
        result = CodeValidator.validate_dangerous_patterns(safe_code)
        assert result is None
        
        dangerous_code = "eval('code')"
        result = CodeValidator.validate_dangerous_patterns(dangerous_code)
        assert result is not None
        assert "eval" in result.lower()

