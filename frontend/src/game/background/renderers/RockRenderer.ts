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
      
      // Forma de roca
      rockGraphics.fillStyle(0x5D6D7E, 1)
      rockGraphics.fillCircle(0, 0, rockSize)
      rockGraphics.fillCircle(rockSize * 0.3, rockSize * 0.2, rockSize * 0.6)
      rockGraphics.fillCircle(-rockSize * 0.3, rockSize * 0.2, rockSize * 0.6)
      rockGraphics.fillCircle(0, -rockSize * 0.3, rockSize * 0.7)
      
      // Sombra
      rockGraphics.fillStyle(0x34495E, 0.7)
      rockGraphics.fillCircle(-rockSize * 0.3, rockSize * 0.2, rockSize * 0.5)
      rockGraphics.fillCircle(rockSize * 0.2, rockSize * 0.3, rockSize * 0.4)
      
      // Resaltes
      rockGraphics.fillStyle(0x7F8C8D, 0.5)
      rockGraphics.fillCircle(rockSize * 0.2, -rockSize * 0.2, rockSize * 0.3)
      rockGraphics.fillCircle(-rockSize * 0.1, -rockSize * 0.3, rockSize * 0.25)
      
      rockGraphics.setPosition(rockX, rockY)
      rockGraphics.setDepth(2)
      rocks.push(rockGraphics)
    }
    
    return rocks
  }
}

