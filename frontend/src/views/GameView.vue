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
              <button @click="runCode" class="run-button" :disabled="isRunning">
                <span class="button-icon">▶️</span>
                <span class="button-text">{{ isRunning ? 'Ejecutando...' : 'Ejecutar' }}</span>
              </button>
              <button @click="resetCode" class="reset-button">
                <span class="button-icon">🔄</span>
                <span class="button-text">Reiniciar</span>
              </button>
            </div>
          </div>
          <div id="monaco-editor" class="monaco-editor"></div>
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

let editor: monaco.editor.IStandaloneCodeEditor | null = null
let gameEngine: GameEngine | null = null

const currentCharacter = ref<Character | null>(null)

const characters: Record<string, Character> = {
  viracocha: {
    id: 'viracocha',
    name: 'Viracocha',
    icon: '👑',
    description: 'El dios creador',
    color: '#FFD700'
  },
  inti: {
    id: 'inti',
    name: 'Inti',
    icon: '☀️',
    description: 'El dios del sol',
    color: '#FF6B35'
  },
  pachamama: {
    id: 'pachamama',
    name: 'Pachamama',
    icon: '🌍',
    description: 'La madre tierra',
    color: '#4ECDC4'
  },
  amaru: {
    id: 'amaru',
    name: 'Amaru',
    icon: '🐍',
    description: 'La serpiente sagrada',
    color: '#95E1D3'
  }
}

onMounted(async () => {
  const characterId = route.query.character as string
  if (characterId && characters[characterId]) {
    currentCharacter.value = characters[characterId]
  } else {
    currentCharacter.value = characters.viracocha
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
})

onUnmounted(() => {
  editor?.dispose()
  gameEngine?.destroy()
})

const getInitialCode = (): string => {
  return `// Bienvenido a CodeShyri!
// Escribe código para controlar a ${currentCharacter.value?.name || 'tu personaje'}
// Las funciones moveForward(), turnRight() y turnLeft() ya están disponibles

// Intenta resolver el desafío:
// Mueve el personaje hacia adelante 3 veces y luego gira a la derecha
moveForward();
moveForward();
moveForward();
turnRight();
`
}

const runCode = async () => {
  if (!editor || !gameEngine || isRunning.value) return

  const code = editor.getValue()
  isRunning.value = true
  consoleLogs.value.push({ type: 'info', message: '⚡ Ejecutando código...', timestamp: getTimestamp() })

  try {
    // Ejecutar código en el backend
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, levelId: levelId.value })
    })

    const result = await response.json()
    
    if (result.success) {
      consoleLogs.value.push({ type: 'success', message: '✓ Código ejecutado correctamente', timestamp: getTimestamp() })
      gameEngine.executeCode(code)
      score.value += 10
    } else {
      consoleLogs.value.push({ type: 'error', message: `✗ Error: ${result.error}`, timestamp: getTimestamp() })
    }
  } catch (error) {
    consoleLogs.value.push({ type: 'error', message: `✗ Error de conexión: ${error}`, timestamp: getTimestamp() })
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
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%);
  color: white;
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
  background: linear-gradient(135deg, rgba(22, 33, 62, 0.95) 0%, rgba(15, 52, 96, 0.95) 100%);
  border-bottom: 3px solid rgba(255, 215, 0, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 10px;
  color: #FFD700;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.home-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
  border-color: rgba(255, 215, 0, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
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
  background: rgba(255, 215, 0, 0.1);
  border-radius: 15px;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.character-icon-small {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.character-info-header h2 {
  margin: 0;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFD700;
  text-transform: uppercase;
  letter-spacing: 2px;
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 80px;
  transition: all 0.3s;
}

.stat-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
}

.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #FFD700;
  margin-bottom: 0.2rem;
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
  background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-right: 3px solid rgba(255, 215, 0, 0.2);
}

.game-canvas-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 107, 53, 0.05) 0%, transparent 50%);
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
  background: linear-gradient(180deg, #1e1e1e 0%, #252526 100%);
  border-left: 3px solid rgba(255, 215, 0, 0.2);
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #252526 0%, #2d2d30 100%);
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #FFD700;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  font-family: 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.run-button {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.run-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
}

.run-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-button {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
}

.reset-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.6);
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
}

.game-console {
  height: 180px;
  background: linear-gradient(180deg, #1e1e1e 0%, #252526 100%);
  border-top: 3px solid rgba(255, 215, 0, 0.2);
  display: flex;
  flex-direction: column;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.5);
}

.console-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #252526 0%, #2d2d30 100%);
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #FFD700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.console-icon {
  font-size: 1.2rem;
}

.clear-console-btn {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.clear-console-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.4);
  color: #FFD700;
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

