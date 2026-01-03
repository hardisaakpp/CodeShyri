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
              <span class="stat-icon">🌽</span>
              <span class="stat-value">{{ totalMaize }}</span>
              <span class="stat-label">Maíz</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⛰️</span>
              <span class="stat-value">{{ levelId }}</span>
              <span class="stat-label">Nivel</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🌿</span>
              <span class="stat-value">100%</span>
              <span class="stat-label">Vitalidad</span>
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
              <span class="editor-icon">📜</span>
              <span>Quipu de Código</span>
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
          <span class="console-icon">🌾</span>
          <span>Mensajes de Pachamama</span>
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
const totalMaize = ref(0)
const consoleLogs = ref<Array<{ type: string; message: string; timestamp?: string }>>([])
const consoleOutput = ref<HTMLElement | null>(null)
const isRunning = ref(false)
const isExecuting = ref(false)

let editor: monaco.editor.IStandaloneCodeEditor | null = null
let gameEngine: GameEngine | null = null

const currentCharacter = ref<Character | null>(null)

const characters: Record<string, Character> = {
  'kitu': {
    id: 'kitu',
    name: 'Kitu',
    icon: '🏔️',
    description: 'Un valiente aventurero andino',
    color: '#8BC34A'
  }
}

const levelData = ref<any>(null)

onMounted(async () => {
  const characterId = route.query.character as string
  if (characterId && characters[characterId]) {
    currentCharacter.value = characters[characterId]
  } else {
    currentCharacter.value = characters['kitu']
  }

  // Cargar datos del nivel desde el backend ANTES de inicializar componentes
  await loadLevelData()

  await nextTick()
  
  // Inicializar Monaco Editor con código inicial del nivel
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
  gameEngine.onExecutionComplete = async () => {
    isExecuting.value = false
    consoleLogs.value.push({ 
      type: 'success', 
      message: '✅ Ejecución completada', 
      timestamp: getTimestamp() 
    })
    
    // Validar objetivos del nivel
    await validateLevelCompletion()
    
    if (consoleOutput.value) {
      consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight
    }
  }
  gameEngine.onReward = (_amount: number, total: number, _message: string) => {
    totalMaize.value = total
    // El mensaje ya se muestra en los logs
  }
  gameEngine.onGoalReached = () => {
    consoleLogs.value.push({ 
      type: 'success', 
      message: '🎯 ¡Premio final recolectado!', 
      timestamp: getTimestamp() 
    })
  }
  
  // Esperar un frame para que el motor de juego se inicialice
  await nextTick()
  await nextTick()
  
  // Configurar nivel cuando se cargan los datos
  if (levelData.value) {
    configureLevelFromData(levelData.value)
  }
})

const loadLevelData = async () => {
  try {
    const response = await fetch(`/api/levels/${levelId.value}`)
    if (response.ok) {
      levelData.value = await response.json()
      // Actualizar personaje si está definido en el nivel
      if (levelData.value.character && characters[levelData.value.character]) {
        currentCharacter.value = characters[levelData.value.character]
      }
      
      // Configurar nivel en el motor de juego
      if (gameEngine && levelData.value) {
        configureLevelFromData(levelData.value)
      }
    } else {
      console.error('Error cargando nivel:', response.statusText)
      consoleLogs.value.push({ 
        type: 'error', 
        message: 'Error al cargar los datos del nivel', 
        timestamp: getTimestamp() 
      })
    }
  } catch (error) {
    console.error('Error cargando nivel:', error)
    consoleLogs.value.push({ 
      type: 'error', 
      message: 'Error de conexión al cargar nivel', 
      timestamp: getTimestamp() 
    })
  }
}

const configureLevelFromData = (data: any) => {
  if (!gameEngine) return
  
  const config: {
    startPosition?: { gridX: number; gridY: number }
    goalPosition?: { gridX: number; gridY: number }
    path?: Array<{ x: number; y: number }>
    maizePositions?: Array<{ gridX: number; gridY: number }>
  } = {}
  
  if (data.startPosition) {
    config.startPosition = data.startPosition
  }
  
  if (data.goalPosition) {
    config.goalPosition = data.goalPosition
  }
  
  if (data.path && Array.isArray(data.path)) {
    config.path = data.path
  }
  
  // Si hay posiciones de maíz definidas en el backend, usarlas
  if (data.maizePositions && Array.isArray(data.maizePositions)) {
    config.maizePositions = data.maizePositions
  }
  
  gameEngine.setLevelConfig(config)
}

