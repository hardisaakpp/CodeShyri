import Phaser from 'phaser'
import type { Character } from '@/types/character'

type CommandAction = () => void

export class GameEngine {
  private game: Phaser.Game | null = null
  private character: Character
  public onLog?: (message: string, type?: string) => void
  private commandQueue: CommandAction[] = []
  private isExecutingQueue: boolean = false
  private currentTween: Phaser.Tweens.Tween | null = null

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
          // Cargar sprite del personaje desde archivo PNG
          // El archivo kitu.png está en public/assets/characters/
          this.load.image('character', '/assets/characters/kitu.png')
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

          // Crear personaje con el sprite cargado
          // Ajustar escala según el tamaño del sprite (182x270)
          const targetHeight = 100 // Altura objetivo en píxeles del juego
          const scale = targetHeight / 270 // 270 es la altura original del sprite
          
          const character = this.physics.add.sprite(100, centerY + 50, 'character')
          character.setCollideWorldBounds(true)
          character.setScale(scale)
          
          // Establecer punto de anclaje en el centro (0.5, 0.5) para mejor control
          character.setOrigin(0.5, 0.5)
          
          // Efecto sutil de brillo en el personaje (opcional)
          this.tweens.add({
            targets: character,
            alpha: { from: 0.95, to: 1 },
            duration: 2000,
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

  /**
   * Agrega un comando a la cola de ejecución
   */
  private queueCommand(action: CommandAction) {
    this.commandQueue.push(action)
    if (!this.isExecutingQueue) {
      this.processQueue()
    }
  }

  /**
   * Procesa la cola de comandos secuencialmente
   */
  private processQueue() {
    if (this.commandQueue.length === 0) {
      this.isExecutingQueue = false
      return
    }

    this.isExecutingQueue = true
    const command = this.commandQueue.shift()
    
    if (command) {
      command()
    }
  }

  /**
   * Marca el comando actual como completado y procesa el siguiente
   */
  private onCommandComplete() {
    this.currentTween = null
    // Esperar un frame antes de ejecutar el siguiente comando
    // para asegurar que las animaciones se vean claramente separadas
    if (this.game) {
      this.game.scene.getScenes()[0].time.delayedCall(50, () => {
        this.processQueue()
      })
    }
  }

  /**
   * Crea un tween que se ejecuta de forma secuencial
   */
  private createSequentialTween(
    scene: Phaser.Scene,
    config: Phaser.Types.Tweens.TweenBuilderConfig
  ): Phaser.Tweens.Tween {
    // Si hay un tween ejecutándose, lo detenemos primero
    if (this.currentTween && this.currentTween.isPlaying()) {
      this.currentTween.stop()
    }

    // Agregar callback onComplete para procesar el siguiente comando
    const originalOnComplete = config.onComplete
    config.onComplete = (tween: Phaser.Tweens.Tween, targets: any[]) => {
      if (originalOnComplete) {
        // Llamar al callback original con los argumentos que Phaser proporciona
        if (typeof originalOnComplete === 'function') {
          originalOnComplete(tween, targets)
        }
      }
      this.onCommandComplete()
    }

    this.currentTween = scene.tweens.add(config)
    return this.currentTween
  }

  public executeCode(code: string) {
    if (!this.game) return

    const scene = this.game.scene.getScenes()[0]
    if (!scene) return

    // Limpiar cola anterior si existe
    this.commandQueue = []
    this.isExecutingQueue = false
    if (this.currentTween) {
      this.currentTween.stop()
      this.currentTween = null
    }

    try {
      // Crear contexto seguro para ejecutar código
      const player = (scene as any).player
      if (!player) return

      // Función auxiliar para crear movimientos paso a paso
      const createStepByStepMovement = (
        totalSteps: number,
        calculateStep: (currentX: number, currentY: number, currentAngle: number) => { targetX: number; targetY: number },
        logMessage: string,
        directionLabel: string
      ) => {
        if (totalSteps <= 1) {
          // Un solo paso, ejecutar normalmente
          this.queueCommand(() => {
            const { targetX, targetY } = calculateStep(player.x, player.y, player.angle)
            this.log(`${directionLabel} 1 paso...`, 'info')
            this.createSequentialTween(scene, {
              targets: player,
              x: targetX,
              y: targetY,
              duration: 300,
              ease: 'Power2'
            })
          })
        } else {
          // Múltiples pasos, crear un comando por cada paso
          this.log(`${logMessage} ${totalSteps} paso(s)...`, 'info')
          
          for (let step = 1; step <= totalSteps; step++) {
            // Comando para el movimiento del paso
            this.queueCommand(() => {
              // Capturar posición actual en el momento de ejecución
              const { targetX, targetY } = calculateStep(player.x, player.y, player.angle)
              
              this.createSequentialTween(scene, {
                targets: player,
                x: targetX,
                y: targetY,
                duration: 300,
                ease: 'Power2'
              })
            })
            
            // Comando para la pausa entre pasos (excepto después del último paso)
            if (step < totalSteps) {
              this.queueCommand(() => {
                // Pausa breve entre pasos (100ms)
                scene.time.delayedCall(100, () => {
                  this.onCommandComplete()
                })
              })
            }
          }
        }
      }

      // Funciones de movimiento básico
      const moveForward = (steps: number = 1) => {
        createStepByStepMovement(
          steps,
          (currentX, currentY, currentAngle) => {
            const distance = 50
            const radians = Phaser.Math.DegToRad(currentAngle)
            return {
              targetX: currentX + Math.cos(radians) * distance,
              targetY: currentY + Math.sin(radians) * distance
            }
          },
          '➡️ Avanzando',
          '➡️ Avanzando'
        )
      }

      const moveBackward = (steps: number = 1) => {
        createStepByStepMovement(
          steps,
          (currentX, currentY, currentAngle) => {
            const distance = 50
            const radians = Phaser.Math.DegToRad(currentAngle + 180)
            return {
              targetX: currentX + Math.cos(radians) * distance,
              targetY: currentY + Math.sin(radians) * distance
            }
          },
          '⬅️ Retrocediendo',
          '⬅️ Retrocediendo'
        )
      }

      const moveUp = (steps: number = 1) => {
        createStepByStepMovement(
          steps,
          (currentX, currentY) => {
            const distance = 50
            return {
              targetX: currentX,
              targetY: currentY - distance
            }
          },
          '⬆️ Moviendo arriba',
          '⬆️ Moviendo arriba'
        )
      }

      const moveDown = (steps: number = 1) => {
        createStepByStepMovement(
          steps,
          (currentX, currentY) => {
            const distance = 50
            return {
              targetX: currentX,
              targetY: currentY + distance
            }
          },
          '⬇️ Moviendo abajo',
          '⬇️ Moviendo abajo'
        )
      }

      const moveLeft = (steps: number = 1) => {
        createStepByStepMovement(
          steps,
          (currentX, currentY) => {
            const distance = 50
            return {
              targetX: currentX - distance,
              targetY: currentY
            }
          },
          '⬅️ Moviendo izquierda',
          '⬅️ Moviendo izquierda'
        )
      }

      const moveRight = (steps: number = 1) => {
        createStepByStepMovement(
          steps,
          (currentX, currentY) => {
            const distance = 50
            return {
              targetX: currentX + distance,
              targetY: currentY
            }
          },
          '➡️ Moviendo derecha',
          '➡️ Moviendo derecha'
        )
      }

      // Funciones de rotación
      const turnRight = (degrees: number = 90) => {
        this.queueCommand(() => {
          const newAngle = player.angle + degrees
          
          this.log(`↻ Girando ${degrees}° a la derecha...`, 'info')
          this.createSequentialTween(scene, {
            targets: player,
            angle: newAngle,
            duration: 200,
            ease: 'Power2'
          })
        })
      }

      const turnLeft = (degrees: number = 90) => {
        this.queueCommand(() => {
          const newAngle = player.angle - degrees
          
          this.log(`↺ Girando ${degrees}° a la izquierda...`, 'info')
          this.createSequentialTween(scene, {
            targets: player,
            angle: newAngle,
            duration: 200,
            ease: 'Power2'
          })
        })
      }

      const turn = (degrees: number) => {
        this.queueCommand(() => {
          const newAngle = player.angle + degrees
          
          this.log(`🔄 Girando ${degrees}°...`, 'info')
          this.createSequentialTween(scene, {
            targets: player,
            angle: newAngle,
            duration: 200,
            ease: 'Power2'
          })
        })
      }

      const faceDirection = (direction: string) => {
        this.queueCommand(() => {
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
          
          this.log(`🧭 Mirando hacia ${direction}...`, 'info')
          this.createSequentialTween(scene, {
            targets: player,
            angle: angle,
            duration: 200,
            ease: 'Power2'
          })
        })
      }

      // Funciones de movimiento avanzado
      const moveTo = (x: number, y: number) => {
        this.queueCommand(() => {
          const distance = Phaser.Math.Distance.Between(player.x, player.y, x, y)
          const duration = Math.max(300, distance * 3)
          
          this.log(`🎯 Moviendo a posición (${x}, ${y})...`, 'info')
          this.createSequentialTween(scene, {
            targets: player,
            x: x,
            y: y,
            duration: duration,
            ease: 'Power2'
          })
        })
      }

      const moveDistance = (distance: number) => {
        this.queueCommand(() => {
          const radians = Phaser.Math.DegToRad(player.angle)
          const targetX = player.x + Math.cos(radians) * distance
          const targetY = player.y + Math.sin(radians) * distance
          
          this.log(`📏 Moviendo ${distance} píxeles...`, 'info')
          this.createSequentialTween(scene, {
            targets: player,
            x: targetX,
            y: targetY,
            duration: Math.abs(distance) * 3,
            ease: 'Power2'
          })
        })
      }

      // Funciones de acción
      const jump = () => {
        this.queueCommand(() => {
          const originalY = player.y
          
          this.log('🦘 Saltando...', 'info')
          // Salto hacia arriba
          this.createSequentialTween(scene, {
            targets: player,
            y: originalY - 60,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
              // Caída hacia abajo
              this.createSequentialTween(scene, {
                targets: player,
                y: originalY,
                duration: 200,
                ease: 'Power2'
              })
            }
          })
        })
      }

      const attack = () => {
        this.queueCommand(() => {
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
          
          // Marcar como completado después de la animación
          scene.time.delayedCall(300, () => {
            this.onCommandComplete()
          })
        })
      }

      const sprint = (steps: number = 1) => {
        // Sprint es similar a moveForward pero más rápido
        if (steps <= 1) {
          this.queueCommand(() => {
            const distance = 75 // Más rápido que moveForward
            const radians = Phaser.Math.DegToRad(player.angle)
            const targetX = player.x + Math.cos(radians) * distance
            const targetY = player.y + Math.sin(radians) * distance
            
            this.log(`💨 Corriendo 1 paso...`, 'info')
            this.createSequentialTween(scene, {
              targets: player,
              x: targetX,
              y: targetY,
              duration: 200, // Más rápido
              ease: 'Power1'
            })
          })
        } else {
          this.log(`💨 Corriendo ${steps} paso(s)...`, 'info')
          
          for (let step = 1; step <= steps; step++) {
            // Comando para el movimiento del paso
            this.queueCommand(() => {
              // Capturar posición actual en el momento de ejecución
              const distance = 75
              const radians = Phaser.Math.DegToRad(player.angle)
              const targetX = player.x + Math.cos(radians) * distance
              const targetY = player.y + Math.sin(radians) * distance
              
              this.createSequentialTween(scene, {
                targets: player,
                x: targetX,
                y: targetY,
                duration: 200, // Más rápido que moveForward
                ease: 'Power1'
              })
            })
            
            // Comando para la pausa entre pasos (excepto después del último paso)
            if (step < steps) {
              this.queueCommand(() => {
                // Pausa breve entre pasos (80ms - más corta que moveForward)
                scene.time.delayedCall(80, () => {
                  this.onCommandComplete()
                })
              })
            }
          }
        }
      }

      const wait = (milliseconds: number) => {
        this.queueCommand(() => {
          this.log(`⏳ Esperando ${milliseconds}ms...`, 'info')
          // Esperar el tiempo especificado antes de continuar
          scene.time.delayedCall(milliseconds, () => {
            this.onCommandComplete()
          })
        })
      }

      const teleport = (x: number, y: number) => {
        this.queueCommand(() => {
          this.log(`✨ Teletransportando a (${x}, ${y})...`, 'info')
          
          // Efecto de desaparición
          this.createSequentialTween(scene, {
            targets: player,
            alpha: 0,
            scale: 0.5,
            duration: 150,
            onComplete: () => {
              player.setPosition(x, y)
              // Obtener la escala original del personaje
              const originalScale = player.scaleX
              player.setAlpha(1)
              player.setScale(originalScale)
              
              // Efecto de aparición (este también debe estar en la cola)
              this.createSequentialTween(scene, {
                targets: player,
                alpha: 1,
                scale: originalScale,
                duration: 150
              })
            }
          })
        })
      }

      const spin = () => {
        this.queueCommand(() => {
          this.log('🌀 Girando...', 'info')
          this.createSequentialTween(scene, {
            targets: player,
            angle: player.angle + 360,
            duration: 500,
            ease: 'Power1'
          })
        })
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

    // Limpiar cola de comandos y detener animaciones actuales
    this.commandQueue = []
    this.isExecutingQueue = false
    if (this.currentTween) {
      this.currentTween.stop()
      this.currentTween = null
    }

    const player = (scene as any).player
    if (player) {
      // Obtener dimensiones del juego
      const gameHeight = this.game.config.height as number || 600
      const centerY = gameHeight / 2
      // Usar la misma posición inicial que en create()
      player.setPosition(100, centerY + 50)
      player.setAngle(0)
      // Detener cualquier tween activo en el player
      scene.tweens.killTweensOf(player)
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

