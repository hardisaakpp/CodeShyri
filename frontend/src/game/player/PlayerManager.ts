import type Phaser from 'phaser'

export class PlayerManager {
  private player: Phaser.Physics.Arcade.Sprite | null = null

  constructor(
    private scene: Phaser.Scene,
    private characterImageKey: string,
    private initialX: number,
    private initialY: number
  ) {}

  /**
   * Crea el personaje en la escena
   */
  private glowTween: Phaser.Tweens.Tween | null = null

  public create() {
    const targetHeight = 100
    const scale = targetHeight / 270 // 270 es la altura original del sprite
    
    this.player = this.scene.physics.add.sprite(this.initialX, this.initialY, this.characterImageKey)
    this.player.setCollideWorldBounds(true)
    this.player.setScale(scale)
    this.player.setOrigin(0.5, 0.5)
    this.player.setDepth(10)
    
    // Cancelar cualquier tween de brillo anterior si existe
    if (this.glowTween) {
      this.scene.tweens.killTweensOf(this.glowTween)
      this.glowTween = null
    }
    
    // Efecto sutil de brillo
    this.glowTween = this.scene.tweens.add({
      targets: this.player,
      alpha: { from: 0.95, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    return this.player
  }

  /**
   * Limpia todos los tweens del personaje
   */
  public cleanup() {
    if (this.player) {
      this.scene.tweens.killTweensOf(this.player)
    }
    if (this.glowTween) {
      this.scene.tweens.killTweensOf(this.glowTween)
      this.glowTween = null
    }
  }

  /**
   * Obtiene el sprite del personaje
   */
  public getPlayer(): Phaser.Physics.Arcade.Sprite | null {
    return this.player
  }

  /**
   * Reinicia la posición del personaje
   */
  public reset(gameHeight: number) {
    if (!this.player) return
    
    const centerY = gameHeight / 2
    this.player.setPosition(this.initialX, centerY + 50)
    this.player.setAngle(0)
    this.scene.tweens.killTweensOf(this.player)
  }
}