const validateLevelCompletion = async () => {
  if (!gameEngine || !levelData.value) return
  
  try {
    const playerState = gameEngine.getPlayerState()
    if (!playerState) return

    const response = await fetch(`/api/levels/${levelId.value}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        levelId: levelId.value,
        playerPosition: { x: playerState.x, y: playerState.y },
        playerAngle: playerState.angle,
        actionsExecuted: playerState.actionsExecuted || [],
        stepsMoved: playerState.stepsMoved || 0,
        rotationsMade: playerState.rotationsMade || 0
      })
    })

    if (response.ok) {
      const result = await response.json()
      
      if (result.completed) {
        consoleLogs.value.push({ 
          type: 'success', 
          message: `🎉 ${result.message}`, 
          timestamp: getTimestamp() 
        })
        score.value += 50
      } else {
        if (result.objectivesCompleted && result.objectivesCompleted.length > 0) {
          result.objectivesCompleted.forEach((obj: string) => {
            consoleLogs.value.push({ 
              type: 'success', 
              message: `✅ ${obj}`, 
              timestamp: getTimestamp() 
            })
          })
        }
        if (result.objectivesPending && result.objectivesPending.length > 0) {
          result.objectivesPending.forEach((obj: string) => {
            consoleLogs.value.push({ 
              type: 'warning', 
              message: `⚠️ ${obj}`, 
              timestamp: getTimestamp() 
            })
          })
        }
        consoleLogs.value.push({ 
          type: 'info', 
          message: result.message, 
          timestamp: getTimestamp() 
        })
      }
      
      if (consoleOutput.value) {
        consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight
      }
    }
  } catch (error) {
    console.error('Error validando nivel:', error)
  }
}

onUnmounted(() => {
  editor?.dispose()
  gameEngine?.destroy()
})

const getInitialCode = (): string => {
  // Si tenemos datos del nivel, usar el código inicial del nivel
  if (levelData.value && levelData.value.initialCode) {
    return levelData.value.initialCode
  }
  
  // Código por defecto según el nivel
  const defaultCodes: Record<string, string> = {
    '1': `// Nivel 1: Primeros Pasos con Kitu
// Mueve a Kitu 3 pasos hacia adelante y luego gira a la derecha

moveForward(3);
turnRight();
`,
    '2': `// Nivel 2: Explorando el Camino
// Combina movimiento y rotación para crear un camino

moveForward(2);
turnRight();
moveForward(2);
turnLeft();
moveForward(1);
`,
    '3': `// Nivel 3: Bucles con Kitu
// Usa un bucle for para repetir acciones

for (let i = 0; i < 4; i++) {
  moveForward(2);
  turnRight();
}
`
  }
  
  return defaultCodes[levelId.value] || `// Bienvenido a CodeShyri - El Reino Andino del Código!
// Controla a ${currentCharacter.value?.name || 'Kitu'} con estas funciones:

// === MOVIMIENTO BÁSICO ===
// moveForward(steps) - Avanza en la dirección actual (por defecto 1 paso)
// moveBackward(steps) - Retrocede

// === ROTACIÓN ===
// turnRight(degrees) - Gira a la derecha (por defecto 90°)
// turnLeft(degrees) - Gira a la izquierda (por defecto 90°)
// turn(degrees) - Gira grados específicos

// Ejemplo básico:
moveForward(2);
turnRight();
moveForward(1);
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
        // Las recompensas se manejan automáticamente por el sistema de recompensas
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
  totalMaize.value = 0 // Reiniciar maíz al reiniciar
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
    linear-gradient(135deg, #1a2e3d 0%, #2d1a3d 50%, #1a2e3d 100%),
    radial-gradient(circle at 20% 30%, rgba(139, 195, 74, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(76, 175, 80, 0.08) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a3a5a' fill-opacity='0.05'%3E%3Cpath d='M50 50 L60 40 L70 50 L60 60 Z M30 50 L40 40 L50 50 L40 60 Z M50 30 L60 20 L70 30 L60 40 Z M50 70 L60 60 L70 70 L60 80 Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  color: #c8b8e6;
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
    linear-gradient(135deg, rgba(45, 30, 75, 0.95) 0%, rgba(60, 25, 90, 0.95) 50%, rgba(35, 20, 65, 0.95) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(76, 175, 80, 0.1) 10px, rgba(76, 175, 80, 0.1) 20px),
    url("data:image/svg+xml,%3Csvg width='1800' height='500' viewBox='0 0 1800 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-opacity='0.20'%3E%3Cg transform='translate(55 75) rotate(15)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(245 45) rotate(-25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(135 130) rotate(45)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(385 95) rotate(-15)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(28 170) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(315 150) rotate(-40)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(485 130) rotate(20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(625 75) rotate(-30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(555 170) rotate(35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(745 140) rotate(-20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(865 100) rotate(50)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(815 190) rotate(-35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1025 155) rotate(25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1185 115) rotate(-45)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1125 210) rotate(40)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1345 175) rotate(-25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1505 135) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1445 230) rotate(-50)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1665 195) rotate(20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(95 255) rotate(-30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(285 233) rotate(45)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(475 265) rotate(-20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(655 250) rotate(35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(835 312) rotate(-40)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1015 295) rotate(25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1195 278) rotate(-35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1375 310) rotate(50)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1555 293) rotate(-25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1735 275) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(185 375) rotate(-45)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(375 358) rotate(20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(565 385) rotate(-30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(745 368) rotate(40)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(925 350) rotate(-35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1105 375) rotate(25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1285 358) rotate(-50)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1465 340) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1645 365) rotate(-20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(150 60) rotate(10)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(215 100) rotate(-15)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(405 65) rotate(25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(555 110) rotate(-10)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(695 145) rotate(20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(895 165) rotate(-30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1085 140) rotate(15)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1265 195) rotate(-20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1425 160) rotate(35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1585 220) rotate(-25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(140 245) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(335 285) rotate(-35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(515 270) rotate(18)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(705 310) rotate(-22)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(885 325) rotate(28)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1065 295) rotate(-18)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1245 330) rotate(32)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1405 305) rotate(-28)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1565 345) rotate(22)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  background-size: auto, auto, 1800px 500px;
  background-repeat: no-repeat, repeat, repeat-x;
  border-bottom: none;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.6),
    inset 0 -2px 10px rgba(139, 195, 74, 0.15);
  z-index: 10;
  position: relative;
}

.game-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='2000' height='300' viewBox='0 0 2000 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-opacity='0.16'%3E%3Cg transform='translate(45 38) rotate(-20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(185 18) rotate(35)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(325 65) rotate(-45)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(485 52) rotate(25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(625 85) rotate(-30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(765 28) rotate(40)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(905 72) rotate(-25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1045 48) rotate(50)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1185 95) rotate(-35)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1325 62) rotate(20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1465 88) rotate(-40)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1605 35) rotate(30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1745 75) rotate(-50)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1885 58) rotate(15)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(105 178) rotate(-25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(245 162) rotate(45)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(385 188) rotate(-20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(525 175) rotate(35)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(665 202) rotate(-30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(805 188) rotate(25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(945 195) rotate(-40)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1085 182) rotate(50)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1225 168) rotate(-35)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1365 195) rotate(20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1505 182) rotate(-45)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1645 168) rotate(30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1785 195) rotate(-25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1925 182) rotate(40)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(115 28) rotate(12)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(265 50) rotate(-18)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(405 42) rotate(28)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(555 75) rotate(-12)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(695 56) rotate(22)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(835 80) rotate(-28)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(975 60) rotate(15)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1115 88) rotate(-22)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1255 71) rotate(30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1395 82) rotate(-16)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1535 66) rotate(24)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1675 92) rotate(-26)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1815 74) rotate(18)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(175 148) rotate(-14)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(315 170) rotate(26)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(455 155) rotate(-20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(595 180) rotate(32)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(735 165) rotate(-24)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(875 175) rotate(20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1015 172) rotate(-30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1155 178) rotate(16)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1295 160) rotate(-22)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1435 185) rotate(28)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1575 173) rotate(-18)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1715 180) rotate(24)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1855 167) rotate(-28)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  background-size: 2000px 300px;
  background-repeat: repeat-x;
  background-position: 0 0;
  pointer-events: none;
  opacity: 0.5;
}

