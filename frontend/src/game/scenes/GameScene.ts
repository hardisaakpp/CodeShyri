import Phaser from 'phaser'
import type { Character } from '@/types/character'
import { BackgroundRenderer } from '../background/BackgroundRenderer'
import { PlayerManager } from '../player/PlayerManager'
import { CommandQueue } from '../commands/CommandQueue'
import { MovementCommands } from '../commands/MovementCommands'
import { RotationCommands } from '../commands/RotationCommands'
import { ActionCommands } from '../commands/ActionCommands'
import { GridRenderer } from '../background/renderers/GridRenderer'
import { RewardSystem } from '../services/RewardSystem'
import { GoalRenderer } from '../background/renderers/GoalRenderer'
import { GroundRenderer } from '../background/renderers/GroundRenderer'
import { MaizeItemRenderer } from '../background/renderers/MaizeItemRenderer'

export class GameScene extends Phaser.Scene {
  private width!: number
  private height!: number
  private character!: Character
  private onLog?: (message: string, type?: string) => void
  private onExecutionComplete?: () => void
  private onReward?: (amount: number, total: number, message: string) => void
  private onGoalReached?: () => void
  
  private commandQueue!: CommandQueue
  private movementCommands!: MovementCommands
  private rotationCommands!: RotationCommands
  private actionCommands!: ActionCommands
  private playerManager!: PlayerManager
  private backgroundRenderer!: BackgroundRenderer
  private gridRenderer!: GridRenderer
  private rewardSystem!: RewardSystem
  private goalRenderer?: GoalRenderer
  private groundRenderer?: GroundRenderer
  private maizeItemRenderer?: MaizeItemRenderer
  
  // Rastreo de acciones para validación
  private actionsExecuted: Set<string> = new Set()
  private stepsMoved: number = 0
  private rotationsMade: number = 0
  
  // Posición actual en el grid
  private currentGridX: number = 1 // Empezar en celda (1, 2)
  private currentGridY: number = 2
  
