import type Phaser from 'phaser'

export class GroundRenderer {
  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza el suelo con textura
   */
  public render() {
    // Suelo base
    this.graphics.fillStyle(0x27AE60, 1)
    this.graphics.fillRect(0, this.horizonY, this.width, this.height - this.horizonY)
    
    // Textura de hierba
    const grassColors = [0x16A085, 0x1ABC9C, 0x2ECC71, 0x52BE80, 0x229954]
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width
      const y = this.horizonY + Math.random() * (this.height - this.horizonY)
      const size = 2 + Math.random() * 6
      const colorIndex = Math.floor(Math.random() * grassColors.length)
      this.graphics.fillStyle(grassColors[colorIndex], 0.3 + Math.random() * 0.4)
      this.graphics.fillCircle(x, y, size)
    }
    
    // Línea del horizonte
    this.graphics.lineStyle(2, 0xFFD700, 0.4)
    this.graphics.moveTo(0, this.horizonY)
    this.graphics.lineTo(this.width, this.horizonY)
    this.graphics.strokePath()
  }
}