.game-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='30' height='4' viewBox='0 0 30 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='2' opacity='0.8'%3E%3Cpath d='M0 2 Q7 0 15 2 Q23 4 30 2'/%3E%3Cpath d='M15 0 Q18 2 15 4 Q12 2 15 0'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 30px 4px;
  background-repeat: repeat-x;
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
    linear-gradient(135deg, rgba(29, 26, 61, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(76, 175, 80, 0.1) 5px, rgba(76, 175, 80, 0.1) 10px);
  border: none;
  border-radius: 8px;
  color: #c8b8e6;
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
    inset 0 0 10px rgba(139, 195, 74, 0.15);
  position: relative;
}

.home-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 3px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='25' height='25' viewBox='0 0 25 25' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='1.8' opacity='0.75'%3E%3Cpath d='M12.5 1 Q15 7 12.5 11 Q10 7 12.5 1'/%3E%3Cpath d='M1 12.5 Q7 15 11 12.5 Q7 10 1 12.5'/%3E%3Cpath d='M12.5 11 Q15 17 12.5 24 Q10 17 12.5 11'/%3E%3Cpath d='M24 12.5 Q18 15 14 12.5 Q18 10 24 12.5'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 25px 25px;
  background-repeat: repeat;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.home-button:hover {
  background: 
    linear-gradient(135deg, rgba(139, 195, 74, 0.25) 0%, rgba(76, 175, 80, 0.2) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(76, 175, 80, 0.1) 5px, rgba(76, 175, 80, 0.1) 10px);
  border-color: rgba(139, 195, 74, 0.7);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(139, 195, 74, 0.5),
    inset 0 0 15px rgba(139, 195, 74, 0.25);
}

