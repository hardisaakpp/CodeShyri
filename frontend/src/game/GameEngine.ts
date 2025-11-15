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
      backgroundColor: '#1a0f08',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: {
        preload() {
          // Verificar que el personaje existe, usar valores por defecto si no
          const character = gameEngine.character || {
            color: '#4A90E2',
            icon: '⚔️',
            name: 'Personaje'
          }
          
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
                  <stop offset="0%" style="stop-color:${character.color};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${character.color}88;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="35" fill="url(#grad)" filter="url(#glow)"/>
              <circle cx="40" cy="40" r="30" fill="${character.color}"/>
              <text x="40" y="52" font-size="36" text-anchor="middle" font-family="Arial">${character.icon}</text>
            </svg>
          `
          const base64 = btoa(unescape(encodeURIComponent(svgString)))
          this.load.image('character', 'data:image/svg+xml;base64,' + base64)
        },
        create() {
          const scene = this
          const centerX = width / 2
          const centerY = height / 2

          // Verificar que el personaje existe, usar valores por defecto si no
          const characterData = gameEngine.character || {
            color: '#4A90E2',
            icon: '⚔️',
            name: 'Personaje'
          }

          // Crear grid sutil estilo medieval
          const graphics = this.add.graphics()
          graphics.lineStyle(1, 0xd4af37, 0.2)
          
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

          // Título estilizado medieval
          const titleBg = this.add.rectangle(centerX, 40, 450, 55, 0x1a0f08, 0.8)
          titleBg.setStrokeStyle(3, 0xd4af37, 0.6)
          
          const title = this.add.text(centerX, 40, `Aventura con ${characterData.name}`, {
            fontSize: '24px',
            fontFamily: 'Cinzel, serif',
            color: '#d4af37',
            fontStyle: 'bold'
          }).setOrigin(0.5)
          
          // Sombra del texto
          title.setStroke('#000000', 4)
          title.setShadow(2, 2, '#000000', 4, true, true)
          
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

          gameEngine.log(`✨ ¡Bienvenido, ${characterData.name}!`)
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

      // Funciones de movimiento básico
      const moveForward = (steps: number = 1) => {
        const distance = steps * 50
        const radians = Phaser.Math.DegToRad(player.angle)
        const targetX = player.x + Math.cos(radians) * distance
        const targetY = player.y + Math.sin(radians) * distance
        
        scene.tweens.add({
          targets: player,
          x: targetX,
          y: targetY,
          duration: 300 * steps,
          ease: 'Power2'
        })
        this.log(`➡️ Avanzando ${steps} paso(s)...`, 'info')
      }

      const moveBackward = (steps: number = 1) => {
        const distance = steps * 50
        const radians = Phaser.Math.DegToRad(player.angle + 180)
        const targetX = player.x + Math.cos(radians) * distance
        const targetY = player.y + Math.sin(radians) * distance
        
        scene.tweens.add({
          targets: player,
          x: targetX,
          y: targetY,
          duration: 300 * steps,
          ease: 'Power2'
        })
        this.log(`⬅️ Retrocediendo ${steps} paso(s)...`, 'info')
      }

      const moveUp = (steps: number = 1) => {
        const distance = steps * 50
        const targetY = player.y - distance
        scene.tweens.add({
          targets: player,
          y: targetY,
          duration: 300 * steps,
          ease: 'Power2'
        })
        this.log(`⬆️ Moviendo arriba ${steps} paso(s)...`, 'info')
      }

      const moveDown = (steps: number = 1) => {
        const distance = steps * 50
        const targetY = player.y + distance
        scene.tweens.add({
          targets: player,
          y: targetY,
          duration: 300 * steps,
          ease: 'Power2'
        })
        this.log(`⬇️ Moviendo abajo ${steps} paso(s)...`, 'info')
      }

      const moveLeft = (steps: number = 1) => {
        const distance = steps * 50
        const targetX = player.x - distance
        scene.tweens.add({
          targets: player,
          x: targetX,
          duration: 300 * steps,
          ease: 'Power2'
        })
        this.log(`⬅️ Moviendo izquierda ${steps} paso(s)...`, 'info')
      }

      const moveRight = (steps: number = 1) => {
        const distance = steps * 50
        const targetX = player.x + distance
        scene.tweens.add({
          targets: player,
          x: targetX,
          duration: 300 * steps,
          ease: 'Power2'
        })
        this.log(`➡️ Moviendo derecha ${steps} paso(s)...`, 'info')
      }

      // Funciones de rotación
      const turnRight = (degrees: number = 90) => {
        const newAngle = player.angle + degrees
        scene.tweens.add({
          targets: player,
          angle: newAngle,
          duration: 200,
          ease: 'Power2'
        })
        this.log(`↻ Girando ${degrees}° a la derecha...`, 'info')
      }

      const turnLeft = (degrees: number = 90) => {
        const newAngle = player.angle - degrees
        scene.tweens.add({
          targets: player,
          angle: newAngle,
          duration: 200,
          ease: 'Power2'
        })
        this.log(`↺ Girando ${degrees}° a la izquierda...`, 'info')
      }

      const turn = (degrees: number) => {
        const newAngle = player.angle + degrees
        scene.tweens.add({
          targets: player,
          angle: newAngle,
          duration: 200,
          ease: 'Power2'
        })
        this.log(`🔄 Girando ${degrees}°...`, 'info')
      }

      const faceDirection = (direction: string) => {
        const directions: Record<string, number> = {
          'north': 270,
          'south': 90,
          'east': 0,
          'west': 180,
          'norte': 270,
          'sur': 90,
          'este': 0,
          'oeste': 180
        }
        const angle = directions[direction.toLowerCase()] ?? player.angle
        scene.tweens.add({
          targets: player,
          angle: angle,
          duration: 200,
          ease: 'Power2'
        })
        this.log(`🧭 Mirando hacia ${direction}...`, 'info')
      }

      // Funciones de movimiento avanzado
      const moveTo = (x: number, y: number) => {
        const distance = Phaser.Math.Distance.Between(player.x, player.y, x, y)
        const duration = Math.max(300, distance * 3)
        
        scene.tweens.add({
          targets: player,
          x: x,
          y: y,
          duration: duration,
          ease: 'Power2'
        })
        this.log(`🎯 Moviendo a posición (${x}, ${y})...`, 'info')
      }

      const moveDistance = (distance: number) => {
        const radians = Phaser.Math.DegToRad(player.angle)
        const targetX = player.x + Math.cos(radians) * distance
        const targetY = player.y + Math.sin(radians) * distance
        
        scene.tweens.add({
          targets: player,
          x: targetX,
          y: targetY,
          duration: Math.abs(distance) * 3,
          ease: 'Power2'
        })
        this.log(`📏 Moviendo ${distance} píxeles...`, 'info')
      }

      // Funciones de acción
      const jump = () => {
        const originalY = player.y
        scene.tweens.add({
          targets: player,
          y: originalY - 60,
          duration: 200,
          ease: 'Power2',
          yoyo: true,
          onComplete: () => {
            player.y = originalY
          }
        })
        this.log('🦘 Saltando...', 'info')
      }

      const attack = () => {
        // Efecto visual de ataque
        const attackEffect = scene.add.circle(player.x, player.y, 30, 0xff0000, 0.5)
        scene.tweens.add({
          targets: attackEffect,
          scale: { from: 0.5, to: 1.5 },
          alpha: { from: 0.8, to: 0 },
          duration: 300,
          onComplete: () => attackEffect.destroy()
        })
        this.log('⚔️ Atacando!', 'info')
      }

      const sprint = (steps: number = 1) => {
        const distance = steps * 75 // Más rápido que moveForward
        const radians = Phaser.Math.DegToRad(player.angle)
        const targetX = player.x + Math.cos(radians) * distance
        const targetY = player.y + Math.sin(radians) * distance
        
        scene.tweens.add({
          targets: player,
          x: targetX,
          y: targetY,
          duration: 200 * steps,
          ease: 'Power1'
        })
        this.log(`💨 Corriendo ${steps} paso(s)...`, 'info')
      }

      const wait = (milliseconds: number) => {
        this.log(`⏳ Esperando ${milliseconds}ms...`, 'info')
        // En una implementación real, esto debería ser asíncrono
        // Por ahora solo registramos el log
      }

      const teleport = (x: number, y: number) => {
        // Efecto de desaparición
        scene.tweens.add({
          targets: player,
          alpha: 0,
          scale: 0.5,
          duration: 150,
          onComplete: () => {
            player.setPosition(x, y)
            player.setAlpha(1)
            player.setScale(1.2)
            // Efecto de aparición
            scene.tweens.add({
              targets: player,
              alpha: 1,
              scale: 1.2,
              duration: 150
            })
          }
        })
        this.log(`✨ Teletransportando a (${x}, ${y})...`, 'info')
      }

      const spin = () => {
        scene.tweens.add({
          targets: player,
          angle: player.angle + 360,
          duration: 500,
          ease: 'Power1'
        })
        this.log('🌀 Girando...', 'info')
      }

      // Ejecutar código del usuario con funciones disponibles
      const consoleObj = {
        log: (msg: string) => this.log(msg, 'info')
      }
      
      // Lista de todas las funciones disponibles
      const functionNames = [
        'moveForward', 'moveBackward', 'moveUp', 'moveDown', 'moveLeft', 'moveRight',
        'turnRight', 'turnLeft', 'turn', 'faceDirection',
        'moveTo', 'moveDistance', 'jump', 'attack', 'sprint', 'wait', 'teleport', 'spin'
      ]
      
      // Ejecutar código en el contexto seguro
      try {
        // Reemplazar cualquier definición de función que el usuario pueda tener
        let sanitizedCode = code
        functionNames.forEach(funcName => {
          // Eliminar definiciones de función tradicionales
          sanitizedCode = sanitizedCode.replace(
            new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`, 'gs'),
            `// ${funcName} ya está definida`
          )
          // Eliminar arrow functions
          sanitizedCode = sanitizedCode.replace(
            new RegExp(`const\\s+${funcName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{[^}]*\\}`, 'gs'),
            `// ${funcName} ya está definida`
          )
          // Eliminar var/let
          sanitizedCode = sanitizedCode.replace(
            new RegExp(`(var|let)\\s+${funcName}\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`, 'gs'),
            `// ${funcName} ya está definida`
          )
        })
        
        // Crear función con todas las funciones del contexto como parámetros
        const userCode = new Function(
          ...functionNames,
          'console',
          sanitizedCode
        )
        
        // Ejecutar con todas las funciones reales del juego
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

