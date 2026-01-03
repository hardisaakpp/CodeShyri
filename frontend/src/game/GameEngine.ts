import Phaser from 'phaser'
import type { Character } from '@/types/character'
import { GameScene } from './scenes/GameScene'

export class GameEngine {
  private game: Phaser.Game | null = null
  private character: Character
  public onLog?: (message: string, type?: string) => void
  public onExecutionComplete?: () => void
  public onReward?: (amount: number, total: number, message: string) => void
  public onGoalReached?: () => void

  constructor(canvasId: string, character: Character) {
    this.character = character
    this.initializeGame(canvasId)
  }

  private initializeGame(canvasId: string) {
    const gameEngine = this
    const parentElement = document.getElementById(canvasId)
    const width = parentElement?.clientWidth || 800
    const height = parentElement?.clientHeight || 600

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      parent: canvasId,
      backgroundColor: '#4A90E2',
      audio: {
        disableWebAudio: true
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: GameScene
    }

    this.game = new Phaser.Game(config)
    
    // Inicializar la escena con los datos necesarios
    this.game.scene.start('GameScene', {
      character: this.character,
      width: width,
      height: height,
      onLog: (message: string, type?: string) => {
        if (gameEngine.onLog) {
          gameEngine.onLog(message, type)
        }
      },
      onExecutionComplete: () => {
        if (gameEngine.onExecutionComplete) {
          gameEngine.onExecutionComplete()
        }
      },
      onReward: (amount: number, total: number, message: string) => {
        if (gameEngine.onReward) {
          gameEngine.onReward(amount, total, message)
        }
      },
      onGoalReached: () => {
        if (gameEngine.onGoalReached) {
          gameEngine.onGoalReached()
        }
      }
    })
  }

  /**
   * Ejecuta código del usuario
   */
  public executeCode(code: string) {
    if (!this.game) return

    const scene = this.game.scene.getScene('GameScene') as GameScene
    if (!scene) return

    scene.executeCode(code)
  }

  /**
   * Reinicia el juego
   */
  public reset() {
    if (!this.game) return

    const scene = this.game.scene.getScene('GameScene') as GameScene
    if (!scene) return

    scene.reset()
    this.log('Juego reiniciado', 'info')
  }

  /**
   * Obtiene el estado actual del jugador (posición, ángulo, acciones)
   */
  public getPlayerState(): { x: number; y: number; angle: number; actionsExecuted: string[]; stepsMoved: number; rotationsMade: number; gridX: number; gridY: number } | null {
    if (!this.game) return null

    const scene = this.game.scene.getScene('GameScene') as GameScene
    if (!scene) return null

    return scene.getPlayerState()
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
    if (!this.game) return

    const scene = this.game.scene.getScene('GameScene') as GameScene
    if (scene) {
      scene.setLevelConfig(config)
    }
  }

  /**
   * Destruye el juego
   */
  public destroy() {
    if (this.game) {
      this.game.destroy(true)
      this.game = null
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
