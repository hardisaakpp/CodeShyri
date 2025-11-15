import Phaser from 'phaser'
import type { Character } from '@/types/character'

export class GameEngine {
  private game: Phaser.Game | null = null
  private character: Character
  public onLog?: (message: string, type?: string) => void

  constructor(canvasId: string, character: Character) {
    this.character = character
    this.initializeGame(canvasId)
  }

  private initializeGame(canvasId: string) {
    const gameEngine = this
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: canvasId,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: {
        preload() {
          // Crear sprite simple para el personaje
          // Usar encodeURIComponent para manejar caracteres Unicode (emojis)
          const svgString = `
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="${gameEngine.character.color}"/>
              <text x="32" y="42" font-size="32" text-anchor="middle">${gameEngine.character.icon}</text>
            </svg>
          `
          // Codificar a base64 de forma segura para Unicode
          const base64 = btoa(unescape(encodeURIComponent(svgString)))
          this.load.image('character', 'data:image/svg+xml;base64,' + base64)
        },
        create() {
          // Fondo del juego
          this.add.rectangle(400, 300, 800, 600, 0x2d5016)
          this.add.text(400, 50, `Aventura con ${gameEngine.character.name}`, {
            fontSize: '24px',
            color: '#ffffff'
          }).setOrigin(0.5)

          // Crear personaje
          const character = this.physics.add.sprite(100, 300, 'character')
          character.setCollideWorldBounds(true)

          // Guardar referencia al personaje en la escena
          ;(this as any).player = character

          gameEngine.log(`¡Bienvenido, ${gameEngine.character.name}!`)
        },
        update() {
          // Lógica de actualización del juego
        }
      }
    }

    this.game = new Phaser.Game(config)
  }

  public executeCode(code: string) {
    if (!this.game) return

    const scene = this.game.scene.getScenes()[0]
    if (!scene) return

    try {
      // Crear contexto seguro para ejecutar código
      const player = (scene as any).player
      if (!player) return

      // Funciones disponibles para el usuario
      const moveForward = () => {
        player.x += 50
        this.log('Avanzando...', 'info')
      }

      const turnRight = () => {
        player.setAngle(player.angle + 90)
        this.log('Girando a la derecha...', 'info')
      }

      const turnLeft = () => {
        player.setAngle(player.angle - 90)
        this.log('Girando a la izquierda...', 'info')
      }

      // Ejecutar código del usuario con funciones disponibles
      const userCode = new Function('moveForward', 'turnRight', 'turnLeft', 'console', code)
      userCode(moveForward, turnRight, turnLeft, {
        log: (msg: string) => this.log(msg, 'info')
      })
    } catch (error) {
      this.log(`Error: ${error}`, 'error')
    }
  }

  public reset() {
    if (!this.game) return

    const scene = this.game.scene.getScenes()[0]
    if (!scene) return

    const player = (scene as any).player
    if (player) {
      player.setPosition(100, 300)
      player.setAngle(0)
    }

    this.log('Juego reiniciado', 'info')
  }

  public destroy() {
    if (this.game) {
      this.game.destroy(true)
      this.game = null
    }
  }

  private log(message: string, type: string = 'info') {
    if (this.onLog) {
      this.onLog(message, type)
    }
  }
}

