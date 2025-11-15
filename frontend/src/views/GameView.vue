<template>
  <div class="game-view">
    <div class="game-container">
      <div class="game-header">
        <h2>Nivel {{ levelId }} - {{ currentCharacter?.name || 'Aventura' }}</h2>
        <div class="game-stats">
          <span>💎 Puntos: {{ score }}</span>
          <span>⭐ Nivel: {{ levelId }}</span>
        </div>
      </div>

      <div class="game-layout">
        <div class="game-canvas-container">
          <div id="game-canvas"></div>
        </div>

        <div class="code-editor-container">
          <div class="editor-header">
            <span>Editor de Código</span>
            <div class="editor-actions">
              <button @click="runCode" class="run-button">▶️ Ejecutar</button>
              <button @click="resetCode" class="reset-button">🔄 Reiniciar</button>
            </div>
          </div>
          <div id="monaco-editor" class="monaco-editor"></div>
        </div>
      </div>

      <div class="game-console">
        <div class="console-header">Consola</div>
        <div class="console-output" ref="consoleOutput">
          <div v-for="(log, index) in consoleLogs" :key="index" :class="log.type">
            {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as monaco from 'monaco-editor'
import { GameEngine } from '@/game/GameEngine'
import type { Character } from '@/types/character'

const route = useRoute()
const levelId = ref(route.params.levelId as string || '1')
const score = ref(0)
const consoleLogs = ref<Array<{ type: string; message: string }>>([])
const consoleOutput = ref<HTMLElement | null>(null)

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
    consoleLogs.value.push({ type, message })
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

function moveForward() {
  // Mueve el personaje hacia adelante
  console.log("Avanzando...");
}

function turnRight() {
  // Gira a la derecha
  console.log("Girando a la derecha...");
}

function turnLeft() {
  // Gira a la izquierda
  console.log("Girando a la izquierda...");
}

// Intenta resolver el desafío:
moveForward();
moveForward();
turnRight();
moveForward();
`
}

const runCode = async () => {
  if (!editor || !gameEngine) return

  const code = editor.getValue()
  consoleLogs.value = []
  consoleLogs.value.push({ type: 'info', message: 'Ejecutando código...' })

  try {
    // Ejecutar código en el backend
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, levelId: levelId.value })
    })

    const result = await response.json()
    
    if (result.success) {
      consoleLogs.value.push({ type: 'success', message: '✓ Código ejecutado correctamente' })
      gameEngine.executeCode(code)
    } else {
      consoleLogs.value.push({ type: 'error', message: `✗ Error: ${result.error}` })
    }
  } catch (error) {
    consoleLogs.value.push({ type: 'error', message: `✗ Error de conexión: ${error}` })
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
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100vh;
  background: #1a1a2e;
  color: white;
  overflow: hidden;
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
  background: #16213e;
  border-bottom: 2px solid #0f3460;
}

.game-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.game-stats {
  display: flex;
  gap: 2rem;
  font-size: 1.1rem;
}

.game-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.game-canvas-container {
  flex: 1;
  background: #0f3460;
  display: flex;
  align-items: center;
  justify-content: center;
}

#game-canvas {
  width: 100%;
  height: 100%;
}

.code-editor-container {
  width: 500px;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  border-left: 2px solid #0f3460;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.run-button,
.reset-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.run-button {
  background: #4caf50;
  color: white;
}

.reset-button {
  background: #ff9800;
  color: white;
}

.run-button:hover,
.reset-button:hover {
  opacity: 0.8;
}

.monaco-editor {
  flex: 1;
  min-height: 0;
}

.game-console {
  height: 150px;
  background: #1e1e1e;
  border-top: 2px solid #0f3460;
  display: flex;
  flex-direction: column;
}

.console-header {
  padding: 0.5rem 1rem;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
  font-weight: bold;
}

.console-output {
  flex: 1;
  padding: 0.5rem 1rem;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.console-output .info {
  color: #d4d4d4;
}

.console-output .success {
  color: #4caf50;
}

.console-output .error {
  color: #f44336;
}
</style>

