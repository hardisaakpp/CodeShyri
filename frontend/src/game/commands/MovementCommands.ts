import Phaser from 'phaser'
import { CommandQueue } from './CommandQueue'
import { GridRenderer } from '../background/renderers/GridRenderer'
import { GroundRenderer } from '../background/renderers/GroundRenderer'
import { RewardSystem } from '../services/RewardSystem'

export class MovementCommands {
  // Posición actual en el grid
  private currentGridX: number = 1
  private currentGridY: number = 2

  constructor(
    private commandQueue: CommandQueue,
    private player: Phaser.GameObjects.Sprite,
    private log: (message: string, type?: string) => void,
    private gridRenderer?: GridRenderer,
    private onGridPositionChange?: (gridX: number, gridY: number) => void,
    private groundRenderer?: GroundRenderer,
    private rewardSystem?: RewardSystem,
    private hasMaizeAt?: (gridX: number, gridY: number) => boolean,
    private collectMaizeAt?: (gridX: number, gridY: number) => boolean
  ) {
    // Si tenemos grid, inicializar posición
    if (this.gridRenderer) {
      const initialPos = this.gridRenderer.pixelToGrid(player.x, player.y)
      this.currentGridX = initialPos.gridX
      this.currentGridY = initialPos.gridY
    }
  }

  /**
   * Mueve el jugador en el grid basado en dirección
   */
  private moveInGrid(deltaX: number, deltaY: number, steps: number = 1): void {
    if (!this.gridRenderer) {
      // Fallback a movimiento libre si no hay grid
      return
    }

    for (let step = 0; step < steps; step++) {
      this.commandQueue.queueCommand(() => {
        // Calcular nueva posición en grid
        const newGridX = this.currentGridX + deltaX
        const newGridY = this.currentGridY + deltaY

        // Obtener posición en píxeles para el personaje (parte inferior de la celda)
        const targetPosition = this.gridRenderer!.gridToPixelForPlayer(newGridX, newGridY)

        // Actualizar posición en grid
        this.currentGridX = newGridX
        this.currentGridY = newGridY

        // Notificar cambio de posición
        if (this.onGridPositionChange) {
          this.onGridPositionChange(this.currentGridX, this.currentGridY)
        }

        // Mover personaje a la nueva celda
        this.commandQueue.createSequentialTween({
          targets: this.player,
          x: targetPosition.pixelX,
          y: targetPosition.pixelY,
          duration: 300,
          ease: 'Power2'
        })
      })

      // Pausa entre pasos
      if (step < steps - 1) {
        this.commandQueue.queueCommand(() => {
          const scene = this.player.scene
          scene.time.delayedCall(100, () => {
            this.commandQueue.onCommandComplete()
          })
        })
      }
    }
  }

  /**
   * Crea un movimiento paso a paso (fallback para movimientos sin grid)
   */
  private createStepByStepMovement(
    totalSteps: number,
    calculateStep: (currentX: number, currentY: number, currentAngle: number) => { targetX: number; targetY: number },
    logMessage: string,
    directionLabel: string
  ) {
    if (!this.gridRenderer) {
      // Si no hay grid, usar movimiento libre
      if (totalSteps <= 1) {
        this.commandQueue.queueCommand(() => {
          const { targetX, targetY } = calculateStep(this.player.x, this.player.y, this.player.angle)
          this.log(`${directionLabel} 1 paso...`, 'info')
          this.commandQueue.createSequentialTween({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 300,
            ease: 'Power2'
          })
        })
      } else {
        this.log(`${logMessage} ${totalSteps} paso(s)...`, 'info')
        
        for (let step = 1; step <= totalSteps; step++) {
          this.commandQueue.queueCommand(() => {
            const { targetX, targetY } = calculateStep(this.player.x, this.player.y, this.player.angle)
            
            this.commandQueue.createSequentialTween({
              targets: this.player,
              x: targetX,
              y: targetY,
              duration: 300,
              ease: 'Power2'
            })
          })
          
          if (step < totalSteps) {
            this.commandQueue.queueCommand(() => {
              const scene = this.player.scene
              scene.time.delayedCall(100, () => {
                this.commandQueue.onCommandComplete()
              })
            })
          }
        }
      }
    }
  }