.home-button:active {
  transform: translateY(0);
}

.home-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 0 5px rgba(139, 195, 74, 0.6));
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
    linear-gradient(135deg, rgba(29, 26, 61, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(76, 175, 80, 0.1) 5px, rgba(76, 175, 80, 0.1) 10px);
  border-radius: 8px;
  border: none;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 0 15px rgba(139, 195, 74, 0.15);
  position: relative;
}

.character-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 3px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='25' height='25' viewBox='0 0 25 25' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='1.8' opacity='0.75'%3E%3Cpath d='M12.5 1 Q15 7 12.5 11 Q10 7 12.5 1'/%3E%3Cpath d='M1 12.5 Q7 15 11 12.5 Q7 10 1 12.5'/%3E%3Cpath d='M12.5 11 Q15 17 12.5 24 Q10 17 12.5 11'/%3E%3Cpath d='M24 12.5 Q18 15 14 12.5 Q18 10 24 12.5'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 25px 25px;
  background-repeat: repeat;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.character-icon-small {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 10px rgba(139, 195, 74, 0.7)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
}

.character-info-header h2 {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #8bc34a;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 
    0 0 10px rgba(139, 195, 74, 0.6),
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
    linear-gradient(135deg, rgba(29, 26, 61, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(76, 175, 80, 0.1) 5px, rgba(76, 175, 80, 0.1) 10px);
  border-radius: 8px;
  border: none;
  min-width: 80px;
  transition: all 0.3s;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 0 10px rgba(139, 195, 74, 0.1);
  position: relative;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 2px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='1.5' opacity='0.7'%3E%3Cpath d='M10 1 Q12 6 10 9 Q8 6 10 1'/%3E%3Cpath d='M1 10 Q6 12 9 10 Q6 8 1 10'/%3E%3Cpath d='M10 9 Q12 15 10 19 Q8 15 10 9'/%3E%3Cpath d='M19 10 Q14 12 11 10 Q14 8 19 10'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 20px 20px;
  background-repeat: repeat;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.stat-item:hover {
  background: 
    linear-gradient(135deg, rgba(139, 195, 74, 0.2) 0%, rgba(76, 175, 80, 0.2) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(76, 175, 80, 0.1) 5px, rgba(76, 175, 80, 0.1) 10px);
  border-color: rgba(139, 195, 74, 0.6);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(139, 195, 74, 0.4),
    inset 0 0 15px rgba(139, 195, 74, 0.15);
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
  color: #8bc34a;
  margin-bottom: 0.2rem;
  text-shadow: 
    0 0 10px rgba(139, 195, 74, 0.6),
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
    linear-gradient(135deg, #1a2e3d 0%, #2d1a3d 50%, #1a2e3d 100%),
    radial-gradient(circle at 20% 30%, rgba(139, 195, 74, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(76, 175, 80, 0.08) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a3a5a' fill-opacity='0.05'%3E%3Cpath d='M50 50 L60 40 L70 50 L60 60 Z M30 50 L40 40 L50 50 L40 60 Z M50 30 L60 20 L70 30 L60 40 Z M50 70 L60 60 L70 70 L60 80 Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-right: none;
}

.game-canvas-container::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 4px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='4' height='30' viewBox='0 0 4 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='2' opacity='0.8'%3E%3Cpath d='M2 0 Q0 7 2 15 Q4 23 2 30'/%3E%3Cpath d='M2 15 Q1 18 2 20 Q3 18 2 15'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 4px 30px;
  background-repeat: repeat-y;
  z-index: 1;
}

.game-canvas-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(139, 195, 74, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(76, 175, 80, 0.08) 0%, transparent 50%);
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
    linear-gradient(180deg, #1a2e3d 0%, #0f1a24 100%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(76, 175, 80, 0.1) 10px, rgba(76, 175, 80, 0.1) 20px);
  border-left: none;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.8);
  position: relative;
}

.code-editor-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='4' height='30' viewBox='0 0 4 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='2' opacity='0.8'%3E%3Cpath d='M2 0 Q0 7 2 15 Q4 23 2 30'/%3E%3Cpath d='M2 15 Q1 18 2 20 Q3 18 2 15'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 4px 30px;
  background-repeat: repeat-y;
  z-index: 1;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: 
    linear-gradient(135deg, rgba(29, 26, 61, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(76, 175, 80, 0.1) 5px, rgba(76, 175, 80, 0.1) 10px);
  border-bottom: none;
  position: relative;
}

.editor-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='30' height='3' viewBox='0 0 30 3' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='2' opacity='0.75'%3E%3Cpath d='M0 1.5 Q7 0 15 1.5 Q23 3 30 1.5'/%3E%3Cpath d='M15 0 Q18 1.5 15 3 Q12 1.5 15 0'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 30px 3px;
  background-repeat: repeat-x;
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  font-size: 1rem;
  color: #8bc34a;
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
    linear-gradient(135deg, #5a1a7a 0%, #6a2a8f 50%, #7b3c9f 100%),
    repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(76, 175, 80, 0.1) 3px, rgba(76, 175, 80, 0.1) 6px);
  color: #fff;
  border: none;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.6),
    inset 0 0 10px rgba(139, 195, 74, 0.15);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  position: relative;
}

.run-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 2px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23fff' stroke-width='1.5' opacity='0.6'%3E%3Cpath d='M10 1 Q12 6 10 9 Q8 6 10 1'/%3E%3Cpath d='M1 10 Q6 12 9 10 Q6 8 1 10'/%3E%3Cpath d='M10 9 Q12 15 10 19 Q8 15 10 9'/%3E%3Cpath d='M19 10 Q14 12 11 10 Q14 8 19 10'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 20px 20px;
  background-repeat: repeat;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.run-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(139, 195, 74, 0.6),
    inset 0 0 15px rgba(139, 195, 74, 0.25);
  border-color: rgba(139, 195, 74, 0.7);
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
    linear-gradient(135deg, #5d4037 0%, #6d4c41 50%, #8d6e63 100%),
    repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(76, 175, 80, 0.1) 3px, rgba(76, 175, 80, 0.1) 6px);
  color: #fff;
  border: none;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.6),
    inset 0 0 10px rgba(139, 195, 74, 0.15);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  position: relative;
}

