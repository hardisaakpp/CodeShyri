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
    const parentElement = document.getElementById(canvasId)
    const width = parentElement?.clientWidth || 800
    const height = parentElement?.clientHeight || 600

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      parent: canvasId,
      backgroundColor: '#0f3460',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: {
        preload() {
          // Crear sprite mejorado para el personaje con sombra y brillo
          const svgString = `
            <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:${gameEngine.character.color};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${gameEngine.character.color}88;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="35" fill="url(#grad)" filter="url(#glow)"/>
              <circle cx="40" cy="40" r="30" fill="${gameEngine.character.color}"/>
              <text x="40" y="52" font-size="36" text-anchor="middle" font-family="Arial">${gameEngine.character.icon}</text>
            </svg>
          `
          const base64 = btoa(unescape(encodeURIComponent(svgString)))
          this.load.image('character', 'data:image/svg+xml;base64,' + base64)
        },
        create() {
          const scene = this
          const centerX = width / 2
          const centerY = height / 2

          // Crear grid sutil
          const graphics = this.add.graphics()
          graphics.lineStyle(1, 0x1a4a6a, 0.3)
          
          const gridSize = 50
          for (let x = 0; x <= width; x += gridSize) {
            graphics.moveTo(x, 0)
            graphics.lineTo(x, height)
          }
          for (let y = 0; y <= height; y += gridSize) {
            graphics.moveTo(0, y)
            graphics.lineTo(width, y)
          }
          graphics.strokePath()

          // Título estilizado
          const titleBg = this.add.rectangle(centerX, 40, 400, 50, 0x000000, 0.5)
          titleBg.setStrokeStyle(2, 0xffd700, 0.5)
          
          const title = this.add.text(centerX, 40, `Aventura con ${gameEngine.character.name}`, {
            fontSize: '22px',
            fontFamily: 'Orbitron, Arial',
            color: '#FFD700',
            fontStyle: 'bold'
          }).setOrigin(0.5)
          
          // Efecto de brillo en el título
          this.tweens.add({
            targets: title,
            alpha: { from: 0.7, to: 1 },
            duration: 2000,
            yoyo: true,
            repeat: -1
          })

          // Crear personaje con efectos
          const character = this.physics.add.sprite(100, centerY, 'character')
          character.setCollideWorldBounds(true)
          character.setScale(1.2)
          
          // Efecto de pulso en el personaje
          this.tweens.add({
            targets: character,
            scale: { from: 1.2, to: 1.25 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          })

          // Guardar referencias
          ;(scene as any).player = character
          ;(scene as any).graphics = graphics

          gameEngine.log(`✨ ¡Bienvenido, ${gameEngine.character.name}!`)
          gameEngine.log(`🎮 Usa moveForward(), turnRight() y turnLeft() para controlar tu personaje`)
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

      // Funciones disponibles para el usuario con animaciones
      const moveForward = () => {
        const targetX = player.x + 50
        scene.tweens.add({
          targets: player,
          x: targetX,
          duration: 300,
          ease: 'Power2'
        })
        this.log('➡️ Avanzando...', 'info')
      }

      const turnRight = () => {
        const newAngle = player.angle + 90
        scene.tweens.add({
          targets: player,
          angle: newAngle,
          duration: 200,
          ease: 'Power2'
        })
        this.log('↻ Girando a la derecha...', 'info')
      }

      const turnLeft = () => {
        const newAngle = player.angle - 90
        scene.tweens.add({
          targets: player,
          angle: newAngle,
          duration: 200,
          ease: 'Power2'
        })
        this.log('↺ Girando a la izquierda...', 'info')
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

