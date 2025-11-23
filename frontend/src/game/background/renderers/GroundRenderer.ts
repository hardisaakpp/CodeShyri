import type Phaser from 'phaser'

export class GroundRenderer {
  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza el suelo con textura medieval
   */
  public render() {
    // Suelo base más terroso (estilo medieval)
    this.graphics.fillStyle(0x3D5A3D, 1) // Verde más apagado y terroso
    this.graphics.fillRect(0, this.horizonY, this.width, this.height - this.horizonY)
    
    // Capa de tierra más oscura
    this.graphics.fillStyle(0x2D4A2D, 0.6)
    this.graphics.fillRect(0, this.horizonY, this.width, (this.height - this.horizonY) * 0.3)
    
    // Textura de hierba más oscura y variada (estilo medieval)
    const grassColors = [0x2D4A2D, 0x3D5A3D, 0x2A4A2A, 0x1B3D1B, 0x4A5A3A] // Verdes más apagados
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width
      const y = this.horizonY + Math.random() * (this.height - this.horizonY)
      const size = 2 + Math.random() * 5
      const colorIndex = Math.floor(Math.random() * grassColors.length)
      this.graphics.fillStyle(grassColors[colorIndex], 0.25 + Math.random() * 0.3)
      this.graphics.fillCircle(x, y, size)
    }
    
    // Parches de tierra más oscura (camino medieval)
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * this.width
      const y = this.horizonY + 20 + Math.random() * (this.height - this.horizonY - 20)
      const size = 15 + Math.random() * 25
      this.graphics.fillStyle(0x2A3A2A, 0.4)
      this.graphics.fillCircle(x, y, size)
    }
    
    // Línea del horizonte más sutil
    this.graphics.lineStyle(1.5, 0x4A5A3A, 0.3)
    this.graphics.moveTo(0, this.horizonY)
    this.graphics.lineTo(this.width, this.horizonY)
    this.graphics.strokePath()
  }
}