.reset-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 2px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23fff' stroke-width='1.5' opacity='0.6'%3E%3Cpath d='M10 1 Q12 6 10 9 Q8 6 10 1'/%3E%3Cpath d='M1 10 Q6 12 9 10 Q6 8 1 10'/%3E%3Cpath d='M10 9 Q12 15 10 19 Q8 15 10 9'/%3E%3Cpath d='M19 10 Q14 12 11 10 Q14 8 19 10'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 20px 20px;
  background-repeat: repeat;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.reset-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(93, 64, 55, 0.6),
    inset 0 0 15px rgba(139, 195, 74, 0.25);
  border-color: rgba(139, 195, 74, 0.7);
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
    linear-gradient(180deg, #1a2e3d 0%, #0f1a24 100%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(76, 175, 80, 0.1) 10px, rgba(76, 175, 80, 0.1) 20px);
  border-top: none;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.8);
  position: relative;
}

.game-console::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='30' height='4' viewBox='0 0 30 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='2' opacity='0.8'%3E%3Cpath d='M0 2 Q7 0 15 2 Q23 4 30 2'/%3E%3Cpath d='M15 0 Q18 2 15 4 Q12 2 15 0'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 30px 4px;
  background-repeat: repeat-x;
  z-index: 1;
}

.console-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: 
    linear-gradient(135deg, rgba(45, 30, 75, 0.95) 0%, rgba(60, 25, 90, 0.95) 50%, rgba(35, 20, 65, 0.95) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(76, 175, 80, 0.1) 5px, rgba(76, 175, 80, 0.1) 10px),
    url("data:image/svg+xml,%3Csvg width='1800' height='500' viewBox='0 0 1800 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-opacity='0.20'%3E%3Cg transform='translate(55 75) rotate(15)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(245 45) rotate(-25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(135 130) rotate(45)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(385 95) rotate(-15)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(28 170) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(315 150) rotate(-40)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(485 130) rotate(20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(625 75) rotate(-30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(555 170) rotate(35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(745 140) rotate(-20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(865 100) rotate(50)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(815 190) rotate(-35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1025 155) rotate(25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1185 115) rotate(-45)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1125 210) rotate(40)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1345 175) rotate(-25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1505 135) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1445 230) rotate(-50)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1665 195) rotate(20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(95 255) rotate(-30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(285 233) rotate(45)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(475 265) rotate(-20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(655 250) rotate(35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(835 312) rotate(-40)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1015 295) rotate(25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1195 278) rotate(-35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1375 310) rotate(50)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1555 293) rotate(-25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1735 275) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(185 375) rotate(-45)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(375 358) rotate(20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(565 385) rotate(-30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(745 368) rotate(40)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(925 350) rotate(-35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1105 375) rotate(25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1285 358) rotate(-50)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1465 340) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1645 365) rotate(-20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(150 60) rotate(10)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(215 100) rotate(-15)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(405 65) rotate(25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(555 110) rotate(-10)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(695 145) rotate(20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(895 165) rotate(-30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1085 140) rotate(15)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1265 195) rotate(-20)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1425 160) rotate(35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1585 220) rotate(-25)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(140 245) rotate(30)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(335 285) rotate(-35)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(515 270) rotate(18)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(705 310) rotate(-22)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(885 325) rotate(28)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1065 295) rotate(-18)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1245 330) rotate(32)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1405 305) rotate(-28)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1565 345) rotate(22)'%3E%3Cpath d='M0 0 Q12 -25 30 -5 Q48 15 38 40 Q28 65 10 45 Q-8 25 -12 10 Q-16 -5 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  background-size: auto, auto, 1800px 500px;
  background-repeat: no-repeat, repeat, repeat-x;
  border-bottom: none;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #8bc34a;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  position: relative;
}

