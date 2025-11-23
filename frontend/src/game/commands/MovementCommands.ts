import Phaser from 'phaser'
import { CommandQueue } from './CommandQueue'

export class MovementCommands {
  constructor(
    private commandQueue: CommandQueue,
    private player: Phaser.GameObjects.Sprite,
    private log: (message: string, type?: string) => void
  ) {}

  /**
   * Crea un movimiento paso a paso
   */
  private createStepByStepMovement(
    totalSteps: number,
    calculateStep: (currentX: number, currentY: number, currentAngle: number) => { targetX: number; targetY: number },
    logMessage: string,
    directionLabel: string
  ) {
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

  public moveForward(steps: number = 1) {
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
}

