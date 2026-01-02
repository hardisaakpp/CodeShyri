import Phaser from 'phaser'
import type { Character } from '@/types/character'
import { BackgroundRenderer } from '../background/BackgroundRenderer'
import { PlayerManager } from '../player/PlayerManager'
import { CommandQueue } from '../commands/CommandQueue'
import { MovementCommands } from '../commands/MovementCommands'
import { RotationCommands } from '../commands/RotationCommands'
import { ActionCommands } from '../commands/ActionCommands'
import { GridRenderer } from '../background/renderers/GridRenderer'

export class GameScene extends Phaser.Scene {
  private width!: number
  private height!: number
  private character!: Character
  private onLog?: (message: string, type?: string) => void
  private onExecutionComplete?: () => void
  
  private commandQueue!: CommandQueue
  private movementCommands!: MovementCommands
  private rotationCommands!: RotationCommands
  private actionCommands!: ActionCommands
  private playerManager!: PlayerManager
  private backgroundRenderer!: BackgroundRenderer
  private gridRenderer!: GridRenderer
  
  // Rastreo de acciones para validación
  private actionsExecuted: Set<string> = new Set()
  private stepsMoved: number = 0
  private rotationsMade: number = 0
  
  // Posición actual en el grid
  private currentGridX: number = 1 // Empezar en celda (1, 2)
  private currentGridY: number = 2

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { 
    character: Character
    width: number
    height: number
    onLog?: (message: string, type?: string) => void
    onExecutionComplete?: () => void
  }) {
    this.character = data.character
    this.width = data.width
    this.height = data.height
    this.onLog = data.onLog
    this.onExecutionComplete = data.onExecutionComplete
  }

  preload() {
    this.load.image('character', '/assets/characters/kitu.png')
  }

  create() {
    // Renderizar fondo
    this.backgroundRenderer = new BackgroundRenderer(this, this.width, this.height)
    const backgroundData = this.backgroundRenderer.render()

    // Obtener grid renderer
    this.gridRenderer = this.backgroundRenderer.getGridRenderer()

    // Posicionar personaje en el grid (celda inicial)
    const initialGridPosition = this.gridRenderer.gridToPixel(this.currentGridX, this.currentGridY)
    this.playerManager = new PlayerManager(this, 'character', initialGridPosition.pixelX, initialGridPosition.pixelY)
    const player = this.playerManager.create()

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
        return this.rotationCommands.turnRight(degrees)
      }
      const turnLeft = (degrees: number = 90) => {
        this.actionsExecuted.add('turnLeft')
        this.rotationsMade++
        return this.rotationCommands.turnLeft(degrees)
      }
      const turn = (degrees: number) => {
        this.actionsExecuted.add('turn')
        this.rotationsMade++
        return this.rotationCommands.turn(degrees)
      }
      const faceDirection = (direction: string) => {
        this.actionsExecuted.add('faceDirection')
        this.rotationsMade++
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
    this.commandQueue.clear()
    
      // Resetear posición del grid
      this.currentGridX = 1
      this.currentGridY = 2
      
      // Reposicionar personaje en celda inicial
      if (this.gridRenderer) {
        const initialGridPosition = this.gridRenderer.gridToPixel(this.currentGridX, this.currentGridY)
        const player = this.playerManager.getPlayer()
        if (player) {
          player.setPosition(initialGridPosition.pixelX, initialGridPosition.pixelY)
          player.setAngle(0)
        }
        this.updatePlayerGridHighlight()
      }
    
    this.updatePlayerGridHighlight()
    this.actionsExecuted.clear()
    this.stepsMoved = 0
    this.rotationsMade = 0
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

