import Phaser from 'phaser'
import type { Character } from '@/types/character'
import { BackgroundRenderer } from '../background/BackgroundRenderer'
import { PlayerManager } from '../player/PlayerManager'
import { CommandQueue } from '../commands/CommandQueue'
import { MovementCommands } from '../commands/MovementCommands'
import { RotationCommands } from '../commands/RotationCommands'
import { ActionCommands } from '../commands/ActionCommands'

export class GameScene extends Phaser.Scene {
  private width!: number
  private height!: number
  private character!: Character
  private onLog?: (message: string, type?: string) => void
  
  private commandQueue!: CommandQueue
  private movementCommands!: MovementCommands
  private rotationCommands!: RotationCommands
  private actionCommands!: ActionCommands
  private playerManager!: PlayerManager
  private backgroundRenderer!: BackgroundRenderer

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { character: Character; width: number; height: number; onLog?: (message: string, type?: string) => void }) {
    this.character = data.character
    this.width = data.width
    this.height = data.height
    this.onLog = data.onLog
  }

  preload() {
    this.load.image('character', '/assets/characters/kitu.png')
  }

  create() {
    const centerX = this.width / 2
    const centerY = this.height / 2

    // Renderizar fondo
    this.backgroundRenderer = new BackgroundRenderer(this, this.width, this.height)
    const backgroundData = this.backgroundRenderer.render()

    // Crear personaje
    this.playerManager = new PlayerManager(this, 'character', 100, centerY + 50)
    const player = this.playerManager.create()

    // Inicializar sistema de comandos
    this.commandQueue = new CommandQueue(this)
    this.movementCommands = new MovementCommands(this.commandQueue, player, this.log.bind(this))
    this.rotationCommands = new RotationCommands(this.commandQueue, player, this.log.bind(this))
    this.actionCommands = new ActionCommands(this.commandQueue, player, this.log.bind(this))

    // Crear título
    this.createTitle(centerX)

    // Guardar referencias en la escena
    ;(this as any).player = player
    ;(this as any).backgroundGraphics = backgroundData.backgroundGraphics
    ;(this as any).commandQueue = this.commandQueue
    ;(this as any).movementCommands = this.movementCommands
    ;(this as any).rotationCommands = this.rotationCommands
    ;(this as any).actionCommands = this.actionCommands

    this.log(`✨ ¡Bienvenido, ${this.character.name}!`)
    this.log(`🎮 Usa moveForward(), turnRight() y turnLeft() para controlar tu personaje`)
  }

  /**
   * Crea el título estilizado
   */
  private createTitle(centerX: number) {
    const titleBg = this.add.rectangle(centerX, 40, 450, 55, 0x1a0f08, 0.8)
    titleBg.setStrokeStyle(3, 0xd4af37, 0.6)
    titleBg.setDepth(20)

    const title = this.add.text(centerX, 40, `Aventura con ${this.character.name}`, {
      fontSize: '24px',
      fontFamily: 'Cinzel, serif',
      color: '#d4af37',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    title.setDepth(21)

    title.setStroke('#000000', 4)
    title.setShadow(2, 2, '#000000', 4, true, true)

    this.tweens.add({
      targets: title,
      alpha: { from: 0.7, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    })
  }

  /**
   * Ejecuta código del usuario
   */
  public executeCode(code: string) {
    this.commandQueue.clear()

    const player = this.playerManager.getPlayer()
    if (!player) return

    try {
      // Crear funciones disponibles para el usuario
      const {
        moveForward, moveBackward, moveUp, moveDown, moveLeft, moveRight,
        moveTo, moveDistance, sprint
      } = this.movementCommands

      const {
        turnRight, turnLeft, turn, faceDirection
      } = this.rotationCommands

      const {
        jump, attack, wait, teleport, spin
      } = this.actionCommands

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
    } catch (execError) {
      this.log(`Error de ejecución: ${execError}`, 'error')
      throw execError
    }
  }

  /**
   * Reinicia el juego
   */
  public reset() {
    this.commandQueue.clear()
    this.playerManager.reset(this.height)
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

