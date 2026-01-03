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
import { FireRenderer } from '../background/renderers/FireRenderer'

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
  private fireRenderer?: FireRenderer
  
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
    maizePositions?: Array<{ gridX: number; gridY: number }>
    path?: Array<{ x: number; y: number }>
    lake?: { centerX: number; centerY: number; width?: number; height?: number }
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
    // Renderizar fondo (pasar path y lake si están configurados)
    this.backgroundRenderer = new BackgroundRenderer(this, this.width, this.height)
    const pathCoordinates = this.levelConfig?.path || undefined
    const lakeConfig = this.levelConfig?.lake || undefined
    const backgroundData = this.backgroundRenderer.render(pathCoordinates, lakeConfig)

    // Obtener grid renderer y ground renderer
    this.gridRenderer = this.backgroundRenderer.getGridRenderer()
    this.groundRenderer = this.backgroundRenderer.getGroundRenderer()
    this.fireRenderer = this.backgroundRenderer.getFireRenderer()
    
    if (pathCoordinates) {
      console.log('✅ Path blocks configurados antes del render:', pathCoordinates.length, 'bloques')
    }

    // Posicionar personaje en el grid (usar configuración del nivel o defaults)
    if (this.levelConfig?.startPosition) {
      this.currentGridX = this.levelConfig.startPosition.gridX
      this.currentGridY = this.levelConfig.startPosition.gridY
    }
    const initialGridPosition = this.gridRenderer.gridToPixelForPlayer(this.currentGridX, this.currentGridY)
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

    // Renderizar premio final - usar configuración o generar posición aleatoria
    let goalPosition = this.levelConfig?.goalPosition
    
    // Si no hay goalPosition en la configuración, generar una aleatoria
    if (!goalPosition) {
      const excludePositions: Array<{ gridX: number; gridY: number }> = []
      if (this.levelConfig?.startPosition) {
        excludePositions.push(this.levelConfig.startPosition)
      }
      const randomGoalPositions = this.generateRandomPositions(1, excludePositions)
      if (randomGoalPositions.length > 0) {
        goalPosition = randomGoalPositions[0]
        // Guardar en levelConfig para referencia futura
        if (!this.levelConfig) {
          this.levelConfig = {}
        }
        this.levelConfig.goalPosition = goalPosition
        console.log('🎲 GoalPosition generada aleatoriamente:', goalPosition)
      }
    }
    
    if (goalPosition) {
      console.log('📋 Creando GoalRenderer en create() con config:', goalPosition)
      console.log('📋 GridRenderer disponible:', !!this.gridRenderer)
      console.log('📋 Scene disponible:', !!this.scene)
      
      this.goalRenderer = new GoalRenderer(
        this,
        this.gridRenderer,
        goalPosition.gridX,
        goalPosition.gridY,
        this.height * 0.33
      )
      const rendered = this.goalRenderer.render()
      if (rendered) {
        this.log(`💰 Bolsa de dinero colocada en (${goalPosition.gridX}, ${goalPosition.gridY})`, 'info')
        console.log('✅ GoalRenderer creado exitosamente en create():', rendered)
        console.log('✅ Contenedor activo:', rendered.active)
        console.log('✅ Contenedor visible:', rendered.visible)
        console.log('✅ Contenedor depth:', rendered.depth)
        console.log('✅ Posición del contenedor:', rendered.x, rendered.y)
      } else {
        this.log('❌ Error al crear la bolsa de dinero en create()', 'error')
        console.error('❌ Error: GoalRenderer.render() retornó null/undefined en create()')
      }
    } else {
      this.log('⚠️ No se pudo generar una posición para el premio final', 'warning')
    }

    // Crear renderer de items de maíz
    this.maizeItemRenderer = new MaizeItemRenderer(
      this,
      this.gridRenderer,
      this.height * 0.33
    )

    // Colocar maíz en posiciones aleatorias del grid
    // Si hay configuración específica del backend, usarla; sino, generar aleatorias
    if (this.levelConfig?.maizePositions && this.levelConfig.maizePositions.length > 0) {
      // Filtrar posiciones que coincidan con goalPosition o startPosition
      const filteredPositions = this.levelConfig.maizePositions.filter(pos => {
        const isStart = this.levelConfig?.startPosition && 
                       pos.gridX === this.levelConfig.startPosition.gridX && 
                       pos.gridY === this.levelConfig.startPosition.gridY
        const isGoal = this.levelConfig?.goalPosition && 
                      pos.gridX === this.levelConfig.goalPosition.gridX && 
                      pos.gridY === this.levelConfig.goalPosition.gridY
        return !isStart && !isGoal
      })
      if (filteredPositions.length > 0) {
        this.maizeItemRenderer.placeMaizeItems(filteredPositions)
      } else {
        // Si todas fueron filtradas, generar aleatorias
        this.placeRandomMaize(3)
      }
    } else {
      // Generar posiciones aleatorias (3-5 maíces)
      const numMaizeItems = 3 + Math.floor(Math.random() * 3) // Entre 3 y 5
      this.placeRandomMaize(numMaizeItems)
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
    // Limpiar cola de comandos primero (esto maneja sus propios tweens)
    this.commandQueue.clear()
    
    // Cancelar solo los tweens de movimiento del personaje (no el brillo)
    const player = this.playerManager.getPlayer()
    if (player) {
      // Solo matar tweens que NO son de brillo (que tienen repeat: -1)
      // Para esto, necesitamos un enfoque diferente: matar todos los tweens del player
      // y luego recrear el brillo
      this.tweens.killTweensOf(player)
    }
    
    // Limpiar contenedores de efectos temporales (partículas de recolección, etc.)
    // Estos tienen depth 10-12 y son contenedores que deberían haberse destruido
    this.children.list.slice().forEach((child: any) => {
      // Solo limpiar contenedores temporales (efectos visuales de recolección)
      if (child && child.type === 'Container') {
        // Verificar si es un efecto temporal (depth alto y no es maíz ni cofre)
        // Los efectos de partículas suelen tener depth 10-12
        // Pero el maíz tiene depth 10 y el cofre tiene depth 8
        // Así que solo limpiar contenedores que no están en nuestros maps
        if (child.depth >= 10 && child.depth <= 12) {
          // Verificar que no sea un contenedor de maíz o cofre
          let isMaizeOrChest = false
          if (this.maizeItemRenderer) {
            const maizePositions = this.maizeItemRenderer.getMaizePositions()
            for (const pos of maizePositions) {
              const pixelPos = this.gridRenderer.gridToPixel(pos.gridX, pos.gridY)
              if (Math.abs(child.x - pixelPos.pixelX) < 5 && Math.abs(child.y - pixelPos.pixelY) < 5) {
                isMaizeOrChest = true
                break
              }
            }
          }
          if (this.goalRenderer && this.goalRenderer.isVisible()) {
            const goalPos = this.goalRenderer.getGoalPosition()
            const pixelPos = this.gridRenderer.gridToPixel(goalPos.gridX, goalPos.gridY)
            if (Math.abs(child.x - pixelPos.pixelX) < 5 && Math.abs(child.y - pixelPos.pixelY) < 5) {
              isMaizeOrChest = true
            }
          }
          
          // Solo destruir si NO es maíz ni cofre (es un efecto temporal)
          if (!isMaizeOrChest) {
            try {
              this.tweens.killTweensOf(child)
              child.destroy(true)
            } catch (e) {
              // Ignorar errores
            }
          }
        }
      }
    })
    
    // Limpiar delayedCalls temporales (solo los que no son del sistema)
    // Nota: removeAllEvents puede ser muy agresivo, pero como estamos recreando todo,
    // está bien en este caso
    
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
    
    // Recrear premio - generar nueva posición aleatoria si no viene del backend
    if (this.goalRenderer) {
      this.goalRenderer.destroy()
    }
    
    // Si hay goalPosition en la config del backend, usarla; sino generar aleatoria
    let goalPosition = this.levelConfig?.goalPosition
    if (!goalPosition) {
      const excludePositions: Array<{ gridX: number; gridY: number }> = []
      if (this.levelConfig?.startPosition) {
        excludePositions.push(this.levelConfig.startPosition)
      }
      const randomGoalPositions = this.generateRandomPositions(1, excludePositions)
      if (randomGoalPositions.length > 0) {
        goalPosition = randomGoalPositions[0]
        // Actualizar levelConfig
        if (!this.levelConfig) {
          this.levelConfig = {}
        }
        this.levelConfig.goalPosition = goalPosition
      }
    }
    
    if (goalPosition && this.gridRenderer) {
      this.goalRenderer = new GoalRenderer(
        this,
        this.gridRenderer,
        goalPosition.gridX,
        goalPosition.gridY,
        this.height * 0.33
      )
      this.goalRenderer.render()
      this.log(`💰 Bolsa de dinero reubicada en (${goalPosition.gridX}, ${goalPosition.gridY})`, 'info')
    }

    // Recrear items de maíz siempre - generar posiciones aleatorias nuevas
    if (this.maizeItemRenderer) {
      // Limpiar todos los items de maíz existentes (esto cancela animaciones también)
      this.maizeItemRenderer.clearAll()
      
      // Generar nuevas posiciones aleatorias cada vez que se reinicia
      const numMaizeItems = 3 + Math.floor(Math.random() * 3) // Entre 3 y 5
      this.placeRandomMaize(numMaizeItems)
      
      this.log('🔄 Nivel reiniciado - Emojis de maíz restaurados en nuevas posiciones aleatorias', 'info')
    }
    
    // Reposicionar personaje en celda inicial
    if (this.gridRenderer && player) {
      const initialGridPosition = this.gridRenderer.gridToPixelForPlayer(this.currentGridX, this.currentGridY)
      // Usar setPosition inmediatamente sin animación
      player.setPosition(initialGridPosition.pixelX, initialGridPosition.pixelY)
      player.setAngle(0)
      
      // Recrear animación de brillo del personaje (siempre después del reset)
      this.tweens.add({
        targets: player,
        alpha: { from: 0.95, to: 1 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
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
   * Calcula los límites del grid disponible
   */
  private getGridBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    const cellSize = this.gridRenderer?.getCellSize() || 60
    const numCols = Math.floor(this.width / cellSize)
    const groundHeight = this.height - (this.height * 0.33) // altura del terreno
    const numRows = Math.floor(groundHeight / cellSize)
    
    return {
      minX: 0,
      maxX: numCols - 1,
      minY: 0,
      maxY: numRows - 1
    }
  }

  /**
   * Genera posiciones aleatorias dentro del grid, excluyendo posiciones ocupadas
   */
  private generateRandomPositions(
    count: number,
    excludePositions: Array<{ gridX: number; gridY: number }> = []
  ): Array<{ gridX: number; gridY: number }> {
    const bounds = this.getGridBounds()
    const availablePositions: Array<{ gridX: number; gridY: number }> = []
    
    // Generar todas las posiciones posibles dentro de los límites
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      for (let y = bounds.minY; y <= bounds.maxY; y++) {
        const isExcluded = excludePositions.some(excluded => 
          excluded.gridX === x && excluded.gridY === y
        )
        if (!isExcluded) {
          availablePositions.push({ gridX: x, gridY: y })
        }
      }
    }
    
    // Mezclar aleatoriamente y seleccionar las primeras 'count' posiciones
    const shuffled = availablePositions.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  /**
   * Coloca maíz en posiciones aleatorias del grid
   */
  private placeRandomMaize(count: number = 3): void {
    if (!this.maizeItemRenderer) return
    
    const excludePositions: Array<{ gridX: number; gridY: number }> = []
    
    // Excluir startPosition
    if (this.levelConfig?.startPosition) {
      excludePositions.push(this.levelConfig.startPosition)
    }
    
    // Excluir goalPosition
    if (this.levelConfig?.goalPosition) {
      excludePositions.push(this.levelConfig.goalPosition)
    }
    
    // Generar posiciones aleatorias
    const randomPositions = this.generateRandomPositions(count, excludePositions)
    
    if (randomPositions.length > 0) {
      this.maizeItemRenderer.placeMaizeItems(randomPositions)
      this.log(`🌽 ${randomPositions.length} maíz(es) colocados aleatoriamente en el grid`, 'info')
    } else {
      this.log('⚠️ No se pudo colocar maíz: no hay posiciones disponibles', 'warning')
    }
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
    // Este método ahora solo verifica el objetivo/premio final y obstáculos como la fogata

    const player = this.playerManager.getPlayer()
    const playerX = player?.x || 0
    const playerY = player?.y || 0

    // Verificar si el jugador tocó la fogata (penalización)
    if (this.fireRenderer && this.rewardSystem && this.fireRenderer.isPlayerAtFire(this.currentGridX, this.currentGridY)) {
      this.rewardSystem.penalizeForObstacle(playerX, playerY, 'fire')
      this.log('🔥 ¡Cuidado! Tocaste la fogata y perdiste maíz', 'error')
    }

    // Verificar si alcanzó el objetivo/premio
    if (this.goalRenderer && this.rewardSystem && this.goalRenderer.isPlayerAtGoal(this.currentGridX, this.currentGridY)) {
      this.goalRenderer.collect()
      this.rewardSystem.rewardForGoal(playerX, playerY)
      if (this.onGoalReached) {
        this.onGoalReached()
      }
    }
  }

  /**
   * Configura el nivel (objetivo, posición inicial)
   */
  public setLevelConfig(config: {
    startPosition?: { gridX: number; gridY: number }
    goalPosition?: { gridX: number; gridY: number }
    maizePositions?: Array<{ gridX: number; gridY: number }>
    path?: Array<{ x: number; y: number }>
    lake?: { centerX: number; centerY: number; width?: number; height?: number }
  }) {
    console.log('🔧 setLevelConfig llamado con:', config)
    console.log('🔧 gridRenderer disponible:', !!this.gridRenderer)
    console.log('🔧 scene disponible:', !!this.scene)
    
    // Guardar la configuración siempre (incluso si gridRenderer no está listo)
    this.levelConfig = config
    
    // Si gridRenderer no está disponible, guardar la config y aplicar después
    if (!this.gridRenderer) {
      console.log('⏳ gridRenderer no disponible aún, la configuración se aplicará cuando esté listo')
      // La configuración ya está guardada en this.levelConfig
      // Se aplicará cuando create() termine
      return
    }
    
    // NOTA: Los bloques de camino (path) se configuran en create() ANTES del render
    // No es necesario configurarlos aquí nuevamente
    
    // Actualizar posición del jugador si hay startPosition
    if (config.startPosition && this.playerManager) {
      this.currentGridX = config.startPosition.gridX
      this.currentGridY = config.startPosition.gridY
      const player = this.playerManager.getPlayer()
      if (player && this.gridRenderer) {
        const pos = this.gridRenderer.gridToPixelForPlayer(this.currentGridX, this.currentGridY)
        player.setPosition(pos.pixelX, pos.pixelY)
        this.updatePlayerGridHighlight()
        console.log('✅ Posición del jugador actualizada a:', this.currentGridX, this.currentGridY)
      }
    }
    
    // Determinar goalPosition: usar config o generar aleatoria
    let goalPosition = config.goalPosition
    if (!goalPosition) {
      // Generar posición aleatoria para el premio final
      const excludePositions: Array<{ gridX: number; gridY: number }> = []
      if (config.startPosition) {
        excludePositions.push(config.startPosition)
      }
      const randomGoalPositions = this.generateRandomPositions(1, excludePositions)
      if (randomGoalPositions.length > 0) {
        goalPosition = randomGoalPositions[0]
        // Actualizar levelConfig con la nueva posición
        this.levelConfig = { ...this.levelConfig, goalPosition }
        console.log('🎲 GoalPosition generada aleatoriamente:', goalPosition)
      }
    }
    
    // Crear o actualizar goalRenderer
    if (goalPosition) {
      console.log('🎯 Creando/actualizando goalRenderer con goalPosition:', goalPosition)
      
      // Si ya existe un goalRenderer, destruirlo primero
      if (this.goalRenderer) {
        console.log('🗑️ Destruyendo goalRenderer existente')
        this.goalRenderer.destroy()
      }
      
      // Crear nuevo goalRenderer con la posición (configurada o aleatoria)
      console.log('🏗️ Instanciando nuevo GoalRenderer...')
      this.goalRenderer = new GoalRenderer(
        this,
        this.gridRenderer,
        goalPosition.gridX,
        goalPosition.gridY,
        this.height * 0.33
      )
      
      console.log('🎨 Llamando a render() del goalRenderer...')
      const rendered = this.goalRenderer.render()
      
      if (rendered) {
        this.log(`💰 Bolsa de dinero colocada en (${goalPosition.gridX}, ${goalPosition.gridY})`, 'info')
        console.log('✅ GoalRenderer creado exitosamente:', rendered)
      } else {
        this.log('❌ Error al crear la bolsa de dinero', 'error')
        console.error('❌ Error: GoalRenderer.render() retornó null/undefined')
      }
    } else {
      console.warn('⚠️ No se pudo generar una posición para el premio final')
    }
    
    // Si el renderer de maíz ya existe, actualizar las posiciones
    // IMPORTANTE: Excluir startPosition y goalPosition para evitar superposición
    if (this.maizeItemRenderer) {
      if (config.maizePositions && config.maizePositions.length > 0) {
        // Filtrar posiciones que coincidan con goalPosition o startPosition
        const filteredPositions = config.maizePositions.filter(pos => {
          const isStart = config.startPosition && 
                         pos.gridX === config.startPosition.gridX && 
                         pos.gridY === config.startPosition.gridY
          const isGoal = goalPosition && 
                        pos.gridX === goalPosition.gridX && 
                        pos.gridY === goalPosition.gridY
          return !isStart && !isGoal
        })
        if (filteredPositions.length > 0) {
          this.maizeItemRenderer.placeMaizeItems(filteredPositions)
        } else {
          // Si todas fueron filtradas, generar aleatorias
          const numMaizeItems = 3 + Math.floor(Math.random() * 3) // Entre 3 y 5
          this.placeRandomMaize(numMaizeItems)
        }
      } else {
        // Generar posiciones aleatorias del grid (no solo del path)
        const numMaizeItems = 3 + Math.floor(Math.random() * 3) // Entre 3 y 5
        this.placeRandomMaize(numMaizeItems)
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