.console-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='2000' height='300' viewBox='0 0 2000 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-opacity='0.16'%3E%3Cg transform='translate(45 38) rotate(-20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(185 18) rotate(35)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(325 65) rotate(-45)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(485 52) rotate(25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(625 85) rotate(-30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(765 28) rotate(40)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(905 72) rotate(-25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1045 48) rotate(50)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1185 95) rotate(-35)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1325 62) rotate(20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1465 88) rotate(-40)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1605 35) rotate(30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1745 75) rotate(-50)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1885 58) rotate(15)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(105 178) rotate(-25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(245 162) rotate(45)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(385 188) rotate(-20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(525 175) rotate(35)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(665 202) rotate(-30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(805 188) rotate(25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(945 195) rotate(-40)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1085 182) rotate(50)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1225 168) rotate(-35)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1365 195) rotate(20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1505 182) rotate(-45)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1645 168) rotate(30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1785 195) rotate(-25)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1925 182) rotate(40)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(115 28) rotate(12)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(265 50) rotate(-18)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(405 42) rotate(28)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(555 75) rotate(-12)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(695 56) rotate(22)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(835 80) rotate(-28)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(975 60) rotate(15)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1115 88) rotate(-22)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1255 71) rotate(30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1395 82) rotate(-16)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1535 66) rotate(24)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1675 92) rotate(-26)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1815 74) rotate(18)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(175 148) rotate(-14)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(315 170) rotate(26)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(455 155) rotate(-20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(595 180) rotate(32)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(735 165) rotate(-24)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(875 175) rotate(20)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1015 172) rotate(-30)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1155 178) rotate(16)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1295 160) rotate(-22)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1435 185) rotate(28)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3Cg transform='translate(1575 173) rotate(-18)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%23668938'/%3E%3C/g%3E%3Cg transform='translate(1715 180) rotate(24)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%234caf50'/%3E%3C/g%3E%3Cg transform='translate(1855 167) rotate(-28)'%3E%3Cpath d='M0 0 Q10 -20 25 -4 Q40 12 32 32 Q24 52 9 36 Q-6 20 -10 8 Q-14 -4 0 0 Z' fill='%238bc34a'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  background-size: 2000px 300px;
  background-repeat: repeat-x;
  background-position: 0 0;
  pointer-events: none;
  opacity: 0.5;
}