  // Configuración del nivel (se establece desde fuera)
  private levelConfig?: {
    startPosition?: { gridX: number; gridY: number }
    goalPosition?: { gridX: number; gridY: number }
    path?: Array<{ x: number; y: number }>
    maizePositions?: Array<{ gridX: number; gridY: number }>
  }
  

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { 
    character: Character
    width: number
    height: number
    onLog?: (message: string, type?: string) => void
    onExecutionComplete?: () => void
    onReward?: (amount: number, total: number, message: string) => void
    onGoalReached?: () => void
  }) {
    this.character = data.character
    this.width = data.width
    this.height = data.height
    this.onLog = data.onLog
    this.onExecutionComplete = data.onExecutionComplete
    this.onReward = data.onReward
    this.onGoalReached = data.onGoalReached
  }

  preload() {
    this.load.image('character', '/assets/characters/kitu.png')
  }

  create() {
    // Renderizar fondo
    this.backgroundRenderer = new BackgroundRenderer(this, this.width, this.height)
    const backgroundData = this.backgroundRenderer.render()

    // Obtener grid renderer y ground renderer
    this.gridRenderer = this.backgroundRenderer.getGridRenderer()
    this.groundRenderer = this.backgroundRenderer.getGroundRenderer()

    // Configurar sendero si tenemos configuración del nivel
    // Nota: El sendero se configura ANTES de renderizar, pero como ya se renderizó,
    // necesitamos re-renderizar o configurarlo antes. Por ahora lo configuramos para futuras referencias.
    if (this.levelConfig?.path && this.groundRenderer) {
      this.groundRenderer.setPathBlocks(this.levelConfig.path)
    }

    // Posicionar personaje en el grid (usar configuración del nivel o defaults)
    if (this.levelConfig?.startPosition) {
      this.currentGridX = this.levelConfig.startPosition.gridX
      this.currentGridY = this.levelConfig.startPosition.gridY
    }
    const initialGridPosition = this.gridRenderer.gridToPixel(this.currentGridX, this.currentGridY)
    this.playerManager = new PlayerManager(this, 'character', initialGridPosition.pixelX, initialGridPosition.pixelY)
    const player = this.playerManager.create()

    // Inicializar sistema de recompensas PRIMERO (antes de MovementCommands)
    this.rewardSystem = new RewardSystem((amount, type, message) => {
      const total = this.rewardSystem.getTotalMaize()
      if (this.onReward) {
        this.onReward(amount, total, message)
      }
      this.log(message, type === 'path' ? 'success' : 'info')
    }, this) // Pasar la escena para efectos visuales

    // Renderizar premio final si tenemos configuración
    if (this.levelConfig?.goalPosition) {
      this.goalRenderer = new GoalRenderer(
        this,
        this.gridRenderer,
        this.levelConfig.goalPosition.gridX,
        this.levelConfig.goalPosition.gridY,
        this.height * 0.33
      )
      this.goalRenderer.render()
    }

    // Crear renderer de items de maíz
    this.maizeItemRenderer = new MaizeItemRenderer(
      this,
      this.gridRenderer,
      this.height * 0.33
    )

    // Colocar maíz en algunas celdas si hay configuración
    if (this.levelConfig?.maizePositions && this.levelConfig.maizePositions.length > 0) {
      this.maizeItemRenderer.placeMaizeItems(this.levelConfig.maizePositions)
    } else if (this.levelConfig?.path && this.levelConfig.path.length > 2) {
      // Si no hay configuración, colocar maíz aleatoriamente en algunos bloques del sendero
      const pathBlocks = this.levelConfig.path
      // Seleccionar algunos bloques aleatorios del sendero (máximo 3-4)
      const numMaizeItems = Math.min(3, Math.floor(pathBlocks.length / 2))
      const selectedPositions: Array<{ gridX: number; gridY: number }> = []
      const shuffled = [...pathBlocks].sort(() => Math.random() - 0.5)
      
      // No colocar en la primera ni en la última posición (start y goal)
      const availableBlocks = shuffled.slice(1, -1)
      
      for (let i = 0; i < Math.min(numMaizeItems, availableBlocks.length); i++) {
        selectedPositions.push({
          gridX: availableBlocks[i].x,
          gridY: availableBlocks[i].y
        })
      }
      
      if (selectedPositions.length > 0) {
        this.maizeItemRenderer.placeMaizeItems(selectedPositions)
      } else {
        // Fallback: colocar al menos uno
        this.placeTestMaize()
      }
    } else {
      // Por defecto, colocar UN maíz en una posición fija para probar
      this.placeTestMaize()
    }

    // Resaltar celda inicial
    this.updatePlayerGridHighlight()

    // Inicializar sistema de comandos con grid
    this.commandQueue = new CommandQueue(this, () => {
      // Cuando la cola de comandos termine, notificar
      if (this.onExecutionComplete) {
        this.onExecutionComplete()
      }
    })
    this.movementCommands = new MovementCommands(
      this.commandQueue, 
      player, 
      this.log.bind(this),
      this.gridRenderer,
      (gridX: number, gridY: number) => {
        this.currentGridX = gridX
        this.currentGridY = gridY
        this.updatePlayerGridHighlight()
        
        // Verificar recompensas y objetivo
        this.checkRewardsAndGoal()
      },
      this.groundRenderer,
      this.rewardSystem,
      (gridX: number, gridY: number) => {
        // Callback para verificar si hay maíz visible en una celda
        return this.maizeItemRenderer ? this.maizeItemRenderer.hasMaizeAt(gridX, gridY) : false
      },
      (gridX: number, gridY: number) => {
        // Callback para recolectar maíz visible
        if (this.maizeItemRenderer) {
          return this.maizeItemRenderer.collectMaizeAt(gridX, gridY)
        }
        return false
      }
    )
    this.rotationCommands = new RotationCommands(this.commandQueue, player, this.log.bind(this))
    this.actionCommands = new ActionCommands(this.commandQueue, player, this.log.bind(this))

    // Guardar referencias en la escena
    ;(this as any).player = player
    ;(this as any).backgroundGraphics = backgroundData.backgroundGraphics
    ;(this as any).commandQueue = this.commandQueue
    ;(this as any).movementCommands = this.movementCommands
    ;(this as any).rotationCommands = this.rotationCommands
    ;(this as any).actionCommands = this.actionCommands

    this.log(`✨ ¡Bienvenido, ${this.character.name}!`)
    this.log(`🎮 Usa moveForward(), turnRight() y turnLeft() para controlar tu personaje`)
    this.log(`📍 Estás en la celda (${this.currentGridX}, ${this.currentGridY})`)
  }

  /**
   * Ejecuta código del usuario
   */
  public executeCode(code: string): void {
    if (!code || code.trim().length === 0) {
      this.log('⚠️ No hay código para ejecutar', 'warning')
      return
    }

    this.commandQueue.clear()
    // Resetear rastreo de acciones
    this.actionsExecuted.clear()
    this.stepsMoved = 0
    this.rotationsMade = 0

    const player = this.playerManager.getPlayer()
    if (!player) {
      this.log('❌ Error: El personaje no está disponible', 'error')
      return
    }

    try {
      // Crear funciones disponibles para el usuario con rastreo
      const moveForward = (steps: number = 1) => {
        this.actionsExecuted.add('moveForward')
        this.stepsMoved += steps
        return this.movementCommands.moveForward(steps)
      }
      const moveBackward = (steps: number = 1) => {
        this.actionsExecuted.add('moveBackward')
        this.stepsMoved += steps
        return this.movementCommands.moveBackward(steps)
      }
      const moveUp = (steps: number = 1) => {
        this.actionsExecuted.add('moveUp')
        this.stepsMoved += steps
        return this.movementCommands.moveUp(steps)
      }
      const moveDown = (steps: number = 1) => {
        this.actionsExecuted.add('moveDown')
        this.stepsMoved += steps
        return this.movementCommands.moveDown(steps)
      }
      const moveLeft = (steps: number = 1) => {
        this.actionsExecuted.add('moveLeft')
        this.stepsMoved += steps
        return this.movementCommands.moveLeft(steps)
      }
      const moveRight = (steps: number = 1) => {
        this.actionsExecuted.add('moveRight')
        this.stepsMoved += steps
        return this.movementCommands.moveRight(steps)
      }
      const moveTo = (x: number, y: number) => {
        this.actionsExecuted.add('moveTo')
        return this.movementCommands.moveTo(x, y)
      }
      const moveDistance = (distance: number) => {
        this.actionsExecuted.add('moveDistance')
        this.stepsMoved += Math.floor(distance / 50) // Aproximación
        return this.movementCommands.moveDistance(distance)
      }
      const sprint = (steps: number = 1) => {
        this.actionsExecuted.add('sprint')
        this.stepsMoved += steps
        return this.movementCommands.sprint(steps)
      }

      const turnRight = (degrees: number = 90) => {
        this.actionsExecuted.add('turnRight')
        this.rotationsMade++
        if (this.rewardSystem) {
          this.rewardSystem.rewardForCommand('turnRight')
        }
        return this.rotationCommands.turnRight(degrees)
      }
      const turnLeft = (degrees: number = 90) => {
        this.actionsExecuted.add('turnLeft')
        this.rotationsMade++
        if (this.rewardSystem) {
          this.rewardSystem.rewardForCommand('turnLeft')
        }
        return this.rotationCommands.turnLeft(degrees)
      }
      const turn = (degrees: number) => {
        this.actionsExecuted.add('turn')
        this.rotationsMade++
        if (this.rewardSystem) {
          this.rewardSystem.rewardForCommand('turn')
        }
        return this.rotationCommands.turn(degrees)
      }
      const faceDirection = (direction: string) => {
        this.actionsExecuted.add('faceDirection')
        this.rotationsMade++
        if (this.rewardSystem) {
          this.rewardSystem.rewardForCommand('faceDirection')
        }
        return this.rotationCommands.faceDirection(direction)
      }

      const jump = () => {
        this.actionsExecuted.add('jump')
        return this.actionCommands.jump()
      }
      const attack = () => {
        this.actionsExecuted.add('attack')
        return this.actionCommands.attack()
      }
      const wait = (milliseconds: number) => {
        this.actionsExecuted.add('wait')
        return this.actionCommands.wait(milliseconds)
      }
      const teleport = (x: number, y: number) => {
        this.actionsExecuted.add('teleport')
        return this.actionCommands.teleport(x, y)
      }
      const spin = () => {
        this.actionsExecuted.add('spin')
        this.rotationsMade++
        return this.actionCommands.spin()
      }

      const consoleObj = {
        log: (msg: string) => this.log(msg, 'info')
      }

      // Lista de todas las funciones disponibles
      const functionNames = [
        'moveForward', 'moveBackward', 'moveUp', 'moveDown', 'moveLeft', 'moveRight',
        'turnRight', 'turnLeft', 'turn', 'faceDirection',
        'moveTo', 'moveDistance', 'jump', 'attack', 'sprint', 'wait', 'teleport', 'spin'
      ]

      // Sanitizar código
      let sanitizedCode = code
      functionNames.forEach(funcName => {
        sanitizedCode = sanitizedCode.replace(
          new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`, 'gs'),
          `// ${funcName} ya está definida`
        )
        sanitizedCode = sanitizedCode.replace(
          new RegExp(`const\\s+${funcName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{[^}]*\\}`, 'gs'),
          `// ${funcName} ya está definida`
        )
        sanitizedCode = sanitizedCode.replace(
          new RegExp(`(var|let)\\s+${funcName}\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`, 'gs'),
          `// ${funcName} ya está definida`
        )
      })

      // Ejecutar código
      const userCode = new Function(
        ...functionNames,
        'console',
        sanitizedCode
      )

      userCode(
        moveForward, moveBackward, moveUp, moveDown, moveLeft, moveRight,
        turnRight, turnLeft, turn, faceDirection,
        moveTo, moveDistance, jump, attack, sprint, wait, teleport, spin,
        consoleObj
      )

      // El mensaje de éxito se mostrará cuando termine la ejecución de comandos
      // a través del callback onExecutionComplete
    } catch (execError) {
      const errorMessage = execError instanceof Error 
        ? execError.message 
        : String(execError)
      
      // Mensajes de error más amigables
      let friendlyMessage = 'Error de ejecución'
      
      if (errorMessage.includes('is not defined')) {
        friendlyMessage = `Variable o función no definida: ${errorMessage.split('is not defined')[0].trim()}`
      } else if (errorMessage.includes('Unexpected token')) {
        friendlyMessage = `Error de sintaxis: ${errorMessage}`
      } else if (errorMessage.includes('Cannot read')) {
        friendlyMessage = `Error al acceder a una propiedad: ${errorMessage}`
      } else {
        friendlyMessage = errorMessage
      }
      
      this.log(`❌ ${friendlyMessage}`, 'error')
      
      // No relanzar el error para evitar que rompa la aplicación
      // El usuario ya recibió el feedback a través del log
    }
  }

  /**
   * Reinicia el juego
   */
  public reset() {
    // Limpiar cola de comandos y cancelar todas las animaciones
    this.commandQueue.clear()
    
    // Cancelar todos los tweens del personaje
    const player = this.playerManager.getPlayer()
    if (player) {
      this.tweens.killTweensOf(player)
    }
    
    // Resetear posición del grid
    if (this.levelConfig?.startPosition) {
      this.currentGridX = this.levelConfig.startPosition.gridX
      this.currentGridY = this.levelConfig.startPosition.gridY
    } else {
      this.currentGridX = 1
      this.currentGridY = 2
    }
    
    // Reiniciar sistema de recompensas
    if (this.rewardSystem) {
      this.rewardSystem.reset()
    }
    
    // Recrear premio si fue recolectado o si no existe
    if (this.levelConfig?.goalPosition) {
      // Cancelar todas las animaciones del premio antes de restaurarlo
      if (this.goalRenderer) {
        // Destruir el premio actual si existe
        this.goalRenderer.destroy()
      }
      
      // Siempre recrear el premio desde cero
      this.goalRenderer = new GoalRenderer(
        this,
        this.gridRenderer,
        this.levelConfig.goalPosition.gridX,
        this.levelConfig.goalPosition.gridY,
        this.height * 0.33
      )
      this.goalRenderer.render()
    }

    // Recrear items de maíz siempre
    if (this.maizeItemRenderer) {
      // Limpiar todos los items de maíz existentes (esto cancela animaciones también)
      this.maizeItemRenderer.clearAll()
      
      // Esperar un frame para asegurar que las destrucciones se completen
      this.time.delayedCall(50, () => {
        // Intentar colocar maíz según la configuración
        let maizePlaced = false
        
        if (this.levelConfig?.maizePositions && this.levelConfig.maizePositions.length > 0) {
          this.maizeItemRenderer?.placeMaizeItems(this.levelConfig.maizePositions)
          maizePlaced = true
        } else if (this.levelConfig?.path && this.levelConfig.path.length > 2) {
          // Colocar maíz aleatoriamente en bloques del sendero
          const pathBlocks = this.levelConfig.path
          const numMaizeItems = Math.min(3, Math.floor(pathBlocks.length / 2))
          const selectedPositions: Array<{ gridX: number; gridY: number }> = []
          const shuffled = [...pathBlocks].sort(() => Math.random() - 0.5)
          const availableBlocks = shuffled.slice(1, -1)
          
          for (let i = 0; i < Math.min(numMaizeItems, availableBlocks.length); i++) {
            selectedPositions.push({
              gridX: availableBlocks[i].x,
              gridY: availableBlocks[i].y
            })
          }
          
          if (selectedPositions.length > 0 && this.maizeItemRenderer) {
            this.maizeItemRenderer.placeMaizeItems(selectedPositions)
            maizePlaced = true
          }
        }
        
        // Si no se colocó maíz con ninguna configuración, usar maíz de prueba
        if (!maizePlaced) {
          this.placeTestMaize()
        }
        
        this.log('🔄 Nivel reiniciado - Emojis de maíz restaurados', 'info')
      })
    }
    
    // Reposicionar personaje en celda inicial
    if (this.gridRenderer && player) {
      const initialGridPosition = this.gridRenderer.gridToPixel(this.currentGridX, this.currentGridY)
      // Usar setPosition inmediatamente sin animación
      player.setPosition(initialGridPosition.pixelX, initialGridPosition.pixelY)
      player.setAngle(0)
      
      // Resetear la posición interna de MovementCommands
      if (this.movementCommands) {
        this.movementCommands.reset(this.currentGridX, this.currentGridY)
      }
      
      this.updatePlayerGridHighlight()
    }
    
    // Resetear rastreo de acciones
    this.actionsExecuted.clear()
    this.stepsMoved = 0
    this.rotationsMade = 0
  }

  /**
   * Coloca un maíz de prueba en una posición fija
   */
  private placeTestMaize(): void {
    if (!this.maizeItemRenderer) return
    
    // Calcular posición inicial si existe
    const startX = this.levelConfig?.startPosition?.gridX || 1
    const startY = this.levelConfig?.startPosition?.gridY || 2
    
    // Colocar maíz en (3, 2) si no es la posición inicial
    const testX = startX === 3 ? 4 : 3
    const testY = startY
    
    const defaultPosition: Array<{ gridX: number; gridY: number }> = [
      { gridX: testX, gridY: testY }
    ]
    
    this.maizeItemRenderer.placeMaizeItems(defaultPosition)
    this.log(`🌽 Maíz de prueba colocado en (${testX}, ${testY})`, 'info')
  }

  /**
   * Actualiza el highlight de la celda actual del jugador
   */
  private updatePlayerGridHighlight(): void {
    if (this.gridRenderer) {
      this.gridRenderer.highlightCell(this.currentGridX, this.currentGridY)
    }
  }

  /**
   * Verifica recompensas y si el jugador alcanzó el objetivo
   */
  private checkRewardsAndGoal(): void {
    // Nota: La recolección de maíz visible y las recompensas ya se manejan en MovementCommands
    // Este método ahora solo verifica el objetivo/premio final

    // Verificar si alcanzó el objetivo/premio
    if (this.goalRenderer && this.rewardSystem && this.goalRenderer.isPlayerAtGoal(this.currentGridX, this.currentGridY)) {
      const player = this.playerManager.getPlayer()
      const playerX = player?.x || 0
      const playerY = player?.y || 0
      
      this.goalRenderer.collect()
      this.rewardSystem.rewardForGoal(playerX, playerY)
      if (this.onGoalReached) {
        this.onGoalReached()
      }
    }
  }

  /**
   * Configura el nivel (sendero, objetivo, posición inicial)
   */
  public setLevelConfig(config: {
    startPosition?: { gridX: number; gridY: number }
    goalPosition?: { gridX: number; gridY: number }
    path?: Array<{ x: number; y: number }>
    maizePositions?: Array<{ gridX: number; gridY: number }>
  }) {
    this.levelConfig = config
    
    // Si el renderer de maíz ya existe, actualizar las posiciones
    if (this.maizeItemRenderer) {
      if (config.maizePositions && config.maizePositions.length > 0) {
        this.maizeItemRenderer.placeMaizeItems(config.maizePositions)
      } else if (config.path && config.path.length > 2) {
        // Colocar maíz aleatoriamente en algunos bloques del sendero
        const pathBlocks = config.path
        const numMaizeItems = Math.min(3, Math.floor(pathBlocks.length / 2))
        const selectedPositions: Array<{ gridX: number; gridY: number }> = []
        const shuffled = [...pathBlocks].sort(() => Math.random() - 0.5)
        const availableBlocks = shuffled.slice(1, -1)
        
        for (let i = 0; i < Math.min(numMaizeItems, availableBlocks.length); i++) {
          selectedPositions.push({
            gridX: availableBlocks[i].x,
            gridY: availableBlocks[i].y
          })
        }
        
        if (selectedPositions.length > 0) {
          this.maizeItemRenderer.placeMaizeItems(selectedPositions)
        }
      }
    }
  }

  /**
   * Obtiene el sistema de recompensas
   */
  public getRewardSystem(): RewardSystem {
    return this.rewardSystem
  }

  /**
   * Obtiene el estado actual del jugador para validación
   */
  public getPlayerState(): { x: number; y: number; angle: number; actionsExecuted: string[]; stepsMoved: number; rotationsMade: number; gridX: number; gridY: number } | null {
    const player = this.playerManager.getPlayer()
    if (!player) return null

    return {
      x: player.x,
      y: player.y,
      angle: player.angle,
      actionsExecuted: Array.from(this.actionsExecuted),
      stepsMoved: this.stepsMoved,
      rotationsMade: this.rotationsMade,
      gridX: this.currentGridX,
      gridY: this.currentGridY
    }
  }

  /**
   * Logging helper
   */
  private log(message: string, type: string = 'info') {
    if (this.onLog) {
      this.onLog(message, type)
    }
  }
}