  public moveForward(steps: number = 1) {
    if (this.gridRenderer) {
      // Movimiento basado en grid usando el ángulo del personaje
      this.log(`➡️ Avanzando ${steps} celda(s)...`, 'info')
      
      for (let step = 0; step < steps; step++) {
        this.commandQueue.queueCommand(() => {
          // Calcular dirección basada en el ángulo actual
          const angle = this.player.angle
          let deltaX = 0
          let deltaY = 0
          
          // Convertir ángulo a dirección de grid
          // 0° = Este, 90° = Sur, 180° = Oeste, 270° = Norte
          if (angle >= -45 && angle < 45) {
            deltaX = 1 // Este
          } else if (angle >= 45 && angle < 135) {
            deltaY = 1 // Sur
          } else if (angle >= 135 || angle < -135) {
            deltaX = -1 // Oeste
          } else {
            deltaY = -1 // Norte
          }
          
          // Calcular nueva posición en grid
          const newGridX = this.currentGridX + deltaX
          const newGridY = this.currentGridY + deltaY
          
          // Obtener posición en píxeles del centro de la celda
          const targetPosition = this.gridRenderer.gridToPixelForPlayer(newGridX, newGridY)
          
          // Actualizar posición en grid
          this.currentGridX = newGridX
          this.currentGridY = newGridY
          
          // Verificar si hay maíz visible ANTES de dar recompensa
          const hasVisibleMaize = this.hasMaizeAt ? this.hasMaizeAt(this.currentGridX, this.currentGridY) : false
          
          // Si hay maíz visible, recolectarlo primero (desaparecerá visualmente)
          if (hasVisibleMaize && this.collectMaizeAt) {
            this.collectMaizeAt(this.currentGridX, this.currentGridY)
          }
          
          // Dar recompensa si hay maíz visible
          if (this.rewardSystem) {
            // Pasar también la posición en píxeles y si hay maíz visible para el efecto visual
            this.rewardSystem.rewardForBlock(
              this.currentGridX, 
              this.currentGridY, 
              false, // Ya no se usa isPathBlock, pero mantenemos el parámetro por compatibilidad
              targetPosition.pixelX,
              targetPosition.pixelY,
              hasVisibleMaize
            )
          }
          
          // Notificar cambio de posición
          if (this.onGridPositionChange) {
            this.onGridPositionChange(this.currentGridX, this.currentGridY)
          }
          
          // Mover personaje a la nueva celda
          this.commandQueue.createSequentialTween({
            targets: this.player,
            x: targetPosition.pixelX,
            y: targetPosition.pixelY,
            duration: 300,
            ease: 'Power2'
          })
        })
        
        // Pausa entre pasos
        if (step < steps - 1) {
          this.commandQueue.queueCommand(() => {
            const scene = this.player.scene
            scene.time.delayedCall(100, () => {
              this.commandQueue.onCommandComplete()
            })
          })
        }
      }
    } else {
      // Fallback a movimiento libre
      this.createStepByStepMovement(
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
  }

  public moveBackward(steps: number = 1) {
    this.createStepByStepMovement(
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

  public moveUp(steps: number = 1) {
    this.createStepByStepMovement(
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

  public moveDown(steps: number = 1) {
    this.createStepByStepMovement(
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

  public moveLeft(steps: number = 1) {
    this.createStepByStepMovement(
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

  public moveRight(steps: number = 1) {
    this.createStepByStepMovement(
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

  public moveTo(x: number, y: number) {
    this.commandQueue.queueCommand(() => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y)
      const duration = Math.max(300, distance * 3)
      
      this.log(`🎯 Moviendo a posición (${x}, ${y})...`, 'info')
      this.commandQueue.createSequentialTween({
        targets: this.player,
        x: x,
        y: y,
        duration: duration,
        ease: 'Power2'
      })
    })
  }

  public moveDistance(distance: number) {
    this.commandQueue.queueCommand(() => {
      const radians = Phaser.Math.DegToRad(this.player.angle)
      const targetX = this.player.x + Math.cos(radians) * distance
      const targetY = this.player.y + Math.sin(radians) * distance
      
      this.log(`📏 Moviendo ${distance} píxeles...`, 'info')
      this.commandQueue.createSequentialTween({
        targets: this.player,
        x: targetX,
        y: targetY,
        duration: Math.abs(distance) * 3,
        ease: 'Power2'
      })
    })
  }

  public sprint(steps: number = 1) {
    if (steps <= 1) {
      this.commandQueue.queueCommand(() => {
        const distance = 75
        const radians = Phaser.Math.DegToRad(this.player.angle)
        const targetX = this.player.x + Math.cos(radians) * distance
        const targetY = this.player.y + Math.sin(radians) * distance
        
        this.log(`💨 Corriendo 1 paso...`, 'info')
        this.commandQueue.createSequentialTween({
          targets: this.player,
          x: targetX,
          y: targetY,
          duration: 200,
          ease: 'Power1'
        })
      })
    } else {
      this.log(`💨 Corriendo ${steps} paso(s)...`, 'info')
      
      for (let step = 1; step <= steps; step++) {
        this.commandQueue.queueCommand(() => {
          const distance = 75
          const radians = Phaser.Math.DegToRad(this.player.angle)
          const targetX = this.player.x + Math.cos(radians) * distance
          const targetY = this.player.y + Math.sin(radians) * distance
          
          this.commandQueue.createSequentialTween({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 200,
            ease: 'Power1'
          })
        })
        
        if (step < steps) {
          this.commandQueue.queueCommand(() => {
            const scene = this.player.scene
            scene.time.delayedCall(80, () => {
              this.commandQueue.onCommandComplete()
            })
          })
        }
      }
    }
  }

  /**
   * Resetea la posición del grid basándose en la posición actual del personaje
   */
  public reset(gridX?: number, gridY?: number) {
    if (this.gridRenderer) {
      if (gridX !== undefined && gridY !== undefined) {
        // Si se proporcionan coordenadas del grid, usarlas
        this.currentGridX = gridX
        this.currentGridY = gridY
      } else {
        // Si no, calcular desde la posición actual del personaje
        const initialPos = this.gridRenderer.pixelToGrid(this.player.x, this.player.y)
        this.currentGridX = initialPos.gridX
        this.currentGridY = initialPos.gridY
      }
    }
  }
}

