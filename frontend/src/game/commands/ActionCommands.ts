import type Phaser from 'phaser'
import { CommandQueue } from './CommandQueue'

export class ActionCommands {
  constructor(
    private commandQueue: CommandQueue,
    private player: Phaser.GameObjects.Sprite,
    private log: (message: string, type?: string) => void
  ) {}

  public jump() {
    this.commandQueue.queueCommand(() => {
      const originalY = this.player.y
      
      this.log('🦘 Saltando...', 'info')
      this.commandQueue.createSequentialTween({
        targets: this.player,
        y: originalY - 60,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.commandQueue.createSequentialTween({
            targets: this.player,
            y: originalY,
            duration: 200,
            ease: 'Power2'
          })
        }
      })
    })
  }

  public attack() {
    this.commandQueue.queueCommand(() => {
      const scene = this.player.scene
      const attackEffect = scene.add.circle(this.player.x, this.player.y, 30, 0xff0000, 0.5)
      scene.tweens.add({
        targets: attackEffect,
        scale: { from: 0.5, to: 1.5 },
        alpha: { from: 0.8, to: 0 },
        duration: 300,
        onComplete: () => attackEffect.destroy()
      })
      
      this.log('⚔️ Atacando!', 'info')
      
      scene.time.delayedCall(300, () => {
        this.commandQueue.onCommandComplete()
      })
    })
  }

  public wait(milliseconds: number) {
    this.commandQueue.queueCommand(() => {
      this.log(`⏳ Esperando ${milliseconds}ms...`, 'info')
      const scene = this.player.scene
      scene.time.delayedCall(milliseconds, () => {
        this.commandQueue.onCommandComplete()
      })
    })
  }

  public teleport(x: number, y: number) {
    this.commandQueue.queueCommand(() => {
      this.log(`✨ Teletransportando a (${x}, ${y})...`, 'info')
      
      this.commandQueue.createSequentialTween({
        targets: this.player,
        alpha: 0,
        scale: 0.5,
        duration: 150,
        onComplete: () => {
          this.player.setPosition(x, y)
          const originalScale = this.player.scaleX
          this.player.setAlpha(1)
          this.player.setScale(originalScale)
          
          this.commandQueue.createSequentialTween({
            targets: this.player,
            alpha: 1,
            scale: originalScale,
            duration: 150
          })
        }
      })
    })
  }

  public spin() {
    this.commandQueue.queueCommand(() => {
      this.log('🌀 Girando...', 'info')
      this.commandQueue.createSequentialTween({
        targets: this.player,
        angle: this.player.angle + 360,
        duration: 500,
        ease: 'Power1'
      })
    })
  }
}

