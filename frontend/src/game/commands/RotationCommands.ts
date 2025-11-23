import type Phaser from 'phaser'
import { CommandQueue } from './CommandQueue'

export class RotationCommands {
  constructor(
    private commandQueue: CommandQueue,
    private player: Phaser.GameObjects.Sprite,
    private log: (message: string, type?: string) => void
  ) {}

  public turnRight(degrees: number = 90) {
    this.commandQueue.queueCommand(() => {
      const newAngle = this.player.angle + degrees
      
      this.log(`↻ Girando ${degrees}° a la derecha...`, 'info')
      this.commandQueue.createSequentialTween({
        targets: this.player,
        angle: newAngle,
        duration: 200,
        ease: 'Power2'
      })
    })
  }

  public turnLeft(degrees: number = 90) {
    this.commandQueue.queueCommand(() => {
      const newAngle = this.player.angle - degrees
      
      this.log(`↺ Girando ${degrees}° a la izquierda...`, 'info')
      this.commandQueue.createSequentialTween({
        targets: this.player,
        angle: newAngle,
        duration: 200,
        ease: 'Power2'
      })
    })
  }

  public turn(degrees: number) {
    this.commandQueue.queueCommand(() => {
      const newAngle = this.player.angle + degrees
      
      this.log(`🔄 Girando ${degrees}°...`, 'info')
      this.commandQueue.createSequentialTween({
        targets: this.player,
        angle: newAngle,
        duration: 200,
        ease: 'Power2'
      })
    })
  }

  public faceDirection(direction: string) {
    this.commandQueue.queueCommand(() => {
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
      const angle = directions[direction.toLowerCase()] ?? this.player.angle
      
      this.log(`🧭 Mirando hacia ${direction}...`, 'info')
      this.commandQueue.createSequentialTween({
        targets: this.player,
        angle: angle,
        duration: 200,
        ease: 'Power2'
      })
    })
  }
}

