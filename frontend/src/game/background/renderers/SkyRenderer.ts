import type Phaser from 'phaser'

export class SkyRenderer {
  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza el cielo con gradiente
   */
  public render() {
    this.graphics.fillGradientStyle(
      0x4A90E2,  // Azul brillante superior izquierdo
      0x9B59B6,  // Púrpura superior derecho
      0xFF6B9D,  // Rosa inferior izquierdo
      0xFFA500   // Naranja brillante inferior derecho
    )
    this.graphics.fillRect(0, 0, this.width, this.horizonY)
  }
}

