import type Phaser from 'phaser'

export class RockRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza las rocas
   */
  public render(): Phaser.GameObjects.Graphics[] {
    const rocks: Phaser.GameObjects.Graphics[] = []
    
    for (let i = 0; i < 12; i++) {
      const rockX = Math.random() * this.width
      const rockY = this.horizonY + 10 + Math.random() * (this.height - this.horizonY - 10)
      const rockSize = 8 + Math.random() * 15
      
      const rockGraphics = this.scene.add.graphics()
      
      // Forma de roca más terrosa y medieval
      rockGraphics.fillStyle(0x4A4A3A, 1) // Gris terroso oscuro
      rockGraphics.fillCircle(0, 0, rockSize)
      rockGraphics.fillCircle(rockSize * 0.3, rockSize * 0.2, rockSize * 0.6)
      rockGraphics.fillCircle(-rockSize * 0.3, rockSize * 0.2, rockSize * 0.6)
      rockGraphics.fillCircle(0, -rockSize * 0.3, rockSize * 0.7)
      
      // Sombra más profunda
      rockGraphics.fillStyle(0x2C2C1F, 0.8)
      rockGraphics.fillCircle(-rockSize * 0.3, rockSize * 0.2, rockSize * 0.5)
      rockGraphics.fillCircle(rockSize * 0.2, rockSize * 0.3, rockSize * 0.4)
      
      // Resaltes más sutiles
      rockGraphics.fillStyle(0x6A6A5A, 0.4)
      rockGraphics.fillCircle(rockSize * 0.2, -rockSize * 0.2, rockSize * 0.3)
      rockGraphics.fillCircle(-rockSize * 0.1, -rockSize * 0.3, rockSize * 0.25)
      
      // Musgo en algunas rocas (toque medieval)
      if (Math.random() > 0.6) {
        rockGraphics.fillStyle(0x2D4A2D, 0.5) // Verde musgo oscuro
        rockGraphics.fillCircle(rockSize * 0.2, rockSize * 0.1, rockSize * 0.4)
        rockGraphics.fillCircle(-rockSize * 0.15, rockSize * 0.15, rockSize * 0.3)
      }
      
      rockGraphics.setPosition(rockX, rockY)
      rockGraphics.setDepth(2)
      rocks.push(rockGraphics)
    }
    
    return rocks
  }
}