.console-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='30' height='3' viewBox='0 0 30 3' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='2' opacity='0.75'%3E%3Cpath d='M0 1.5 Q7 0 15 1.5 Q23 3 30 1.5'/%3E%3Cpath d='M15 0 Q18 1.5 15 3 Q12 1.5 15 0'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 30px 3px;
  background-repeat: repeat-x;
}

.console-icon {
  font-size: 1.2rem;
}

.clear-console-btn {
  margin-left: auto;
  background: 
    linear-gradient(135deg, rgba(29, 26, 61, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(76, 175, 80, 0.1) 3px, rgba(76, 175, 80, 0.1) 6px);
  border: none;
  color: rgba(200, 184, 230, 0.9);
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: 'Cinzel', serif;
  transition: all 0.3s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  position: relative;
}

.clear-console-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 2px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='1.5' opacity='0.7'%3E%3Cpath d='M10 1 Q12 6 10 9 Q8 6 10 1'/%3E%3Cpath d='M1 10 Q6 12 9 10 Q6 8 1 10'/%3E%3Cpath d='M10 9 Q12 15 10 19 Q8 15 10 9'/%3E%3Cpath d='M19 10 Q14 12 11 10 Q14 8 19 10'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 20px 20px;
  background-repeat: repeat;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.clear-console-btn:hover {
  background: 
    linear-gradient(135deg, rgba(139, 195, 74, 0.25) 0%, rgba(76, 175, 80, 0.2) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(76, 175, 80, 0.1) 3px, rgba(76, 175, 80, 0.1) 6px);
  border-color: rgba(139, 195, 74, 0.6);
  color: #c8b8e6;
  box-shadow: 0 4px 8px rgba(139, 195, 74, 0.4);
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
  background: rgba(139, 195, 74, 0.4);
  border-radius: 4px;
}

.console-output::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 195, 74, 0.6);
}
</style>

