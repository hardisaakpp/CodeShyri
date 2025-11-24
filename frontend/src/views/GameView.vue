<template>
  <div class="game-view">
    <div class="game-container">
      <div class="game-header">
        <div class="header-left">
          <button @click="goHome" class="home-button" title="Volver al inicio">
            <span class="home-icon">🏠</span>
            <span class="home-text">Inicio</span>
          </button>
          <div class="character-badge">
            <span class="character-icon-small">{{ currentCharacter?.icon }}</span>
            <div class="character-info-header">
              <h2>{{ currentCharacter?.name || 'Aventura' }}</h2>
              <span class="level-badge">Nivel {{ levelId }}</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-icon">💎</span>
              <span class="stat-value">{{ score }}</span>
              <span class="stat-label">Puntos</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⭐</span>
              <span class="stat-value">{{ levelId }}</span>
              <span class="stat-label">Nivel</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <span class="stat-value">100%</span>
              <span class="stat-label">Energía</span>
            </div>
          </div>
        </div>
      </div>

      <div class="game-layout">
        <div class="game-canvas-container">
          <div id="game-canvas"></div>
        </div>

        <div class="code-editor-container">
          <div class="editor-header">
            <div class="editor-title">
              <span class="editor-icon">💻</span>
              <span>Editor de Código</span>
            </div>
            <div class="editor-actions">
              <button @click="runCode" class="run-button" :disabled="isRunning || isExecuting">
                <span v-if="isRunning || isExecuting" class="spinner"></span>
                <span v-else class="button-icon">▶️</span>
                <span class="button-text">{{ getButtonText() }}</span>
              </button>
              <button @click="resetCode" class="reset-button" :disabled="isRunning || isExecuting">
                <span class="button-icon">🔄</span>
                <span class="button-text">Reiniciar</span>
              </button>
            </div>
          </div>
          <div id="monaco-editor" class="monaco-editor" :class="{ 'editor-disabled': isRunning || isExecuting }"></div>
        </div>
      </div>

      <div class="game-console">
        <div class="console-header">
          <span class="console-icon">📟</span>
          <span>Consola de Ejecución</span>
          <button @click="clearConsole" class="clear-console-btn">🗑️ Limpiar</button>
        </div>
        <div class="console-output" ref="consoleOutput">
          <div v-if="consoleLogs.length === 0" class="console-empty">
            <span>La consola está lista. Ejecuta tu código para ver los resultados.</span>
          </div>
          <div v-for="(log, index) in consoleLogs" :key="index" :class="['log-entry', log.type]">
            <span class="log-timestamp">{{ log.timestamp || getTimestamp() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as monaco from 'monaco-editor'
import { GameEngine } from '@/game/GameEngine'
import type { Character } from '@/types/character'

const route = useRoute()
const router = useRouter()
const levelId = ref(route.params.levelId as string || '1')
const score = ref(0)
const consoleLogs = ref<Array<{ type: string; message: string; timestamp?: string }>>([])
const consoleOutput = ref<HTMLElement | null>(null)
const isRunning = ref(false)
const isExecuting = ref(false)

let editor: monaco.editor.IStandaloneCodeEditor | null = null
let gameEngine: GameEngine | null = null

const currentCharacter = ref<Character | null>(null)

const characters: Record<string, Character> = {
  'human-paladin': {
    id: 'human-paladin',
    name: 'Paladín Humano',
    icon: '⚔️',
    description: 'Un noble paladín de la Alianza',
    color: '#4A90E2'
  },
  'orc-warrior': {
    id: 'orc-warrior',
    name: 'Guerrero Orco',
    icon: '🪓',
    description: 'Un feroz guerrero de la Horda',
    color: '#8B4513'
  },
  'elf-mage': {
    id: 'elf-mage',
    name: 'Mago Élfico',
    icon: '🔮',
    description: 'Un sabio mago élfico',
    color: '#9370DB'
  },
  'human-warrior': {
    id: 'human-warrior',
    name: 'Guerrero Humano',
    icon: '🛡️',
    description: 'Un valiente guerrero humano',
    color: '#1E90FF'
  }
}

onMounted(async () => {
  const characterId = route.query.character as string
  if (characterId && characters[characterId]) {
    currentCharacter.value = characters[characterId]
  } else {
    currentCharacter.value = characters['human-paladin']
  }

  await nextTick()
  
  // Inicializar Monaco Editor
  editor = monaco.editor.create(document.getElementById('monaco-editor')!, {
    value: getInitialCode(),
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false
  })

  // Inicializar motor de juego
  gameEngine = new GameEngine('game-canvas', currentCharacter.value)
  gameEngine.onLog = (message: string, type: string = 'info') => {
    consoleLogs.value.push({ type, message, timestamp: getTimestamp() })
    if (consoleOutput.value) {
      consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight
    }
  }
  gameEngine.onExecutionComplete = () => {
    isExecuting.value = false
    consoleLogs.value.push({ 
      type: 'success', 
      message: '✅ Ejecución completada', 
      timestamp: getTimestamp() 
    })
    if (consoleOutput.value) {
      consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight
    }
  }
})

onUnmounted(() => {
  editor?.dispose()
  gameEngine?.destroy()
})

const getInitialCode = (): string => {
  return `// Bienvenido a CodeShyri - Azeroth del Código!
// Controla a ${currentCharacter.value?.name || 'tu personaje'} con estas funciones:

// === MOVIMIENTO BÁSICO ===
// moveForward(steps) - Avanza en la dirección actual (por defecto 1 paso)
// moveBackward(steps) - Retrocede
// moveUp(steps) - Mueve hacia arriba
// moveDown(steps) - Mueve hacia abajo
// moveLeft(steps) - Mueve hacia la izquierda
// moveRight(steps) - Mueve hacia la derecha

// === ROTACIÓN ===
// turnRight(degrees) - Gira a la derecha (por defecto 90°)
// turnLeft(degrees) - Gira a la izquierda (por defecto 90°)
// turn(degrees) - Gira grados específicos (positivo = derecha, negativo = izquierda)
// faceDirection('north'|'south'|'east'|'west') - Mira hacia una dirección

// === MOVIMIENTO AVANZADO ===
// moveTo(x, y) - Mueve a una posición específica
// moveDistance(pixels) - Mueve una distancia específica en la dirección actual
// sprint(steps) - Corre más rápido que moveForward
// teleport(x, y) - Teletransporta instantáneamente

// === ACCIONES ===
// jump() - Salta
// attack() - Ataca
// spin() - Gira 360 grados
// wait(milliseconds) - Espera (solo para logging)

// Ejemplo básico:
moveForward(2);
turnRight();
moveForward(1);
jump();
attack();
`
}

const runCode = async () => {
  if (!editor || !gameEngine || isRunning.value) return

  const code = editor.getValue()
  if (!code || code.trim().length === 0) {
    consoleLogs.value.push({ type: 'warning', message: '⚠️ No hay código para ejecutar', timestamp: getTimestamp() })
    return
  }

  isRunning.value = true
  consoleLogs.value.push({ type: 'info', message: '⚡ Ejecutando código...', timestamp: getTimestamp() })

  try {
    // Ejecutar código en el backend
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, levelId: levelId.value })
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Intentar parsear el error del backend
      let errorMessage = 'Error desconocido'
      try {
        const errorResult = await response.json()
        errorMessage = errorResult.error || errorResult.detail || `Error ${response.status}`
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`
      }
      consoleLogs.value.push({ type: 'error', message: `✗ ${errorMessage}`, timestamp: getTimestamp() })
      isRunning.value = false
      return
    }

    const result = await response.json()
    
    if (result.success) {
      consoleLogs.value.push({ type: 'success', message: '✓ Código validado correctamente', timestamp: getTimestamp() })
      // Ejecutar código en el juego
      try {
        isExecuting.value = true
        gameEngine.executeCode(code)
        score.value += 10
      } catch (execError) {
        isExecuting.value = false
        consoleLogs.value.push({ type: 'error', message: `✗ Error al ejecutar código: ${execError}`, timestamp: getTimestamp() })
      }
    } else {
      // Código inválido según el backend
      const errorMsg = result.error || 'Código inválido'
      consoleLogs.value.push({ type: 'error', message: `✗ ${errorMsg}`, timestamp: getTimestamp() })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    consoleLogs.value.push({ type: 'error', message: `✗ Error de conexión: ${errorMessage}`, timestamp: getTimestamp() })
  } finally {
    isRunning.value = false
  }
}

const resetCode = () => {
  if (editor) {
    editor.setValue(getInitialCode())
  }
  consoleLogs.value = []
  if (gameEngine) {
    gameEngine.reset()
  }
}

const clearConsole = () => {
  consoleLogs.value = []
}

const getTimestamp = () => {
  const now = new Date()
  return now.toLocaleTimeString('es-ES', { hour12: false })
}

const goHome = () => {
  router.push({ name: 'Home' })
}

const getButtonText = (): string => {
  if (isRunning.value) return 'Validando...'
  if (isExecuting.value) return 'Ejecutando...'
  return 'Ejecutar'
}
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100vh;
  background: 
    linear-gradient(135deg, #2c1810 0%, #1a0f08 50%, #0d0603 100%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  color: #d4af37;
  overflow: hidden;
  position: relative;
}

.game-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: 
    linear-gradient(135deg, rgba(44, 24, 16, 0.95) 0%, rgba(26, 15, 8, 0.95) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px);
  border-bottom: 4px solid rgba(212, 175, 55, 0.4);
  border-style: double;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.6),
    inset 0 -2px 10px rgba(212, 175, 55, 0.1);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.home-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: 
    linear-gradient(135deg, rgba(44, 24, 16, 0.8) 0%, rgba(26, 15, 8, 0.8) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
  border: 3px solid rgba(212, 175, 55, 0.4);
  border-style: double;
  border-radius: 8px;
  color: #d4af37;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 0 10px rgba(212, 175, 55, 0.1);
}

.home-button:hover {
  background: 
    linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(139, 69, 19, 0.2) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
  border-color: rgba(212, 175, 55, 0.6);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(212, 175, 55, 0.4),
    inset 0 0 15px rgba(212, 175, 55, 0.2);
}

.home-button:active {
  transform: translateY(0);
}

.home-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
}

.home-text {
  font-size: 0.85rem;
}

.character-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1.5rem;
  background: 
    linear-gradient(135deg, rgba(44, 24, 16, 0.8) 0%, rgba(26, 15, 8, 0.8) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
  border-radius: 8px;
  border: 3px solid rgba(212, 175, 55, 0.4);
  border-style: double;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 0 15px rgba(212, 175, 55, 0.1);
}

.character-icon-small {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
}

.character-info-header h2 {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 
    0 0 10px rgba(212, 175, 55, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.level-badge {
  display: inline-block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  margin-top: 0.2rem;
}

.header-right {
  display: flex;
  align-items: center;
}

.game-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background: 
    linear-gradient(135deg, rgba(44, 24, 16, 0.6) 0%, rgba(26, 15, 8, 0.6) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
  border-radius: 8px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-style: double;
  min-width: 80px;
  transition: all 0.3s;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 0 10px rgba(212, 175, 55, 0.05);
}

.stat-item:hover {
  background: 
    linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(139, 69, 19, 0.15) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
  border-color: rgba(212, 175, 55, 0.5);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(212, 175, 55, 0.3),
    inset 0 0 15px rgba(212, 175, 55, 0.1);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
}

.stat-value {
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #d4af37;
  margin-bottom: 0.2rem;
  text-shadow: 
    0 0 10px rgba(212, 175, 55, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.game-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.game-canvas-container {
  flex: 1;
  background: 
    linear-gradient(135deg, #2c1810 0%, #1a0f08 50%, #0d0603 100%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-right: 4px solid rgba(212, 175, 55, 0.3);
  border-style: double;
}

.game-canvas-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(139, 69, 19, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

#game-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.code-editor-container {
  width: 550px;
  display: flex;
  flex-direction: column;
  background: 
    linear-gradient(180deg, #1a0f08 0%, #0d0603 100%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px);
  border-left: 4px solid rgba(212, 175, 55, 0.3);
  border-style: double;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.8);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: 
    linear-gradient(135deg, rgba(44, 24, 16, 0.95) 0%, rgba(26, 15, 8, 0.95) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
  border-bottom: 3px solid rgba(212, 175, 55, 0.3);
  border-style: double;
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  font-size: 1rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.editor-icon {
  font-size: 1.2rem;
}

.editor-actions {
  display: flex;
  gap: 0.75rem;
}

.run-button,
.reset-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  font-family: 'Cinzel', serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
}

.run-button {
  background: 
    linear-gradient(135deg, #556b2f 0%, #6b8e23 50%, #8b6914 100%),
    repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px);
  color: #fff;
  border: 2px solid rgba(212, 175, 55, 0.4);
  border-style: double;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.6),
    inset 0 0 10px rgba(212, 175, 55, 0.1);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.run-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(107, 142, 35, 0.6),
    inset 0 0 15px rgba(212, 175, 55, 0.2);
  border-color: rgba(212, 175, 55, 0.6);
}

.run-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  position: relative;
}

.run-button:disabled::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.reset-button {
  background: 
    linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%),
    repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px);
  color: #fff;
  border: 2px solid rgba(212, 175, 55, 0.4);
  border-style: double;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.6),
    inset 0 0 10px rgba(212, 175, 55, 0.1);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.reset-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(139, 69, 19, 0.6),
    inset 0 0 15px rgba(212, 175, 55, 0.2);
  border-color: rgba(212, 175, 55, 0.6);
}

.reset-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-icon {
  font-size: 1rem;
}

.button-text {
  font-size: 0.85rem;
}

.monaco-editor {
  flex: 1;
  min-height: 0;
  transition: opacity 0.3s;
}

.monaco-editor.editor-disabled {
  opacity: 0.6;
  pointer-events: none;
  position: relative;
}

.monaco-editor.editor-disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
  cursor: not-allowed;
}

.game-console {
  height: 180px;
  background: 
    linear-gradient(180deg, #1a0f08 0%, #0d0603 100%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px);
  border-top: 4px solid rgba(212, 175, 55, 0.3);
  border-style: double;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.8);
}

.console-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: 
    linear-gradient(135deg, rgba(44, 24, 16, 0.95) 0%, rgba(26, 15, 8, 0.95) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
  border-bottom: 3px solid rgba(212, 175, 55, 0.3);
  border-style: double;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.console-icon {
  font-size: 1.2rem;
}

.clear-console-btn {
  margin-left: auto;
  background: 
    linear-gradient(135deg, rgba(44, 24, 16, 0.6) 0%, rgba(26, 15, 8, 0.6) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px);
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-style: double;
  color: rgba(212, 175, 55, 0.8);
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: 'Cinzel', serif;
  transition: all 0.3s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.clear-console-btn:hover {
  background: 
    linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(139, 69, 19, 0.2) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px);
  border-color: rgba(212, 175, 55, 0.5);
  color: #d4af37;
  box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
}

.console-output {
  flex: 1;
  padding: 1rem 1.5rem;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  background: #1a1a1a;
}

.console-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

.log-entry {
  display: flex;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  animation: fadeIn 0.3s ease-in;
}

.log-timestamp {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-entry.info .log-message {
  color: #d4d4d4;
}

.log-entry.success .log-message {
  color: #4caf50;
  font-weight: 600;
}

.log-entry.error .log-message {
  color: #f44336;
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scrollbar personalizado */
.console-output::-webkit-scrollbar {
  width: 8px;
}

.console-output::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.console-output::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 4px;
}

.console-output::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}
</style>

